import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOrgFigures, ORG_FIGURES_MAX_AGE_MS } from './useOrgFigures';
import type { OrgEntityIndex } from './useOrgEntityIndex';

const NOW = 1_800_000_000_000;

interface StubOptions {
  lastFullWalkAt?: number | null;
  isReading?: boolean;
  complete?: boolean;
  ruleStatuses?: Array<'ACTIVE' | 'INACTIVE'>;
  status?: number | null;
  rulesOver?: Partial<StubOptions>;
}

let syncs: { collection: string; force: boolean }[] = [];

function stub(
  collection: string,
  rows: unknown[],
  options: StubOptions,
  records: { id: string }[] = [],
) {
  const { lastFullWalkAt = NOW, isReading = false, complete = true, status = null } = options;
  return {
    rows,
    records,
    isReading,
    complete,
    lastFullWalkAt,
    isSyncing: false,
    error: null,
    status,
    sync: vi.fn(async (force = false) => {
      syncs.push({ collection, force });
      return null;
    }),
  };
}

function makeIndex(options: StubOptions = {}): OrgEntityIndex {
  const rules = (options.ruleStatuses ?? ['ACTIVE', 'INACTIVE', 'INACTIVE']).map((status, i) => ({
    id: `0prFAKE000000000000${i}`,
    status,
    actions: i === 0 ? { assignUserToGroups: { groupIds: ['g1'] } } : undefined,
  }));
  const groups = [
    { id: 'g1', _embedded: { stats: { usersCount: 7 } } },
    { id: 'g2', _embedded: { stats: { usersCount: 0 } } },
  ];
  const apps = [
    { id: 'a1', status: 'ACTIVE', features: ['GROUP_PUSH'] },
    { id: 'a2', status: 'ACTIVE', features: ['GROUP_PUSH'] },
    { id: 'a3', status: 'INACTIVE' },
  ];
  return {
    lookup: () => ({ status: 'unknown' }),
    isAuthoritative: () => true,
    groups: stub('groups', groups, options),
    rules: stub('rules', rules, { ...options, ...options.rulesOver }),
    apps: stub('apps', apps, options),
    appGroups: stub('appGroups', [], options, [{ id: 'a1::g1' }]),
  } as unknown as OrgEntityIndex;
}

const sub = (
  boxes: { subCounts: { key: string; value: number | null; note?: string; icon: string }[] }[],
  key: string,
) => boxes.flatMap((box) => box.subCounts).find((s) => s.key === key);

const render = (index: OrgEntityIndex, over: { enabled?: boolean; connected?: boolean } = {}) => {
  const reading = { ...index, groups: { ...index.groups, isReading: true } } as OrgEntityIndex;
  const view = renderHook(
    (props: { index: OrgEntityIndex }) =>
      useOrgFigures({
        index: props.index,
        enabled: over.enabled ?? true,
        connected: over.connected ?? true,
      }),
    { initialProps: { index: reading } },
  );
  view.rerender({ index });
  return view;
};

