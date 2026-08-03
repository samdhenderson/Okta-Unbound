import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCoreApi } from './core';
import { resetCurrentUserCache, CURRENT_USER_TTL_MS } from './currentUserCache';

const runtimeSendMessage = chrome.runtime.sendMessage as ReturnType<typeof vi.fn>;

function makeCore(tabId: number) {
  const progress = { start: vi.fn(), reportBatch: vi.fn(), complete: vi.fn() };
  return createCoreApi(tabId, () => {}, vi.fn(), progress, {});
}

function meCallCount(): number {
  return runtimeSendMessage.mock.calls.filter(
    (c) => c[0]?.action === 'scheduleApiRequest' && c[0]?.endpoint === '/api/v1/users/me',
  ).length;
}

beforeEach(() => {
  runtimeSendMessage.mockReset();
  resetCurrentUserCache();
  runtimeSendMessage.mockResolvedValue({
    success: true,
    data: { id: '00uFAKEADMIN', profile: { email: 'admin@example.com' } },
  });
});

describe('coreApi.getCurrentUser TTL cache', () => {
  it('serves a second call within the TTL from cache — one network request', async () => {
    const core = makeCore(1);

    const first = await core.getCurrentUser();
    const second = await core.getCurrentUser();

    expect(first).toEqual({ email: 'admin@example.com', id: '00uFAKEADMIN' });
    expect(second).toEqual(first);
    expect(meCallCount()).toBe(1);
  });

  it('does not share the cache between different tabs', async () => {
    await makeCore(1).getCurrentUser();
    await makeCore(2).getCurrentUser();

    expect(meCallCount()).toBe(2);
  });

  it('re-fetches once the TTL has expired', async () => {
    vi.useFakeTimers();
    try {
      const core = makeCore(1);
      await core.getCurrentUser();

      vi.advanceTimersByTime(CURRENT_USER_TTL_MS + 1);

      await core.getCurrentUser();
      expect(meCallCount()).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not cache a failed lookup, so the next call retries', async () => {
    runtimeSendMessage.mockReset();
    runtimeSendMessage.mockRejectedValueOnce(new Error('net down')).mockResolvedValueOnce({
      success: true,
      data: { id: '00uFAKEADMIN', profile: { email: 'admin@example.com' } },
    });

    const core = makeCore(1);

    const failed = await core.getCurrentUser();
    expect(failed).toEqual({ email: 'unknown@unknown.com', id: 'unknown' });

    const retried = await core.getCurrentUser();
    expect(retried).toEqual({ email: 'admin@example.com', id: '00uFAKEADMIN' });
    expect(meCallCount()).toBe(2);
  });
});
