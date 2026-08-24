import type { DriftVerdict, SnapshotCollection, SyncMeta } from './types';

export const DRIFT_CHECK_INTERVAL_MS = 15 * 60 * 1000;

export function emptySyncMeta(origin: string, collection: SnapshotCollection): SyncMeta {
  return {
    origin,
    collection,
    lastFullWalkAt: null,
    lastDeltaAt: null,
    watermark: null,
    itemCount: null,
    cursor: null,
    walkStartedAt: null,
    deltaSupported: null,
    complete: false,
    completedShards: [],
  };
}

export function advanceWatermark(
  current: string | null,
  candidates: ReadonlyArray<string | undefined | null>,
): string | null {
  let best = current;
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !ISO_UTC.test(candidate)) continue;
    if (best === null || candidate > best) best = candidate;
  }
  return best;
}

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;

export function driftVerdict(reportedTotal: number | null, storedCount: number): DriftVerdict {
  if (reportedTotal === null || !Number.isFinite(reportedTotal) || reportedTotal < 0) {
    return 'unknown';
  }
  return reportedTotal === storedCount ? 'in-sync' : 'drifted';
}

export function readTotalCount(headers: Record<string, string> | undefined): number | null {
  if (!headers) return null;
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== 'x-total-count') continue;
    if (typeof value !== 'string' || value.trim() === '') return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
  }
  return null;
}

export type SyncMode = 'full' | 'delta' | 'drift-check' | 'none';

export function nextSyncMode(
  meta: SyncMeta,
  now: number,
  refreshIntervalMs: number = DRIFT_CHECK_INTERVAL_MS,
): SyncMode {
  if (!meta.complete || meta.cursor !== null || meta.lastFullWalkAt === null) return 'full';

  const lastChecked = meta.lastDeltaAt ?? meta.lastFullWalkAt;
  const due = now - lastChecked >= refreshIntervalMs;

  if (meta.deltaSupported === false) return due ? 'full' : 'none';

  if (due) return 'drift-check';

  return meta.watermark === null ? 'none' : 'delta';
}
