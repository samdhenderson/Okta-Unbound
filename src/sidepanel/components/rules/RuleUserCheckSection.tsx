import React from 'react';
import { Button, DetailSection, type GroupNameResolver } from '../shared';
import QualificationSubjectStatus from '../qualification/QualificationSubjectStatus';
import RuleUserReport from '../qualification/RuleUserReport';
import type { QualificationSubjectState } from '../../hooks/useQualificationSubject';
import type { RuleUserVerdict } from '../../../shared/membership/qualificationTypes';
import { userDisplayName } from '../../../shared/utils/userDisplay';

export interface RuleUserCheckSectionProps {
  subject: QualificationSubjectState;
  verdict: RuleUserVerdict | null;
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

const RuleUserCheckSection: React.FC<RuleUserCheckSectionProps> = ({
  subject,
  verdict,
  resolveGroupName,
  onClear,
}) => (
  <DetailSection
    title="For one user"
    description={describe(subject)}
    actions={
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear
      </Button>
    }
  >
    {subject.status === 'loaded' && verdict ? (
      <RuleUserReport
        verdict={verdict}
        user={subject.user}
        groupContext={subject.groupContext}
        resolveGroupName={resolveGroupName}
      />
    ) : (
      <QualificationSubjectStatus state={subject} />
    )}
  </DetailSection>
);

export default RuleUserCheckSection;
