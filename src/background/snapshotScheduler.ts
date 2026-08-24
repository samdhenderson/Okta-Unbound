import type { ApiScheduler } from '../shared/scheduler/apiScheduler';
import { syncSnapshot } from './snapshotBridge';
import { oktaOriginOf } from '../shared/utils/oktaUrl';
import { createLogger } from '../shared/utils/logger';

const log = createLogger('SnapshotScheduler');

export const SNAPSHOT_SYNC_ALARM = 'snapshotSync';

export const TAB_SETTLE_DEBOUNCE_MS = 3_000;

export const MIN_ATTEMPT_INTERVAL_MS = 60_000;

export const SNAPSHOT_ALARM_PERIOD_MINUTES = 15;

export interface SnapshotSchedulerDeps {
  scheduler: ApiScheduler;
  sync?: typeof syncSnapshot;
  now?: () => number;
  debounceMs?: number;
}

export interface SnapshotSchedulerHandlers {
  onTabUpdated: (
    tabId: number,
    changeInfo: chrome.tabs.OnUpdatedInfo,
    tab: chrome.tabs.Tab,
  ) => void;
  onAlarm: (alarm: chrome.alarms.Alarm) => Promise<void>;
}

export function createSnapshotScheduler(deps: SnapshotSchedulerDeps): SnapshotSchedulerHandlers {
  const { scheduler } = deps;
  const sync = deps.sync ?? syncSnapshot;
  const now = deps.now ?? (() => Date.now());
  const debounceMs = deps.debounceMs ?? TAB_SETTLE_DEBOUNCE_MS;

  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const lastAttemptAt = new Map<string, number>();

  async function attempt(origin: string, tabId: number): Promise<void> {
    const at = now();
    const last = lastAttemptAt.get(origin);
    if (last !== undefined && at - last < MIN_ATTEMPT_INTERVAL_MS) return;
    lastAttemptAt.set(origin, at);

    try {
      await sync(scheduler, origin, tabId, at, false);
    } catch (error) {
      log.debug('Opportunistic snapshot sync did not run', {
        code: 'snapshot_attempt_skipped',
        tabId,
        reason: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  function scheduleAttempt(origin: string, tabId: number): void {
    const existing = timers.get(origin);
    if (existing !== undefined) clearTimeout(existing);
    timers.set(
      origin,
      setTimeout(() => {
        timers.delete(origin);
        void attempt(origin, tabId);
      }, debounceMs),
    );
  }

  return {
    onTabUpdated: (tabId, changeInfo, tab) => {
      if (changeInfo.status !== 'complete') return;
      const origin = oktaOriginOf(tab.url);
      if (!origin) return;
      scheduleAttempt(origin, tabId);
    },

    onAlarm: async (alarm) => {
      if (alarm.name !== SNAPSHOT_SYNC_ALARM) return;
      const tabs = await chrome.tabs.query({});
      const byOrigin = new Map<string, number>();
      for (const tab of tabs) {
        const origin = oktaOriginOf(tab.url);
        if (origin && tab.id !== undefined && !byOrigin.has(origin)) {
          byOrigin.set(origin, tab.id);
        }
      }
      if (byOrigin.size === 0) return;
      log.debug('Alarm re-arming snapshot attempts', { origins: byOrigin.size });
      await Promise.all([...byOrigin].map(([origin, tabId]) => attempt(origin, tabId)));
    },
  };
}

export function startSnapshotScheduler(scheduler: ApiScheduler): void {
  const handlers = createSnapshotScheduler({ scheduler });
  chrome.tabs.onUpdated.addListener(handlers.onTabUpdated);
  chrome.alarms.onAlarm.addListener((alarm) => void handlers.onAlarm(alarm));
  chrome.alarms.create(SNAPSHOT_SYNC_ALARM, {
    periodInMinutes: SNAPSHOT_ALARM_PERIOD_MINUTES,
  });
  log.debug('Snapshot scheduler started');
}
