import { describe, it, expect } from 'vitest';
import {
  readDormantAccessRows,
  readGroupCleanupRows,
  readUnmaintainedAppAccessRows,
} from './orgReportSource';
import type { OrgSnapshotView, SnapshotCollection } from './snapshot';
import { CLEANUP_CAVEAT, APP_ACCESS_CAVEAT } from '../components/groups/ruleOrphans';

const DAY = 24 * 60 * 60 * 1000;
const WALK_AT = Date.parse('2026-08-20T00:00:00.000Z');

function complete(
  rows: unknown[],
  records = rows.map((_, i) => ({ id: `r${i}` })),
): SnapshotCollection {
  return { rows, records, isReading: false, complete: true, lastFullWalkAt: WALK_AT, error: null };
}

function partial(
  rows: unknown[],
  records = rows.map((_, i) => ({ id: `r${i}` })),
): SnapshotCollection {
  return { rows, records, isReading: false, complete: false, lastFullWalkAt: null, error: null };
}

function unread(): SnapshotCollection {
  return {
    rows: [],
    records: [],
    isReading: false,
    complete: true,
    lastFullWalkAt: null,
    error: null,
  };
}

function group(
  id: string,
  name: string,
  usersCount: number,
  extra: Record<string, unknown> = {},
): unknown {
  return {
    id,
    profile: { name },
    _embedded: { stats: { usersCount } },
    ...extra,
  };
}

function rule(...groupIds: string[]): unknown {
  return { id: '0prFAKE', actions: { assignUserToGroups: { groupIds } } };
}

function view(overrides: Partial<OrgSnapshotView>): OrgSnapshotView {
  return {
    groups: unread(),
    rules: complete([]),
    apps: complete([]),
    appGroups: complete([], []),
    ...overrides,
  };
}

describe('readGroupCleanupRows', () => {
  it('returns one row per empty unfilled group, carrying the caveat on each', () => {
    const result = readGroupCleanupRows(
      view({
        groups: complete([
          group('00gFAKE1', 'Abandoned Alpha', 0),
          group('00gFAKE2', 'Abandoned Beta', 0),
          group('00gFAKE3', 'Has Members', 4),
        ]),
      }),
    );

    expect(result.resolution.status).toBe('ok');
    expect(result.resolution.value).toBe(2);
    expect(result.rows.map((row) => row.groupId)).toEqual(['00gFAKE1', '00gFAKE2']);
    expect(result.rows.every((row) => row.caveat === CLEANUP_CAVEAT)).toBe(true);
    expect(result.rows.every((row) => row.completeness === '')).toBe(true);
  });

  it('excludes a group some rule fills', () => {
    const result = readGroupCleanupRows(
      view({
        groups: complete([group('00gFAKE1', 'Filled', 0), group('00gFAKE2', 'Orphan', 0)]),
        rules: complete([rule('00gFAKE1')]),
      }),
    );

    expect(result.rows.map((row) => row.groupId)).toEqual(['00gFAKE2']);
  });

  it('ships no rows at all when a gate collection was never read', () => {
    const result = readGroupCleanupRows(
      view({
        groups: complete([group('00gFAKE1', 'Orphan', 0)]),
        rules: unread(),
      }),
    );

    expect(result.resolution.status).toBe('unavailable');
    expect(result.resolution.value).toBeNull();
    expect(result.rows).toEqual([]);
    expect(result.resolution.note).toContain('group rules');
  });

  it('does not cap the rows at the Home preview limit', () => {
    const many = Array.from({ length: 60 }, (_, i) =>
      group(`00gFAKE${String(i).padStart(3, '0')}`, `Group ${i}`, 0),
    );
    const result = readGroupCleanupRows(view({ groups: complete(many) }));

    expect(result.rows).toHaveLength(60);
    expect(result.resolution.value).toBe(60);
  });

  it('drops a malformed snapshot row and counts it rather than throwing', () => {
    const result = readGroupCleanupRows(
      view({ groups: complete([group('00gFAKE1', 'Real', 0), { profile: { name: 'No id' } }]) }),
    );

    expect(result.dropped).toBe(1);
    expect(result.rows.map((row) => row.groupId)).toEqual(['00gFAKE1']);
  });
});

describe('readUnmaintainedAppAccessRows', () => {
  it('names the apps and marks every row as a floor when a floor collection is partial', () => {
    const result = readUnmaintainedAppAccessRows(
      view({
        groups: complete([group('00gFAKE1', 'Sales Access', 12)]),
        apps: complete([{ id: '0oaFAKE1', label: 'Salesforce' }]),
        appGroups: partial([{ id: '00gFAKE1' }], [{ id: '0oaFAKE1::00gFAKE1' }]),
      }),
    );

    expect(result.resolution.status).toBe('partial');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].finding).toContain('Salesforce');
    expect(result.rows[0].caveat).toBe(APP_ACCESS_CAVEAT);
    expect(result.rows[0].completeness).toBe(result.resolution.note);
    expect(result.rows[0].completeness).toContain('At least');
  });
});

describe('readDormantAccessRows', () => {
  const dormantGroup = group('00gFAKE9', 'Legacy Contractors', 7, {
    lastMembershipUpdated: new Date(WALK_AT - 400 * DAY).toISOString(),
  });

  const dormantView = view({
    groups: complete([dormantGroup]),
    apps: complete([{ id: '0oaFAKE1', label: 'Concur' }]),
    appGroups: complete([{ id: '00gFAKE9' }], [{ id: '0oaFAKE1::00gFAKE9' }]),
  });

  it('carries the anchored caveat on every row', () => {
    const result = readDormantAccessRows(dormantView, WALK_AT + 2 * DAY);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].caveat).toContain('Measured from the last complete read of your groups');
    expect(result.rows[0].caveat).toContain('none of them has written to this group');
    expect(result.rows[0].caveat).not.toBe('');
  });

  it('withholds the export entirely when the anchor is stale', () => {
    const result = readDormantAccessRows(dormantView, WALK_AT + 90 * DAY);

    expect(result.resolution.status).toBe('unavailable');
    expect(result.rows).toEqual([]);
    expect(result.resolution.note).toBeTruthy();
  });

  it('withholds the export when the group walk never finished', () => {
    const result = readDormantAccessRows(
      view({ ...dormantView, groups: partial([dormantGroup]) }),
      WALK_AT,
    );

    expect(result.resolution.value).toBeNull();
    expect(result.rows).toEqual([]);
  });
});
