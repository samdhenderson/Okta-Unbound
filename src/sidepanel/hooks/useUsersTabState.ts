import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type React from 'react';
import type { GroupMembership, OktaUser } from '../../shared/types';
import type { AlertAction, AlertMessageData } from '../components/shared/AlertMessage';
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
import { useUserDetailPanes, type UseUserDetailPanesReturn } from './useUserDetailPanes';
import { useUsersTabProfileEdit, type UserProfileEditing } from './useUsersTabProfileEdit';

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
  resultAction: AlertAction | null;
  dismissResultMessage: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: OktaUser[];
  isSearching: boolean;
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
  panes: UseUserDetailPanesReturn;
  profileEdit: UserProfileEditing;
  applySelectedUserUpdate: (user: OktaUser) => void;
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
  const { oktaOrigin } = useUserContext(isActive);
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OktaUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<AlertMessageData | null>(null);
  const [resultAction, setResultAction] = useState<AlertAction | null>(null);
  const publishResult = useCallback((message: AlertMessageData, action?: AlertAction) => {
    setResultMessage(message);
    setResultAction(action ?? null);
  }, []);
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

  const { memberships, rules, loadMemberships, clearMemberships } = useUserMemberships({
    targetTabId,
    oktaOrigin,
    onError: setError,
    onLoadingChange: setIsLoadingMemberships,
  });

  const onSearchStart = useCallback(() => {
    setSelectedUser(null);
    clearMemberships();
  }, [clearMemberships]);

  const { searchQuery, setSearchQuery, searchResults, setSearchResults, isSearching } =
    useUsersTabSearch({
      targetTabId,
      onError: setError,
      onSearchStart,
      enabled: isActive && nav.isRoot,
    });

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

  const refreshMembershipsFor = useCallback(
    (user: OktaUser) => {
      invalidate(cacheKeys.userMemberships(user.id));
      void loadMemberships(user, { force: true });
    },
    [loadMemberships],
  );

  const refreshSelectedUserMemberships = useCallback(() => {
    if (!selectedUser) return;
    refreshMembershipsFor(selectedUser);
  }, [selectedUser, refreshMembershipsFor]);

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

  const { loadUserById } = useDetectedUser({
    targetTabId,
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

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setRecentlyAddedGroupId(null);
    clearMemberships();
    setError(null);
    setResultMessage(null);
    setResultAction(null);
    resetNav();
  }, [setSearchQuery, setSearchResults, clearMemberships, resetNav]);

  const onUserStatusRefresh = useCallback((status: OktaUser['status']) => {
    setSelectedUser((prev) => (prev ? { ...prev, status } : prev));
  }, []);

  const lifecycle = useUserLifecycleActions({
    targetTabId,
    selectedUser,
    onResult: publishResult,
    onUserStatusRefresh,
  });

  const addToGroup = useAddToGroup({
    targetTabId,
    selectedUser,
    onResult: publishResult,
    onAdded: handleUserAddedToGroup,
    enabled: isActive,
  });

  const { selectedGroup, confirmAddToGroup: confirmAddToGroupInner } = addToGroup;
  const confirmAddToGroup = useCallback(() => {
    pendingAddGroupIdRef.current = selectedGroup?.id ?? null;
    return confirmAddToGroupInner();
  }, [selectedGroup, confirmAddToGroupInner]);

  const dismissError = useCallback(() => setError(null), []);
  const dismissResultMessage = useCallback(() => {
    setResultMessage(null);
    setResultAction(null);
  }, []);

  const { getMembershipRuleProof } = useOktaApi({ targetTabId: targetTabId ?? null });
  const proveMembershipSource = useMemo(
    () =>
      selectedUser && targetTabId
        ? (groupId: string) => getMembershipRuleProof(groupId, selectedUser.id)
        : undefined,
    [selectedUser, targetTabId, getMembershipRuleProof],
  );

  const panes = useUserDetailPanes({
    user: selectedUser,
    targetTabId,
    oktaOrigin,
    memberships,
    rules,
    enabled: isActive,
  });

  const profileEdit = useUsersTabProfileEdit({
    user: selectedUser,
    attributes: panes.attributes,
    memberships,
    rules,
    oktaOrigin,
    mastering: panes.mastering,
    targetTabId,
    enabled: isActive && panes.pane === 'profile',
    onUserUpdated: setSelectedUser,
    onMembershipsChanged: refreshMembershipsFor,
    onResult: publishResult,
  });

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
    resultAction,
    dismissResultMessage,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
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
    panes,
    profileEdit,
    applySelectedUserUpdate: setSelectedUser,
    confirmAddToGroup,
    recentlyAddedGroupId,
  };
}
