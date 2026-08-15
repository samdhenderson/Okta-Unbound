import React from 'react';
import GroupMembershipsList from './GroupMembershipsList';
import UserLifecycleActions from './UserLifecycleActions';
import UserProfileCard from './UserProfileCard';
import type { GroupMembership, OktaUser } from '../../../shared/types';
import type { MemberRuleAttribution } from '../../../shared/membership/memberRuleAttribution';
import type { LifecycleAction } from '../../hooks/useUserLifecycleActions';

export interface UserDetailPanelProps {
  user: OktaUser;
  oktaOrigin?: string | null;
  memberships: GroupMembership[];
  isLoadingMemberships: boolean;
  currentGroupId?: string;
  recentlyAddedGroupId?: string | null;
  isLifecycleLoading: boolean;
  pendingLifecycleAction: LifecycleAction | null;
  onRequestLifecycleAction: (action: LifecycleAction) => void;
  onCancelLifecycleAction: () => void;
  onConfirmLifecycleAction: () => void;
  onProveMembershipSource?: (groupId: string) => Promise<MemberRuleAttribution>;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({
  user,
  oktaOrigin,
  memberships,
  isLoadingMemberships,
  currentGroupId,
  recentlyAddedGroupId,
  isLifecycleLoading,
  pendingLifecycleAction,
  onRequestLifecycleAction,
  onCancelLifecycleAction,
  onConfirmLifecycleAction,
  onProveMembershipSource,
}) => {
  return (
    <div className="space-y-6 animate-rise-in">
      <UserProfileCard
        user={user}
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
        recentlyAddedGroupId={recentlyAddedGroupId}
        onProveMembershipSource={onProveMembershipSource}
      />
    </div>
  );
};

export default UserDetailPanel;
