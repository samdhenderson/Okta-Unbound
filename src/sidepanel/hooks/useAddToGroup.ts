import { useState, useEffect, useCallback, useRef } from 'react';
import type { OktaUser } from '../../shared/types';
import { useOktaApi } from './useOktaApi';

export interface GroupSearchResult {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface UseAddToGroupOptions {
  targetTabId: number | undefined;
  selectedUser: OktaUser | null;
  onResult: (result: { text: string; type: 'danger' }) => void;
  onAdded: (user: OktaUser) => Promise<void> | void;
}

interface UseAddToGroupReturn {
  isOpen: boolean;
  groupSearchQuery: string;
  setGroupSearchQuery: (query: string) => void;
  groupSearchResults: GroupSearchResult[];
  isSearchingGroups: boolean;
  showGroupDropdown: boolean;
  selectedGroup: GroupSearchResult | null;
  selectGroup: (group: GroupSearchResult) => void;
  clearSelectedGroup: () => void;
  isAddingToGroup: boolean;
  openModal: () => void;
  closeModal: () => void;
  confirmAddToGroup: () => Promise<void>;
}

export function useAddToGroup({
  targetTabId,
  selectedUser,
  onResult,
  onAdded,
}: UseAddToGroupOptions): UseAddToGroupReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupSearchResults, setGroupSearchResults] = useState<GroupSearchResult[]>([]);
  const [isSearchingGroups, setIsSearchingGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupSearchResult | null>(null);
  const [isAddingToGroup, setIsAddingToGroup] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const groupDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { searchGroups, addUserToGroup } = useOktaApi({
    targetTabId: targetTabId ?? null,
  });

  useEffect(() => {
    if (groupDebounceTimerRef.current) {
      clearTimeout(groupDebounceTimerRef.current);
    }

    if (groupSearchQuery.trim().length < 2) {
      setGroupSearchResults([]);
      setShowGroupDropdown(false);
      return;
    }

    groupDebounceTimerRef.current = setTimeout(async () => {
      setIsSearchingGroups(true);
      try {
        const results = await searchGroups(groupSearchQuery.trim());
        setGroupSearchResults(results);
        setShowGroupDropdown(results.length > 0);
      } catch {
        setGroupSearchResults([]);
        setShowGroupDropdown(false);
      } finally {
        setIsSearchingGroups(false);
      }
    }, 300);

    return () => {
      if (groupDebounceTimerRef.current) {
        clearTimeout(groupDebounceTimerRef.current);
      }
    };
  }, [groupSearchQuery, searchGroups]);

  const openModal = useCallback(() => {
    setGroupSearchQuery('');
    setGroupSearchResults([]);
    setSelectedGroup(null);
    setShowGroupDropdown(false);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setGroupSearchQuery('');
    setGroupSearchResults([]);
    setSelectedGroup(null);
    setShowGroupDropdown(false);
  }, []);

  const selectGroup = useCallback((group: GroupSearchResult) => {
    setSelectedGroup(group);
    setShowGroupDropdown(false);
    setGroupSearchQuery('');
  }, []);

  const clearSelectedGroup = useCallback(() => {
    setSelectedGroup(null);
    setGroupSearchQuery('');
  }, []);

  const confirmAddToGroup = useCallback(async () => {
    if (!selectedUser || !selectedGroup) return;

    setIsAddingToGroup(true);
    try {
      const result = await addUserToGroup(selectedGroup.id, selectedGroup.name, {
        id: selectedUser.id,
        profile: {
          login: selectedUser.profile.login,
          firstName: selectedUser.profile.firstName,
          lastName: selectedUser.profile.lastName,
          email: selectedUser.profile.email,
        },
      });

      if (result.success) {
        closeModal();
        await onAdded(selectedUser);
      } else {
        onResult({
          text: result.error || 'Failed to add user to group. Please try again.',
          type: 'danger',
        });
        closeModal();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      onResult({ text: message, type: 'danger' });
      closeModal();
    } finally {
      setIsAddingToGroup(false);
    }
  }, [selectedUser, selectedGroup, addUserToGroup, closeModal, onAdded, onResult]);

  return {
    isOpen,
    groupSearchQuery,
    setGroupSearchQuery,
    groupSearchResults,
    isSearchingGroups,
    showGroupDropdown,
    selectedGroup,
    selectGroup,
    clearSelectedGroup,
    isAddingToGroup,
    openModal,
    closeModal,
    confirmAddToGroup,
  };
}
