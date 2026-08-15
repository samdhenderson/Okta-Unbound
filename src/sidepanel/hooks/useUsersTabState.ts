import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type React from 'react';
import type { GroupMembership, OktaUser, UserInfo } from '../../shared/types';
import type { AlertMessageData } from '../components/shared/AlertMessage';
import { invalidate } from '../cache/entityCache';
import { useOktaApi } from './useOktaApi';
import type { MemberRuleAttribution } from '../../shared/membership/memberRuleAttribution';
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

export type UsersViewEntry =
  | {
      kind: 'detail';
      userId: string;
      userName: string;
    }
  | {
      kind: 'compare';
      userId: string;
      userName: string;
    };

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
  nav: ViewStack<UsersViewEntry>;
  isDetailOpen: boolean;
  isCompareOpen: boolean;
  proveMembershipSource?: (groupId: string) => Promise<MemberRuleAttribution>;
  openCompare: () => void;
  closeCompare: () => void;
  refreshSelectedUserMemberships: () => void;
  lifecycle: ReturnType<typeof useUserLifecycleActions>;
  addToGroup: ReturnType<typeof useAddToGroup>;
  confirmAddToGroup: () => Promise<void>;
  recentlyAddedGroupId: string | null;
}

const viewCrumbLabel = (entry: UsersViewEntry): string =>
  entry.kind === 'compare' ? 'Compare users' : entry.userName;

const viewCrumbKey = (entry: UsersViewEntry): string => `${entry.kind}-${entry.userId}`;

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
  const [recentlyAddedGroupId, setRecentlyAddedGroupId] = useState<string | null>(null);
  const pendingAddGroupIdRef = useRef<string | null>(null);

  const nav = useViewStack<UsersViewEntry>({
    rootLabel: 'User Search',
    getLabel: viewCrumbLabel,
    getKey: viewCrumbKey,
    viewRef: compareViewRef,
  });
  const currentView = nav.currentEntry?.kind ?? 'search';
  const isDetailOpen = currentView === 'detail';
  const isCompareOpen = currentView === 'compare';

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

  const detailUserIdRef = useRef<string | null>(null);
  const { push: pushView } = nav;
  const showUserDetail = useCallback(
    (user: OktaUser) => {
      if (detailUserIdRef.current === user.id) return;
      detailUserIdRef.current = user.id;
      pushView({ kind: 'detail', userId: user.id, userName: userDisplayName(user) });
    },
    [pushView],
  );

  useEffect(() => {
    if (nav.isRoot) detailUserIdRef.current = null;
  }, [nav.isRoot]);

  const handleSelectUser = useCallback(
    async (user: OktaUser) => {
      if (!targetTabId) return;

      setRecentlyAddedGroupId(null);
      setSelectedUser(user);
      showUserDetail(user);
      await loadMemberships(user);
    },
    [targetTabId, loadMemberships, showUserDetail],
  );

  const handleUserAddedToGroup = useCallback(
    async (user: OktaUser) => {
      invalidate(cacheKeys.userMemberships(user.id));
      await handleSelectUser(user);
      setRecentlyAddedGroupId(pendingAddGroupIdRef.current);
    },
    [handleSelectUser],
  );

  useEffect(() => {
    if (!recentlyAddedGroupId) return;
    const AFFIRM_FLASH_MS = 500;
    const timer = window.setTimeout(() => setRecentlyAddedGroupId(null), AFFIRM_FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [recentlyAddedGroupId]);

  const refreshSelectedUserMemberships = useCallback(() => {
    if (!selectedUser) return;
    invalidate(cacheKeys.userMemberships(selectedUser.id));
    void loadMemberships(selectedUser, { force: true });
  }, [selectedUser, loadMemberships]);

  const onResetSearch = useCallback(() => {
    setSearchResults([]);
    setSearchQuery('');
  }, [setSearchResults, setSearchQuery]);

  const onDetectedUserSelected = useCallback(
    (user: OktaUser | null) => {
      setSelectedUser(user);
      if (user) showUserDetail(user);
    },
    [showUserDetail],
  );

  const { loadDetectedUser, loadUserById } = useDetectedUser({
    targetTabId,
    detectedUserId: userInfo?.userId,
    loadMemberships,
    onSelectUser: onDetectedUserSelected,
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
    setRecentlyAddedGroupId(null);
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

  const { selectedGroup, confirmAddToGroup: confirmAddToGroupInner } = addToGroup;
  const confirmAddToGroup = useCallback(() => {
    pendingAddGroupIdRef.current = selectedGroup?.id ?? null;
    return confirmAddToGroupInner();
  }, [selectedGroup, confirmAddToGroupInner]);

  const dismissError = useCallback(() => setError(null), []);
  const dismissResultMessage = useCallback(() => setResultMessage(null), []);

  const { getMembershipRuleProof } = useOktaApi({ targetTabId: targetTabId ?? null });
  const proveMembershipSource = useMemo(
    () =>
      selectedUser && targetTabId
        ? (groupId: string) => getMembershipRuleProof(groupId, selectedUser.id)
        : undefined,
    [selectedUser, targetTabId, getMembershipRuleProof],
  );

  const { pop: popCompare } = nav;
  const openCompare = useCallback(() => {
    if (!selectedUser) return;
    pushView({ kind: 'compare', userId: selectedUser.id, userName: userDisplayName(selectedUser) });
  }, [selectedUser, pushView]);
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
    isDetailOpen,
    isCompareOpen,
    proveMembershipSource,
    openCompare,
    closeCompare,
    refreshSelectedUserMemberships,
    lifecycle,
    addToGroup,
    confirmAddToGroup,
    recentlyAddedGroupId,
  };
}
