import { useState, useRef, useCallback } from 'react';
import { useOktaApi } from './useOktaApi';
import { getOrFetch } from '../cache/entityCache';
import { cacheKeys } from '../cache/keys';
import type { OktaUser } from '../../shared/types';

type OktaApi = ReturnType<typeof useOktaApi>;

export function useGroupMembersCache(api: OktaApi) {
  const [groupMembersCache, setGroupMembersCache] = useState<Map<string, OktaUser[]>>(new Map());

  const apiRef = useRef(api);
  // eslint-disable-next-line react-hooks/refs
  apiRef.current = api;

  const fetchMembers = useCallback(async (groupId: string) => {
    const members = await getOrFetch<OktaUser[]>(cacheKeys.groupMembers(groupId), () =>
      apiRef.current.getAllGroupMembers(groupId),
    );
    setGroupMembersCache((prev) => {
      const next = new Map(prev);
      next.set(groupId, members);
      return next;
    });
    return members;
  }, []);

  return { groupMembersCache, fetchMembers };
}
