import React, { useMemo } from 'react';
import Icon, { type IconType } from '../../shared/Icon';
import { AlertMessage } from '../../shared';
import RuleExpressionText, { type GroupNameResolver } from './RuleExpressionText';
import {
  explainRuleExpression,
  type ClauseExplanation,
  type ClauseStatus,
  type RuleExplanationSummary,
} from '../../../../shared/rules/explainExpression';
import type { RuleExprValue, RuleGroupContext } from '../../../../shared/ruleEvaluator';
import { UNEVALUABLE_REASON_TEXT } from '../../../../shared/rules/unevaluableReasonText';
import type { OktaUser } from '../../../../shared/types';

interface ClauseChecklistProps {
  expression: string;
  user: OktaUser;
  maxClauses?: number;
  groupContext?: RuleGroupContext;
}

interface ClauseRowProps {
  clause: ClauseExplanation;
  resolveGroupName?: GroupNameResolver;
}

interface StatusPresentation {
  readonly label: string;
  readonly icon: IconType;
  readonly chipClass: string;
  readonly iconClass: string;
}

const statusPresentation: Record<ClauseStatus, StatusPresentation> = {
  pass: {
    label: 'Pass',
    icon: 'check',
    chipClass: 'border-success-light bg-success-light text-success-text',
    iconClass: 'text-success',
  },
  fail: {
    label: 'Fail',
    icon: 'alert',
    chipClass: 'border-danger-light bg-danger-light text-danger-text',
    iconClass: 'text-danger',
  },
  'not-evaluated': {
    label: 'Not evaluated',
    icon: 'minus',
    chipClass: 'border-neutral-200 bg-neutral-100 text-neutral-700',
    iconClass: 'text-neutral-500',
  },
};

const resultPresentation = {
  match: { label: 'Rule matches this user', chipClass: 'bg-success-light text-success-text' },
  'no-match': { label: 'Rule does not match', chipClass: 'bg-danger-light text-danger-text' },
  unevaluable: { label: 'Cannot be determined', chipClass: 'bg-neutral-100 text-neutral-700' },
} as const;

function formatResolvedValue(value: RuleExprValue): string {
  if (value === null) return 'null';
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

const ResolvedValue: React.FC<{ value: RuleExprValue | undefined }> = ({ value }) => (
  <p className="mt-2 text-xs text-neutral-600">
    <span className="font-medium">Resolved value: </span>
    {value === undefined ? (
      <span>no value could be read for this clause</span>
    ) : (
      <>
        <code className="font-mono break-words text-neutral-900">{formatResolvedValue(value)}</code>
        {value === null && <span>, and the attribute resolved to null</span>}
      </>
    )}
  </p>
);

const ClauseRow: React.FC<ClauseRowProps> = ({ clause, resolveGroupName }) => {
  const presentation = statusPresentation[clause.status];

  return (
    <li className="rounded-md border border-neutral-200 bg-white p-(--sp-card)">
      <div className="flex items-start justify-between gap-3">
        <RuleExpressionText
          text={clause.expressionText}
          resolveGroupName={resolveGroupName}
          className="min-w-0 flex-1 font-mono text-xs break-words whitespace-pre-wrap text-neutral-900"
        />
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${presentation.chipClass}`}
        >
          <span aria-hidden="true" className="inline-flex">
            <Icon type={presentation.icon} size="sm" className={presentation.iconClass} />
          </span>
          {presentation.label}
        </span>
      </div>

      <ResolvedValue value={clause.resolvedValue} />

      {clause.reasonCode && (
        <p className="mt-1 text-xs text-neutral-600">
          {UNEVALUABLE_REASON_TEXT[clause.reasonCode]}
        </p>
      )}

      {clause.alternatives && (
        <div className="mt-2 border-l-2 border-neutral-200 pl-3">
          <p className="text-xs font-medium text-neutral-600">Any one of these satisfies it:</p>
          <ul className="mt-1 space-y-1">
            {clause.alternatives.map((alternative, index) => (
              <li
                key={`${index}-${alternative.expressionText}`}
                className="flex items-start justify-between gap-2"
              >
                <RuleExpressionText
                  text={alternative.expressionText}
                  resolveGroupName={resolveGroupName}
                  className="min-w-0 flex-1 font-mono text-xs break-words whitespace-pre-wrap text-neutral-700"
                />
                <span className="shrink-0 text-xs text-neutral-600">
                  {statusPresentation[alternative.status].label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

const ChecklistSummary: React.FC<{ summary: RuleExplanationSummary }> = ({ summary }) => {
  const result = resultPresentation[summary.result.outcome];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-neutral-600">
        {summary.evaluatedClauses} of {summary.totalClauses} clause
        {summary.totalClauses === 1 ? '' : 's'} evaluated
        {summary.notEvaluatedClauses > 0 && <> · {summary.notEvaluatedClauses} not evaluated</>}
        {summary.needsGroupContext > 0 && <> ({summary.needsGroupContext} needs group context)</>}
      </p>
      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${result.chipClass}`}>
        {result.label}
      </span>
    </div>
  );
};

const ClauseChecklist: React.FC<ClauseChecklistProps> = ({
  expression,
  user,
  maxClauses,
  groupContext,
}) => {
  const { clauses, summary } = useMemo(
    () => explainRuleExpression(expression, user, { maxClauses, groups: groupContext }),
    [expression, user, maxClauses, groupContext],
  );

  const resolveGroupName = useMemo<GroupNameResolver | undefined>(() => {
    if (!groupContext || groupContext.length === 0) return undefined;
    const namesById = new Map(groupContext.map((entry) => [entry.id, entry.name]));
    return (groupId) => namesById.get(groupId);
  }, [groupContext]);

  if (clauses.length === 0) {
    const reasonCode =
      summary.result.outcome === 'unevaluable' ? summary.result.reasonCode : undefined;
    return (
      <div className="rounded-md border border-neutral-200 bg-white p-(--sp-card)">
        <p className="text-xs text-neutral-700">
          This condition could not be checked clause by clause, so no part of it is shown as
          failing.
        </p>
        {reasonCode && (
          <p className="mt-1 text-xs text-neutral-600">{UNEVALUABLE_REASON_TEXT[reasonCode]}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ChecklistSummary summary={summary} />

      {summary.truncated && (
        <AlertMessage
          message={{
            text: `Only the first ${summary.totalClauses} clause${
              summary.totalClauses === 1 ? ' is' : 's are'
            } shown — this condition has more.`,
            type: 'warning',
          }}
        />
      )}

      <ul className="space-y-2">
        {clauses.map((clause, index) => (
          <ClauseRow
            key={`${index}-${clause.expressionText}`}
            clause={clause}
            resolveGroupName={resolveGroupName}
          />
        ))}
      </ul>
    </div>
  );
};

export default ClauseChecklist;
