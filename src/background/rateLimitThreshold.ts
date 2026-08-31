import type { ApiScheduler } from '../shared/scheduler/apiScheduler';
import {
  WARNING_THRESHOLD_ENDPOINT,
  minRemainingFromWarningThreshold,
  parseWarningThreshold,
} from '../shared/scheduler/rateLimitSettings';
import { createLogger } from '../shared/utils/logger';
import { oktaOriginOf } from '../shared/utils/oktaUrl';

const log = createLogger('RateLimitThreshold');

function storageKey(origin: string): string {
  return `rateLimitThreshold:${origin}`;
}

type MemoisedThreshold = { minRemaining: number | null };

const inFlight = new Set<string>();

async function originOfTab(tabId: number): Promise<string | null> {
  try {
    const tab = await chrome.tabs.get(tabId);
    return oktaOriginOf(tab.url);
  } catch {
    return null;
  }
}

async function readMemo(origin: string): Promise<MemoisedThreshold | null> {
  try {
    const key = storageKey(origin);
    const stored = await chrome.storage.session.get([key]);
    const value = stored[key] as MemoisedThreshold | undefined;
    if (!value || typeof value !== 'object') return null;
    const { minRemaining } = value;
    if (minRemaining === null) return { minRemaining: null };
    return typeof minRemaining === 'number' ? { minRemaining } : null;
  } catch {
    return null;
  }
}

async function writeMemo(origin: string, memo: MemoisedThreshold): Promise<void> {
  try {
    await chrome.storage.session.set({ [storageKey(origin)]: memo });
  } catch {
    // Same: a memo we could not write costs a repeat probe, nothing more.
  }
}

async function probe(scheduler: ApiScheduler, origin: string, tabId: number): Promise<void> {
  let minRemaining: number | null = null;
  let code = 'rate_limit_threshold_unusable';

  try {
    const result = await scheduler.scheduleRequest(
      WARNING_THRESHOLD_ENDPOINT,
      'GET',
      undefined,
      tabId,
      'low',
      'Read org rate-limit threshold',
    );

    if (!result.success) {
      code = 'rate_limit_threshold_unavailable';
      log.info('Org rate-limit threshold not readable', { code, status: result.status });
    } else {
      const warningThreshold = parseWarningThreshold(result.data);
      if (warningThreshold === null) {
        log.warn('Org rate-limit threshold was not usable', { code });
      } else {
        minRemaining = minRemainingFromWarningThreshold(warningThreshold);
        code = 'rate_limit_threshold_applied';
        log.info('Org rate-limit threshold applied', { code, warningThreshold, minRemaining });
      }
    }
  } catch {
    code = 'rate_limit_threshold_failed';
    log.warn('Org rate-limit threshold probe failed', { code });
  }

  if (minRemaining !== null) scheduler.setMinRemainingThreshold(minRemaining);
  await writeMemo(origin, { minRemaining });
}

export function ensureRateLimitThreshold(scheduler: ApiScheduler, tabId: number): void {
  void (async () => {
    const origin = await originOfTab(tabId);
    if (origin === null) return;

    const memo = await readMemo(origin);
    if (memo !== null) {
      if (memo.minRemaining !== null) scheduler.setMinRemainingThreshold(memo.minRemaining);
      return;
    }

    if (inFlight.has(origin)) return;
    inFlight.add(origin);
    try {
      await probe(scheduler, origin, tabId);
    } finally {
      inFlight.delete(origin);
    }
  })();
}

export function resetRateLimitThresholdMemo(): void {
  inFlight.clear();
}
