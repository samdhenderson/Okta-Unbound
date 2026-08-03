import { useState, useRef, useCallback, useMemo } from 'react';
import { useOktaApi } from './useOktaApi';
import { getOrFetch, invalidate } from '../cache/entityCache';
import type { GroupSummary, OktaUser } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useGroupMembersCache');

type OktaApi = ReturnType<typeof useOktaApi>;

export function useGroupMembersCache(api: OktaApi, groups: GroupSummary[]) {
  const [groupMembersCache, setGroupMembersCache] = useState<Map<string, OktaUser[]>>(new Map());

  const apiRef = useRef(api);
  // eslint-disable-next-line react-hooks/refs
  apiRef.current = api;

  const fetchMembers = useCallback(async (groupId: string) => {
    const members = await getOrFetch<OktaUser[]>(['groupMembers', groupId], () =>
      apiRef.current.getAllGroupMembers(groupId),
    );
    setGroupMembersCache((prev) => {
      const next = new Map(prev);
      next.set(groupId, members);
      return next;
    });
    return members;
  }, []);

  const removeUserFromGroups = useCallback(async (userId: string, groupIds: string[]) => {
    const outcome = await apiRef.current.removeUserFromGroups(userId, groupIds);
    for (const r of outcome.results) {
      if (r.status !== 'fulfilled') continue;
      invalidate(['groupMembers', r.item]);
      log.debug(`Removed user ${userId} from group ${r.item}`);
    }
    const rejected = outcome.results.find((r) => r.status === 'rejected');
    if (rejected) throw rejected.error;
  }, []);

  const groupNames = useMemo(() => {
    const names = new Map<string, string>();
    for (const g of groups) {
      names.set(g.id, g.name);
    }
    return names;
  }, [groups]);

  return { groupMembersCache, groupNames, fetchMembers, removeUserFromGroups };
}
