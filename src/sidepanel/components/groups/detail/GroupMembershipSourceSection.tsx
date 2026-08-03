import React from 'react';
import { AlertMessage, Button, LoadingSpinner } from '../../shared';
import DetailSection from './DetailSection';
import MemberSourceMeter from './MemberSourceMeter';
import RuleLinkRow from './RuleLinkRow';
import type { SourceStatus } from '../../../hooks/useGroupSource';
import type { MemberSourceBreakdown } from '../../../../shared/membership/groupSource';

interface GroupMembershipSourceSectionProps {
  memberCount: number;
  breakdown: MemberSourceBreakdown | null;
  status: SourceStatus;
  error: string | null;
  onAnalyze: () => void;
  canAnalyze?: boolean;
  onNavigateToRule?: (ruleId: string) => void;
}

const GroupMembershipSourceSection: React.FC<GroupMembershipSourceSectionProps> = ({
  memberCount,
  breakdown,
  status,
  error,
  onAnalyze,
  canAnalyze = true,
  onNavigateToRule,
}) => {
  const hasMembers = memberCount > 0;

  return (
    <DetailSection
      title="Membership source"
      description="Splits the current members into rule-managed and manual."
      actions={
        status === 'idle' && hasMembers ? (
          <Button
            variant="secondary"
            size="sm"
            icon="chart"
            onClick={onAnalyze}
            disabled={!canAnalyze}
          >
            Analyze
          </Button>
        ) : undefined
      }
    >
      {!hasMembers ? (
        <p className="text-sm text-neutral-500">
          This group has no members, so there is nothing to attribute.
        </p>
      ) : status === 'idle' ? (
        <p className="text-sm text-neutral-500">
          Not analyzed yet. Reads all {memberCount.toLocaleString()} member
          {memberCount === 1 ? '' : 's'} once, then classifies each against the rules that assign
          into this group.
        </p>
      ) : status === 'loading' ? (
        <LoadingSpinner size="sm" message="Analyzing members…" centered />
      ) : status === 'error' ? (
        <AlertMessage
          message={{ text: error || 'Failed to analyze members.', type: 'danger' }}
          action={{ label: 'Retry', onClick: onAnalyze }}
        />
      ) : breakdown ? (
        <div className="space-y-4">
          <MemberSourceMeter breakdown={breakdown} />

          <div>
            <h3 className="text-xs font-medium text-neutral-600">Attributed to</h3>
            {breakdown.byRule.length === 0 ? (
              <p className="mt-1.5 text-sm text-neutral-500">
                No member was attributed to a specific rule.
              </p>
            ) : (
              <ul className="mt-1.5 space-y-1.5">
                {breakdown.byRule.map((contribution) => (
                  <li key={contribution.ruleId}>
                    <RuleLinkRow
                      name={contribution.ruleName}
                      onSelect={
                        onNavigateToRule ? () => onNavigateToRule(contribution.ruleId) : undefined
                      }
                      trailing={
                        <span className="text-xs font-semibold text-neutral-600">
                          {contribution.count.toLocaleString()} member
                          {contribution.count === 1 ? '' : 's'}
                        </span>
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </DetailSection>
  );
};

export default GroupMembershipSourceSection;
