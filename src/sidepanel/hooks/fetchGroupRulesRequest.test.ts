import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchGroupRulesRequest } from './fetchGroupRulesRequest';
import { orgSnapshotStore } from '../../shared/snapshot/orgSnapshotStore';
import type { RequestResult } from '../../shared/scheduler/types';

vi.mock('../../shared/snapshot/orgSnapshotStore', () => ({
  orgSnapshotStore: { getCollection: vi.fn(async () => []) },
}));

const ORIGIN = 'https://x.okta.com';

function stubGroupsCache(groups: Array<{ id: string; name: string }>) {
  vi.mocked(orgSnapshotStore.getCollection).mockResolvedValue(
    groups.map((g) => ({ id: g.id, type: 'OKTA_GROUP', profile: { name: g.name } })),
  );
}

const ok = (data: unknown, headers?: Record<string, string>): RequestResult => ({
  success: true,
  data,
  headers,
});

function rawRule(over: Record<string, unknown> = {}) {
  return {
    id: 'r1',
    name: 'Rule 1',
    status: 'ACTIVE',
    conditions: { expression: { value: 'user.department=="Eng"' } },
    actions: { assignUserToGroups: { groupIds: ['gX'] } },
    created: '2020-01-01T00:00:00.000Z',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    ...over,
  };
}

