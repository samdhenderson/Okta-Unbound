import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiScheduler } from './apiScheduler';

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

beforeEach(() => {
  vi.clearAllMocks();
  (chrome as unknown as { tabs: { sendMessage: typeof sendMessage } }).tabs = {
    sendMessage,
  };
});

afterEach(() => {
  scheduler?.stop();
});

describe('ApiScheduler interactive tier', () => {
  it('dispatches before high/normal/low regardless of enqueue order', async () => {
    sendMessage.mockImplementation(
      () => new Promise((res) => setTimeout(() => res({ success: true }), 5)),
    );
    scheduler = new ApiScheduler({ maxConcurrent: 1, maxRetries: 0 });

    await Promise.all([
      scheduler.scheduleRequest('/low', 'GET', undefined, 1, 'low'),
      scheduler.scheduleRequest('/normal', 'GET', undefined, 1, 'normal'),
      scheduler.scheduleRequest('/high', 'GET', undefined, 1, 'high'),
      scheduler.scheduleRequest('/interactive', 'GET', undefined, 1, 'interactive'),
    ]);

    expect(dispatchedEndpoints()).toEqual(['/interactive', '/high', '/normal', '/low']);
  });

  it('dispatches during a soft cooldown while a normal request stays queued', async () => {
    sendMessage.mockImplementation(async (_tabId: number, msg: { endpoint: string }) => ({
      success: true,
      data: msg.endpoint,
      headers: rateLimitHeaders(5),
    }));
    scheduler = new ApiScheduler({ maxRetries: 0 });

    await scheduler.scheduleRequest('/prime', 'GET', undefined, 1, 'high');
    expect(scheduler.getState().cooldownEndsAt).toBeTruthy();

    let normalResolved = false;
    void scheduler
      .scheduleRequest('/normal', 'GET', undefined, 1, 'normal')
      .then(() => {
        normalResolved = true;
      })
      .catch(() => {});

    const interactive = await scheduler.scheduleRequest(
      '/interactive',
      'GET',
      undefined,
      1,
      'interactive',
    );

    await new Promise((r) => setTimeout(r, 150));

    expect(interactive.data).toBe('/interactive');
    expect(normalResolved).toBe(false);
    expect(dispatchedEndpoints()).toEqual(['/prime', '/interactive']);
  });

  it('holds an interactive request when the hard rate limit is exhausted (remaining 0)', async () => {
    sendMessage.mockImplementation(async () => ({
      success: true,
      headers: rateLimitHeaders(0),
    }));
    scheduler = new ApiScheduler({ maxRetries: 0 });

    await scheduler.scheduleRequest('/prime', 'GET', undefined, 1, 'high');
    expect(scheduler.getState().cooldownEndsAt).toBeTruthy();

    let interactiveResolved = false;
    void scheduler
      .scheduleRequest('/interactive', 'GET', undefined, 1, 'interactive')
      .then(() => {
        interactiveResolved = true;
      })
      .catch(() => {});

    await new Promise((r) => setTimeout(r, 200));

    expect(interactiveResolved).toBe(false);
    expect(dispatchedEndpoints()).toEqual(['/prime']);
  });
});
