import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiScheduler } from './apiScheduler';

let scheduler: ApiScheduler;
const sendMessage = vi.fn();

function rateLimitHeaders(remaining: number, limit: number): Record<string, string> {
  return {
    'x-rate-limit-limit': String(limit),
    'x-rate-limit-remaining': String(remaining),
    'x-rate-limit-reset': String(Math.floor(Date.now() / 1000) + 60),
  };
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

describe('ApiScheduler.shouldEnterCooldown with a zero budget', () => {
  it('does not treat a zero-limit response as headroom', async () => {
    scheduler = new ApiScheduler({ maxConcurrent: 5, minRemainingThreshold: 10 });

    sendMessage.mockResolvedValue({ success: true, data: {}, headers: rateLimitHeaders(5, 100) });
    await scheduler.scheduleRequest('/api/v1/apps', 'GET', undefined, 1);
    await vi.advanceTimersByTimeAsync(0);

    sendMessage.mockResolvedValue({ success: true, data: {}, headers: rateLimitHeaders(0, 0) });
    await scheduler.scheduleRequest('/api/v1/groups', 'GET', undefined, 1, 'interactive');
    await vi.advanceTimersByTimeAsync(0);

    const groups = scheduler.getState().buckets.find((b) => b.bucket === '/api/v1/groups');
    expect(groups?.gatedUntil).toEqual(expect.any(Number));
  });
});
