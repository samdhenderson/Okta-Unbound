import React from 'react';
import { Button } from '../shared';
import GroupMembershipsList from './GroupMembershipsList';
import UserLifecycleActions from './UserLifecycleActions';
import UserProfileCard from './UserProfileCard';
import type { GroupMembership, OktaUser } from '../../../shared/types';
import type { LifecycleAction } from '../../hooks/useUserLifecycleActions';

export interface UserDetailPanelProps {
  user: OktaUser;
  oktaOrigin?: string | null;
  memberships: GroupMembership[];
  isLoadingMemberships: boolean;
  currentGroupId?: string;
  onNavigateToRule?: (ruleId: string) => void;
  recentlyAddedGroupId?: string | null;
  isLifecycleLoading: boolean;
  pendingLifecycleAction: LifecycleAction | null;
  onRequestLifecycleAction: (action: LifecycleAction) => void;
  onCancelLifecycleAction: () => void;
  onConfirmLifecycleAction: () => void;
  onCompare: () => void;
  onAddToGroup: () => void;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({
  user,
  oktaOrigin,
  memberships,
  isLoadingMemberships,
  currentGroupId,
  onNavigateToRule,
  recentlyAddedGroupId,
  isLifecycleLoading,
  pendingLifecycleAction,
  onRequestLifecycleAction,
  onCancelLifecycleAction,
  onConfirmLifecycleAction,
  onCompare,
  onAddToGroup,
}) => {
  return (
    <div className="space-y-6 animate-rise-in">
      <UserProfileCard
        user={user}
        oktaOrigin={oktaOrigin}
        afterCard={
          <UserLifecycleActions
            user={user}
            isLifecycleLoading={isLifecycleLoading}
            pendingLifecycleAction={pendingLifecycleAction}
            onRequestAction={onRequestLifecycleAction}
            onCancel={onCancelLifecycleAction}
            onConfirm={onConfirmLifecycleAction}
          />
        }
      />

      <GroupMembershipsList
        memberships={memberships}
        user={user}
        isLoading={isLoadingMemberships}
        currentGroupId={currentGroupId}
        oktaOrigin={oktaOrigin}
        onNavigateToRule={onNavigateToRule}
        recentlyAddedGroupId={recentlyAddedGroupId}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon="users"
              onClick={onCompare}
              disabled={isLoadingMemberships}
              title="Compare group & app access with another user"
            >
              Compare
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onAddToGroup}
              disabled={isLoadingMemberships}
            >
              Add to Group
            </Button>
          </>
        }
      />
    </div>
  );
};

export default UserDetailPanel;
