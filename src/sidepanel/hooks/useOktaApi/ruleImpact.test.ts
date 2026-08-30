import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fakeDB, idbTables } = vi.hoisted(() => {
  const idbTables = new Map<string, Map<string, unknown>>();
  const keyOf = (key: unknown) => (Array.isArray(key) ? key.join('::') : String(key));
  const table = (name: string) => {
    if (!idbTables.has(name)) idbTables.set(name, new Map());
    return idbTables.get(name) as Map<string, unknown>;
  };
  const fakeDB = {
    get: async (name: string, key: unknown) => table(name).get(keyOf(key)),
    put: async () => {},
    delete: async () => {},
    getAllFromIndex: async (name: string, _i: string, origin: string) =>
      [...table(name).values()].filter((v) => (v as { origin: string }).origin === origin),
    getAllKeysFromIndex: async () => [],
    transaction: () => ({
      store: { put: async () => {}, delete: async () => {} },
      done: Promise.resolve(),
    }),
  };
  return { fakeDB, idbTables };
});

vi.mock('idb', () => ({ openDB: vi.fn(async () => fakeDB) }));

import { createRuleImpactOperations } from './ruleImpact';
import type { CoreApi } from './core';
import { emptySyncMeta } from '../../../shared/snapshot/syncMeta';
import type { SyncMeta } from '../../../shared/snapshot/types';
import type { OktaGroupRule, OktaUser } from '../../../shared/types';
import { OperationCancelledError } from '../../../shared/scheduler/cancellation';
import type { RequestResult } from '../../../shared/scheduler/types';
import { makeFakeCore, sequentialRunOperation } from '@/test/factories/coreApi';

const makeCore = (overrides: Partial<CoreApi> = {}): CoreApi =>
  makeFakeCore({ runOperation: sequentialRunOperation(), ...overrides });

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
  idbTables.clear();
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
    const makeApiRequest = vi.fn(async (endpoint: string): Promise<RequestResult> => {
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
    expect(summary.targetGroups[0].heldSolelyCount).toBe(1);
    expect(summary.totalHeldSolely).toBe(1);
  });
});

const ORIGIN = 'https://example.okta.com';
const WALKED_AT = 1_800_000_000_000;
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

function seedRulesMeta(patch: Partial<SyncMeta>, origin = ORIGIN) {
  const table = (idbTables.get('syncMeta') ?? new Map()) as Map<string, unknown>;
  table.set(`${origin}::rules`, { ...emptySyncMeta(origin, 'rules'), ...patch });
  idbTables.set('syncMeta', table);
}

function seedSnapshotRules(rules: OktaGroupRule[], origin = ORIGIN) {
  const table = (idbTables.get('rules') ?? new Map()) as Map<string, unknown>;
  for (const entity of rules) {
    table.set(`${origin}::${entity.id}`, { origin, id: entity.id, entity, syncedAt: WALKED_AT });
  }
  idbTables.set('rules', table);
  seedRulesMeta({ complete: true, lastFullWalkAt: WALKED_AT, itemCount: rules.length }, origin);
}

function routeMetaOnly() {
  return vi.fn(async (endpoint: string): Promise<RequestResult> => {
    if (endpoint === '/api/v1/groups/00gFAKE1') {
      return {
        success: true,
        data: { id: '00gFAKE1', profile: { name: 'Target Group' }, type: 'OKTA_GROUP' },
      };
    }
    throw new Error(`Unrouted test endpoint: ${endpoint}`);
  });
}

