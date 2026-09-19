import React from 'react';
import { Button, DetailSection, LoadingSpinner, type GroupNameResolver } from '../../shared';
import GroupUserReport from '../../qualification/GroupUserReport';
import QualificationSubjectStatus from '../../qualification/QualificationSubjectStatus';
import type { GroupUserCheck } from '../../../hooks/useGroupUserCheck';
import type { QualificationSubjectState } from '../../../hooks/useQualificationSubject';
import { userDisplayName } from '../../../../shared/utils/userDisplay';

export interface GroupUserCheckSectionProps {
  subject: QualificationSubjectState;
  check: GroupUserCheck;
  groupName: string;
  resolveGroupName?: GroupNameResolver;
  onClear: () => void;
}

function describe(subject: QualificationSubjectState): string | undefined {
  if (subject.status === 'loaded') {
    return `${userDisplayName(subject.user)} · ${subject.user.profile.login}`;
  }
  if (subject.status === 'idle') return undefined;
  return `User ${subject.userId}`;
}

const GroupUserCheckSection: React.FC<GroupUserCheckSectionProps> = ({
  subject,
  check,
  groupName,
  resolveGroupName,
  onClear,
}) => (
  <DetailSection
    title="Membership check"
    description={describe(subject)}
    actions={
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear
      </Button>
    }
  >
    {subject.status !== 'loaded' ? (
      <QualificationSubjectStatus state={subject} />
    ) : check.kind === 'verdict' ? (
      <GroupUserReport
        verdict={check.verdict}
        groupName={groupName}
        user={subject.user}
        groupContext={subject.groupContext}
        resolveGroupName={resolveGroupName}
      />
    ) : (
      <LoadingSpinner size="sm" centered message="Waiting for the feeding rules to load." />
    )}
  </DetailSection>
);

export default GroupUserCheckSection;
