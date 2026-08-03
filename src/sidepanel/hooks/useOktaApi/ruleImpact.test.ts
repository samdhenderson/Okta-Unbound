import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRuleImpactOperations } from './ruleImpact';
import type { CoreApi } from './core';
import type { OktaGroupRule, OktaUser } from '../../../shared/types';
import { OperationCancelledError } from '../../../shared/scheduler/cancellation';

function makeCore(overrides: Partial<CoreApi> = {}): CoreApi {
  return {
    targetTabId: 1,
    sendMessage: vi.fn(),
    makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: [], headers: {} }),
    getCurrentUser: vi.fn().mockResolvedValue({ email: 'admin@example.com', id: 'admin' }),
    checkCancelled: vi.fn(),
    resetCancellation: vi.fn(),
    runOperation: vi.fn(
      async (
        _name: string,
        items: unknown[],
        task: (item: unknown, index: number) => Promise<unknown>,
      ) => {
        const results: Array<{
          item: unknown;
          index: number;
          status: string;
          value?: unknown;
          error?: unknown;
        }> = [];
        let completed = 0;
        let failed = 0;
        for (let i = 0; i < items.length; i++) {
          try {
            const value = await task(items[i], i);
            results.push({ item: items[i], index: i, status: 'fulfilled', value });
            completed++;
          } catch (error) {
            results.push({ item: items[i], index: i, status: 'rejected', error });
            failed++;
          }
        }
        return {
          results,
          total: items.length,
          completed,
          failed,
          skipped: 0,
          stoppedByError: false,
          cancelled: false,
        };
      },
    ),
    callbacks: {},
    ...overrides,
  } as unknown as CoreApi;
}

const member: OktaUser = {
  id: '00uFAKE1',
  status: 'ACTIVE',
  profile: {
    login: 'ada@example.com',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Fake',
  },
};

beforeEach(() => {
  vi.mocked(chrome.storage.local.get).mockReset();
  vi.mocked(chrome.storage.local.remove).mockReset();
});

describe('captureRuleImpact boundary validation', () => {
  it('drops a malformed rule row leniently so it cannot skew the impact math', async () => {
    const analyzedRule = {
      id: '0prFAKE1',
      name: 'Rule One',
      status: 'ACTIVE',
      actions: { assignUserToGroups: { groupIds: ['00gFAKE1'] } },
    };
    const malformedRule = {
      id: 999,
      name: 'Broken Rule',
      status: 'ACTIVE',
      actions: { assignUserToGroups: { groupIds: ['00gFAKE1'] } },
    };
    const makeApiRequest = vi.fn(async (endpoint: string) => {
      if (endpoint.startsWith('/api/v1/groups/rules')) {
        return { success: true, data: [analyzedRule, malformedRule], headers: {} };
      }
      if (endpoint === '/api/v1/groups/00gFAKE1') {
        return {
          success: true,
          data: { id: '00gFAKE1', profile: { name: 'Target Group' }, type: 'OKTA_GROUP' },
        };
      }
      throw new Error(`Unrouted test endpoint: ${endpoint}`);
    });
    const core = makeCore({ makeApiRequest });
    const getAllGroupMembers = vi.fn().mockResolvedValue([member]);
    const { captureRuleImpact } = createRuleImpactOperations(core, getAllGroupMembers);

    const summary = await captureRuleImpact({
      id: '0prFAKE1',
      name: 'Rule One',
      groupIds: ['00gFAKE1'],
      groupNames: ['Target Group'],
    });

    expect(summary.targetGroups).toHaveLength(1);
    expect(summary.targetGroups[0].losingCount).toBe(1);
    expect(summary.totalLosing).toBe(1);
  });
});

const RULES_CACHE_KEY = 'global_rules_cache';

const cachedRawRule: OktaGroupRule = {
  id: '0prFAKE1',
  name: 'Rule One',
  status: 'ACTIVE',
  type: 'group_rule',
  created: '2020-01-01T00:00:00.000Z',
  lastUpdated: '2024-01-01T00:00:00.000Z',
  actions: { assignUserToGroups: { groupIds: ['00gFAKE1'] } },
};

