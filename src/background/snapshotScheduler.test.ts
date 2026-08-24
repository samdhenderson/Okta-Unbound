import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createSnapshotScheduler,
  MIN_ATTEMPT_INTERVAL_MS,
  SNAPSHOT_SYNC_ALARM,
} from './snapshotScheduler';

const ORIGIN = 'https://acme.okta.com';
const OTHER_ORIGIN = 'https://other.okta.com';
const DEBOUNCE = 3_000;

const tabsQuery = vi.fn();

globalThis.chrome = {
  tabs: { query: tabsQuery },
} as unknown as typeof chrome;

function tab(id: number, url?: string) {
  return { id, url } as chrome.tabs.Tab;
}

const COMPLETE = { status: 'complete' } as chrome.tabs.OnUpdatedInfo;

function harness(startAt = 1_000_000) {
  const sync = vi.fn(async () => []);
  const clock = { at: startAt };
  const handlers = createSnapshotScheduler({
    scheduler: {} as never,
    sync: sync as never,
    now: () => clock.at,
    debounceMs: DEBOUNCE,
  });
  return { handlers, sync, clock };
}

async function settle() {
  await vi.advanceTimersByTimeAsync(DEBOUNCE);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('an Okta tab settling', () => {
  it('attempts a sync for the tab that settled', async () => {
    const { handlers, sync } = harness();

    handlers.onTabUpdated(7, COMPLETE, tab(7, `${ORIGIN}/admin/groups`));
    await settle();

    expect(sync).toHaveBeenCalledTimes(1);
    expect(sync).toHaveBeenCalledWith(expect.anything(), ORIGIN, 7, expect.any(Number), false);
  });

  it('waits for the tab to settle rather than firing on the event', async () => {
    const { handlers, sync } = harness();

    handlers.onTabUpdated(7, COMPLETE, tab(7, `${ORIGIN}/admin/groups`));
    await vi.advanceTimersByTimeAsync(DEBOUNCE - 1);

    expect(sync).not.toHaveBeenCalled();
  });

  it('collapses a burst of navigations into a single attempt', async () => {
    const { handlers, sync } = harness();

    handlers.onTabUpdated(7, COMPLETE, tab(7, `${ORIGIN}/admin/groups`));
    await vi.advanceTimersByTimeAsync(500);
    handlers.onTabUpdated(7, COMPLETE, tab(7, `${ORIGIN}/admin/group/00gFAKE`));
    await vi.advanceTimersByTimeAsync(500);
    handlers.onTabUpdated(7, COMPLETE, tab(7, `${ORIGIN}/admin/users`));
    await settle();

    expect(sync).toHaveBeenCalledTimes(1);
  });

  it('holds an org to one attempt per interval however much the admin browses', async () => {
    const { handlers, sync, clock } = harness();

    handlers.onTabUpdated(7, COMPLETE, tab(7, `${ORIGIN}/admin/groups`));
    await settle();
    expect(sync).toHaveBeenCalledTimes(1);

    clock.at += MIN_ATTEMPT_INTERVAL_MS - 1;
    handlers.onTabUpdated(7, COMPLETE, tab(7, `${ORIGIN}/admin/users`));
    await settle();
    expect(sync).toHaveBeenCalledTimes(1);

    clock.at += 2;
    handlers.onTabUpdated(7, COMPLETE, tab(7, `${ORIGIN}/admin/apps`));
    await settle();
    expect(sync).toHaveBeenCalledTimes(2);
  });

  it('keeps two orgs on their own floors', async () => {
    const { handlers, sync } = harness();

    handlers.onTabUpdated(7, COMPLETE, tab(7, `${ORIGIN}/admin/groups`));
    handlers.onTabUpdated(8, COMPLETE, tab(8, `${OTHER_ORIGIN}/admin/groups`));
    await settle();

    expect(sync).toHaveBeenCalledTimes(2);
  });

  it('ignores a navigation that has not finished, and any non-Okta host', async () => {
    const { handlers, sync } = harness();

    handlers.onTabUpdated(7, { status: 'loading' } as chrome.tabs.OnUpdatedInfo, tab(7, ORIGIN));
    handlers.onTabUpdated(8, COMPLETE, tab(8, 'https://okta.com.evil.example/admin'));
    handlers.onTabUpdated(9, COMPLETE, tab(9, undefined));
    await settle();

    expect(sync).not.toHaveBeenCalled();
  });

  it('swallows a rejected attempt rather than leaving it unhandled', async () => {
    const { handlers, sync } = harness();
    sync.mockRejectedValue(new Error('The connected tab is no longer on this Okta org'));

    handlers.onTabUpdated(7, COMPLETE, tab(7, `${ORIGIN}/admin/groups`));

    await expect(settle()).resolves.not.toThrow();
  });
});

describe('the periodic alarm', () => {
  it('attempts once per org, not once per tab', async () => {
    const { handlers, sync } = harness();
    tabsQuery.mockResolvedValue([
      tab(1, `${ORIGIN}/admin/groups`),
      tab(2, `${ORIGIN}/admin/users`),
      tab(3, `${OTHER_ORIGIN}/admin/groups`),
      tab(4, 'https://example.com/'),
    ]);

    await handlers.onAlarm({ name: SNAPSHOT_SYNC_ALARM } as chrome.alarms.Alarm);

    expect(sync).toHaveBeenCalledTimes(2);
    expect(sync.mock.calls.map((call) => (call as unknown[])[1])).toEqual([ORIGIN, OTHER_ORIGIN]);
    expect((sync.mock.calls[0] as unknown[])[2]).toBe(1);
  });

  it('does nothing when no Okta tab is open', async () => {
    const { handlers, sync } = harness();
    tabsQuery.mockResolvedValue([tab(1, 'https://example.com/')]);

    await handlers.onAlarm({ name: SNAPSHOT_SYNC_ALARM } as chrome.alarms.Alarm);

    expect(sync).not.toHaveBeenCalled();
  });

  it('ignores every other alarm the extension registers', async () => {
    const { handlers, sync } = harness();

    await handlers.onAlarm({ name: 'auditRetentionCleanup' } as chrome.alarms.Alarm);

    expect(tabsQuery).not.toHaveBeenCalled();
    expect(sync).not.toHaveBeenCalled();
  });
});
