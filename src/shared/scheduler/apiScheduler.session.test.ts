import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiScheduler } from './apiScheduler';

let scheduler: ApiScheduler;
const sendMessage = vi.fn();

function apiCallCount(): number {
  return sendMessage.mock.calls.filter((c) => c[1]?.action === 'makeApiRequest').length;
}

async function settle(ms = 0): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  (chrome as unknown as { tabs: { sendMessage: typeof sendMessage } }).tabs = {
    sendMessage,
  };
});

afterEach(() => {
  scheduler?.stop();
  vi.useRealTimers();
});

describe('ApiScheduler · a 429 is retried (D-007c)', () => {
  it('routes a resolved 429 into retry backoff instead of the success path', async () => {
    sendMessage.mockResolvedValue({ success: false, status: 429, error: 'Too many requests' });
    scheduler = new ApiScheduler({ maxRetries: 2, retryDelay: 1000 });

    const settled = scheduler.scheduleRequest('/api/v1/users', 'GET', undefined, 1);
    await settle();
    expect(apiCallCount()).toBe(1);

    await settle(999);
    expect(apiCallCount()).toBe(1);
    await settle(3500);

    const result = await settled;
    expect(result.success).toBe(false);
    expect(apiCallCount()).toBe(3);
    expect(scheduler.getMetrics().retriedRequests).toBe(2);
    expect(scheduler.getMetrics().successfulRequests).toBe(0);
    expect(scheduler.getMetrics().failedRequests).toBe(1);
  });

  it('stops retrying as soon as the 429 clears, and counts that as the success', async () => {
    sendMessage
      .mockResolvedValueOnce({ success: false, status: 429, error: 'Too many requests' })
      .mockResolvedValue({ success: true, data: { ok: true } });
    scheduler = new ApiScheduler({ maxRetries: 2, retryDelay: 1000 });

    const settled = scheduler.scheduleRequest('/api/v1/users', 'GET', undefined, 1);
    await settle(1500);

    await expect(settled).resolves.toMatchObject({ success: true });
    expect(apiCallCount()).toBe(2);
    expect(scheduler.getMetrics().successfulRequests).toBe(1);
    expect(scheduler.getMetrics().failedRequests).toBe(0);
  });

  it('does not revive a retrying request when the queue is cleared mid-backoff', async () => {
    sendMessage.mockResolvedValue({ success: false, status: 429, error: 'Too many requests' });
    scheduler = new ApiScheduler({ maxRetries: 2, retryDelay: 1000 });

    const settled = scheduler.scheduleRequest('/api/v1/users', 'GET', undefined, 1);
    const rejected = settled.catch((e: Error) => e.name);
    await settle();
    scheduler.clearQueue();
    await settle(5000);

    await expect(rejected).resolves.toBe('OperationCancelledError');
    expect(apiCallCount()).toBe(1);
  });

  it('never retries a status that is not retryable', async () => {
    sendMessage.mockResolvedValue({ success: false, status: 404, error: 'Not found' });
    scheduler = new ApiScheduler({ maxRetries: 2, retryDelay: 1000 });

    const result = await scheduler.scheduleRequest('/api/v1/users/u1', 'GET', undefined, 1);
    await settle(10_000);

    expect(result).toMatchObject({ success: false, status: 404 });
    expect(apiCallCount()).toBe(1);
    expect(scheduler.getMetrics().successfulRequests).toBe(0);
  });
});

describe('ApiScheduler · a 401 suspends the session (D-007b)', () => {
  it('settles the rest of the queue against the first 401 instead of sending it', async () => {
    sendMessage.mockResolvedValue({ success: false, status: 401, error: 'Unauthorized' });
    scheduler = new ApiScheduler({ maxConcurrent: 5, maxRetries: 2, retryDelay: 1000 });

    const results = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        scheduler.scheduleRequest(`/api/v1/users/u${i}`, 'GET', undefined, 1),
      ),
    );
    await settle(10_000);

    expect(results).toHaveLength(12);
    for (const result of results) {
      expect(result).toMatchObject({ success: false, status: 401 });
    }
    expect(apiCallCount()).toBeLessThanOrEqual(5);
    expect(scheduler.getState().expiredSessionTabIds).toEqual([1]);
  });

  it('never retries a 401 — an expired session is not a transient failure', async () => {
    sendMessage.mockResolvedValue({ success: false, status: 401, error: 'Unauthorized' });
    scheduler = new ApiScheduler({ maxConcurrent: 1, maxRetries: 2, retryDelay: 1000 });

    await scheduler.scheduleRequest('/api/v1/users/u1', 'GET', undefined, 1);
    await settle(10_000);

    expect(apiCallCount()).toBe(1);
    expect(scheduler.getMetrics().retriedRequests).toBe(0);
  });

  it('holds one tab without touching another tab’s session', async () => {
    sendMessage.mockResolvedValue({ success: false, status: 401, error: 'Unauthorized' });
    scheduler = new ApiScheduler({ maxConcurrent: 1 });
    await scheduler.scheduleRequest('/api/v1/users/u1', 'GET', undefined, 1);
    await settle();

    sendMessage.mockResolvedValue({ success: true, data: { id: 'u2' } });
    const other = await scheduler.scheduleRequest('/api/v1/users/u2', 'GET', undefined, 2);
    await settle();

    expect(other).toMatchObject({ success: true });
    expect(scheduler.getState().expiredSessionTabIds).toEqual([1]);
  });

  it('clears the suspension and resumes once the session answers again', async () => {
    sendMessage.mockResolvedValue({ success: false, status: 401, error: 'Unauthorized' });
    scheduler = new ApiScheduler({ maxConcurrent: 1 });
    await scheduler.scheduleRequest('/api/v1/users/u1', 'GET', undefined, 1);
    await settle();
    expect(scheduler.getState().expiredSessionTabIds).toEqual([1]);

    sendMessage.mockResolvedValue({ success: true, data: { id: 'u2' } });
    const probe = await scheduler.scheduleRequest('/api/v1/users/u2', 'GET', undefined, 1);
    await settle();

    expect(probe).toMatchObject({ success: true });
    expect(scheduler.getState().expiredSessionTabIds).toEqual([]);

    const before = apiCallCount();
    await scheduler.scheduleRequest('/api/v1/users/u3', 'GET', undefined, 1);
    await settle();
    expect(apiCallCount()).toBe(before + 1);
  });

  it('lets at most one request probe a suspended session at a time', async () => {
    sendMessage.mockResolvedValue({ success: false, status: 401, error: 'Unauthorized' });
    scheduler = new ApiScheduler({ maxConcurrent: 5 });
    await scheduler.scheduleRequest('/api/v1/users/u1', 'GET', undefined, 1);
    await settle();
    const afterSuspension = apiCallCount();

    sendMessage.mockImplementation(() => new Promise(() => {}));
    void scheduler.scheduleRequest('/api/v1/users/probe', 'GET', undefined, 1).catch(() => {});
    await settle();
    const shortCircuited = await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        scheduler.scheduleRequest(`/api/v1/groups/g${i}`, 'GET', undefined, 1),
      ),
    );
    await settle();

    expect(apiCallCount()).toBe(afterSuspension + 1);
    for (const result of shortCircuited) {
      expect(result).toMatchObject({ success: false, status: 401 });
      expect(result).not.toHaveProperty('data');
      expect(result).not.toHaveProperty('headers');
    }
  });
});
