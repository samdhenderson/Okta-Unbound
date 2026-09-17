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
  const { memberships } = result.current;
  if (!memberships) throw new Error('expected the membership load to succeed');
  return memberships;
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

describe('useUserMemberships hands the classifier the whole group list', () => {
  const twoGroups = {
    success: true,
    count: 2,
    data: [
      {
        group: { id: '00gFAKEeng', type: 'OKTA_GROUP', profile: { name: 'Engineering' } },
        membershipType: 'UNKNOWN',
        addedDate: undefined,
      },
      {
        group: { id: '00gFAKEcon', type: 'OKTA_GROUP', profile: { name: 'Contractors' } },
        membershipType: 'UNKNOWN',
        addedDate: undefined,
      },
    ],
  };

  const feedingRule = {
    id: '0prFAKEmember',
    name: 'Engineering by membership',
    status: 'ACTIVE',
    groupIds: ['00gFAKEeng'],
    conditionExpression: 'isMemberOfGroup("00gFAKEcon")',
  };

  it('proves an isMemberOf rule rather than deducing it', async () => {
    vi.mocked(getUserGroupsRequest).mockResolvedValue(
      twoGroups as unknown as Awaited<ReturnType<typeof getUserGroupsRequest>>,
    );
    vi.mocked(fetchGroupRulesRequest).mockResolvedValue({
      success: true,
      rules: [feedingRule],
    } as unknown as Awaited<ReturnType<typeof fetchGroupRulesRequest>>);

    const memberships = await load();
    const engineering = memberships.find((m) => m.group.id === '00gFAKEeng');

    expect(engineering?.membershipType).toBe('RULE_BASED');
    expect(engineering?.attribution).toBe('exact');
    expect(engineering?.rules.map((r) => r.id)).toEqual(['0prFAKEmember']);
  });
});
