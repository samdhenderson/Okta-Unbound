import type { MessageRequest, MessageResponse, OperationCallbacks } from './types';
import type { RequestResult, RequestPriority } from '@/shared/scheduler/types';
import { runBatch, type BatchProgress, type BatchOutcome } from '@/shared/scheduler/runBatch';
import { createLogger } from '@/shared/utils/logger';
import { getCachedCurrentUser, cacheCurrentUser } from './currentUserCache';

const log = createLogger('useOktaApi');

const TRANSIENT_PORT_ERROR_PATTERNS = [
  'message port closed before a response',
  'receiving end does not exist',
];

const TRANSIENT_PORT_MAX_RETRIES = 2;

const TRANSIENT_PORT_RETRY_DELAYS_MS = [250, 500];

export function isTransientPortError(message: string): boolean {
  const normalized = message.toLowerCase();
  return TRANSIENT_PORT_ERROR_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export interface ProgressBridge {
  start: (name: string, total: number) => void;
  reportBatch: (progress: BatchProgress, message?: string) => void;
  complete: () => void;
}

export interface RunOperationOptions<T> {
  concurrency?: number;
  stopOnError?: (error: unknown, item: T, index: number) => boolean;
  message?: (progress: BatchProgress) => string;
}

export interface CoreApi {
  targetTabId: number | null;
  sendMessage: <T = unknown>(message: MessageRequest) => Promise<MessageResponse<T>>;
  makeApiRequest: (
    endpoint: string,
    method?: string,
    body?: unknown,
    priority?: RequestPriority,
  ) => Promise<RequestResult>;
  getCurrentUser: () => Promise<{ email: string; id: string }>;
  checkCancelled: () => void;
  resetCancellation: () => void;
  runOperation: <T, R>(
    name: string,
    items: T[],
    task: (item: T, index: number) => Promise<R>,
    options?: RunOperationOptions<T>,
  ) => Promise<BatchOutcome<T, R>>;
  callbacks: OperationCallbacks;
}

export function createCoreApi(
  targetTabId: number | null,
  checkCancelled: () => void,
  resetCancellation: () => void,
  progress: ProgressBridge,
  callbacks: OperationCallbacks,
): CoreApi {
  const sendMessage = async <T = unknown>(message: MessageRequest): Promise<MessageResponse<T>> => {
    if (!targetTabId) {
      throw new Error('No target tab ID - not connected to Okta page');
    }

    log.debug('Sending message', { action: message.action });
    const response = await chrome.tabs.sendMessage(targetTabId, message);
    log.debug('Received response', { action: message.action, success: response?.success });

    return response;
  };

  const makeApiRequest = async (
    endpoint: string,
    method: string = 'GET',
    body?: unknown,
    priority: RequestPriority = 'normal',
  ): Promise<RequestResult> => {
    if (!targetTabId) {
      throw new Error('No target tab ID - not connected to Okta page');
    }

    log.debug('Scheduling API request via background', {
      endpoint: endpoint.split('?')[0],
      method,
      priority,
    });

    const retryable = method.toUpperCase() === 'GET';
    let response: RequestResult;
    let attempt = 0;

    for (;;) {
      try {
        response = await chrome.runtime.sendMessage({
          action: 'scheduleApiRequest',
          endpoint,
          method,
          body,
          tabId: targetTabId,
          priority,
        });
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!retryable || attempt >= TRANSIENT_PORT_MAX_RETRIES || !isTransientPortError(message)) {
          throw error;
        }
        log.debug('Retrying scheduled API request after transient port error', {
          endpoint: endpoint.split('?')[0],
          attempt: attempt + 1,
        });
        const delay = TRANSIENT_PORT_RETRY_DELAYS_MS[attempt];
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt += 1;
      }
    }

    log.debug('Received scheduled response', {
      endpoint: endpoint.split('?')[0],
      success: response?.success,
    });
    return response;
  };

  const getCurrentUser = async (): Promise<{ email: string; id: string }> => {
    if (targetTabId !== null) {
      const cached = getCachedCurrentUser(targetTabId);
      if (cached) return cached;
    }

    try {
      const response = await makeApiRequest('/api/v1/users/me');
      if (response.success && response.data) {
        const identity = {
          email: response.data.profile?.email || 'unknown@unknown.com',
          id: response.data.id || 'unknown',
        };
        if (targetTabId !== null) {
          cacheCurrentUser(targetTabId, identity);
        }
        return identity;
      }
      return { email: 'unknown@unknown.com', id: 'unknown' };
    } catch (error) {
      log.error('Failed to get current user', error);
      return { email: 'unknown@unknown.com', id: 'unknown' };
    }
  };

  const runOperation = async <T, R>(
    name: string,
    items: T[],
    task: (item: T, index: number) => Promise<R>,
    options: RunOperationOptions<T> = {},
  ): Promise<BatchOutcome<T, R>> => {
    resetCancellation();
    progress.start(name, items.length);
    try {
      return await runBatch(items, task, {
        concurrency: options.concurrency,
        stopOnError: options.stopOnError,
        throwIfCancelled: checkCancelled,
        onProgress: (p) => progress.reportBatch(p, options.message?.(p)),
      });
    } finally {
      progress.complete();
    }
  };

  return {
    targetTabId,
    sendMessage,
    makeApiRequest,
    getCurrentUser,
    checkCancelled,
    resetCancellation,
    runOperation,
    callbacks,
  };
}
