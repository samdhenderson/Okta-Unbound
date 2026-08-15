import { useCallback, useMemo, useState } from 'react';
import type { GroupSummary, OktaUser } from '../../../../shared/types';
import { useOktaApi } from '../../../hooks/useOktaApi';
import { useDebouncedUserSearch } from '../../../hooks/useDebouncedUserSearch';
import { peek, setEntry } from '../../../cache/entityCache';
import { cacheKeys } from '../../../cache/keys';
import type { SourceStatus } from '../../../hooks/useGroupSource';
import { createLogger } from '../../../../shared/utils/logger';

const log = createLogger('useGroupMembersSection');

export type MemberWriteStatus = 'idle' | 'loading' | 'error';

export interface UseGroupMembersSectionReturn {
  members: OktaUser[] | null;

  removeTarget: OktaUser | null;
  requestRemove: (user: OktaUser) => void;
  cancelRemove: () => void;
  confirmRemove: () => void;
  removeStatus: MemberWriteStatus;
  removeError: string | null;

  addQuery: string;
  setAddQuery: (query: string) => void;
  addResults: OktaUser[];
  isSearchingToAdd: boolean;
  addSearchError: string | null;
  selectToAdd: (user: OktaUser) => void;
  addStatus: MemberWriteStatus;
  addError: string | null;
}

export function useGroupMembersSection(
  group: GroupSummary,
  targetTabId: number | null,
  memberStatus: SourceStatus,
  onRosterChanged?: (members: OktaUser[]) => void,
): UseGroupMembersSectionReturn {
  const api = useOktaApi({ targetTabId });
  const { addUserToGroup, removeUserFromGroup } = api;

  const [cacheTick, setCacheTick] = useState(0);

  const members = useMemo<OktaUser[] | null>(() => {
    void cacheTick;
    if (memberStatus !== 'done') return null;
    return peek<OktaUser[]>(cacheKeys.groupMembers(group.id)) ?? [];
  }, [group.id, memberStatus, cacheTick]);

  const writeBack = useCallback(
    (next: OktaUser[]) => {
      setEntry(cacheKeys.groupMembers(group.id), next);
      setCacheTick((t) => t + 1);
      onRosterChanged?.(next);
    },
    [group.id, onRosterChanged],
  );

  const [removeTarget, setRemoveTarget] = useState<OktaUser | null>(null);
  const [removeStatus, setRemoveStatus] = useState<MemberWriteStatus>('idle');
  const [removeError, setRemoveError] = useState<string | null>(null);

  const requestRemove = useCallback((user: OktaUser) => {
    setRemoveTarget(user);
    setRemoveStatus('idle');
    setRemoveError(null);
  }, []);

  const cancelRemove = useCallback(() => {
    setRemoveTarget(null);
    setRemoveStatus('idle');
    setRemoveError(null);
  }, []);

  const confirmRemove = useCallback(() => {
    if (!removeTarget || !members) return;
    const target = removeTarget;
    setRemoveStatus('loading');
    setRemoveError(null);

    removeUserFromGroup(group.id, group.name, target)
      .then((result) => {
        if (!result.success) {
          setRemoveStatus('error');
          setRemoveError(result.error || 'Failed to remove member.');
          return;
        }
        writeBack(members.filter((m) => m.id !== target.id));
        setRemoveTarget(null);
        setRemoveStatus('idle');
      })
      .catch((err: unknown) => {
        log.error('Failed to remove member:', err);
        setRemoveStatus('error');
        setRemoveError(err instanceof Error ? err.message : 'Failed to remove member.');
      });
  }, [removeTarget, members, removeUserFromGroup, group.id, group.name, writeBack]);

  const [addStatus, setAddStatus] = useState<MemberWriteStatus>('idle');
  const [addError, setAddError] = useState<string | null>(null);
  const [addSearchError, setAddSearchError] = useState<string | null>(null);

  const {
    searchQuery: addQuery,
    setSearchQuery: setAddQuery,
    searchResults,
    setSearchResults,
    isSearching: isSearchingToAdd,
  } = useDebouncedUserSearch({
    targetTabId: targetTabId ?? undefined,
    onError: setAddSearchError,
    debounceMs: 400,
    minQueryLength: 2,
    log,
  });

  const memberIds = useMemo(() => new Set((members ?? []).map((m) => m.id)), [members]);
  const addResults = useMemo(
    () => searchResults.filter((u) => !memberIds.has(u.id)),
    [searchResults, memberIds],
  );

  const selectToAdd = useCallback(
    (user: OktaUser) => {
      if (!members) return;
      setAddStatus('loading');
      setAddError(null);

      addUserToGroup(group.id, group.name, user)
        .then((result) => {
          if (!result.success) {
            setAddStatus('error');
            setAddError(result.error || 'Failed to add member.');
            return;
          }
          writeBack([...members, user]);
          setAddQuery('');
          setSearchResults([]);
          setAddStatus('idle');
        })
        .catch((err: unknown) => {
          log.error('Failed to add member:', err);
          setAddStatus('error');
          setAddError(err instanceof Error ? err.message : 'Failed to add member.');
        });
    },
    [members, addUserToGroup, group.id, group.name, writeBack, setAddQuery, setSearchResults],
  );

  return {
    members,
    removeTarget,
    requestRemove,
    cancelRemove,
    confirmRemove,
    removeStatus,
    removeError,
    addQuery,
    setAddQuery,
    addResults,
    isSearchingToAdd,
    addSearchError,
    selectToAdd,
    addStatus,
    addError,
  };
}
