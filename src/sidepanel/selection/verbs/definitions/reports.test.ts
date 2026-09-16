import { describe, it, expect, vi } from 'vitest';
import { sequentialRunOperation } from '@/test/factories/coreApi';
import type { MemberMfaResult, OktaUser } from '@/shared/types';
import { groupOverlapVerb, mfaEnrolmentVerb, ruleImpactVerb } from './reports';
import type { BasketVerb, VerbApi, VerbContext, VerbDetail, VerbOutcome } from '../types';
import type { SelectionBasket, SelectionKind } from '../../selectionStore';

function basketOf(entries: [SelectionKind, string][]): SelectionBasket {
  return {
    picked: entries.map(([kind, id], index) => ({
      kind,
      id,
      name: `${id} name`,
      pickedAt: 1_700_000_000_000 + index,
    })),
  };
}

const groups = (n: number): SelectionBasket =>
  basketOf(
    Array.from({ length: n }, (_, i) => ['group', `00gFAKE${i}`] as [SelectionKind, string]),
  );

const rules = (n: number): SelectionBasket =>
  basketOf(Array.from({ length: n }, (_, i) => ['rule', `0prFAKE${i}`] as [SelectionKind, string]));

function member(id: string, login = `${id}@example.com`): OktaUser {
  return {
    id,
    status: 'ACTIVE',
    profile: { login, email: login, firstName: 'Ada', lastName: id },
  };
}

function mfa(userId: string, enrolled: boolean): MemberMfaResult {
  return {
    userId,
    factors: [],
    enrolled,
    factorCount: enrolled ? 1 : 0,
    factorLabels: enrolled ? ['SMS'] : [],
  };
}

function countsOf(basket: SelectionBasket): Partial<Record<SelectionKind, number>> {
  const counts: Partial<Record<SelectionKind, number>> = {};
  for (const ref of basket.picked) counts[ref.kind] = (counts[ref.kind] ?? 0) + 1;
  return counts;
}

type FakeApi = Partial<VerbApi>;

async function runVerb(
  verb: BasketVerb,
  basket: SelectionBasket,
  api: FakeApi,
): Promise<{ outcome: VerbOutcome; reported: string[] }> {
  const reported: string[] = [];
  const context: VerbContext = {
    basket,
    counts: countsOf(basket),
    addMany: vi.fn() as unknown as VerbContext['addMany'],
    report: (message) => reported.push(message),
    api: { runOperation: sequentialRunOperation(), ...api } as unknown as VerbApi,
    memo: new Map<string, unknown>(),
    oktaOrigin: 'https://example.okta.com',
    values: {},
  };
  return { outcome: await verb.run(context), reported };
}

function detailOf(outcome: VerbOutcome): VerbDetail {
  const detail = outcome.detail;
  if (!detail) throw new Error(`Expected a detail table; the run reported: ${outcome.summary}`);
  return detail;
}

function expectRectangular(outcome: VerbOutcome): void {
  const detail = detailOf(outcome);
  for (const row of detail.rows) {
    expect(row).toHaveLength(detail.headers.length);
  }
}

describe('cost is exact arithmetic over the basket', () => {
  it('quotes one member-listing request per group for the overlap report', () => {
    expect(groupOverlapVerb.cost(groups(2))).toEqual({ requests: 2, writes: 0 });
    expect(groupOverlapVerb.cost(groups(5))).toEqual({ requests: 5, writes: 0 });
  });

  it('quotes nothing for an overlap the run will refuse', () => {
    expect(groupOverlapVerb.cost(groups(1))).toEqual({ requests: 0, writes: 0 });
    expect(groupOverlapVerb.cost(groups(6))).toEqual({ requests: 0, writes: 0 });
  });

  it('quotes one member-listing request per group for the MFA report', () => {
    expect(mfaEnrolmentVerb.cost(groups(4))).toEqual({ requests: 4, writes: 0 });
  });

  it('quotes two requests per rule for the impact report', () => {
    expect(ruleImpactVerb.cost(rules(3))).toEqual({ requests: 6, writes: 0 });
  });

  it('ignores the partitions a verb does not act on', () => {
    const mixed = basketOf([
      ['group', '00gFAKE0'],
      ['group', '00gFAKE1'],
      ['user', '00uFAKE0'],
      ['rule', '0prFAKE0'],
    ]);
    expect(groupOverlapVerb.cost(mixed).requests).toBe(2);
    expect(ruleImpactVerb.cost(mixed).requests).toBe(2);
  });
});

describe('group-overlap availability', () => {
  it('needs at least two groups, because an overlap of one is not a question', () => {
    expect(groupOverlapVerb.isAvailable?.(groups(1))).toBe(false);
    expect(groupOverlapVerb.isAvailable?.(groups(2))).toBe(true);
  });

  it('stays available past the comparison cap so the refusal can state the range', () => {
    expect(groupOverlapVerb.isAvailable?.(groups(6))).toBe(true);
  });

  it('does not count the other partitions towards the two', () => {
    const oneGroupPlusUsers = basketOf([
      ['group', '00gFAKE0'],
      ['user', '00uFAKE0'],
      ['user', '00uFAKE1'],
    ]);
    expect(groupOverlapVerb.isAvailable?.(oneGroupPlusUsers)).toBe(false);
  });
});

