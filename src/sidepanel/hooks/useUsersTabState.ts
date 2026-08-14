import { useState, useCallback, useEffect, useRef } from 'react';
import type React from 'react';
import type { GroupMembership, OktaUser, UserInfo } from '../../shared/types';
import type { AlertMessageData } from '../components/shared/AlertMessage';
import { invalidate } from '../cache/entityCache';
import { cacheKeys } from '../cache/keys';
import { userDisplayName } from '../../shared/utils/userDisplay';
import { useUserContext } from './useUserContext';
import { useUserMemberships } from './useUserMemberships';
import { useUsersTabSearch } from './useUsersTabSearch';
import { useDetectedUser } from './useDetectedUser';
import { useUserLifecycleActions } from './useUserLifecycleActions';
import { useAddToGroup } from './useAddToGroup';
import { useViewStack, type ViewStack } from './useViewStack';

export interface UseUsersTabStateOptions {
  targetTabId?: number;
  selectedUserId?: string | null;
  onUserSelected?: () => void;
  isActive?: boolean;
  compareViewRef?: React.RefObject<HTMLElement | null>;
}

export interface UserCompareEntry {
  userId: string;
  userName: string;
}

export interface UseUsersTabStateReturn {
  oktaOrigin: string | null;
  selectedUser: OktaUser | null;
  memberships: GroupMembership[];
  isLoadingMemberships: boolean;
  error: string | null;
  dismissError: () => void;
  resultMessage: AlertMessageData | null;
  dismissResultMessage: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: OktaUser[];
  isSearching: boolean;
  detectedUser: UserInfo | null;
  loadDetectedUser: () => Promise<void>;
  dismissDetectedUser: () => void;
  selectUser: (user: OktaUser) => Promise<void>;
  clearSearch: () => void;
  nav: ViewStack<UserCompareEntry>;
  isCompareOpen: boolean;
  openCompare: () => void;
  closeCompare: () => void;
  refreshSelectedUserMemberships: () => void;
  lifecycle: ReturnType<typeof useUserLifecycleActions>;
  addToGroup: ReturnType<typeof useAddToGroup>;
}

const compareCrumbLabel = (): string => 'Compare users';

const compareCrumbKey = (entry: UserCompareEntry): string => `compare-${entry.userId}`;

export function useUsersTabState({
  targetTabId,
  selectedUserId,
  onUserSelected,
  isActive = true,
  compareViewRef,
}: UseUsersTabStateOptions): UseUsersTabStateReturn {
  const { userInfo, oktaOrigin } = useUserContext(isActive);
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OktaUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<AlertMessageData | null>(null);
  const [dismissedDetectedId, setDismissedDetectedId] = useState<string | null>(null);

  const nav = useViewStack<UserCompareEntry>({
    rootLabel: 'User Search',
    getLabel: compareCrumbLabel,
    getKey: compareCrumbKey,
    viewRef: compareViewRef,
  });
  const isCompareOpen = !nav.isRoot;

  const { memberships, loadMemberships, clearMemberships } = useUserMemberships({
    targetTabId,
    onError: setError,
    onLoadingChange: setIsLoadingMemberships,
  });

  const onSearchStart = useCallback(() => {
    setSelectedUser(null);
    clearMemberships();
  }, [clearMemberships]);

  const { searchQuery, setSearchQuery, searchResults, setSearchResults, isSearching } =
    useUsersTabSearch({ targetTabId, onError: setError, onSearchStart, enabled: isActive });

  const handleSelectUser = useCallback(
    async (user: OktaUser) => {
      if (!targetTabId) return;

      setSelectedUser(user);
      await loadMemberships(user);
    },
    [targetTabId, loadMemberships],
  );

  const handleUserAddedToGroup = useCallback(
    async (user: OktaUser) => {
      invalidate(cacheKeys.userMemberships(user.id));
      await handleSelectUser(user);
    },
    [handleSelectUser],
  );

  const refreshSelectedUserMemberships = useCallback(() => {
    if (!selectedUser) return;
    invalidate(cacheKeys.userMemberships(selectedUser.id));
    void loadMemberships(selectedUser, { force: true });
  }, [selectedUser, loadMemberships]);

  const onResetSearch = useCallback(() => {
    setSearchResults([]);
    setSearchQuery('');
  }, [setSearchResults, setSearchQuery]);

  const { loadDetectedUser, loadUserById } = useDetectedUser({
    targetTabId,
    detectedUserId: userInfo?.userId,
    loadMemberships,
    onSelectUser: setSelectedUser,
    onError: setError,
    onLoadingChange: setIsLoadingMemberships,
    onResetSearch,
  });

  const requestedUserRef = useRef<string | null>(null);
  const { reset: resetNav } = nav;
  useEffect(() => {
    if (!selectedUserId) {
      requestedUserRef.current = null;
      return;
    }
    if (selectedUserId === requestedUserRef.current) return;
    requestedUserRef.current = selectedUserId;
    resetNav();
    loadUserById(selectedUserId);
    onUserSelected?.();
  }, [selectedUserId, loadUserById, onUserSelected, resetNav]);

  const detectedUserId = userInfo?.userId;
  const showDetectedBanner =
    Boolean(userInfo) &&
    detectedUserId !== selectedUser?.id &&
    detectedUserId !== dismissedDetectedId &&
    !searchQuery;

  const dismissDetectedUser = useCallback(() => {
    if (!userInfo) return;
    setDismissedDetectedId(userInfo.userId);
  }, [userInfo]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    clearMemberships();
    setError(null);
    setResultMessage(null);
    resetNav();
  }, [setSearchQuery, setSearchResults, clearMemberships, resetNav]);

  const onUserStatusRefresh = useCallback((status: OktaUser['status']) => {
    setSelectedUser((prev) => (prev ? { ...prev, status } : prev));
  }, []);

  const lifecycle = useUserLifecycleActions({
    targetTabId,
    selectedUser,
    onResult: setResultMessage,
    onUserStatusRefresh,
  });

  const addToGroup = useAddToGroup({
    targetTabId,
    selectedUser,
    onResult: setResultMessage,
    onAdded: handleUserAddedToGroup,
    enabled: isActive,
  });

  const dismissError = useCallback(() => setError(null), []);
  const dismissResultMessage = useCallback(() => setResultMessage(null), []);

  const { push: pushCompare, pop: popCompare } = nav;
  const openCompare = useCallback(() => {
    if (!selectedUser) return;
    pushCompare({ userId: selectedUser.id, userName: userDisplayName(selectedUser) });
  }, [selectedUser, pushCompare]);
  const closeCompare = popCompare;

  return {
    oktaOrigin,
    selectedUser,
    memberships,
    isLoadingMemberships,
    error,
    dismissError,
    resultMessage,
    dismissResultMessage,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    detectedUser: showDetectedBanner && userInfo ? userInfo : null,
    loadDetectedUser,
    dismissDetectedUser,
    selectUser: handleSelectUser,
    clearSearch,
    nav,
    isCompareOpen,
    openCompare,
    closeCompare,
    refreshSelectedUserMemberships,
    lifecycle,
    addToGroup,
  };
}
