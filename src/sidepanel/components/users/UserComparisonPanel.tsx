import React from 'react';
import UserComparisonView from './UserComparisonView';
import { useUserComparison } from '../../hooks/useUserComparison';
import type { OktaUser, GroupMembership } from '../../../shared/types';

export interface UserComparisonPanelProps {
  isActive: boolean;
  searchEnabled: boolean;
  contextUser: OktaUser;
  contextGroups: GroupMembership[];
  oktaOrigin?: string | null;
  targetTabId: number;
  onGroupsChanged: () => void;
}

const UserComparisonPanel: React.FC<UserComparisonPanelProps> = ({
  isActive,
  searchEnabled,
  contextUser,
  contextGroups,
  oktaOrigin,
  targetTabId,
  onGroupsChanged,
}) => {
  const comparison = useUserComparison({
    isActive,
    searchEnabled,
    contextUser,
    contextGroups,
    targetTabId,
    onGroupsChanged,
  });

  return (
    <UserComparisonView contextUser={contextUser} comparison={comparison} oktaOrigin={oktaOrigin} />
  );
};

export default UserComparisonPanel;
