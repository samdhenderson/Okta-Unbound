import React, { useState, useCallback, useEffect, useRef } from 'react';
import PageHeader from './shared/PageHeader';
import AlertMessage from './shared/AlertMessage';
import Button from './shared/Button';
import EmptyState from './shared/EmptyState';
import {
  AddToGroupModal,
  DetectedUserBanner,
  GroupMembershipsList,
  UserComparisonModal,
  UserLifecycleActions,
  UserProfileCard,
  UserSearchBar,
  UserSearchResults,
} from './users';
import type { OktaUser } from '../../shared/types';
import type { AlertMessageData } from './shared/AlertMessage';
import { useUserContext } from '../hooks/useUserContext';
import { useUserMemberships } from '../hooks/useUserMemberships';
import { invalidate } from '../cache/entityCache';
import { useUsersTabSearch } from '../hooks/useUsersTabSearch';
import { useDetectedUser } from '../hooks/useDetectedUser';
import { useUserLifecycleActions } from '../hooks/useUserLifecycleActions';
import { useAddToGroup } from '../hooks/useAddToGroup';

interface UsersTabProps {
  targetTabId?: number;
  currentGroupId?: string;
  onNavigateToRule?: (ruleId: string) => void;
  selectedUserId?: string | null;
  onUserSelected?: () => void;
  isActive?: boolean;
}

const UsersTab: React.FC<UsersTabProps> = ({
  targetTabId,
  currentGroupId,
  onNavigateToRule,
  selectedUserId,
  onUserSelected,
  isActive = true,
}) => {
  const { userInfo, oktaOrigin } = useUserContext(isActive);
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OktaUser | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<AlertMessageData | null>(null);
  const [dismissedDetectedId, setDismissedDetectedId] = useState<string | null>(null);

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
      invalidate(['userMemberships', user.id]);
      await handleSelectUser(user);
    },
    [handleSelectUser],
  );

  const refreshSelectedUserMemberships = useCallback(() => {
    if (!selectedUser) return;
    invalidate(['userMemberships', selectedUser.id]);
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
  useEffect(() => {
    if (!selectedUserId) {
      requestedUserRef.current = null;
      return;
    }
    if (selectedUserId === requestedUserRef.current) return;
    requestedUserRef.current = selectedUserId;
    loadUserById(selectedUserId);
    onUserSelected?.();
  }, [selectedUserId, loadUserById, onUserSelected]);

  const detectedUserId = userInfo?.userId;
  const showDetectedBanner =
    Boolean(userInfo) &&
    detectedUserId !== selectedUser?.id &&
    detectedUserId !== dismissedDetectedId &&
    !searchQuery;

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    clearMemberships();
    setError(null);
    setResultMessage(null);
  };

  const onUserStatusRefresh = useCallback((status: OktaUser['status']) => {
    setSelectedUser((prev) => (prev ? { ...prev, status } : prev));
  }, []);

  const {
    pendingLifecycleAction,
    setPendingLifecycleAction,
    isLifecycleLoading,
    confirmLifecycleAction,
  } = useUserLifecycleActions({
    targetTabId,
    selectedUser,
    onResult: setResultMessage,
    onUserStatusRefresh,
  });

  const {
    isOpen: isAddToGroupModalOpen,
    groupSearchQuery,
    setGroupSearchQuery,
    groupSearchResults,
    isSearchingGroups,
    showGroupDropdown,
    selectedGroup,
    selectGroup,
    clearSelectedGroup,
    isAddingToGroup,
    openModal: handleOpenAddToGroupModal,
    closeModal: handleCloseAddToGroupModal,
    confirmAddToGroup: handleConfirmAddToGroup,
  } = useAddToGroup({
    targetTabId,
    selectedUser,
    onResult: setResultMessage,
    onAdded: handleUserAddedToGroup,
    enabled: isActive,
  });

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title="User Search"
        subtitle="Search users and analyze their group memberships"
        badge={
          selectedUser ? { text: `${memberships.length} Groups`, variant: 'primary' } : undefined
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="space-y-3">
          <UserSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={handleClearSearch}
            isSearching={isSearching}
            showClearButton={Boolean(searchQuery || selectedUser)}
          />

          {showDetectedBanner && userInfo && (
            <DetectedUserBanner
              userInfo={userInfo}
              isLoading={isLoadingMemberships}
              onLoad={loadDetectedUser}
              onDismiss={() => setDismissedDetectedId(userInfo.userId)}
            />
          )}
        </div>

        {error && (
          <AlertMessage
            message={{ text: error, type: 'danger' }}
            onDismiss={() => setError(null)}
            className="animate-in slide-in-from-top-2 duration-300"
          />
        )}

        {resultMessage && (
          <AlertMessage
            message={resultMessage}
            onDismiss={() => setResultMessage(null)}
            className="animate-in slide-in-from-top-2 duration-300"
          />
        )}

        {!selectedUser && (
          <UserSearchResults results={searchResults} onSelectUser={handleSelectUser} />
        )}

        {selectedUser && (
          <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
            <UserProfileCard
              user={selectedUser}
              oktaOrigin={oktaOrigin}
              afterCard={
                <UserLifecycleActions
                  user={selectedUser}
                  isLifecycleLoading={isLifecycleLoading}
                  pendingLifecycleAction={pendingLifecycleAction}
                  onRequestAction={setPendingLifecycleAction}
                  onCancel={() => setPendingLifecycleAction(null)}
                  onConfirm={confirmLifecycleAction}
                />
              }
            />

            <GroupMembershipsList
              memberships={memberships}
              isLoading={isLoadingMemberships}
              currentGroupId={currentGroupId}
              oktaOrigin={oktaOrigin}
              onNavigateToRule={onNavigateToRule}
              actions={
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="users"
                    onClick={() => setIsCompareOpen(true)}
                    disabled={isLoadingMemberships}
                    title="Compare group & app access with another user"
                  >
                    Compare
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleOpenAddToGroupModal}
                    disabled={isLoadingMemberships}
                  >
                    Add to Group
                  </Button>
                </>
              }
            />
          </div>
        )}

        {!isSearching && searchResults.length === 0 && !error && !selectedUser && !searchQuery && (
          <EmptyState
            icon="user"
            title="User Membership Tracing"
            description="Search for users to analyze their group memberships and understand why they're in specific groups"
          />
        )}
      </div>

      {selectedUser && targetTabId != null && (
        <UserComparisonModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          contextUser={selectedUser}
          contextGroups={memberships}
          targetTabId={targetTabId}
          onGroupsChanged={refreshSelectedUserMemberships}
        />
      )}

      <AddToGroupModal
        isOpen={isAddToGroupModalOpen}
        userFirstName={selectedUser?.profile?.firstName}
        groupSearchQuery={groupSearchQuery}
        onGroupSearchQueryChange={setGroupSearchQuery}
        groupSearchResults={groupSearchResults}
        isSearchingGroups={isSearchingGroups}
        showGroupDropdown={showGroupDropdown}
        selectedGroup={selectedGroup}
        onSelectGroup={selectGroup}
        onClearSelectedGroup={clearSelectedGroup}
        isAddingToGroup={isAddingToGroup}
        onClose={handleCloseAddToGroupModal}
        onConfirm={handleConfirmAddToGroup}
      />
    </div>
  );
};

export default UsersTab;