describe('useOrgFigures', () => {
  beforeEach(() => {
    syncs = [];
    vi.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  it('derives one entry per collection the card speaks about — two, not four', () => {
    const { result } = render(makeIndex());
    expect(result.current.boxes.map((b) => b.key)).toEqual(['rules', 'groups']);
    expect(result.current.boxes.map((b) => b.value)).toEqual([3, 2]);
    expect(result.current.boxes.map((b) => b.tab)).toEqual(['rules', 'groups']);
    expect(result.current.boxes.map((b) => b.noun)).toEqual(['group rules', 'groups']);
  });

  it('derives every finding from rows already held — no extra read', () => {
    const { result } = render(makeIndex());
    const { boxes } = result.current;
    expect(boxes.flatMap((box) => box.subCounts).map((s) => s.key)).toEqual([
      'rules-paused',
      'groups-empty-unfilled',
    ]);
    expect(sub(boxes, 'rules-paused')?.value).toBe(2);
    expect(sub(boxes, 'groups-empty-unfilled')?.value).toBe(1);
    expect(syncs).toEqual([]);
  });

  it('counts the INTERSECTION, not either half of it', () => {
    const base = makeIndex();
    const index = {
      ...base,
      groups: stub(
        'groups',
        [
          { id: 'g1', _embedded: { stats: { usersCount: 7 } } },
          { id: 'g2', _embedded: { stats: { usersCount: 0 } } },
          { id: 'g3', _embedded: { stats: { usersCount: 0 } } },
        ],
        {},
      ),
      rules: stub(
        'rules',
        [{ id: 'r1', status: 'ACTIVE', actions: { assignUserToGroups: { groupIds: ['g3'] } } }],
        {},
      ),
    } as unknown as OrgEntityIndex;
    const { result } = render(index);
    expect(sub(result.current.boxes, 'groups-empty-unfilled')?.value).toBe(1);
  });

  it('leads with each finding’s glyph, so the rows read as one column', () => {
    const { result } = render(makeIndex());
    expect(sub(result.current.boxes, 'rules-paused')?.icon).toBe('pause');
    expect(sub(result.current.boxes, 'groups-empty-unfilled')?.icon).toBe('users');
  });

  it('agrees with a denominator of one — the nouns are declared plural (I-024)', () => {
    const base = makeIndex();
    const index = {
      ...base,
      groups: stub('groups', [{ id: 'g9', _embedded: { stats: { usersCount: 0 } } }], {}),
    } as unknown as OrgEntityIndex;
    const { result } = render(index);
    expect(sub(result.current.boxes, 'groups-empty-unfilled')).toMatchObject({
      value: 1,
      note: 'of 1 group',
    });
    expect(sub(result.current.boxes, 'rules-paused')?.note).toBe('of 3 group rules');
  });

  it('counts paused rules out of the rows already held', () => {
    const { result } = render(makeIndex({ ruleStatuses: ['ACTIVE', 'ACTIVE'] }));
    expect(sub(result.current.boxes, 'rules-paused')?.value).toBe(0);
  });

  it('carries each finding’s filtered destination with it', () => {
    const { result } = render(makeIndex());
    const requests = result.current.boxes.flatMap((box) =>
      box.subCounts.map((subCount) => subCount.request),
    );
    expect(requests).toEqual([
      { tab: 'rules', view: 'paused' },
      { tab: 'groups', view: 'empty-no-rules' },
    ]);
  });

  it('suppresses a subtracting finding when the collection it subtracts was never walked', () => {
    const { result } = render(makeIndex({ rulesOver: { lastFullWalkAt: null, complete: false } }));
    expect(sub(result.current.boxes, 'groups-empty-unfilled')?.value).toBeNull();
    expect(sub(result.current.boxes, 'groups-empty-unfilled')?.note).toBe(
      'Needs group rules, which have not been read.',
    );
  });

  function unwalkedGroupsIndex(status: number | null): OrgEntityIndex {
    const index = makeIndex();
    return {
      ...index,
      groups: stub('groups', [], { lastFullWalkAt: null, complete: false, status }),
    } as unknown as OrgEntityIndex;
  }

  it('names the permission problem when a collection’s last walk stopped on a 403 (D-068)', () => {
    const { result } = render(unwalkedGroupsIndex(403));
    const groupsBox = result.current.boxes.find((box) => box.key === 'groups');
    expect(groupsBox?.note).toBe('You are not allowed to read groups.');
  });

  it('keeps the generic copy for a non-permission failure (429, a dropped connection)', () => {
    const { result } = render(unwalkedGroupsIndex(429));
    const groupsBox = result.current.boxes.find((box) => box.key === 'groups');
    expect(groupsBox?.note).toBe('Groups have not been read yet.');
  });

  it('drops the permission note once a later walk succeeds', () => {
    const { result, rerender } = render(unwalkedGroupsIndex(403));
    expect(result.current.boxes.find((box) => box.key === 'groups')?.note).toBe(
      'You are not allowed to read groups.',
    );

    const recovered = makeIndex({ lastFullWalkAt: NOW, complete: true, status: null });
    rerender({ index: recovered });

    const groupsBox = result.current.boxes.find((box) => box.key === 'groups');
    expect(groupsBox?.note).toBeUndefined();
    expect(groupsBox?.value).toBe(2);
  });

  it('spends nothing when the figures are fresh', async () => {
    render(makeIndex({ lastFullWalkAt: NOW - 1000 }));
    await waitFor(() => expect(syncs).toEqual([]));
  });

  it('tops up with ONE sync when they are older than the floor', async () => {
    render(makeIndex({ lastFullWalkAt: NOW - ORG_FIGURES_MAX_AGE_MS - 1 }));
    await waitFor(() => expect(syncs).toHaveLength(1));
    expect(syncs).toEqual([{ collection: 'groups', force: false }]);
  });

  it('tops up when a collection has never been walked', async () => {
    render(makeIndex({ lastFullWalkAt: null, complete: false }));
    await waitFor(() => expect(syncs).toHaveLength(1));
  });

  it('tops up at most once per mount', async () => {
    const index = makeIndex({ lastFullWalkAt: null, complete: false });
    const { rerender } = render(index);
    await waitFor(() => expect(syncs).toHaveLength(1));
    rerender({ index });
    rerender({ index });
    expect(syncs).toHaveLength(1);
  });

  it('spends nothing from a hidden tab', async () => {
    render(makeIndex({ lastFullWalkAt: null, complete: false }), { enabled: false });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(syncs).toEqual([]);
  });

  it('spends nothing with no Okta tab connected', async () => {
    render(makeIndex({ lastFullWalkAt: null, complete: false }), { connected: false });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(syncs).toEqual([]);
  });

  it('does not decide on the age while the read is still in flight', async () => {
    const index = makeIndex({ isReading: true, lastFullWalkAt: null });
    renderHook(() => useOrgFigures({ index, enabled: true, connected: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(syncs).toEqual([]);
  });

  it('does not top up on the first commit, before any read has started', async () => {
    const beforeRead = makeIndex({ lastFullWalkAt: null, complete: false });
    const reading = {
      ...beforeRead,
      groups: { ...beforeRead.groups, isReading: true },
    } as OrgEntityIndex;
    const settled = makeIndex({ lastFullWalkAt: NOW - 1000 });

    const { rerender } = renderHook(
      (props: { index: OrgEntityIndex }) =>
        useOrgFigures({ index: props.index, enabled: true, connected: true }),
      { initialProps: { index: beforeRead } },
    );
    rerender({ index: reading });
    rerender({ index: settled });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(syncs).toEqual([]);
  });

  it('forces a real walk on Refresh, floor or no floor', async () => {
    const { result } = render(makeIndex({ lastFullWalkAt: NOW - 1000 }));
    await act(async () => {
      result.current.refresh();
    });
    expect(syncs).toEqual([{ collection: 'groups', force: true }]);
  });

  it('quotes the oldest walk behind the card', () => {
    const index = makeIndex();
    (index.rules as { lastFullWalkAt: number | null }).lastFullWalkAt = NOW - 9000;
    const { result } = render(index);
    expect(result.current.readAt).toBe(NOW - 9000);
  });

  it('does not let a collection the card never shows date it', () => {
    const index = makeIndex();
    (index.apps as { lastFullWalkAt: number | null }).lastFullWalkAt = NOW - 9_000_000;
    const { result } = render(index);
    expect(result.current.readAt).toBe(NOW);
  });

  it('states no age at all when a collection has never been walked', () => {
    const { result } = render(makeIndex({ lastFullWalkAt: null, complete: false }));
    expect(result.current.readAt).toBeNull();
  });

  it('cannot refresh without a connected tab', () => {
    const { result } = render(makeIndex(), { connected: false });
    expect(result.current.canRefresh).toBe(false);
  });
});
