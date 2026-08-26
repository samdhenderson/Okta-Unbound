import type { MessageRequest, MessageResponse, OperationCallbacks } from './types';
import type { RequestResult, RequestPriority } from '@/shared/scheduler/types';
import { runBatch, type BatchProgress, type BatchOutcome } from '@/shared/scheduler/runBatch';
import { createLogger } from '@/shared/utils/logger';
import { z } from 'zod';
import {
  getCachedCurrentUser,
  cacheCurrentUser,
  type Actor,
  type ResolvedActor,
} from './currentUserCache';

export type { Actor } from './currentUserCache';

const log = createLogger('useOktaApi');

const TRANSIENT_PORT_ERROR_PATTERNS = [
  'message port closed before a response',
  'receiving end does not exist',
];

const currentUserSchema = z
  .object({
    id: z.string().optional(),
    profile: z.object({ email: z.string().optional() }).passthrough().optional(),
  })
  .passthrough();

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

export interface MakeApiRequestOptions {
  method?: string;
  body?: unknown;
  priority?: RequestPriority;
  reason: string;
}

export interface RunOperationOptions<T> {
  concurrency?: number;
  stopOnError?: (error: unknown, item: T, index: number) => boolean;
  message?: (progress: BatchProgress) => string;
}

export interface CoreApi {
  targetTabId: number | null;
  sendMessage: <T = unknown>(message: MessageRequest) => Promise<MessageResponse<T>>;
  makeApiRequest: (endpoint: string, options: MakeApiRequestOptions) => Promise<RequestResult>;
  getCurrentUser: () => Promise<Actor>;
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
    options: MakeApiRequestOptions,
  ): Promise<RequestResult> => {
    const { method = 'GET', body, priority = 'normal', reason } = options;

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
          reason,
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

  const getCurrentUser = async (): Promise<Actor> => {
    if (targetTabId !== null) {
      const cached = getCachedCurrentUser(targetTabId);
      if (cached) return cached;
    }

    try {
      const response = await makeApiRequest('/api/v1/users/me', {
        reason: 'Resolve current admin identity',
      });
      if (!response.success || !response.data) {
        return { kind: 'unavailable', reason: 'failed' };
      }
      const parsed = currentUserSchema.safeParse(response.data);
      const email = parsed.success ? parsed.data.profile?.email : undefined;
      if (!parsed.success || !email) {
        return { kind: 'unavailable', reason: 'no-email' };
      }
      const actor: ResolvedActor = { kind: 'resolved', email, id: parsed.data.id ?? '' };
      if (targetTabId !== null) {
        cacheCurrentUser(targetTabId, actor);
      }
      return actor;
    } catch (error) {
      log.error('Failed to get current user', error);
      return { kind: 'unavailable', reason: 'threw' };
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
