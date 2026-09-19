import React from 'react';
import { Button, DetailSection, LoadingSpinner, type GroupNameResolver } from '../shared';
import GroupUserReport from '../qualification/GroupUserReport';
import RuleUserReport from '../qualification/RuleUserReport';
import { groupContextOf } from '../../../shared/membership/groupContext';
import type { GroupMembership, OktaUser } from '../../../shared/types';
import type { UserQualificationCheck } from '../../hooks/useUserQualification';

export interface UserQualificationSurfaceProps {
  check: UserQualificationCheck;
  user: OktaUser;
  memberships: GroupMembership[] | undefined;
  resolveGroupName?: GroupNameResolver;
  onClear: () => void;
}

const PENDING_TEXT = {
  memberships: "Waiting for the user's memberships to load.",
  inventory: 'Waiting for the rule inventory to load.',
} as const;

function titleOf(check: UserQualificationCheck): string {
  if (check.kind === 'rule') return `Against rule: ${check.rule.name}`;
  if (check.kind === 'group') return `Membership of ${check.group.name}`;
  return 'Checking';
}

const UserQualificationSurface: React.FC<UserQualificationSurfaceProps> = ({
  check,
  user,
  memberships,
  resolveGroupName,
  onClear,
}) => {
  const groupContext = memberships ? groupContextOf(memberships) : undefined;
  return (
    <DetailSection
      title={titleOf(check)}
      actions={
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      }
    >
      {check.kind === 'pending' && (
        <LoadingSpinner size="sm" centered message={PENDING_TEXT[check.reason]} />
      )}
      {check.kind === 'rule' && groupContext && (
        <RuleUserReport
          verdict={check.verdict}
          user={user}
          groupContext={groupContext}
          resolveGroupName={resolveGroupName}
        />
      )}
      {check.kind === 'group' && groupContext && (
        <GroupUserReport
          verdict={check.verdict}
          groupName={check.group.name}
          user={user}
          groupContext={groupContext}
          resolveGroupName={resolveGroupName}
        />
      )}
    </DetailSection>
  );
};

export default UserQualificationSurface;
