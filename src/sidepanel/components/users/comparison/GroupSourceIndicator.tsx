import React from 'react';
import { membershipSourceLine, sourceLineLabel } from '../../../../shared/membership/sourceLine';
import type { GroupMembership } from '../../../../shared/types';

type SourceTone = 'answer' | 'nonAnswer';

const baseClasses = 'min-w-0 truncate text-xs';

const chipClasses = 'rounded bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-700';

const nonAnswerClasses = 'italic text-neutral-400';

const toneClasses: Record<SourceTone, string> = {
  answer: chipClasses,
  nonAnswer: nonAnswerClasses,
};

interface GroupSourceIndicatorProps {
  membership?: GroupMembership;
}

const GroupSourceIndicator: React.FC<GroupSourceIndicatorProps> = ({ membership }) => {
  if (!membership) return null;

  const line = membershipSourceLine(membership);
  const label = sourceLineLabel(line);
  const tone: SourceTone = line.proven ? 'answer' : 'nonAnswer';
  return (
    <span
      className={`${baseClasses} ${toneClasses[tone]}`}
      title={`${label} — ${line.description}`}
    >
      {label}
    </span>
  );
};

export default GroupSourceIndicator;
