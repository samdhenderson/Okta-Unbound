import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHomeReports, type UseHomeReportsResult } from './useHomeReports';
import type { OrgEntityIndex } from './useOrgEntityIndex';

const NOW = 1_800_000_000_000;

interface StubOptions {
  complete?: boolean;
  lastFullWalkAt?: number | null;
  isReading?: boolean;
  rulesOver?: Partial<StubOptions>;
}

const sync = vi.fn(async () => null);

function stub(rows: unknown[], options: StubOptions, records: { id: string }[] = []) {
  const { lastFullWalkAt = NOW, isReading = false, complete = true } = options;
  return {
    rows,
    records,
    isReading,
    complete,
    lastFullWalkAt,
    isSyncing: false,
    error: null,
    sync,
  };
}

function makeIndex(options: StubOptions = {}): OrgEntityIndex {
  const groups = [
    { id: 'g1', type: 'OKTA_GROUP', profile: { name: 'Abandoned' } },
    { id: 'g2', type: 'OKTA_GROUP', profile: { name: 'Filled' } },
    {
      id: 'g3',
      type: 'OKTA_GROUP',
      profile: { name: 'Sales tools' },
      _embedded: { stats: { usersCount: 12 } },
    },
    { id: 'g4', type: 'OKTA_GROUP', profile: { name: 'Holds an app open' } },
  ];
  const rules = [{ id: 'r1', actions: { assignUserToGroups: { groupIds: ['g2'] } } }];
  const apps = [{ id: 'a1', label: 'Slack', features: ['GROUP_PUSH'] }];
  return {
    lookup: () => ({ status: 'unknown' }),
    isAuthoritative: () => true,
    groups: stub(groups, options),
    rules: stub(rules, { ...options, ...options.rulesOver }),
    apps: stub(apps, options),
    appGroups: stub([{ id: 'g3' }, { id: 'g4' }], options, [{ id: 'a1::g3' }, { id: 'a1::g4' }]),
  } as unknown as OrgEntityIndex;
}

const render = (index: OrgEntityIndex) => renderHook(() => useHomeReports({ index }));

const report = (result: UseHomeReportsResult, key: string) =>
  result.reports.find((entry) => entry.key === key);

describe('useHomeReports', () => {
  it('derives both reports from rows already held, and issues nothing', () => {
    sync.mockClear();
    const { result } = render(makeIndex());
    expect(result.current.reports.map((entry) => entry.key)).toEqual([
      'group-cleanup',
      'unmaintained-app-access',
    ]);
    expect(sync).not.toHaveBeenCalled();
  });

  it('finds the abandoned group and no other', () => {
    const { result } = render(makeIndex());
    const cleanup = report(result.current, 'group-cleanup');
    expect(cleanup?.value).toBe(1);
    expect(cleanup?.findings.map((finding) => finding.name)).toEqual(['Abandoned']);
  });

  it('names the app from the record key, not from the assignment row', () => {
    const { result } = render(makeIndex());
    const access = report(result.current, 'unmaintained-app-access');
    expect(access?.value).toBe(1);
    expect(access?.findings).toEqual([
      { id: 'g3', name: 'Sales tools', detail: '12 members · Slack' },
    ]);
  });

  it('withholds both reports, names and all, when the rules were never read', () => {
    const { result } = render(makeIndex({ rulesOver: { complete: false, lastFullWalkAt: null } }));
    for (const entry of result.current.reports) {
      expect(entry.value).toBeNull();
      expect(entry.findings).toEqual([]);
      expect(entry.note).toBe('Needs group rules, which have not been read.');
    }
  });
});
