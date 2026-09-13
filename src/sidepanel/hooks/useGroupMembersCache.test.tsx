import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGroupMembersCache } from './useGroupMembersCache';
import type { useOktaApi } from './useOktaApi';
import { peek } from '../cache/entityCache';
import type { OktaUser } from '../../shared/types';

type OktaApi = ReturnType<typeof useOktaApi>;

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

function makeApi(overrides: Partial<Record<keyof OktaApi, unknown>> = {}): OktaApi {
  return {
    getAllGroupMembers: vi.fn().mockResolvedValue([member]),
    ...overrides,
  } as unknown as OktaApi;
}

describe('useGroupMembersCache', () => {
  it('serves a second fetch for the same group from the entity cache (one network call)', async () => {
    const getAllGroupMembers = vi.fn().mockResolvedValue([member]);
    const api = makeApi({ getAllGroupMembers });
    const { result } = renderHook(() => useGroupMembersCache(api));

    await act(async () => {
      await result.current.fetchMembers('00gFAKE1');
    });
    await act(async () => {
      await result.current.fetchMembers('00gFAKE1');
    });

    expect(getAllGroupMembers).toHaveBeenCalledTimes(1);
    expect(result.current.groupMembersCache.get('00gFAKE1')).toEqual([member]);
  });

  it('writes under the same key GroupOverview reads (["groupMembers", groupId])', async () => {
    const api = makeApi();
    const { result } = renderHook(() => useGroupMembersCache(api));

    await act(async () => {
      await result.current.fetchMembers('00gFAKE1');
    });

    expect(peek<OktaUser[]>(['groupMembers', '00gFAKE1'])).toEqual([member]);
  });
});
