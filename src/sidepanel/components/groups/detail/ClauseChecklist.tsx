import React, { useMemo } from 'react';
import Icon, { type IconType } from '../../shared/Icon';
import {
  AlertMessage,
  RuleExpressionText,
  StableWidth,
  type GroupNameResolver,
} from '../../shared';
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
  resolveGroupName?: GroupNameResolver;
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

const WIDEST_CLAUSE_STATUS = Object.values(statusPresentation).reduce((a, b) =>
  b.label.length > a.label.length ? b : a,
);

const WIDEST_RESULT = Object.values(resultPresentation).reduce((a, b) =>
  b.label.length > a.label.length ? b : a,
);

const ClauseStatusChip: React.FC<{ presentation: StatusPresentation }> = ({ presentation }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${presentation.chipClass}`}
  >
    <span aria-hidden="true" className="inline-flex">
      <Icon type={presentation.icon} size="sm" className={presentation.iconClass} />
    </span>
    {presentation.label}
  </span>
);

function formatResolvedValue(value: RuleExprValue): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map(formatResolvedValue).join(', ')}]`;
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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <RuleExpressionText
          text={clause.expressionText}
          resolveGroupName={resolveGroupName}
          className="min-w-0"
        />
        <StableWidth reserve={<ClauseStatusChip presentation={WIDEST_CLAUSE_STATUS} />} align="end">
          <ClauseStatusChip presentation={presentation} />
        </StableWidth>
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
                  tone="subdued"
                  className="min-w-0 flex-1"
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

const ClauseChecklist: React.FC<ClauseChecklistProps> = ({
  expression,
  user,
  maxClauses,
  groupContext,
  resolveGroupName: resolveFromHost,
}) => {
  const { clauses, summary } = useMemo(
    () => explainRuleExpression(expression, user, { maxClauses, groups: groupContext }),
    [expression, user, maxClauses, groupContext],
  );

  const resolveGroupName = useMemo<GroupNameResolver | undefined>(() => {
    const namesById = new Map((groupContext ?? []).map((entry) => [entry.id, entry.name]));
    if (namesById.size === 0 && !resolveFromHost) return undefined;
    return (groupId) => namesById.get(groupId) ?? resolveFromHost?.(groupId);
  }, [groupContext, resolveFromHost]);

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
