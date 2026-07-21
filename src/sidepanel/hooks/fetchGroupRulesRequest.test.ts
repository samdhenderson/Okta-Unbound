import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchGroupRulesRequest } from './fetchGroupRulesRequest';
import type { RequestResult } from '../../shared/scheduler/types';

const getCacheEntry = vi.fn();
const setCacheEntry = vi.fn();
vi.mock('../../shared/cache', () => ({
  getCacheEntry: (...args: unknown[]) => getCacheEntry(...args),
  setCacheEntry: (...args: unknown[]) => setCacheEntry(...args),
}));

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
  getCacheEntry.mockResolvedValue(null); // cache miss → resolve names via fetch
  setCacheEntry.mockResolvedValue(undefined);
});

describe('fetchGroupRulesRequest', () => {
  it('formats rules with resolved group names, stats, and conflicts', async () => {
    const ruleA = rawRule({ id: 'rA', name: 'A' });
    const ruleB = rawRule({ id: 'rB', name: 'B' }); // same group + attribute → conflict
    const makeApiRequest = router([
      [/^\/api\/v1\/groups\/rules/, () => ok([ruleA, ruleB])],
      [/^\/api\/v1\/groups\/gX$/, () => ok({ profile: { name: 'Group X' } })],
    ]);

    const result = await fetchGroupRulesRequest(makeApiRequest, 'gX');

    expect(result.success).toBe(true);
    expect(result.stats).toEqual({ total: 2, active: 2, inactive: 0, conflicts: 1 });
    expect(result.conflicts).toHaveLength(1);
    expect(result.rules?.[0].groupNames).toEqual(['Group X']);
    expect(result.rules?.[0].allGroupNamesMap).toEqual({ gX: 'Group X' });
    expect(result.rules?.[0].affectsCurrentGroup).toBe(true);
    expect(makeApiRequest.mock.calls.filter((c) => c[0] === '/api/v1/groups/gX')).toHaveLength(1);
    expect(setCacheEntry).toHaveBeenCalledWith('group_name_gX', 'Group X', { ttl: 5 * 60 * 1000 });
  });

  it('serves a cached group name without fetching it', async () => {
    getCacheEntry.mockResolvedValue('Cached X');
    const makeApiRequest = router([[/^\/api\/v1\/groups\/rules/, () => ok([rawRule()])]]);

    const result = await fetchGroupRulesRequest(makeApiRequest);

    expect(result.rules?.[0].groupNames).toEqual(['Cached X']);
    expect(makeApiRequest.mock.calls.filter((c) => c[0] === '/api/v1/groups/gX')).toHaveLength(0);
  });

  it('skips the group-name fan-out when resolveGroupNames is false', async () => {
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
    });

    expect(result.success).toBe(true);
    const groupGets = makeApiRequest.mock.calls.filter((c) =>
      /^\/api\/v1\/groups\/00g/.test(c[0] as string),
    );
    expect(groupGets).toHaveLength(0);
    expect(getCacheEntry).not.toHaveBeenCalled();
    expect(result.rules?.[0].groupNames).toEqual(['00gAAAAAAAAAAAAAAAAA']);
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
