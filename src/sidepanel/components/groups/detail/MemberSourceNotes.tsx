import React, { useState } from 'react';
import { Button, Modal, ScrollableList } from '../../shared';
import RuleLinkRow from './RuleLinkRow';
import { toRuleAttributionRows, type RuleAttributionRow } from '../memberSourceBuckets';
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

const INLINE_RULE_CAP = 3;

interface RuleAttributionRowsProps {
  rows: readonly RuleAttributionRow[];
  onNavigateToRule?: (ruleId: string) => void;
}

const RuleAttributionRows: React.FC<RuleAttributionRowsProps> = ({ rows, onNavigateToRule }) => (
  <ul className="space-y-1.5">
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
  const [revealOpen, setRevealOpen] = useState(false);
  const hidden = Math.max(rows.length - INLINE_RULE_CAP, 0);

  return (
    <div>
      <h5 className="text-xs font-medium text-neutral-600">Attributed to</h5>
      {rows.length === 0 ? (
        <p className="mt-1.5 text-sm text-neutral-500">
          No member was attributed to a specific rule.
        </p>
      ) : (
        <div className="mt-1.5 space-y-1.5">
          <RuleAttributionRows
            rows={rows.slice(0, INLINE_RULE_CAP)}
            onNavigateToRule={onNavigateToRule}
          />
          {hidden > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRevealOpen(true)}
              title={`Show all ${rows.length.toLocaleString()} rules feeding this group`}
            >
              +{hidden.toLocaleString()} more rule{hidden === 1 ? '' : 's'}
            </Button>
          )}
        </div>
      )}

      <Modal
        isOpen={revealOpen}
        onClose={() => setRevealOpen(false)}
        title="Attributed to"
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setRevealOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="space-y-(--sp-rung)">
          <p className="text-sm text-neutral-600">
            All {rows.length.toLocaleString()} rule{rows.length === 1 ? '' : 's'} that account for
            members of this group.
          </p>
          <ScrollableList maxHeight="50vh" fillAvailable={false}>
            <RuleAttributionRows rows={rows} onNavigateToRule={onNavigateToRule} />
          </ScrollableList>
        </div>
      </Modal>
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
