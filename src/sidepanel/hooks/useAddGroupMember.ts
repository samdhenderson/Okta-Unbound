import { useCallback, useMemo, useState } from 'react';
import type { GroupSummary, OktaUser } from '../../shared/types';
import { useOktaApi } from './useOktaApi';
import { useDebouncedUserSearch } from './useDebouncedUserSearch';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useAddGroupMember');

export interface UseAddGroupMemberOptions {
  targetTabId: number | null;
  group: GroupSummary;
  members: OktaUser[] | null;
  onResult: (result: { text: string; type: 'danger' }) => void;
  onAdded: (user: OktaUser) => Promise<void> | void;
  enabled?: boolean;
}

export interface UseAddGroupMemberReturn {
  isOpen: boolean;
  addQuery: string;
  setAddQuery: (query: string) => void;
  addResults: OktaUser[];
  isSearchingToAdd: boolean;
  addSearchError: string | null;
  selectedUser: OktaUser | null;
  selectUser: (user: OktaUser) => void;
  clearSelectedUser: () => void;
  isAddingMember: boolean;
  openModal: () => void;
  closeModal: () => void;
  confirmAddMember: () => Promise<void>;
  addMemberDirect: (user: OktaUser) => Promise<void>;
}

export function useAddGroupMember({
  targetTabId,
  group,
  members,
  onResult,
  onAdded,
  enabled = true,
}: UseAddGroupMemberOptions): UseAddGroupMemberReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OktaUser | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  const { addUserToGroup } = useOktaApi({ targetTabId });

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
    enabled,
  });

  const memberIds = useMemo(() => new Set((members ?? []).map((m) => m.id)), [members]);
  const addResults = useMemo(
    () => searchResults.filter((u) => !memberIds.has(u.id)),
    [searchResults, memberIds],
  );

  const addMemberDirect = useCallback(
    async (user: OktaUser) => {
      setIsAddingMember(true);
      try {
        const result = await addUserToGroup(group.id, group.name, user);
        if (!result.success) {
          onResult({ text: result.error || 'Failed to add member.', type: 'danger' });
          return;
        }
        setAddQuery('');
        setSearchResults([]);
        await onAdded(user);
      } catch (err: unknown) {
        log.error('Failed to add member:', err);
        const message = err instanceof Error ? err.message : 'Failed to add member.';
        onResult({ text: message, type: 'danger' });
      } finally {
        setIsAddingMember(false);
      }
    },
    [addUserToGroup, group.id, group.name, onAdded, onResult, setAddQuery, setSearchResults],
  );

  const openModal = useCallback(() => {
    setAddQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setIsOpen(true);
  }, [setAddQuery, setSearchResults]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setAddQuery('');
    setSearchResults([]);
    setSelectedUser(null);
  }, [setAddQuery, setSearchResults]);

  const selectUser = useCallback(
    (user: OktaUser) => {
      setSelectedUser(user);
      setAddQuery('');
      setSearchResults([]);
    },
    [setAddQuery, setSearchResults],
  );

  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
    setAddQuery('');
  }, [setAddQuery]);

  const confirmAddMember = useCallback(async () => {
    if (!selectedUser) return;
    await addMemberDirect(selectedUser);
    closeModal();
  }, [selectedUser, addMemberDirect, closeModal]);

  return {
    isOpen,
    addQuery,
    setAddQuery,
    addResults,
    isSearchingToAdd,
    addSearchError,
    selectedUser,
    selectUser,
    clearSelectedUser,
    isAddingMember,
    openModal,
    closeModal,
    confirmAddMember,
    addMemberDirect,
  };
}
