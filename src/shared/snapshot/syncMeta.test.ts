import { describe, it, expect } from 'vitest';
import {
  DRIFT_CHECK_INTERVAL_MS,
  advanceWatermark,
  driftVerdict,
  emptySyncMeta,
  nextSyncMode,
  readTotalCount,
} from './syncMeta';
import type { SyncMeta } from './types';

const ORIGIN = 'https://example.okta.com';

function complete(now: number, overrides: Partial<SyncMeta> = {}): SyncMeta {
  return {
    ...emptySyncMeta(ORIGIN, 'groups'),
    complete: true,
    lastFullWalkAt: now,
    watermark: '2026-08-24T09:00:00.000Z',
    itemCount: 1000,
    ...overrides,
  };
}

describe('emptySyncMeta', () => {
  it('starts every unknown as null, never as a zero or a false verdict', () => {
    const meta = emptySyncMeta(ORIGIN, 'groups');
    expect(meta.deltaSupported).toBeNull();
    expect(meta.itemCount).toBeNull();
    expect(meta.watermark).toBeNull();
    expect(meta.cursor).toBeNull();
    expect(meta.complete).toBe(false);
  });
});

describe('advanceWatermark', () => {
  it('takes the highest value seen, regardless of page order', () => {
    expect(
      advanceWatermark(null, [
        '2026-08-24T09:00:00.000Z',
        '2026-08-24T11:30:00.000Z',
        '2026-08-24T10:00:00.000Z',
      ]),
    ).toBe('2026-08-24T11:30:00.000Z');
  });

  it('never moves backwards', () => {
    expect(advanceWatermark('2026-08-24T11:00:00.000Z', ['2026-08-24T09:00:00.000Z'])).toBe(
      '2026-08-24T11:00:00.000Z',
    );
  });

  it('ignores a malformed value rather than letting it become the watermark', () => {
    expect(advanceWatermark('2026-08-24T09:00:00.000Z', ['zzzz-not-a-date', ''])).toBe(
      '2026-08-24T09:00:00.000Z',
    );
    expect(advanceWatermark(null, ['zzzz-not-a-date'])).toBeNull();
  });

  it('ignores absent values', () => {
    expect(advanceWatermark(null, [undefined, null, '2026-08-24T09:00:00.000Z'])).toBe(
      '2026-08-24T09:00:00.000Z',
    );
  });
});

describe('readTotalCount', () => {
  it('reads the header whatever its casing', () => {
    expect(readTotalCount({ 'X-Total-Count': '47' })).toBe(47);
    expect(readTotalCount({ 'x-total-count': '47' })).toBe(47);
  });

  it('returns null for an absent, empty or non-integer header', () => {
    expect(readTotalCount(undefined)).toBeNull();
    expect(readTotalCount({})).toBeNull();
    expect(readTotalCount({ 'x-total-count': '' })).toBeNull();
    expect(readTotalCount({ 'x-total-count': 'many' })).toBeNull();
    expect(readTotalCount({ 'x-total-count': '4.5' })).toBeNull();
  });
});

describe('driftVerdict', () => {
  it('agrees only when the counts match', () => {
    expect(driftVerdict(1000, 1000)).toBe('in-sync');
    expect(driftVerdict(999, 1000)).toBe('drifted');
    expect(driftVerdict(1001, 1000)).toBe('drifted');
  });

  it('reports unknown — never in-sync — when Okta did not say', () => {
    expect(driftVerdict(null, 1000)).toBe('unknown');
    expect(driftVerdict(Number.NaN, 1000)).toBe('unknown');
  });

  it('detects an emptied collection rather than reading it as unknown', () => {
    expect(driftVerdict(0, 1000)).toBe('drifted');
  });
});

describe('nextSyncMode', () => {
  const NOW = 1_800_000_000_000;

  it('full-walks a cold collection', () => {
    expect(nextSyncMode(emptySyncMeta(ORIGIN, 'groups'), NOW)).toBe('full');
  });

  it('full-walks an interrupted walk rather than topping it up with a delta', () => {
    const interrupted = complete(NOW, { cursor: '/api/v1/groups?after=abc', complete: false });
    expect(nextSyncMode(interrupted, NOW)).toBe('full');
  });

  it('full-walks when the last walk never completed, even with a cursor cleared', () => {
    expect(nextSyncMode(complete(NOW, { complete: false }), NOW)).toBe('full');
  });

  it('full-walks an org probed as not honouring the delta filter, once it is due', () => {
    const meta = complete(NOW, { deltaSupported: false });
    expect(nextSyncMode(meta, NOW + DRIFT_CHECK_INTERVAL_MS)).toBe('full');
  });

  it('leaves a no-cheap-mode collection alone until its interval elapses', () => {
    const meta = complete(NOW, { deltaSupported: false });
    expect(nextSyncMode(meta, NOW)).toBe('none');
    expect(nextSyncMode(meta, NOW + DRIFT_CHECK_INTERVAL_MS - 1)).toBe('none');
  });

  it('honours a collection-specific interval over the default', () => {
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const meta = complete(NOW, { deltaSupported: false });
    expect(nextSyncMode(meta, NOW + DRIFT_CHECK_INTERVAL_MS, SIX_HOURS)).toBe('none');
    expect(nextSyncMode(meta, NOW + SIX_HOURS, SIX_HOURS)).toBe('full');
  });

  it('applies a collection-specific interval to the drift check too', () => {
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const meta = complete(NOW, { deltaSupported: true });
    expect(nextSyncMode(meta, NOW + DRIFT_CHECK_INTERVAL_MS, SIX_HOURS)).toBe('delta');
    expect(nextSyncMode(meta, NOW + SIX_HOURS, SIX_HOURS)).toBe('drift-check');
  });

  it('deltas a complete, recently checked snapshot', () => {
    expect(nextSyncMode(complete(NOW, { deltaSupported: true }), NOW + 1000)).toBe('delta');
  });

  it('owes a drift check once the last check ages out', () => {
    const meta = complete(NOW, { deltaSupported: true });
    expect(nextSyncMode(meta, NOW + DRIFT_CHECK_INTERVAL_MS - 1)).toBe('delta');
    expect(nextSyncMode(meta, NOW + DRIFT_CHECK_INTERVAL_MS)).toBe('drift-check');
  });

  it('ages the check from the last delta, not only the last full walk', () => {
    const meta = complete(NOW, {
      deltaSupported: true,
      lastDeltaAt: NOW + DRIFT_CHECK_INTERVAL_MS,
    });
    expect(nextSyncMode(meta, NOW + DRIFT_CHECK_INTERVAL_MS + 1)).toBe('delta');
  });

  it('does nothing for a fresh collection with no watermark to query from', () => {
    expect(nextSyncMode(complete(NOW, { watermark: null, itemCount: 0 }), NOW)).toBe('none');
  });
});
