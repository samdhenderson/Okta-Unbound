import React, { useRef } from 'react';
import PageHeader from './shared/PageHeader';
import Breadcrumbs from './shared/Breadcrumbs';
import AlertMessage from './shared/AlertMessage';
import { ActionBar, Button, EntityIdentity, OpenInOktaLink } from './shared';
import { AddToGroupModal, UserComparisonPanel, UserDetailPanel, UserSearchPanel } from './users';
import { userIdentity } from './users/userIdentity';
import { useUsersTabState } from '../hooks/useUsersTabState';
import { userDisplayName } from '../../shared/utils/userDisplay';

interface UsersTabProps {
  targetTabId?: number;
  currentGroupId?: string;
  selectedUserId?: string | null;
  onUserSelected?: () => void;
  isActive?: boolean;
}

const UsersTab: React.FC<UsersTabProps> = ({
  targetTabId,
  currentGroupId,
  selectedUserId,
  onUserSelected,
  isActive = true,
}) => {
  const compareViewRef = useRef<HTMLDivElement>(null);
  const state = useUsersTabState({
    targetTabId,
    selectedUserId,
    onUserSelected,
    isActive,
    compareViewRef,
  });
  const {
    selectedUser,
    memberships,
    isLoadingMemberships,
    lifecycle,
    addToGroup,
    nav,
    isDetailOpen,
    isCompareOpen,
  } = state;

  const currentEntry = nav.currentEntry;
  const currentName =
    currentEntry && selectedUser?.id === currentEntry.userId
      ? userDisplayName(selectedUser)
      : currentEntry?.userName;

  const detailUser =
    isDetailOpen && !isCompareOpen && currentEntry && selectedUser?.id === currentEntry.userId
      ? selectedUser
      : undefined;
  const identity = detailUser
    ? userIdentity(detailUser, {
        groupCount: isLoadingMemberships ? undefined : memberships.length,
      })
    : undefined;

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title={
          isCompareOpen ? 'Compare users' : isDetailOpen ? (currentName ?? 'User') : 'User Search'
        }
        subtitle={
          isCompareOpen
            ? `${currentName} vs. another user`
            : isDetailOpen
              ? undefined
              : 'Search users and analyze their group memberships'
        }
        onBack={nav.isRoot ? undefined : nav.pop}
        backLabel={isCompareOpen ? 'Back to user' : 'Back to search'}
        breadcrumbs={nav.isRoot ? undefined : <Breadcrumbs items={nav.trail} />}
        sticky={isActive}
        identityKey={identity?.key}
        identity={identity ? <EntityIdentity rows={identity.rows} /> : undefined}
        badge={
          identity
            ? identity.badge
            : selectedUser
              ? { text: `${memberships.length} Groups`, variant: 'primary' }
              : undefined
        }
        actions={
          identity?.link && (
            <OpenInOktaLink
              oktaOrigin={state.oktaOrigin}
              entityType={identity.link.entityType}
              entityId={identity.link.entityId}
            />
          )
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className={nav.isRoot ? 'space-y-6' : 'hidden'}>
          <UserSearchPanel
            searchQuery={state.searchQuery}
            onSearchQueryChange={state.setSearchQuery}
            onClearSearch={state.clearSearch}
            isSearching={state.isSearching}
            searchResults={state.searchResults}
            onSelectUser={state.selectUser}
            detectedUser={state.detectedUser}
            isDetectedUserLoading={state.isLoadingMemberships}
            onLoadDetectedUser={state.loadDetectedUser}
            onDismissDetectedUser={state.dismissDetectedUser}
            hasSelectedUser={Boolean(selectedUser)}
            hasError={Boolean(state.error)}
            alerts={
              <>
                {state.error && (
                  <AlertMessage
                    message={{ text: state.error, type: 'danger' }}
                    onDismiss={state.dismissError}
                    className="animate-rise-in"
                  />
                )}

                {state.resultMessage && (
                  <AlertMessage
                    message={state.resultMessage}
                    onDismiss={state.dismissResultMessage}
                    className="animate-rise-in"
                  />
                )}
              </>
            }
          />
        </div>

        {selectedUser && (
          <>
            <div
              ref={isDetailOpen ? compareViewRef : undefined}
              tabIndex={-1}
              data-testid="user-detail-view"
              className={isDetailOpen ? 'space-y-6 focus:outline-none' : 'hidden'}
            >
              <ActionBar ariaLabel={`Actions for ${userDisplayName(selectedUser)}`}>
                <Button
                  variant="primary"
                  size="sm"
                  icon="users"
                  onClick={state.openCompare}
                  disabled={state.isLoadingMemberships}
                  title="Compare group & app access with another user"
                >
                  Compare
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="plus"
                  onClick={addToGroup.openModal}
                  disabled={state.isLoadingMemberships}
                >
                  Add to Group
                </Button>
              </ActionBar>

              <UserDetailPanel
                user={selectedUser}
                oktaOrigin={state.oktaOrigin}
                memberships={memberships}
                isLoadingMemberships={state.isLoadingMemberships}
                currentGroupId={currentGroupId}
                recentlyAddedGroupId={state.recentlyAddedGroupId}
                isLifecycleLoading={lifecycle.isLifecycleLoading}
                pendingLifecycleAction={lifecycle.pendingLifecycleAction}
                onRequestLifecycleAction={lifecycle.setPendingLifecycleAction}
                onCancelLifecycleAction={() => lifecycle.setPendingLifecycleAction(null)}
                onConfirmLifecycleAction={lifecycle.confirmLifecycleAction}
                onProveMembershipSource={state.proveMembershipSource}
              />
            </div>

            {targetTabId != null && (
              <div
                ref={isCompareOpen ? compareViewRef : undefined}
                tabIndex={-1}
                data-testid="user-comparison-view"
                className={isCompareOpen ? 'space-y-6 focus:outline-none' : 'hidden'}
              >
                <UserComparisonPanel
                  oktaOrigin={state.oktaOrigin}
                  isActive={isCompareOpen}
                  searchEnabled={isCompareOpen && isActive}
                  contextUser={selectedUser}
                  contextGroups={memberships}
                  targetTabId={targetTabId}
                  onGroupsChanged={state.refreshSelectedUserMemberships}
                />
              </div>
            )}
          </>
        )}
      </div>

      <AddToGroupModal
        isOpen={addToGroup.isOpen}
        userFirstName={selectedUser?.profile?.firstName}
        groupSearchQuery={addToGroup.groupSearchQuery}
        onGroupSearchQueryChange={addToGroup.setGroupSearchQuery}
        groupSearchResults={addToGroup.groupSearchResults}
        isSearchingGroups={addToGroup.isSearchingGroups}
        showGroupDropdown={addToGroup.showGroupDropdown}
        selectedGroup={addToGroup.selectedGroup}
        onSelectGroup={addToGroup.selectGroup}
        onClearSelectedGroup={addToGroup.clearSelectedGroup}
        isAddingToGroup={addToGroup.isAddingToGroup}
        onClose={addToGroup.closeModal}
        onConfirm={state.confirmAddToGroup}
      />
    </div>
  );
};

export default UsersTab;