describe('group-overlap run', () => {
  const compareGroups = (rosters: Record<string, OktaUser[]>, intersection: string[]) =>
    vi.fn(
      async (
        picked: { id: string; name: string }[],
        onProgress?: (current: number, total: number, message?: string) => void,
        cache?: Map<string, OktaUser[]>,
      ) => {
        picked.forEach((group, index) => {
          onProgress?.(index + 1, picked.length);
          cache?.set(group.id, rosters[group.id] ?? []);
        });
        const distinct = new Set(Object.values(rosters).flatMap((r) => r.map((u) => u.id)));
        return {
          groups: picked.map((g) => ({
            id: g.id,
            name: g.name,
            memberCount: (rosters[g.id] ?? []).length,
          })),
          intersection,
          uniqueMembers: {},
          totalUniqueUsers: distinct.size,
        };
      },
    );

  it('reports only the members in more than one group, one row per person', async () => {
    const shared = member('00uFAKE1');
    const compare = compareGroups(
      { '00gFAKE0': [shared, member('00uFAKE2')], '00gFAKE1': [shared] },
      ['00uFAKE1'],
    );

    const { outcome } = await runVerb(groupOverlapVerb, groups(2), { compareGroups: compare });

    expect(outcome.status).toBe('done');
    expect(outcome.summary).toBe(
      'Compared 2 groups holding 2 distinct members: 1 are in more than one, and 1 are in every one.',
    );
    expectRectangular(outcome);
    expect(outcome.detail?.rows).toEqual([
      ['00uFAKE1', '00uFAKE1@example.com', 'Ada 00uFAKE1', '00gFAKE0 name; 00gFAKE1 name', 2, true],
    ]);
  });

  it('refuses whole, and reads nothing, outside the comparable range', async () => {
    const compare = compareGroups({}, []);
    const { outcome } = await runVerb(groupOverlapVerb, groups(6), { compareGroups: compare });

    expect(outcome.status).toBe('refused');
    expect(outcome.summary).toContain('6 are selected');
    expect(outcome.detail).toBeUndefined();
    expect(compare).not.toHaveBeenCalled();
  });

  it('says there was nothing to compare rather than reporting an empty overlap', async () => {
    const compare = compareGroups({ '00gFAKE0': [], '00gFAKE1': [] }, []);
    const { outcome } = await runVerb(groupOverlapVerb, groups(2), { compareGroups: compare });

    expect(outcome.status).toBe('nothing-to-do');
    expect(outcome.detail).toBeUndefined();
  });
});

describe('mfa-enrolment run', () => {
  it('scans every distinct member once and states the enrolled split', async () => {
    const shared = member('00uFAKE1');
    const api: FakeApi = {
      getAllGroupMembers: vi.fn(async (groupId: string) =>
        groupId === '00gFAKE0' ? [shared, member('00uFAKE2')] : [shared],
      ),
      scanGroupMfa: vi.fn(
        async (userIds: string[]) => new Map(userIds.map((id) => [id, mfa(id, id === '00uFAKE1')])),
      ),
    };

    const { outcome, reported } = await runVerb(mfaEnrolmentVerb, groups(2), api);

    expect(api.scanGroupMfa).toHaveBeenCalledWith(['00uFAKE1', '00uFAKE2'], expect.any(Function));
    expect(outcome.status).toBe('done');
    expect(outcome.summary).toBe(
      'Read factors for 2 members across 2 groups: 1 carry an active MFA factor and 1 carry none.',
    );
    expect(reported).toContain('Reading factors for 2 members: one request each.');
    expectRectangular(outcome);
    expect(outcome.detail?.rows).toHaveLength(2);
  });

  it('reports a partial scan as partly-done, with the true covered count', async () => {
    const api: FakeApi = {
      getAllGroupMembers: vi.fn(async () => [member('00uFAKE1'), member('00uFAKE2')]),
      scanGroupMfa: vi.fn(async () => new Map([['00uFAKE1', mfa('00uFAKE1', true)]])),
    };

    const { outcome } = await runVerb(mfaEnrolmentVerb, groups(1), api);

    expect(outcome.status).toBe('partly-done');
    expect(outcome.summary).toContain('Read factors for 1 of 2 members');
    expect(outcome.summary).toContain('The table lists 2 members; 1 carry no factor reading.');
    expect(outcome.summary).not.toContain('Read factors for 2 members across');
  });

  it('renders an unscanned member as absent, never as a member with no factors', async () => {
    const api: FakeApi = {
      getAllGroupMembers: vi.fn(async () => [member('00uFAKE1'), member('00uFAKE2')]),
      scanGroupMfa: vi.fn(async () => new Map([['00uFAKE1', mfa('00uFAKE1', false)]])),
    };

    const { outcome } = await runVerb(mfaEnrolmentVerb, groups(1), api);
    const [scanned, unscanned] = detailOf(outcome).rows;

    expect(scanned.slice(4)).toEqual([false, 0, null]);
    expect(unscanned.slice(4)).toEqual([null, null, null]);
    expectRectangular(outcome);
  });

  it('names how many rosters failed rather than scanning what loaded and calling it whole', async () => {
    const api: FakeApi = {
      getAllGroupMembers: vi.fn(async (groupId: string) => {
        if (groupId === '00gFAKE1') throw new Error('403');
        return [member('00uFAKE1')];
      }),
      scanGroupMfa: vi.fn(async () => new Map([['00uFAKE1', mfa('00uFAKE1', true)]])),
    };

    const { outcome } = await runVerb(mfaEnrolmentVerb, groups(2), api);

    expect(outcome.status).toBe('partly-done');
    expect(outcome.summary).toContain('across 1 of 2 groups');
  });

  it('says there is nothing to read when the groups hold no members', async () => {
    const api: FakeApi = {
      getAllGroupMembers: vi.fn(async () => []),
      scanGroupMfa: vi.fn(),
    };

    const { outcome } = await runVerb(mfaEnrolmentVerb, groups(2), api);

    expect(outcome.status).toBe('nothing-to-do');
    expect(api.scanGroupMfa).not.toHaveBeenCalled();
  });
});

