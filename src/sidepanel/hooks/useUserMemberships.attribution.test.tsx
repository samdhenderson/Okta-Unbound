import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserMemberships } from './useUserMemberships';
import { peek, resetEntityCache } from '../cache/entityCache';
import type { GroupMembership, OktaUser } from '../../shared/types';

vi.mock('./getUserGroupsRequest', () => ({
  getUserGroupsRequest: vi.fn(),
}));
vi.mock('./fetchGroupRulesRequest', () => ({
  fetchGroupRulesRequest: vi.fn(),
}));

import { getUserGroupsRequest } from './getUserGroupsRequest';
import { fetchGroupRulesRequest } from './fetchGroupRulesRequest';

globalThis.chrome = {
  tabs: { sendMessage: vi.fn() },
} as unknown as typeof chrome;

const user = { id: '00uFAKEuser' } as OktaUser;

const groupsResponse = {
  success: true,
  count: 1,
  data: [
    {
      group: { id: '00gFAKEeng', type: 'OKTA_GROUP', profile: { name: 'Engineering' } },
      membershipType: 'UNKNOWN',
      addedDate: undefined,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
  vi.mocked(getUserGroupsRequest).mockResolvedValue(
    groupsResponse as unknown as Awaited<ReturnType<typeof getUserGroupsRequest>>,
  );
});

async function load(): Promise<GroupMembership[]> {
  const { result } = renderHook(() => useUserMemberships({ targetTabId: 1 }));
  await act(async () => {
    await result.current.loadMemberships(user);
  });
  return result.current.memberships;
}

describe('useUserMemberships when the rule inventory is unavailable', () => {
  it('reports memberships as unclassified rather than as exact manual adds', async () => {
    vi.mocked(fetchGroupRulesRequest).mockResolvedValue({
      success: false,
      error: 'rate limited',
    } as unknown as Awaited<ReturnType<typeof fetchGroupRulesRequest>>);

    const [membership] = await load();

    expect(membership.membershipType).toBe('UNKNOWN');
    expect(membership.attribution).toBe('ambiguous');
    expect(membership.rules).toEqual([]);
  });

  it('does not bank the degraded answer, so the next load retries', async () => {
    vi.mocked(fetchGroupRulesRequest).mockResolvedValue({
      success: false,
      error: 'rate limited',
    } as unknown as Awaited<ReturnType<typeof fetchGroupRulesRequest>>);

    await load();

    expect(peek(['userMemberships', user.id])).toBeNull();
  });

  it('still classifies normally when the org genuinely has no rules', async () => {
    vi.mocked(fetchGroupRulesRequest).mockResolvedValue({
      success: true,
      rules: [],
    } as unknown as Awaited<ReturnType<typeof fetchGroupRulesRequest>>);

    const [membership] = await load();

    expect(membership.membershipType).toBe('DIRECT');
    expect(membership.attribution).toBe('exact');
    expect(peek(['userMemberships', user.id])).not.toBeNull();
  });
});
