import { createLogger } from './utils/logger';
import { redactJson } from './utils/redact';
import type {
  RequestLogEndpoint,
  RequestLogEntry,
  RequestLogHistory,
  RequestLogOutcome,
} from './requestLogTypes';

const log = createLogger('RequestLog');

const REQUEST_LOG_STORAGE_KEY = 'apiRequestLog';
const MAX_REQUEST_LOG_SIZE = 50;

export const MAX_LOGGED_ENDPOINTS = 20;

const FALLBACK_REASON = 'Unlabeled request';

const MAX_REASON_LENGTH = 80;

export interface SettledRequest {
  reason?: string;
  method: string;
  endpoint: string;
  timestamp: number;
  durationMs: number;
  success: boolean;
}

interface PendingBatch {
  reason: string;
  requestCount: number;
  endpoints: Map<string, RequestLogEndpoint>;
  distinctEndpointCount: number;
  firstTimestamp: number;
  lastSettledAt: number;
  successCount: number;
  failureCount: number;
}

const pending = new Map<string, PendingBatch>();

export function recordRequest(request: SettledRequest): void {
  const reason = (request.reason?.trim() || FALLBACK_REASON).slice(0, MAX_REASON_LENGTH);
  const redactedEndpoint = redactJson(request.endpoint).data as string;

  let batch = pending.get(reason);
  if (!batch) {
    batch = {
      reason,
      requestCount: 0,
      endpoints: new Map(),
      distinctEndpointCount: 0,
      firstTimestamp: request.timestamp,
      lastSettledAt: request.timestamp,
      successCount: 0,
      failureCount: 0,
    };
    pending.set(reason, batch);
  }

  batch.requestCount += 1;
  batch.lastSettledAt = Math.max(batch.lastSettledAt, request.timestamp + request.durationMs);
  if (request.success) {
    batch.successCount += 1;
  } else {
    batch.failureCount += 1;
  }

  const endpointKey = `${request.method} ${redactedEndpoint}`;
  if (!batch.endpoints.has(endpointKey)) {
    batch.distinctEndpointCount += 1;
    if (batch.endpoints.size < MAX_LOGGED_ENDPOINTS) {
      batch.endpoints.set(endpointKey, { method: request.method, endpoint: redactedEndpoint });
    }
  }
}

function outcomeOf(batch: PendingBatch): RequestLogOutcome {
  if (batch.failureCount === 0) return 'all';
  if (batch.successCount === 0) return 'none';
  return 'partial';
}

export async function flushAllPending(): Promise<void> {
  if (pending.size === 0) return;

  const batches = Array.from(pending.values());
  pending.clear();

  const entries: RequestLogEntry[] = batches.map((batch) => ({
    id: generateEntryId(),
    timestamp: batch.firstTimestamp,
    reason: batch.reason,
    requestCount: batch.requestCount,
    endpoints: Array.from(batch.endpoints.values()),
    endpointsTruncated: batch.distinctEndpointCount > batch.endpoints.size,
    durationMs: Math.max(0, batch.lastSettledAt - batch.firstTimestamp),
    outcome: outcomeOf(batch),
  }));

  await appendEntries(entries);
}

function generateEntryId(): string {
  return `req_log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function appendEntries(newEntries: RequestLogEntry[]): Promise<void> {
  const history = await getRequestLog();
  history.entries = [...newEntries.reverse(), ...history.entries].slice(0, history.maxSize);
  try {
    await chrome.storage.local.set({ [REQUEST_LOG_STORAGE_KEY]: history });
  } catch (error) {
    log.error('Failed to save request log:', error);
  }
}

export async function getRequestLog(): Promise<RequestLogHistory> {
  try {
    const result = await chrome.storage.local.get([REQUEST_LOG_STORAGE_KEY]);
    const history = result[REQUEST_LOG_STORAGE_KEY] as RequestLogHistory | undefined;

    if (history && Array.isArray(history.entries)) {
      return history;
    }

    return { entries: [], maxSize: MAX_REQUEST_LOG_SIZE };
  } catch (error) {
    log.error('Failed to get request log:', error);
    return { entries: [], maxSize: MAX_REQUEST_LOG_SIZE };
  }
}

export async function clearRequestLog(): Promise<void> {
  try {
    await chrome.storage.local.set({
      [REQUEST_LOG_STORAGE_KEY]: { entries: [], maxSize: MAX_REQUEST_LOG_SIZE },
    });
  } catch (error) {
    log.error('Failed to clear request log:', error);
  }
}
