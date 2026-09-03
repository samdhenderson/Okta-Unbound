import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiScheduler } from './apiScheduler';
import type { BucketState } from './types';

let scheduler: ApiScheduler;
const sendMessage = vi.fn();

function dispatchedEndpoints(): string[] {
  return sendMessage.mock.calls
    .filter((c) => c[1]?.action === 'makeApiRequest')
    .map((c) => c[1].endpoint as string);
}

function rateLimitHeaders(remaining: number, limit = 100): Record<string, string> {
  return {
    'x-rate-limit-limit': String(limit),
    'x-rate-limit-remaining': String(remaining),
    'x-rate-limit-reset': String(Math.floor(Date.now() / 1000) + 60),
  };
}

function bucketState(bucket: string): BucketState | undefined {
  return scheduler.getState().buckets.find((state) => state.bucket === bucket);
}

function activeIn(bucket: string): number {
  return bucketState(bucket)?.active ?? 0;
}

beforeEach(() => {
  vi.clearAllMocks();
  (chrome as unknown as { tabs: { sendMessage: typeof sendMessage } }).tabs = {
    sendMessage,
  };
});

afterEach(() => {
  scheduler?.stop();
  vi.useRealTimers();
});

describe('ApiScheduler per-bucket concurrency cap', () => {
  it('holds one family to its cap while another family keeps draining', async () => {
    sendMessage.mockImplementation(() => new Promise(() => {}));
    scheduler = new ApiScheduler({ maxConcurrent: 10, maxConcurrentPerBucket: 4 });

    for (let i = 0; i < 8; i++) {
      void scheduler
        .scheduleRequest(`/api/v1/groups/00gFAKE${i}/users?limit=200`, 'GET', undefined, 1)
        .catch(() => {});
    }
    for (let i = 0; i < 2; i++) {
      void scheduler
        .scheduleRequest(`/api/v1/users/00uFAKE${i}`, 'GET', undefined, 1)
        .catch(() => {});
    }
    await Promise.resolve();

    expect(activeIn('/api/v1/groups')).toBe(4);

    expect(activeIn('/api/v1/users')).toBe(2);
    expect(dispatchedEndpoints()).toContain('/api/v1/users/00uFAKE0');
    expect(dispatchedEndpoints()).toContain('/api/v1/users/00uFAKE1');

    expect(scheduler.getState().activeRequests).toBe(6);
    expect(scheduler.getState().queueLength).toBe(4);
  });

  it('does not end the drain pass at a bucket that is at its cap', async () => {
    sendMessage.mockImplementation(() => new Promise(() => {}));
    scheduler = new ApiScheduler({ maxConcurrent: 6, maxConcurrentPerBucket: 4 });

    for (let i = 0; i < 5; i++) {
      void scheduler
        .scheduleRequest(`/api/v1/groups/00gFAKE${i}/users?limit=200`, 'GET', undefined, 1)
        .catch(() => {});
    }
    void scheduler.scheduleRequest('/api/v1/users/00uFAKE0', 'GET', undefined, 1).catch(() => {});
    await Promise.resolve();

    expect(dispatchedEndpoints()).toContain('/api/v1/users/00uFAKE0');
    expect(activeIn('/api/v1/groups')).toBe(4);
    expect(scheduler.getState().queueLength).toBe(1);
  });

  it('still binds the global ceiling above the sum of the per-bucket caps', async () => {
    sendMessage.mockImplementation(() => new Promise(() => {}));
    scheduler = new ApiScheduler({ maxConcurrent: 10, maxConcurrentPerBucket: 4 });

    for (const family of ['users', 'groups', 'apps', 'idps']) {
      for (let i = 0; i < 4; i++) {
        void scheduler
          .scheduleRequest(`/api/v1/${family}/FAKE${i}`, 'GET', undefined, 1)
          .catch(() => {});
      }
    }
    await Promise.resolve();

    expect(scheduler.getState().activeRequests).toBe(10);
    for (const family of ['users', 'groups', 'apps', 'idps']) {
      expect(activeIn(`/api/v1/${family}`)).toBeLessThanOrEqual(4);
    }

    expect(activeIn('/api/v1/idps')).toBe(0);
    expect(scheduler.getState().queueLength).toBe(6);
  });

  it('does not exempt an interactive request from the cap', async () => {
    sendMessage.mockImplementation(() => new Promise(() => {}));
    scheduler = new ApiScheduler({ maxConcurrent: 10, maxConcurrentPerBucket: 4 });

    for (let i = 0; i < 4; i++) {
      void scheduler
        .scheduleRequest(`/api/v1/groups/00gFAKE${i}/users?limit=200`, 'GET', undefined, 1)
        .catch(() => {});
    }
    await Promise.resolve();

    void scheduler
      .scheduleRequest('/api/v1/groups/00gFAKE9', 'GET', undefined, 1, 'interactive')
      .catch(() => {});
    await Promise.resolve();

    expect(dispatchedEndpoints()).not.toContain('/api/v1/groups/00gFAKE9');
    expect(activeIn('/api/v1/groups')).toBe(4);
  });
});

