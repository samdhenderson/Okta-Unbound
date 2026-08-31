import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ensureRateLimitThreshold, resetRateLimitThresholdMemo } from './rateLimitThreshold';
import { WARNING_THRESHOLD_ENDPOINT } from '../shared/scheduler/rateLimitSettings';
import type { ApiScheduler } from '../shared/scheduler/apiScheduler';

const ORIGIN = 'https://example.okta.com';
const TAB_ID = 7;

const scheduleRequest = vi.fn();
const setMinRemainingThreshold = vi.fn();

const scheduler = () => ({ scheduleRequest, setMinRemainingThreshold }) as unknown as ApiScheduler;

const session = new Map<string, unknown>();

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  vi.clearAllMocks();
  session.clear();
  resetRateLimitThresholdMemo();

  (globalThis as unknown as { chrome: unknown }).chrome = {
    tabs: { get: vi.fn(async () => ({ url: `${ORIGIN}/admin/dashboard` })) },
    storage: {
      session: {
        get: vi.fn(async (keys: string[]) => {
          const out: Record<string, unknown> = {};
          for (const key of keys) if (session.has(key)) out[key] = session.get(key);
          return out;
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          for (const [key, value] of Object.entries(items)) session.set(key, value);
        }),
      },
    },
  };
});

describe('ensureRateLimitThreshold', () => {
  it('reads the org setting and applies the implied cooldown trigger', async () => {
    scheduleRequest.mockResolvedValue({ success: true, data: { warningThreshold: 90 } });

    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();

    expect(scheduleRequest).toHaveBeenCalledTimes(1);
    const [endpoint, method, body, tabId, priority] = scheduleRequest.mock.calls[0];
    expect(endpoint).toBe(WARNING_THRESHOLD_ENDPOINT);
    expect(method).toBe('GET');
    expect(body).toBeUndefined();
    expect(tabId).toBe(TAB_ID);
    expect(priority).toBe('low');
    expect(setMinRemainingThreshold).toHaveBeenCalledWith(15);
  });

  it('probes once per org however many requests arrive', async () => {
    scheduleRequest.mockResolvedValue({ success: true, data: { warningThreshold: 60 } });

    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();
    ensureRateLimitThreshold(scheduler(), TAB_ID);
    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();

    expect(scheduleRequest).toHaveBeenCalledTimes(1);
  });

  it('leaves the configured default alone on a 403 — and does not re-probe', async () => {
    scheduleRequest.mockResolvedValue({ success: false, status: 403, error: 'Forbidden' });

    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();

    expect(setMinRemainingThreshold).not.toHaveBeenCalled();

    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();
    expect(scheduleRequest).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['an unusable percentage', { success: true, data: { warningThreshold: 0 } }],
    ['a body of the wrong shape', { success: true, data: { threshold: 90 } }],
    ['no body at all', { success: true, data: null }],
  ])('leaves the configured default alone for %s', async (_name, response) => {
    scheduleRequest.mockResolvedValue(response);

    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();

    expect(setMinRemainingThreshold).not.toHaveBeenCalled();
  });

  it('leaves the configured default alone when the probe throws', async () => {
    scheduleRequest.mockRejectedValue(new Error('worker suspended'));

    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();

    expect(setMinRemainingThreshold).not.toHaveBeenCalled();
  });

  it('re-applies a memoised answer without re-asking, for a woken worker', async () => {
    scheduleRequest.mockResolvedValue({ success: true, data: { warningThreshold: 90 } });

    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();
    expect(scheduleRequest).toHaveBeenCalledTimes(1);

    setMinRemainingThreshold.mockClear();
    resetRateLimitThresholdMemo(); // clears only the in-flight set, not storage
    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();

    expect(scheduleRequest).toHaveBeenCalledTimes(1);
    expect(setMinRemainingThreshold).toHaveBeenCalledWith(15);
  });

  it('issues nothing for a tab that is not on an Okta origin', async () => {
    (globalThis as unknown as { chrome: { tabs: { get: unknown } } }).chrome.tabs.get = vi.fn(
      async () => ({ url: 'https://evil.example.com/admin' }),
    );

    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();

    expect(scheduleRequest).not.toHaveBeenCalled();
  });

  it('issues nothing when the tab is gone', async () => {
    (globalThis as unknown as { chrome: { tabs: { get: unknown } } }).chrome.tabs.get = vi.fn(
      async () => {
        throw new Error('No tab with id: 7');
      },
    );

    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();

    expect(scheduleRequest).not.toHaveBeenCalled();
  });

  it('never rejects, so an inbound request is never failed by it', async () => {
    scheduleRequest.mockRejectedValue(new Error('boom'));

    expect(ensureRateLimitThreshold(scheduler(), TAB_ID)).toBeUndefined();
    await settle();

    expect(setMinRemainingThreshold).not.toHaveBeenCalled();
    ensureRateLimitThreshold(scheduler(), TAB_ID);
    await settle();
    expect(scheduleRequest).toHaveBeenCalledTimes(1);
  });
});
