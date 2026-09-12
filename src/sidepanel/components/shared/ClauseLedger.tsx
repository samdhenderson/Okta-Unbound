import React from 'react';
import StableWidth from './StableWidth';
import { ClauseTreeNodeView } from './ClauseLedgerBranch';
import RawExpressionWell from './RawExpressionWell';
import { useClauseLedger } from './useClauseLedger';
import type { GroupNameResolver } from './RuleExpressionText';
import type { RuleExplanationSummary } from '../../../shared/rules/explainExpression';
import { UNEVALUABLE_REASON_TEXT } from '../../../shared/rules/unevaluableReasonText';
import type { RuleGroupContext } from '../../../shared/ruleEvaluator';
import type { OktaUser } from '../../../shared/types';

export interface ClauseLedgerProps {
  expression: string;
  user: OktaUser;
  groupContext?: RuleGroupContext;
  maxClauses?: number;
  resolveGroupName?: GroupNameResolver;
  defaultShowRaw?: boolean;
}

const resultPresentation = {
  match: { label: 'Rule matches this user', chipClass: 'bg-success-light text-success-text' },
  'no-match': { label: 'Rule does not match', chipClass: 'bg-danger-light text-danger-text' },
  unevaluable: { label: 'Cannot be determined', chipClass: 'bg-neutral-100 text-neutral-700' },
} as const;

const WIDEST_RESULT = Object.values(resultPresentation).reduce((a, b) =>
  b.label.length > a.label.length ? b : a,
);

const LedgerSummary: React.FC<{ summary: RuleExplanationSummary }> = ({ summary }) => {
  const result = resultPresentation[summary.result.outcome];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="min-w-0 flex-1 text-xs text-neutral-600">
        {summary.evaluatedClauses} of {summary.totalClauses} clause
        {summary.totalClauses === 1 ? '' : 's'} evaluated
        {summary.notEvaluatedClauses > 0 && <> · {summary.notEvaluatedClauses} not evaluated</>}
        {summary.needsGroupContext > 0 && <> ({summary.needsGroupContext} needs group context)</>}
      </p>
      <StableWidth
        reserve={
          <span className="rounded-md px-2 py-0.5 text-xs font-medium">{WIDEST_RESULT.label}</span>
        }
        align="end"
        className="shrink-0"
      >
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${result.chipClass}`}
        >
          {result.label}
        </span>
      </StableWidth>
    </div>
  );
};

const RawToggleButton: React.FC<{ pressed: boolean; onToggle: () => void }> = ({
  pressed,
  onToggle,
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={pressed}
    className={`press shrink-0 rounded-md border px-4 py-2 text-sm font-medium ${
      pressed
        ? 'border-primary bg-primary-light text-primary-text'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
    }`}
  >
    Raw expression
  </button>
);

const ClauseLedger: React.FC<ClauseLedgerProps> = ({
  expression,
  user,
  groupContext,
  maxClauses,
  resolveGroupName,
  defaultShowRaw,
}) => {
  const {
    explanation,
    resolveGroupName: mergedResolveGroupName,
    showRaw,
    toggleRaw,
  } = useClauseLedger(expression, user, {
    groupContext,
    maxClauses,
    resolveGroupName,
    defaultShowRaw,
  });

  return (
    <div className="space-y-2">
      <LedgerSummary summary={explanation.summary} />

      <div className="flex justify-end">
        <RawToggleButton pressed={showRaw} onToggle={toggleRaw} />
      </div>

      {showRaw ? (
        <RawExpressionWell
          expression={expression}
          result={explanation.summary.result}
          resolveGroupName={mergedResolveGroupName}
        />
      ) : explanation.tree.node === 'leaf' && explanation.tree.expressionText === '' ? (
        <div className="space-y-1 text-xs text-neutral-600">
          <p>This condition could not be read clause by clause.</p>
          {explanation.tree.reasonCode !== undefined && (
            <p>{UNEVALUABLE_REASON_TEXT[explanation.tree.reasonCode]}</p>
          )}
        </div>
      ) : (
        <ClauseTreeNodeView node={explanation.tree} resolveGroupName={mergedResolveGroupName} />
      )}
    </div>
  );
};

export default ClauseLedger;