describe('rule-impact run', () => {
  const rawRule = (id: string, groupIds: string[]) => ({
    id,
    name: `${id} rule`,
    status: 'ACTIVE' as const,
    type: 'group_rule',
    created: '2026-01-01T00:00:00.000Z',
    lastUpdated: '2026-01-01T00:00:00.000Z',
    actions: { assignUserToGroups: { groupIds } },
  });

  const summaryFor = (
    ruleId: string,
    counts: { memberCount: number; heldSolelyCount: number },
    emptyRuleInventory = false,
  ) => ({
    ruleId,
    ruleName: `${ruleId} rule`,
    targetGroups: [{ groupId: '00gFAKE0', groupName: 'Target', heldSolelyByRule: [], ...counts }],
    distinctMemberCount: counts.memberCount,
    totalHeldSolely: counts.heldSolelyCount,
    emptyRuleInventory,
  });

  it('reads each rule, then captures its impact, one row per target group', async () => {
    const api: FakeApi = {
      getRawGroupRule: vi.fn(async (id: string) => rawRule(id, ['00gFAKE0'])),
      captureRuleImpact: vi.fn(async (rule: { id: string }) =>
        summaryFor(rule.id, { memberCount: 10, heldSolelyCount: 4 }),
      ),
    } as FakeApi;

    const { outcome } = await runVerb(ruleImpactVerb, rules(2), api);

    expect(outcome.status).toBe('done');
    expect(outcome.summary).toBe(
      'Read 2 rules across 2 target groups: of 20 memberships, 8 are held by their rule alone.',
    );
    expectRectangular(outcome);
    expect(outcome.detail?.headers).toHaveLength(6);
    expect(outcome.detail?.rows[0]).toEqual([
      '0prFAKE0',
      '0prFAKE0 rule',
      '00gFAKE0',
      'Target',
      10,
      4,
    ]);
  });

  it('withholds a rule whose inventory was empty rather than reporting a confident zero', async () => {
    const api: FakeApi = {
      getRawGroupRule: vi.fn(async (id: string) => rawRule(id, ['00gFAKE0'])),
      captureRuleImpact: vi.fn(async (rule: { id: string }) =>
        rule.id === '0prFAKE1'
          ? summaryFor(rule.id, { memberCount: 10, heldSolelyCount: 0 }, true)
          : summaryFor(rule.id, { memberCount: 10, heldSolelyCount: 4 }),
      ),
    } as FakeApi;

    const { outcome } = await runVerb(ruleImpactVerb, rules(2), api);

    expect(outcome.status).toBe('partly-done');
    expect(outcome.summary).toContain('covers 1 of the 2 selected rules; 1 could not be answered');
    expect(outcome.detail?.rows).toHaveLength(1);
  });

  it('never captures a rule it could not read', async () => {
    const capture = vi.fn();
    const api: FakeApi = {
      getRawGroupRule: vi.fn(async () => null),
      captureRuleImpact: capture,
    } as FakeApi;

    const { outcome } = await runVerb(ruleImpactVerb, rules(2), api);

    expect(capture).not.toHaveBeenCalled();
    expect(outcome.status).toBe('partly-done');
    expect(outcome.summary).toContain('2 of the 2 selected rules could not be read');
  });

  it('says so when the selected rules assign nobody to a group', async () => {
    const api: FakeApi = {
      getRawGroupRule: vi.fn(async (id: string) => rawRule(id, [])),
      captureRuleImpact: vi.fn(),
    } as FakeApi;

    const { outcome } = await runVerb(ruleImpactVerb, rules(1), api);

    expect(outcome.status).toBe('nothing-to-do');
    expect(api.captureRuleImpact).not.toHaveBeenCalled();
  });
});