describe('fetchRawRules snapshot consultation', () => {
  const analyzedInput = {
    id: '0prFAKE1',
    name: 'Rule One',
    groupIds: ['00gFAKE1'],
    groupNames: ['Target Group'],
  };

  it('serves raw rules from the org snapshot with no rules pagination', async () => {
    seedSnapshotRules([cachedRawRule]);
    const makeApiRequest = routeMetaOnly();
    const core = makeCore({ makeApiRequest });
    const getAllGroupMembers = vi.fn().mockResolvedValue([member]);
    const { captureRuleImpact } = createRuleImpactOperations(core, getAllGroupMembers, ORIGIN);

    const summary = await captureRuleImpact(analyzedInput);

    const rulesListings = makeApiRequest.mock.calls.filter((c) =>
      String(c[0]).startsWith('/api/v1/groups/rules'),
    );
    expect(rulesListings).toHaveLength(0);
    expect(summary.totalHeldSolely).toBe(1);
  });

  it('ignores a RulesCache entry now that the snapshot is the source of rules', async () => {
    seedRulesCache([cachedRawRule]);
    const makeApiRequest = vi.fn(async (endpoint: string): Promise<RequestResult> => {
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
    const { captureRuleImpact } = createRuleImpactOperations(core, getAllGroupMembers, ORIGIN);

    await captureRuleImpact(analyzedInput);

    const rulesListings = makeApiRequest.mock.calls.filter((c) =>
      String(c[0]).startsWith('/api/v1/groups/rules'),
    );
    expect(rulesListings).toHaveLength(1);
  });

  it('still paginates when no origin has resolved yet', async () => {
    seedSnapshotRules([cachedRawRule]);
    const makeApiRequest = vi.fn(async (endpoint: string): Promise<RequestResult> => {
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
    const { captureRuleImpact } = createRuleImpactOperations(core, getAllGroupMembers, null);

    const summary = await captureRuleImpact(analyzedInput);

    const rulesListings = makeApiRequest.mock.calls.filter((c) =>
      String(c[0]).startsWith('/api/v1/groups/rules'),
    );
    expect(rulesListings).toHaveLength(1);
    expect(summary.totalHeldSolely).toBe(1);
  });

  it('reads only the connected org, paginating when the snapshot holds another org', async () => {
    seedSnapshotRules([cachedRawRule], 'https://other.okta.com');
    const makeApiRequest = vi.fn(async (endpoint: string): Promise<RequestResult> => {
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
    const { captureRuleImpact } = createRuleImpactOperations(core, getAllGroupMembers, ORIGIN);

    await captureRuleImpact(analyzedInput);

    const rulesListings = makeApiRequest.mock.calls.filter((c) =>
      String(c[0]).startsWith('/api/v1/groups/rules'),
    );
    expect(rulesListings).toHaveLength(1);
  });

  it('raises OperationCancelledError when the target-group load is cancelled', async () => {
    seedSnapshotRules([cachedRawRule]); // rules come from the snapshot; no rules fetch
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
    const { captureRuleImpact } = createRuleImpactOperations(core, vi.fn(), ORIGIN);

    await expect(captureRuleImpact(analyzedInput)).rejects.toBeInstanceOf(OperationCancelledError);
  });

  it('still paginates on a cold snapshot', async () => {
    const makeApiRequest = vi.fn(async (endpoint: string): Promise<RequestResult> => {
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
    const { captureRuleImpact } = createRuleImpactOperations(core, getAllGroupMembers, ORIGIN);

    await captureRuleImpact(analyzedInput);

    const rulesListings = makeApiRequest.mock.calls.filter((c) =>
      String(c[0]).startsWith('/api/v1/groups/rules'),
    );
    expect(rulesListings).toHaveLength(1);
  });

  it('does not serve a mid-walk snapshot as the org, paginating instead', async () => {
    const analyzedRule: OktaGroupRule = { ...cachedRawRule, id: '0prFAKE9', name: 'Rule Nine' };
    const staleGhostRule: OktaGroupRule = { ...cachedRawRule, id: '0prFAKE1' };
    seedSnapshotRules([analyzedRule, staleGhostRule]);
    seedRulesMeta({
      complete: false,
      cursor: '/api/v1/groups/rules?after=0prFAKE1',
      lastFullWalkAt: null,
    });
    const makeApiRequest = vi.fn(async (endpoint: string): Promise<RequestResult> => {
      if (endpoint.startsWith('/api/v1/groups/rules')) {
        return { success: true, data: [analyzedRule], headers: {} };
      }
      return {
        success: true,
        data: { id: '00gFAKE1', profile: { name: 'Target Group' }, type: 'OKTA_GROUP' },
      };
    });
    const core = makeCore({ makeApiRequest });
    const getAllGroupMembers = vi.fn().mockResolvedValue([member]);
    const { captureRuleImpact } = createRuleImpactOperations(core, getAllGroupMembers, ORIGIN);

    const summary = await captureRuleImpact({ ...analyzedInput, id: '0prFAKE9' });

    const rulesListings = makeApiRequest.mock.calls.filter((c) =>
      String(c[0]).startsWith('/api/v1/groups/rules'),
    );
    expect(rulesListings).toHaveLength(1);
    expect(summary.totalHeldSolely).toBe(1);
  });

  it('serves a complete-but-empty snapshot without re-paginating', async () => {
    seedRulesMeta({ complete: true, lastFullWalkAt: WALKED_AT, itemCount: 0 });
    const makeApiRequest = routeMetaOnly();
    const core = makeCore({ makeApiRequest });
    const getAllGroupMembers = vi.fn().mockResolvedValue([member]);
    const { captureRuleImpact } = createRuleImpactOperations(core, getAllGroupMembers, ORIGIN);

    const summary = await captureRuleImpact(analyzedInput);

    const rulesListings = makeApiRequest.mock.calls.filter((c) =>
      String(c[0]).startsWith('/api/v1/groups/rules'),
    );
    expect(rulesListings).toHaveLength(0);
    expect(summary.totalHeldSolely).toBe(0);
  });
});