describe('ApiScheduler config validation', () => {
  it('rejects a per-bucket cap at or above the global ceiling', () => {
    expect(() => new ApiScheduler({ maxConcurrent: 4, maxConcurrentPerBucket: 4 })).toThrow(
      /maxConcurrentPerBucket/,
    );
    expect(() => new ApiScheduler({ maxConcurrent: 4, maxConcurrentPerBucket: 9 })).toThrow(
      /maxConcurrentPerBucket/,
    );
  });

  it('rejects a per-bucket cap of zero or less', () => {
    expect(() => new ApiScheduler({ maxConcurrentPerBucket: 0 })).toThrow(/maxConcurrentPerBucket/);
    expect(() => new ApiScheduler({ maxConcurrentPerBucket: -1 })).toThrow(
      /maxConcurrentPerBucket/,
    );
  });

  it('lets a caller who moves only the ceiling keep an unbound per-bucket cap', async () => {
    sendMessage.mockImplementation(() => new Promise(() => {}));
    scheduler = new ApiScheduler({ maxConcurrent: 5 });

    for (let i = 0; i < 5; i++) {
      void scheduler
        .scheduleRequest(`/api/v1/users/00uFAKE${i}`, 'GET', undefined, 1)
        .catch(() => {});
    }
    await Promise.resolve();

    expect(activeIn('/api/v1/users')).toBe(5);
  });

  it('never lets a raised ceiling widen one bucket past what has ever shipped', async () => {
    sendMessage.mockImplementation(() => new Promise(() => {}));
    scheduler = new ApiScheduler({ maxConcurrent: 20 });

    for (let i = 0; i < 20; i++) {
      void scheduler
        .scheduleRequest(`/api/v1/users/00uFAKE${i}`, 'GET', undefined, 1)
        .catch(() => {});
    }
    await Promise.resolve();

    expect(activeIn('/api/v1/users')).toBe(5);
    expect(activeIn('/api/v1/users')).toBeLessThan(20);
  });
});

describe('ApiScheduler in-flight charging', () => {
  it('charges an observed bucket its own in-flight count, and the global backstop the total', async () => {
    let appsCalls = 0;
    sendMessage.mockImplementation(async (_tabId: number, msg: { endpoint: string }) => {
      if (msg.endpoint.startsWith('/api/v1/groups')) {
        return { success: true, data: msg.endpoint, headers: rateLimitHeaders(12) };
      }
      if (msg.endpoint.startsWith('/api/v1/apps')) {
        appsCalls++;
        if (appsCalls === 1) {
          return { success: true, data: msg.endpoint, headers: rateLimitHeaders(95) };
        }
        return new Promise(() => {});
      }
      return { success: true, data: msg.endpoint, headers: {} };
    });
    scheduler = new ApiScheduler({ maxRetries: 0 });

    await scheduler.scheduleRequest('/api/v1/groups?limit=200', 'GET', undefined, 1, 'high');
    await scheduler.scheduleRequest('/api/v1/apps?limit=200', 'GET', undefined, 1, 'high');
    expect(scheduler.getState().cooldownEndsAt).toBeFalsy();

    for (let i = 0; i < 3; i++) {
      void scheduler
        .scheduleRequest(`/api/v1/apps/0oaFAKE${i}/groups?limit=200`, 'GET', undefined, 1)
        .catch(() => {});
    }
    await new Promise((r) => setTimeout(r, 100));
    expect(activeIn('/api/v1/apps')).toBe(3);

    const groups = await scheduler.scheduleRequest(
      '/api/v1/groups/00gFAKE1/users?limit=200',
      'GET',
      undefined,
      1,
    );
    expect(groups.data).toBe('/api/v1/groups/00gFAKE1/users?limit=200');

    void scheduler.scheduleRequest('/api/v1/idps/FAKE1', 'GET', undefined, 1).catch(() => {});
    await new Promise((r) => setTimeout(r, 200));
    expect(dispatchedEndpoints()).not.toContain('/api/v1/idps/FAKE1');
  });
});

