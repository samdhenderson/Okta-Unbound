import type { ApiScheduler } from '../shared/scheduler/apiScheduler';
import { syncOrg, type PageRequest, type WalkOutcome } from '../shared/snapshot/snapshotSync';
import type { SnapshotCollection } from '../shared/snapshot/types';
import { createLogger } from '../shared/utils/logger';
import { oktaOriginOf } from '../shared/utils/oktaUrl';

const log = createLogger('SnapshotBridge');

export interface SnapshotUpdatedMessage {
  action: 'snapshotUpdated';
  origin: string;
  collection: SnapshotCollection;
  loaded: number;
  complete: boolean;
}

const inFlight = new Map<string, { run: Promise<WalkOutcome[]>; force: boolean }>();

async function tabIsOnOrigin(origin: string, tabId: number): Promise<boolean> {
  try {
    const tab = await chrome.tabs.get(tabId);
    return oktaOriginOf(tab?.url) === origin;
  } catch {
    return false;
  }
}

function broadcast(message: SnapshotUpdatedMessage): void {
  chrome.runtime.sendMessage(message).catch(() => {
    // No listener (side panel closed) — expected for a background sync.
  });
}

export function createSchedulerPageRequest(scheduler: ApiScheduler, tabId: number): PageRequest {
  return async (url, reason) => {
    try {
      const result = await scheduler.scheduleRequest(url, 'GET', undefined, tabId, 'low', reason);
      return result.success
        ? { success: true, data: result.data, headers: result.headers }
        : { success: false, data: result.data, headers: result.headers, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
    }
  };
}

export async function syncSnapshot(
  scheduler: ApiScheduler,
  origin: string,
  tabId: number,
  now: number = Date.now(),
  force = false,
): Promise<WalkOutcome[]> {
  const existing = inFlight.get(origin);
  if (existing && (existing.force || !force)) {
    log.debug('Joining an in-flight snapshot sync');
    return existing.run;
  }
  if (existing) {
    log.debug('Queueing a forced sync behind an in-flight one');
    await existing.run.catch(() => undefined);
  }

  if (!(await tabIsOnOrigin(origin, tabId))) {
    log.warn('Refusing snapshot sync: tab is not on the requested origin', {
      code: 'snapshot_origin_mismatch',
      tabId,
    });
    throw new Error('The connected tab is no longer on this Okta org');
  }

  const raced = inFlight.get(origin);
  if (raced && (raced.force || !force)) return raced.run;

  const run = syncOrg({
    origin,
    now,
    force,
    request: createSchedulerPageRequest(scheduler, tabId),
    onPage: (collection, loaded) =>
      broadcast({ action: 'snapshotUpdated', origin, collection, loaded, complete: false }),
  })
    .then((outcomes) => {
      for (const outcome of outcomes) {
        broadcast({
          action: 'snapshotUpdated',
          origin,
          collection: outcome.collection,
          loaded: outcome.written,
          complete: outcome.complete,
        });
      }
      log.debug('Snapshot sync settled', {
        outcomes: outcomes.map((o) => ({
          collection: o.collection,
          mode: o.mode,
          complete: o.complete,
          written: o.written,
          swept: o.swept,
        })),
      });
      return outcomes;
    })
    .finally(() => {
      inFlight.delete(origin);
    });

  inFlight.set(origin, { run, force });
  return run;
}
