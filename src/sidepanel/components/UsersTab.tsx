import React, { useRef, useState } from 'react';
import AlertMessage from './shared/AlertMessage';
import {
  AddToGroupModal,
  UserActionBar,
  UserComparisonPanel,
  UserDetailPanel,
  UserRungHeader,
  UserSearchPanel,
} from './users';
import { useUsersTabState } from '../hooks/useUsersTabState';

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
    panes,
    isDetailOpen,
    isCompareOpen,
  } = state;

  const [manageOpen, setManageOpen] = useState(false);
  const [manageRung, setManageRung] = useState(isDetailOpen);
  if (manageRung !== isDetailOpen) {
    setManageRung(isDetailOpen);
    setManageOpen(false);
  }

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <UserRungHeader
        nav={nav}
        isDetailOpen={isDetailOpen}
        isCompareOpen={isCompareOpen}
        selectedUser={selectedUser}
        membershipCount={memberships.length}
        isLoadingMemberships={isLoadingMemberships}
        appCount={panes.appCount}
        oktaOrigin={state.oktaOrigin}
        isActive={isActive}
      />

      <div className="max-w-7xl mx-auto px-(--sp-gutter) py-(--sp-gutter) space-y-(--sp-rung)">
        {state.resultMessage && (
          <AlertMessage
            message={state.resultMessage}
            onDismiss={state.dismissResultMessage}
            {...(state.resultAction ? { action: state.resultAction } : {})}
            className="animate-rise-in"
          />
        )}

        <div className={nav.isRoot ? 'space-y-(--sp-rung)' : 'hidden'}>
          <UserSearchPanel
            searchQuery={state.searchQuery}
            onSearchQueryChange={state.setSearchQuery}
            onClearSearch={state.clearSearch}
            isSearching={state.isSearching}
            searchResults={state.searchResults}
            onSelectUser={state.selectUser}
            hasSelectedUser={Boolean(selectedUser)}
            hasError={Boolean(state.error)}
            alerts={
              state.error ? (
                <AlertMessage
                  message={{ text: state.error, type: 'danger' }}
                  onDismiss={state.dismissError}
                  className="animate-rise-in"
                />
              ) : undefined
            }
          />
        </div>

        {selectedUser && (
          <>
            <div
              ref={isDetailOpen ? compareViewRef : undefined}
              tabIndex={-1}
              data-testid="user-detail-view"
              className={isDetailOpen ? 'space-y-(--sp-rung) focus:outline-none' : 'hidden'}
            >
              <UserActionBar
                user={selectedUser}
                onCompare={state.openCompare}
                onAddToGroup={addToGroup.openModal}
                isLoadingMemberships={state.isLoadingMemberships}
                tierOpen={manageOpen}
                onTierOpenChange={setManageOpen}
                isLifecycleLoading={lifecycle.isLifecycleLoading}
                pendingLifecycleAction={lifecycle.pendingLifecycleAction}
                onRequestLifecycleAction={lifecycle.setPendingLifecycleAction}
                onCancelLifecycleAction={() => lifecycle.setPendingLifecycleAction(null)}
                onConfirmLifecycleAction={lifecycle.confirmLifecycleAction}
              />

              <UserDetailPanel
                user={selectedUser}
                targetTabId={targetTabId}
                oktaOrigin={state.oktaOrigin}
                pane={panes.pane}
                onPaneChange={panes.setPane}
                memberships={memberships}
                isLoadingMemberships={state.isLoadingMemberships}
                currentGroupId={currentGroupId}
                recentlyAddedGroupId={state.recentlyAddedGroupId}
                onProveMembershipSource={state.proveMembershipSource}
                apps={panes.apps}
                isLoadingApps={panes.isLoadingApps}
                appsComplete={panes.appsComplete}
                appsByGroupId={panes.appsByGroupId}
                appCount={panes.appCount}
                attributes={panes.attributes}
                isLoadingProfile={panes.isLoadingProfile}
                profileConfig={panes.profileConfig}
                onProfileConfigChange={panes.updateProfileConfig}
                onProfileConfigReset={panes.resetProfileConfig}
                ruleReads={panes.ruleReads}
                profileEdit={state.profileEdit}
              />
            </div>

            {targetTabId != null && (
              <div
                ref={isCompareOpen ? compareViewRef : undefined}
                tabIndex={-1}
                data-testid="user-comparison-view"
                className={isCompareOpen ? 'space-y-(--sp-rung) focus:outline-none' : 'hidden'}
              >
                <UserComparisonPanel
                  oktaOrigin={state.oktaOrigin}
                  isActive={isCompareOpen}
                  searchEnabled={isCompareOpen && isActive}
                  contextUser={selectedUser}
                  contextGroups={memberships}
                  targetTabId={targetTabId}
                  onGroupsChanged={state.refreshSelectedUserMemberships}
                  onContextUserUpdated={state.applySelectedUserUpdate}
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
