import React, { useRef } from 'react';
import PageHeader from './shared/PageHeader';
import Breadcrumbs from './shared/Breadcrumbs';
import AlertMessage from './shared/AlertMessage';
import { AddToGroupModal, UserComparisonPanel, UserDetailPanel, UserSearchPanel } from './users';
import { useUsersTabState } from '../hooks/useUsersTabState';
import { userDisplayName } from '../../shared/utils/userDisplay';

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
  const compareViewRef = useRef<HTMLDivElement>(null);
  const state = useUsersTabState({
    targetTabId,
    selectedUserId,
    onUserSelected,
    isActive,
    compareViewRef,
  });
  const { selectedUser, memberships, lifecycle, addToGroup, nav, isCompareOpen } = state;

  const compareEntry = nav.currentEntry;
  const compareName =
    compareEntry && selectedUser?.id === compareEntry.userId
      ? userDisplayName(selectedUser)
      : compareEntry?.userName;

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title={isCompareOpen ? 'Compare users' : 'User Search'}
        subtitle={
          isCompareOpen
            ? `${compareName} vs. another user`
            : 'Search users and analyze their group memberships'
        }
        onBack={isCompareOpen ? nav.pop : undefined}
        backLabel="Back to user"
        breadcrumbs={isCompareOpen ? <Breadcrumbs items={nav.trail} /> : undefined}
        badge={
          selectedUser ? { text: `${memberships.length} Groups`, variant: 'primary' } : undefined
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className={isCompareOpen ? 'hidden' : 'space-y-6'}>
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
                    className="animate-in slide-in-from-top-2 duration-300"
                  />
                )}

                {state.resultMessage && (
                  <AlertMessage
                    message={state.resultMessage}
                    onDismiss={state.dismissResultMessage}
                    className="animate-in slide-in-from-top-2 duration-300"
                  />
                )}
              </>
            }
          />

          {selectedUser && (
            <UserDetailPanel
              user={selectedUser}
              oktaOrigin={state.oktaOrigin}
              memberships={memberships}
              isLoadingMemberships={state.isLoadingMemberships}
              currentGroupId={currentGroupId}
              onNavigateToRule={onNavigateToRule}
              isLifecycleLoading={lifecycle.isLifecycleLoading}
              pendingLifecycleAction={lifecycle.pendingLifecycleAction}
              onRequestLifecycleAction={lifecycle.setPendingLifecycleAction}
              onCancelLifecycleAction={() => lifecycle.setPendingLifecycleAction(null)}
              onConfirmLifecycleAction={lifecycle.confirmLifecycleAction}
              onCompare={state.openCompare}
              onAddToGroup={addToGroup.openModal}
            />
          )}
        </div>

        {selectedUser && targetTabId != null && (
          <div
            ref={compareViewRef}
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
        onConfirm={addToGroup.confirmAddToGroup}
      />
    </div>
  );
};

export default UsersTab;
