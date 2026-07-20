import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiScheduler } from './apiScheduler';
import type { SchedulerState, SchedulerStatus } from './types';

let scheduler: ApiScheduler;
const sendMessage = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (chrome as unknown as { tabs: { sendMessage: typeof sendMessage } }).tabs = {
    sendMessage,
  };
});

afterEach(() => {
  scheduler?.stop();
});

describe('ApiScheduler state-change notifications', () => {
  it('notifies with status "idle" once the queue drains (the transition the old poll masked)', async () => {
    sendMessage.mockResolvedValue({ success: true, data: 'ok' });
    scheduler = new ApiScheduler();

    const seen: SchedulerStatus[] = [];
    scheduler.onStateChange((s: SchedulerState) => seen.push(s.status));

    await scheduler.scheduleRequest('/api/v1/users/me', 'GET', undefined, 1);
    expect(seen).toContain('processing');

    await vi.waitFor(() => expect(scheduler.getState().status).toBe('idle'));
    expect(seen.at(-1)).toBe('idle');
  });

  it('does not re-notify while the status is unchanged (the 50ms loop must not churn)', async () => {
    sendMessage.mockResolvedValue({ success: true, data: 'ok' });
    scheduler = new ApiScheduler();

    await scheduler.scheduleRequest('/api/v1/users/me', 'GET', undefined, 1);
    await vi.waitFor(() => expect(scheduler.getState().status).toBe('idle'));

    const listener = vi.fn();
    scheduler.onStateChange(listener);
    await new Promise((r) => setTimeout(r, 200));
    expect(listener).not.toHaveBeenCalled();
  });
});
