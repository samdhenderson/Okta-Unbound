import React from 'react';
import RuleLinkRow from './RuleLinkRow';
import { toRuleAttributionRows } from '../memberSourceBuckets';
import type { MemberSourceBreakdown } from '../../../../shared/membership/groupSource';

interface IndeterminateNoteProps {
  count: number;
}

export const IndeterminateNote: React.FC<IndeterminateNoteProps> = ({ count }) => (
  <p className="text-xs text-neutral-600">
    {count.toLocaleString()} member{count === 1 ? '' : 's'} could not be checked against a feeding
    rule&apos;s condition here — that is a limit of the client-side evaluator, not a failed match.
    Open one of them in the Users tab to see the rule explained clause by clause.
  </p>
);

interface RuleAttributionListProps {
  breakdown: MemberSourceBreakdown;
  onNavigateToRule?: (ruleId: string) => void;
}

export const RuleAttributionList: React.FC<RuleAttributionListProps> = ({
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

export interface MemberSourceNotesProps {
  breakdown: MemberSourceBreakdown;
  onNavigateToRule?: (ruleId: string) => void;
}

const MemberSourceNotes: React.FC<MemberSourceNotesProps> = ({ breakdown, onNavigateToRule }) => (
  <div className="space-y-3">
    {breakdown.unattributed > 0 && <IndeterminateNote count={breakdown.unattributed} />}
    <RuleAttributionList breakdown={breakdown} onNavigateToRule={onNavigateToRule} />
  </div>
);

export default MemberSourceNotes;
