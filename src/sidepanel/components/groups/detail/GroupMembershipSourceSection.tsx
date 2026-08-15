import React from 'react';
import { AlertMessage, Button, DetailSection, LoadingSpinner } from '../../shared';
import MemberSourceMeter from './MemberSourceMeter';
import RuleLinkRow from './RuleLinkRow';
import { toRuleAttributionRows } from '../memberSourceBuckets';
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

interface RuleAttributionListProps {
  breakdown: MemberSourceBreakdown;
  onNavigateToRule?: (ruleId: string) => void;
}

const RuleAttributionList: React.FC<RuleAttributionListProps> = ({
  breakdown,
  onNavigateToRule,
}) => {
  const rows = toRuleAttributionRows(breakdown);

  return (
    <div>
      <h3 className="text-xs font-medium text-neutral-600">Attributed to</h3>
      {rows.length === 0 ? (
        <p className="mt-1.5 text-sm text-neutral-500">
          No member was attributed to a specific rule.
        </p>
      ) : (
        <ul className="mt-1.5 space-y-1.5">
          {rows.map((row) => (
            <li key={row.ruleId}>
              <RuleLinkRow
                name={row.ruleName}
                onSelect={onNavigateToRule ? () => onNavigateToRule(row.ruleId) : undefined}
                trailing={
                  <span className="flex items-center gap-2">
                    {row.provenanceLabel && (
                      <span
                        title={row.provenanceTitle}
                        className={`rounded-md border px-2 py-0.5 text-xs font-medium ${row.provenanceClass}`}
                      >
                        {row.provenanceLabel}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-neutral-600">
                      {row.count.toLocaleString()} member{row.count === 1 ? '' : 's'}
                    </span>
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const IndeterminateNote: React.FC<{ count: number }> = ({ count }) => (
  <p className="text-xs text-neutral-600">
    {count.toLocaleString()} member{count === 1 ? '' : 's'} could not be checked against a feeding
    rule&apos;s condition here — that is a limit of the client-side evaluator, not a failed match.
    Open one of them in the Users tab to see the rule explained clause by clause.
  </p>
);

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
          {breakdown.unattributed > 0 && <IndeterminateNote count={breakdown.unattributed} />}
          <RuleAttributionList breakdown={breakdown} onNavigateToRule={onNavigateToRule} />
        </div>
      ) : null}
    </DetailSection>
  );
};

export default GroupMembershipSourceSection;