function router(handlers: Array<[RegExp, () => RequestResult]>) {
  return vi.fn(async (endpoint: string) => {
    for (const [pattern, respond] of handlers) {
      if (pattern.test(endpoint)) return respond();
    }
    return { success: true, data: [] } as RequestResult;
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(orgSnapshotStore.getCollection).mockResolvedValue([]);
});

describe('fetchGroupRulesRequest', () => {
  it('labels rules with group names from the snapshot, plus stats and conflicts', async () => {
    stubGroupsCache([{ id: 'gX', name: 'Group X' }]);
    const ruleA = rawRule({ id: 'rA', name: 'A' });
    const ruleB = rawRule({ id: 'rB', name: 'B' }); // same group + attribute → conflict
    const makeApiRequest = router([[/^\/api\/v1\/groups\/rules/, () => ok([ruleA, ruleB])]]);

    const result = await fetchGroupRulesRequest(makeApiRequest, 'gX', { origin: ORIGIN });

    expect(result.success).toBe(true);
    expect(result.stats).toEqual({ total: 2, active: 2, inactive: 0, conflicts: 1 });
    expect(result.conflicts).toHaveLength(1);
    expect(result.rules?.[0].groupNames).toEqual(['Group X']);
    expect(result.rules?.[0].allGroupNamesMap).toEqual({ gX: 'Group X' });
    expect(result.rules?.[0].affectsCurrentGroup).toBe(true);
    expect(makeApiRequest.mock.calls.filter((c) => c[0] === '/api/v1/groups/gX')).toHaveLength(0);
  });

  it('reads the connected org, and reads nothing at all without one', async () => {
    stubGroupsCache([{ id: 'gX', name: 'Group X' }]);
    const makeApiRequest = router([[/^\/api\/v1\/groups\/rules/, () => ok([rawRule()])]]);

    await fetchGroupRulesRequest(makeApiRequest, undefined, { origin: ORIGIN });
    expect(orgSnapshotStore.getCollection).toHaveBeenCalledWith('groups', ORIGIN);

    vi.mocked(orgSnapshotStore.getCollection).mockClear();
    const result = await fetchGroupRulesRequest(makeApiRequest);

    expect(orgSnapshotStore.getCollection).not.toHaveBeenCalled();
    expect(result.rules?.[0].groupNames).toEqual(['gX']);
  });

  it('falls back to the group id when the group is absent from the snapshot', async () => {
    const makeApiRequest = router([[/^\/api\/v1\/groups\/rules/, () => ok([rawRule()])]]);

    const result = await fetchGroupRulesRequest(makeApiRequest, undefined, { origin: ORIGIN });

    expect(result.rules?.[0].groupNames).toEqual(['gX']);
    expect(makeApiRequest.mock.calls.filter((c) => c[0] === '/api/v1/groups/gX')).toHaveLength(0);
  });

  it('does not read the snapshot when resolveGroupNames is false', async () => {
    const ruleA = rawRule({
      id: 'rA',
      actions: { assignUserToGroups: { groupIds: ['00gAAAAAAAAAAAAAAAAA'] } },
      conditions: { expression: { value: 'isMemberOfAnyGroup("00gBBBBBBBBBBBBBBBBB")' } },
    });
    const ruleB = rawRule({
      id: 'rB',
      actions: { assignUserToGroups: { groupIds: ['00gCCCCCCCCCCCCCCCCC'] } },
    });
    const makeApiRequest = router([[/^\/api\/v1\/groups\/rules/, () => ok([ruleA, ruleB])]]);

    const result = await fetchGroupRulesRequest(makeApiRequest, undefined, {
      resolveGroupNames: false,
      origin: ORIGIN,
    });

    expect(result.success).toBe(true);
    const groupGets = makeApiRequest.mock.calls.filter((c) =>
      /^\/api\/v1\/groups\/00g/.test(c[0] as string),
    );
    expect(groupGets).toHaveLength(0);
    expect(orgSnapshotStore.getCollection).not.toHaveBeenCalled();
    expect(result.rules?.[0].groupNames).toEqual(['00gAAAAAAAAAAAAAAAAA']);
  });

  it('returns the raw rules alongside the formatted ones from a single fetch', async () => {
    const ruleA = rawRule({ id: 'rA', name: 'A' });
    const makeApiRequest = router([[/^\/api\/v1\/groups\/rules/, () => ok([ruleA])]]);

    const result = await fetchGroupRulesRequest(makeApiRequest);

    expect(result.success).toBe(true);
    expect(result.rawRules).toEqual([ruleA]);
    expect(result.rules?.map((r) => r.id)).toEqual(['rA']);
    expect(makeApiRequest).toHaveBeenCalledTimes(1);
  });

  it('stops paginating when Okta returns a next link on an empty page', async () => {
    const nextHeader = {
      link: '<https://acme.okta.com/api/v1/groups/rules?after=STUCK&limit=200>; rel="next"',
    };
    const makeApiRequest = vi
      .fn()
      .mockResolvedValueOnce(
        ok([rawRule({ actions: { assignUserToGroups: { groupIds: [] } } })], nextHeader),
      )
      .mockResolvedValue(ok([], nextHeader));

    const result = await fetchGroupRulesRequest(makeApiRequest);

    expect(result.success).toBe(true);
    const rulePageCalls = makeApiRequest.mock.calls.filter((c) =>
      /^\/api\/v1\/groups\/rules/.test(c[0] as string),
    );
    expect(rulePageCalls).toHaveLength(2);
  });

  it('follows Link rel="next" across rule pages', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValueOnce(
        ok([rawRule({ id: 'rA', actions: { assignUserToGroups: { groupIds: [] } } })], {
          link: '<https://acme.okta.com/api/v1/groups/rules?after=CUR&limit=200>; rel="next"',
        }),
      )
      .mockResolvedValueOnce(
        ok([
          rawRule({
            id: 'rB',
            status: 'INACTIVE',
            actions: { assignUserToGroups: { groupIds: [] } },
          }),
        ]),
      );

    const result = await fetchGroupRulesRequest(makeApiRequest);

    expect(makeApiRequest).toHaveBeenNthCalledWith(2, '/api/v1/groups/rules?after=CUR&limit=200');
    expect(result.stats).toEqual({ total: 2, active: 1, inactive: 1, conflicts: 0 });
  });

  it('returns a failed rules page verbatim', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValue({ success: false, error: 'boom' } as RequestResult);

    const result = await fetchGroupRulesRequest(makeApiRequest);

    expect(result).toEqual({ success: false, error: 'boom' });
  });

  it('reports a failure (does not throw) when a request rejects', async () => {
    const makeApiRequest = vi.fn().mockRejectedValue(new Error('scheduler down'));

    const result = await fetchGroupRulesRequest(makeApiRequest);

    expect(result).toEqual({ success: false, error: 'scheduler down' });
  });
});
