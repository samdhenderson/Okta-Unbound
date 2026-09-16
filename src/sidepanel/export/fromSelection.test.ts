import { describe, it, expect } from 'vitest';
import {
  buildSelectionRequests,
  collectSelectionRows,
  isExportAvailable,
  parseSelectionEntity,
  selectionContextOf,
  selectionRefsFor,
  type SelectionOutcome,
} from './fromSelection';
import { selectedUsersDescriptor, usersDescriptor } from './descriptors/users';
import { selectedGroupMembershipsDescriptor } from './descriptors/groupMemberships';
import type { ExportUser } from './columns/userColumns';
import type { SelectionBasket, SelectionKind } from '@/sidepanel/selection/selectionStore';

function basket(kind: SelectionKind, count: number): SelectionBasket {
  return {
    picked: Array.from({ length: count }, (_, i) => ({
      kind,
      id: `00${kind}FAKE${i}`,
      name: `Ticked ${i}`,
      pickedAt: i,
    })),
  };
}

describe('selectionRefsFor', () => {
  it('keeps only the accepted kinds, in pick order', () => {
    const mixed: SelectionBasket = {
      picked: [
        { kind: 'group', id: '00gFAKE1', name: 'G', pickedAt: 1 },
        { kind: 'user', id: '00uFAKE1', name: 'A', pickedAt: 2 },
        { kind: 'rule', id: '0prFAKE1', name: 'R', pickedAt: 3 },
        { kind: 'user', id: '00uFAKE2', name: 'B', pickedAt: 4 },
      ],
    };
    expect(selectionRefsFor(selectedUsersDescriptor, mixed).map((r) => r.id)).toEqual([
      '00uFAKE1',
      '00uFAKE2',
    ]);
  });

  it('is empty for a descriptor scoped some other way', () => {
    expect(selectionRefsFor(usersDescriptor, basket('user', 3))).toEqual([]);
    expect(selectionContextOf(usersDescriptor)).toBeNull();
  });
});

describe('isExportAvailable', () => {
  it('is false while the required partition is empty', () => {
    expect(isExportAvailable(selectedUsersDescriptor, { picked: [] })).toBe(false);
    expect(isExportAvailable(selectedUsersDescriptor, basket('group', 5))).toBe(false);
  });

  it('is true once an accepted kind is ticked', () => {
    expect(isExportAvailable(selectedUsersDescriptor, basket('user', 1))).toBe(true);
  });

  it('is always true for a descriptor scoped some other way', () => {
    expect(isExportAvailable(usersDescriptor, { picked: [] })).toBe(true);
  });
});

describe('buildSelectionRequests', () => {
  it('issues exactly one request per ticked entity — never a superset or a subset', () => {
    const requests = buildSelectionRequests(selectedUsersDescriptor, basket('user', 128));

    expect(requests).toHaveLength(128);
    expect(new Set(requests.map((r) => r.endpoint)).size).toBe(128);
    expect(requests[0].endpoint).toBe('/api/v1/users/00userFAKE0');
    expect(requests.every((r) => r.rows === 'entity')).toBe(true);
  });

  it('walks a list per ticked group for a rows:"list" descriptor', () => {
    const requests = buildSelectionRequests(selectedGroupMembershipsDescriptor, basket('group', 2));

    expect(requests.map((r) => r.endpoint)).toEqual([
      '/api/v1/groups/00groupFAKE0/users?limit=200',
      '/api/v1/groups/00groupFAKE1/users?limit=200',
    ]);
    expect(requests.every((r) => r.rows === 'list')).toBe(true);
  });

  it('returns nothing for an empty partition or a differently scoped descriptor', () => {
    expect(buildSelectionRequests(selectedUsersDescriptor, { picked: [] })).toEqual([]);
    expect(buildSelectionRequests(usersDescriptor, basket('user', 3))).toEqual([]);
  });
});

describe('parseSelectionEntity', () => {
  it('validates a single-entity response with the descriptor schema', () => {
    const row = parseSelectionEntity(selectedUsersDescriptor, {
      id: '00uFAKE1',
      profile: { email: 'user@example.com' },
    });
    expect(row?.id).toBe('00uFAKE1');
  });

  it('returns null for a payload that does not validate', () => {
    expect(parseSelectionEntity(selectedUsersDescriptor, { noId: true })).toBeNull();
    expect(parseSelectionEntity(selectedUsersDescriptor, undefined)).toBeNull();
  });
});

describe('collectSelectionRows', () => {
  const rowsFor = (ids: string[]): SelectionOutcome<ExportUser>[] =>
    ids.map((id) => ({
      status: 'rows',
      ref: { kind: 'user', id, name: id, pickedAt: 0 },
      rows: [{ id }],
    }));

  it('publishes one row per tick when every fetch resolved', () => {
    const result = collectSelectionRows(selectedUsersDescriptor, rowsFor(['a', 'b', 'c']));

    expect(result.rows).toHaveLength(3);
    expect(result.requested).toBe(3);
    expect(result.missing).toEqual([]);
    expect(result.duplicates).toBe(0);
  });

  it('counts a tick that 404d instead of dropping it silently', () => {
    const result = collectSelectionRows(selectedUsersDescriptor, [
      ...rowsFor(['a']),
      { status: 'missing', ref: { kind: 'user', id: 'gone', name: 'Gone', pickedAt: 0 } },
    ]);

    expect(result.rows).toHaveLength(1);
    expect(result.requested).toBe(2);
    expect(result.missing).toEqual([{ kind: 'user', id: 'gone' }]);
  });

  it('collapses a user reached through two ticked groups into one row', () => {
    const shared: ExportUser = { id: '00uFAKE1' };
    const result = collectSelectionRows<ExportUser>(selectedGroupMembershipsDescriptor, [
      { status: 'rows', ref: { kind: 'group', id: 'g1', name: 'G1', pickedAt: 0 }, rows: [shared] },
      {
        status: 'rows',
        ref: { kind: 'group', id: 'g2', name: 'G2', pickedAt: 1 },
        rows: [shared, { id: '00uFAKE2' }],
      },
    ]);

    expect(result.rows.map((r) => r.id)).toEqual(['00uFAKE1', '00uFAKE2']);
    expect(result.duplicates).toBe(1);
    expect(result.requested).toBe(2);
  });

  it('keeps an empty list walk as a resolved tick, not a missing one', () => {
    const result = collectSelectionRows<ExportUser>(selectedGroupMembershipsDescriptor, [
      { status: 'rows', ref: { kind: 'group', id: 'g1', name: 'G1', pickedAt: 0 }, rows: [] },
    ]);

    expect(result.rows).toEqual([]);
    expect(result.missing).toEqual([]);
  });
});
