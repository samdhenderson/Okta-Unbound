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

import { useUserMemberships } from './useUserMemberships';
import { setEntry, resetEntityCache } from '../cache/entityCache';
import { detectConflicts, formatRuleForDisplay } from '../../shared/ruleUtils';
import { emptySyncMeta } from '../../shared/snapshot/syncMeta';
import type { OktaGroupRule, OktaUser } from '../../shared/types';

const tabsSendMessage = vi.fn();
const runtimeSendMessage = vi.fn(async (_message: unknown) => ({
  success: true,
  data: [rawRule],
  headers: {},
}));

globalThis.chrome = {
  tabs: { sendMessage: tabsSendMessage },
  runtime: { sendMessage: runtimeSendMessage, lastError: undefined },
  storage: { local: { get: vi.fn(), set: vi.fn(), remove: vi.fn() } },
} as unknown as typeof chrome;

const ORIGIN = 'https://example.okta.com';
const WALKED_AT = 1_800_000_000_000;
const user = { id: 'u1' } as OktaUser;

const rawRule: OktaGroupRule = {
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

const rule = formatRuleForDisplay(rawRule, undefined, detectConflicts([rawRule]));

const primeSnapshotRules = (rawRules: OktaGroupRule[]): void => {
  const rows = new Map<string, unknown>(
    rawRules.map((entity) => [
      `${ORIGIN}::${entity.id}`,
      { origin: ORIGIN, id: entity.id, entity, syncedAt: WALKED_AT },
    ]),
  );
  idbTables.set('rules', rows);
  idbTables.set(
    'syncMeta',
    new Map([
      [
        `${ORIGIN}::rules`,
        {
          ...emptySyncMeta(ORIGIN, 'rules'),
          complete: true,
          lastFullWalkAt: WALKED_AT,
          itemCount: rawRules.length,
        },
      ],
    ]),
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
  idbTables.clear();
});

describe('useUserMemberships rule inventory on a memberships cache hit', () => {
  it('adopts an already-cached inventory without issuing a request', async () => {
    setEntry(['userMemberships', user.id], []);
    primeSnapshotRules([rawRule]);

    const { result } = renderHook(() => useUserMemberships({ targetTabId: 1, oktaOrigin: ORIGIN }));
    expect(result.current.rules).toEqual({ status: 'unresolved' });

    await act(async () => {
      await result.current.loadMemberships(user);
    });

    await waitFor(() =>
      expect(result.current.rules).toEqual({ status: 'available', rules: [rule] }),
    );
    expect(tabsSendMessage).not.toHaveBeenCalled();
  });

  it('asks for the rules listing when neither local source holds one', async () => {
    setEntry(['userMemberships', user.id], []);

    const { result } = renderHook(() => useUserMemberships({ targetTabId: 1, oktaOrigin: ORIGIN }));

    await act(async () => {
      await result.current.loadMemberships(user);
    });

    await waitFor(() =>
      expect(runtimeSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'scheduleApiRequest' }),
      ),
    );
    expect(runtimeSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: expect.stringContaining('/api/v1/groups/rules') }),
    );
    expect(tabsSendMessage).not.toHaveBeenCalled();

    await waitFor(() => expect(result.current.rules.status).not.toBe('unresolved'));
    expect(result.current.rules).toMatchObject({
      status: 'available',
      rules: [{ id: rule.id, conditionExpression: rule.conditionExpression }],
    });
  });
});