function seedRulesCache(rawRules: OktaGroupRule[], ageMs = 0) {
  vi.mocked(chrome.storage.local.get).mockResolvedValue({
    [RULES_CACHE_KEY]: {
      rules: [],
      rawRules,
      stats: { total: rawRules.length, active: rawRules.length, inactive: 0, conflicts: 0 },
      conflicts: [],
      timestamp: Date.now() - ageMs,
      ttl: 5 * 60 * 1000,
    },
  } as never);
  vi.mocked(chrome.storage.local.remove).mockResolvedValue(undefined as never);
}

function routeMetaOnly() {
  return vi.fn(async (endpoint: string) => {
    if (endpoint === '/api/v1/groups/00gFAKE1') {
      return {
        success: true,
        data: { id: '00gFAKE1', profile: { name: 'Target Group' }, type: 'OKTA_GROUP' },
      };
    }
    throw new Error(`Unrouted test endpoint: ${endpoint}`);
  });
}

describe('fetchRawRules RulesCache consultation', () => {
  const analyzedInput = {
    id: '0prFAKE1',
    name: 'Rule One',
    groupIds: ['00gFAKE1'],
    groupNames: ['Target Group'],
  };

  it('serves raw rules from a fresh cache entry with no rules pagination', async () => {
    seedRulesCache([cachedRawRule]);
    const makeApiRequest = routeMetaOnly();
    const core = makeCore({ makeApiRequest });
    const getAllGroupMembers = vi.fn().mockResolvedValue([member]);
    const { captureRuleImpact } = createRuleImpactOperations(core, getAllGroupMembers);

    const summary = await captureRuleImpact(analyzedInput);

    const rulesListings = makeApiRequest.mock.calls.filter((c) =>
      String(c[0]).startsWith('/api/v1/groups/rules'),
    );
    expect(rulesListings).toHaveLength(0);
    expect(summary.totalLosing).toBe(1);
  });

  it('still paginates when the cache entry is expired', async () => {
    seedRulesCache([cachedRawRule], 10 * 60 * 1000); // older than the 5-min TTL
    const makeApiRequest = vi.fn(async (endpoint: string) => {
      if (endpoint.startsWith('/api/v1/groups/rules')) {
        return { success: true, data: [cachedRawRule], headers: {} };
      }
      return {
        success: true,
        data: { id: '00gFAKE1', profile: { name: 'Target Group' }, type: 'OKTA_GROUP' },
      };
    });
    const core = makeCore({ makeApiRequest });
    const getAllGroupMembers = vi.fn().mockResolvedValue([member]);
    const { captureRuleImpact } = createRuleImpactOperations(core, getAllGroupMembers);

    await captureRuleImpact(analyzedInput);

    const rulesListings = makeApiRequest.mock.calls.filter((c) =>
      String(c[0]).startsWith('/api/v1/groups/rules'),
    );
    expect(rulesListings).toHaveLength(1);
  });

  it('raises OperationCancelledError when the target-group load is cancelled', async () => {
    seedRulesCache([cachedRawRule]); // rules come from cache; no rules fetch
    const cancelledOutcome = {
      results: [],
      total: 1,
      completed: 0,
      failed: 0,
      skipped: 1,
      stoppedByError: false,
      cancelled: true,
    };
    const runOperation = vi
      .fn()
      .mockResolvedValue(cancelledOutcome) as unknown as CoreApi['runOperation'];
    const core = makeCore({ makeApiRequest: routeMetaOnly(), runOperation });
    const { captureRuleImpact } = createRuleImpactOperations(core, vi.fn());

    await expect(captureRuleImpact(analyzedInput)).rejects.toBeInstanceOf(OperationCancelledError);
  });

  it('still paginates on a missing entry or a legacy entry without raw rules', async () => {
    seedRulesCache([]);
    const makeApiRequest = vi.fn(async (endpoint: string) => {
      if (endpoint.startsWith('/api/v1/groups/rules')) {
        return { success: true, data: [cachedRawRule], headers: {} };
      }
      return {
        success: true,
        data: { id: '00gFAKE1', profile: { name: 'Target Group' }, type: 'OKTA_GROUP' },
      };
    });
    const core = makeCore({ makeApiRequest });
    const getAllGroupMembers = vi.fn().mockResolvedValue([member]);
    const { captureRuleImpact } = createRuleImpactOperations(core, getAllGroupMembers);

    await captureRuleImpact(analyzedInput);

    const rulesListings = makeApiRequest.mock.calls.filter((c) =>
      String(c[0]).startsWith('/api/v1/groups/rules'),
    );
    expect(rulesListings).toHaveLength(1);
  });
});