describe('ApiScheduler remembered buckets', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  async function settle(endpoint: string): Promise<void> {
    await scheduler.scheduleRequest(endpoint, 'GET', undefined, 1, 'high');
  }

  it('still lists a settled bucket after its queue, plan and observation have all gone', async () => {
    sendMessage.mockResolvedValue({ success: true, data: 'ok', headers: rateLimitHeaders(95) });
    scheduler = new ApiScheduler({ maxRetries: 0 });

    await settle('/api/v1/groups?limit=200');
    const settledAt = Date.now();

    await vi.advanceTimersByTimeAsync(120_000);

    const state = bucketState('/api/v1/groups');
    expect(state).toBeDefined();

    expect(state?.queued).toBe(0);
    expect(state?.active).toBe(0);
    expect(state?.planned).toBe(0);

    expect(state?.limit).toBeNull();
    expect(state?.remaining).toBeNull();
    expect(state?.resetAt).toBeNull();

    expect(state?.lastActiveAt).toBe(settledAt);
  });

  it('drops a remembered bucket once its memory has aged out', async () => {
    sendMessage.mockResolvedValue({ success: true, data: 'ok', headers: rateLimitHeaders(95) });
    scheduler = new ApiScheduler({ maxRetries: 0 });

    await settle('/api/v1/groups?limit=200');
    await vi.advanceTimersByTimeAsync(9 * 60 * 1000);
    expect(bucketState('/api/v1/groups')).toBeDefined();

    await vi.advanceTimersByTimeAsync(2 * 60 * 1000);
    expect(bucketState('/api/v1/groups')).toBeUndefined();
  });

  it('evicts the least-recently-active bucket when a thirteenth arrives', async () => {
    sendMessage.mockResolvedValue({ success: true, data: 'ok' });
    scheduler = new ApiScheduler({ maxRetries: 0 });

    for (let i = 0; i < 12; i++) {
      await settle(`/api/v1/family${i}/FAKE`);
    }
    expect(scheduler.getState().buckets).toHaveLength(12);
    expect(bucketState('/api/v1/family0')).toBeDefined();

    await settle('/api/v1/family12/FAKE');

    expect(scheduler.getState().buckets).toHaveLength(12);
    expect(bucketState('/api/v1/family0')).toBeUndefined();
    expect(bucketState('/api/v1/family1')).toBeDefined();
    expect(bucketState('/api/v1/family12')).toBeDefined();
  });

  it('never evicts a bucket that still has work in flight', async () => {
    let calls = 0;
    sendMessage.mockImplementation(async () => {
      calls++;
      if (calls === 2) return new Promise(() => {});
      return { success: true, data: 'ok' };
    });
    scheduler = new ApiScheduler({ maxRetries: 0, maxConcurrent: 20, maxConcurrentPerBucket: 4 });

    await settle('/api/v1/family0/FAKE');
    void scheduler.scheduleRequest('/api/v1/family0/BUSY', 'GET', undefined, 1).catch(() => {});
    await vi.advanceTimersByTimeAsync(100);
    expect(activeIn('/api/v1/family0')).toBe(1);

    for (let i = 1; i <= 12; i++) {
      await settle(`/api/v1/family${i}/FAKE`);
    }

    expect(bucketState('/api/v1/family0')?.lastActiveAt).toEqual(expect.any(Number));
    expect(bucketState('/api/v1/family0')?.active).toBe(1);
    expect(bucketState('/api/v1/family1')).toBeUndefined();
    expect(bucketState('/api/v1/family2')).toBeDefined();
    expect(scheduler.getState().buckets).toHaveLength(12);
  });

  it('never ages out the memory of a bucket whose gate is armed', async () => {
    sendMessage.mockImplementation(async (_tabId: number, msg: { endpoint: string }) => ({
      success: true,
      data: 'ok',
      headers: msg.endpoint.startsWith('/api/v1/family0')
        ? {
            ...rateLimitHeaders(2),
            'x-rate-limit-reset': String(Math.floor(Date.now() / 1000) + 3600),
          }
        : rateLimitHeaders(95),
    }));
    scheduler = new ApiScheduler({ maxRetries: 0, cooldownDuration: 60 * 60 * 1000 });

    await settle('/api/v1/family1/FAKE');
    await settle('/api/v1/family0/FAKE');
    expect(bucketState('/api/v1/family0')?.gatedUntil).toEqual(expect.any(Number));

    await vi.advanceTimersByTimeAsync(11 * 60 * 1000);

    expect(bucketState('/api/v1/family1')).toBeUndefined();
    expect(bucketState('/api/v1/family0')?.lastActiveAt).toEqual(expect.any(Number));
    expect(bucketState('/api/v1/family0')?.gatedUntil).toEqual(expect.any(Number));
  });
});
