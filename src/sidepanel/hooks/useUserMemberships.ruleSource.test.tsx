import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

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

vi.mock('./getUserGroupsRequest', () => ({ getUserGroupsRequest: vi.fn() }));
vi.mock('./fetchGroupRulesRequest', () => ({ fetchGroupRulesRequest: vi.fn() }));

import { useUserMemberships } from './useUserMemberships';
import { getUserGroupsRequest } from './getUserGroupsRequest';
import { fetchGroupRulesRequest } from './fetchGroupRulesRequest';
import { setEntry, resetEntityCache } from '../cache/entityCache';
import { detectConflicts, formatRuleForDisplay } from '../../shared/ruleUtils';
import { emptySyncMeta } from '../../shared/snapshot/syncMeta';
import type { SyncMeta } from '../../shared/snapshot/types';
import type { FormattedRule, OktaGroupRule, OktaUser } from '../../shared/types';

const ORIGIN = 'https://example.okta.com';
const WALKED_AT = 1_800_000_000_000;
const RULES_CACHE_KEY = 'global_rules_cache';

const storageGet = vi.fn();
globalThis.chrome = {
  tabs: { sendMessage: vi.fn() },
  storage: { local: { get: storageGet, set: vi.fn(), remove: vi.fn() } },
} as unknown as typeof chrome;

const user = { id: '00uFAKEuser00001' } as OktaUser;

const currentRawRule: OktaGroupRule = {
  id: '0prFAKErule00001',
  name: 'Contractors → VPN Access',
  status: 'ACTIVE',
  type: 'group_rule',
  created: '2026-01-01T00:00:00.000Z',
  lastUpdated: '2026-01-01T00:00:00.000Z',
  conditions: {
    expression: { value: 'user.userType == "Contractor"', type: 'urn:okta:expression:1.0' },
  },
  actions: { assignUserToGroups: { groupIds: ['00gFAKEgroup0001'] } },
};

const staleRawRule: OktaGroupRule = {
  ...currentRawRule,
  id: '0prFAKErule00002',
  name: 'Interns → VPN Access',
  conditions: {
    expression: { value: 'user.userType == "Intern"', type: 'urn:okta:expression:1.0' },
  },
};

const derive = (rawRules: OktaGroupRule[]): FormattedRule[] => {
  const conflicts = detectConflicts(rawRules);
  return rawRules.map((rule) => formatRuleForDisplay(rule, undefined, conflicts));
};

function primeRulesCache(rawRules: OktaGroupRule[]): void {
  storageGet.mockResolvedValue({
    [RULES_CACHE_KEY]: {
      rules: derive(rawRules),
      rawRules,
      groupNames: {},
      stats: { total: rawRules.length, active: rawRules.length, inactive: 0, conflicts: 0 },
      conflicts: [],
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000,
    },
  });
}

function seedRulesMeta(patch: Partial<SyncMeta>): void {
  const table = (idbTables.get('syncMeta') ?? new Map()) as Map<string, unknown>;
  table.set(`${ORIGIN}::rules`, { ...emptySyncMeta(ORIGIN, 'rules'), ...patch });
  idbTables.set('syncMeta', table);
}

function primeSnapshotRules(rawRules: OktaGroupRule[], complete = true): void {
  const table = (idbTables.get('rules') ?? new Map()) as Map<string, unknown>;
  for (const entity of rawRules) {
    table.set(`${ORIGIN}::${entity.id}`, {
      origin: ORIGIN,
      id: entity.id,
      entity,
      syncedAt: WALKED_AT,
    });
  }
  idbTables.set('rules', table);
  seedRulesMeta({
    complete,
    lastFullWalkAt: complete ? WALKED_AT : null,
    itemCount: rawRules.length,
  });
}

async function loadFresh(): Promise<FormattedRule[] | undefined> {
  const { result } = renderHook(() => useUserMemberships({ targetTabId: 1, oktaOrigin: ORIGIN }));
  await act(async () => {
    await result.current.loadMemberships(user);
  });
  const inventory = result.current.rules;
  return inventory.status === 'available' ? inventory.rules : undefined;
}

async function loadFromCacheHit(): Promise<FormattedRule[] | undefined> {
  setEntry(['userMemberships', user.id], []);
  const { result } = renderHook(() => useUserMemberships({ targetTabId: 1, oktaOrigin: ORIGIN }));
  await act(async () => {
    await result.current.loadMemberships(user);
  });
  await waitFor(() => expect(result.current.rules.status).toBe('available'));
  const inventory = result.current.rules;
  return inventory.status === 'available' ? inventory.rules : undefined;
}

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
  idbTables.clear();
  storageGet.mockResolvedValue({});
  vi.mocked(getUserGroupsRequest).mockResolvedValue({
    success: true,
    count: 0,
    data: [],
  } as unknown as Awaited<ReturnType<typeof getUserGroupsRequest>>);
  vi.mocked(fetchGroupRulesRequest).mockResolvedValue({
    success: false,
    error: 'the test did not expect a rules listing',
  } as unknown as Awaited<ReturnType<typeof fetchGroupRulesRequest>>);
});

describe('useUserMemberships rule inventory shape', () => {
  it('publishes the derived display shape on a full load', async () => {
    primeRulesCache([currentRawRule]);
    primeSnapshotRules([currentRawRule]);

    expect(await loadFresh()).toEqual(derive([currentRawRule]));
    expect(fetchGroupRulesRequest).not.toHaveBeenCalled();
  });

  it('publishes the derived display shape on a memberships cache hit', async () => {
    primeRulesCache([currentRawRule]);
    primeSnapshotRules([currentRawRule]);

    expect(await loadFromCacheHit()).toEqual(derive([currentRawRule]));
    expect(fetchGroupRulesRequest).not.toHaveBeenCalled();
  });
});

describe('useUserMemberships when the two rule stores disagree', () => {
  it('answers from the org snapshot on a full load', async () => {
    primeRulesCache([staleRawRule]);
    primeSnapshotRules([currentRawRule]);

    expect(await loadFresh()).toEqual(derive([currentRawRule]));
  });

  it('answers from the org snapshot on a memberships cache hit', async () => {
    primeRulesCache([staleRawRule]);
    primeSnapshotRules([currentRawRule]);

    expect(await loadFromCacheHit()).toEqual(derive([currentRawRule]));
  });
});

describe('useUserMemberships when the snapshot cannot answer', () => {
  it('lists the rules when the org has no completed walk', async () => {
    primeSnapshotRules([currentRawRule], false);
    vi.mocked(fetchGroupRulesRequest).mockResolvedValue({
      success: true,
      rules: derive([currentRawRule, staleRawRule]),
    } as unknown as Awaited<ReturnType<typeof fetchGroupRulesRequest>>);

    expect(await loadFresh()).toEqual(derive([currentRawRule, staleRawRule]));
    expect(fetchGroupRulesRequest).toHaveBeenCalled();
  });

  it('reports an empty completed walk as an answer, not as a failure', async () => {
    primeSnapshotRules([]);

    expect(await loadFresh()).toEqual([]);
    expect(fetchGroupRulesRequest).not.toHaveBeenCalled();
  });
});
