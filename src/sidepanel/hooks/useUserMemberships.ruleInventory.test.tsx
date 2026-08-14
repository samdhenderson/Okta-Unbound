import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserMemberships } from './useUserMemberships';
import { setEntry, resetEntityCache } from '../cache/entityCache';
import type { FormattedRule, OktaUser } from '../../shared/types';

const tabsSendMessage = vi.fn();
const storageGet = vi.fn();

globalThis.chrome = {
  tabs: { sendMessage: tabsSendMessage },
  storage: { local: { get: storageGet, set: vi.fn(), remove: vi.fn() } },
} as unknown as typeof chrome;

const user = { id: 'u1' } as OktaUser;

const rule: FormattedRule = {
  id: '0prFAKErule00001',
  name: 'Contractors → VPN Access',
  status: 'ACTIVE',
  condition: 'user.userType == "Contractor"',
  conditionExpression: 'user.userType == "Contractor"',
  groupIds: ['00gFAKEgroup0001'],
  userAttributes: ['userType'],
  created: '2026-01-01T00:00:00.000Z',
  lastUpdated: '2026-01-01T00:00:00.000Z',
};

const primeRulesCache = (rules: FormattedRule[]): void => {
  storageGet.mockResolvedValue({
    global_rules_cache: {
      rules,
      groupNames: {},
      conflicts: [],
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000,
    },
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
  storageGet.mockResolvedValue({});
});

describe('useUserMemberships rule inventory on a memberships cache hit', () => {
  it('adopts an already-cached inventory without issuing a request', async () => {
    setEntry(['userMemberships', user.id], []);
    primeRulesCache([rule]);

    const { result } = renderHook(() => useUserMemberships({ targetTabId: 1 }));
    expect(result.current.rules).toEqual({ status: 'unresolved' });

    await act(async () => {
      await result.current.loadMemberships(user);
    });

    await waitFor(() =>
      expect(result.current.rules).toEqual({ status: 'available', rules: [rule] }),
    );
    expect(tabsSendMessage).not.toHaveBeenCalled();
  });

  it('leaves the inventory unresolved — never unavailable — when nothing is cached', async () => {
    setEntry(['userMemberships', user.id], []);

    const { result } = renderHook(() => useUserMemberships({ targetTabId: 1 }));

    await act(async () => {
      await result.current.loadMemberships(user);
    });

    expect(result.current.rules).toEqual({ status: 'unresolved' });
    expect(tabsSendMessage).not.toHaveBeenCalled();
  });
});
