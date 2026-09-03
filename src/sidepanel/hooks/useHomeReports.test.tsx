import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHomeReports, type UseHomeReportsResult } from './useHomeReports';
import type { OrgEntityIndex } from './useOrgEntityIndex';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();

const daysBefore = (days: number) => new Date(NOW - days * DAY).toISOString();

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
      lastMembershipUpdated: daysBefore(730),
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
      'dormant-app-access',
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

describe('useHomeReports · the dormant report', () => {
  const dormant = (result: UseHomeReportsResult) => report(result, 'dormant-app-access');

  it('states the silence it observed, measured from the last complete group read', () => {
    const { result } = render(makeIndex());
    expect(dormant(result.current)?.label).toBe('App access with no membership change in 6 months');
    expect(dormant(result.current)?.value).toBe(1);
    expect(dormant(result.current)?.findings).toEqual([
      {
        id: 'g3',
        name: 'Sales tools',
        detail: '12 members · Slack · no membership change in 2 years',
      },
    ]);
    expect(dormant(result.current)?.caveat).toContain(
      'Measured from the last complete read of your groups,',
    );
  });

  it('withholds the report entirely when the groups were never fully walked', () => {
    const { result } = render(makeIndex({ complete: false, lastFullWalkAt: null }));
    expect(dormant(result.current)?.value).toBeNull();
    expect(dormant(result.current)?.findings).toEqual([]);
  });

  it('withholds the report when the anchor is too old to certify a silence', () => {
    const { result } = render(makeIndex({ lastFullWalkAt: NOW - 60 * DAY }));
    expect(dormant(result.current)).toMatchObject({ status: 'unavailable', value: null });
    expect(dormant(result.current)?.findings).toEqual([]);
    expect(dormant(result.current)?.note).toContain(
      'Needs a complete read of your groups from the last 30 days.',
    );
    expect(report(result.current, 'unmaintained-app-access')?.value).toBe(1);
  });

  it('offers nothing to act on — the findings navigate and nothing more', () => {
    const { result } = render(makeIndex());
    for (const finding of dormant(result.current)?.findings ?? []) {
      expect(Object.keys(finding).sort()).toEqual(['detail', 'id', 'name']);
    }
  });
});
