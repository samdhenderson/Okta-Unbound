import { useState, useRef, useCallback, useMemo } from 'react';
import { useOktaApi } from './useOktaApi';
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
    const members = await apiRef.current.getAllGroupMembers(groupId);
    setGroupMembersCache((prev) => {
      const next = new Map(prev);
      next.set(groupId, members);
      return next;
    });
    return members;
  }, []);

  const removeUserFromGroups = useCallback(async (userId: string, groupIds: string[]) => {
    for (const groupId of groupIds) {
      await apiRef.current.makeApiRequest(`/api/v1/groups/${groupId}/users/${userId}`, 'DELETE');
      log.debug(`Removed user ${userId} from group ${groupId}`);
    }
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
