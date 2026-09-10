import React from 'react';
import { Button, RuleExpressionText, type GroupNameResolver } from '../../shared';
import ClauseGroupList from './ClauseGroupList';
import type { AccessCause, UndeterminedReason } from './accessCause';
import type {
  ClauseExplanation,
  ClauseGroupReference,
  ClauseGroupRequirement,
} from '../../../../shared/rules/explainExpression';
import type { RuleExprValue } from '../../../../shared/ruleEvaluator';

const undeterminedReasonText: Record<UndeterminedReason, string> = {
  'unevaluable-clause':
    'A clause in the rule could not be evaluated here, so this user may still qualify.',
  'needs-group-context':
    'The rule depends on other group memberships, which this panel does not have.',
  'ambiguous-attribution':
    'More than one rule could account for this membership, so no single cause can be named.',
  'no-rule-inventory':
    'The rules targeting this group could not be loaded, so nothing could be checked.',
  'no-condition': 'The rule carries no condition to check, so there was nothing to evaluate.',
};

const UNDETERMINED_FALLBACK = 'We could not work this one out.';

const CLAUSE_PREVIEW_LIMIT = 3;

interface CauseWorklistRowProps {
  cause: AccessCause;
  onViewClauses?: (cause: AccessCause) => void;
  contextName?: string;
  renderGroupAction?: (reference: ClauseGroupReference) => React.ReactNode;
  renderBlockingGroupAction?: (reference: ClauseGroupReference) => React.ReactNode;
  resolveGroupName?: (groupId: string) => string | undefined;
}

function referencesOfPolarity(
  cause: AccessCause,
  requirement: ClauseGroupRequirement,
): readonly ClauseGroupReference[] {
  return cause.failingClauses
    .filter((clause) => clause.groupRequirement === requirement)
    .flatMap((clause) => clause.groupReferences ?? []);
}

const CauseWorklistRow: React.FC<CauseWorklistRowProps> = ({
  cause,
  onViewClauses,
  contextName,
  renderGroupAction,
  renderBlockingGroupAction,
  resolveGroupName,
}) => (
  <li className="rounded-md border border-neutral-200 bg-white p-(--sp-card)">
    <p className="text-sm font-semibold break-words text-neutral-900" title={cause.groupName}>
      {cause.groupName}
    </p>

    {cause.ruleName && (
      <p className="mt-0.5 text-xs break-words text-neutral-600" title={cause.ruleName}>
        Rule: <span className="font-medium text-neutral-700">{cause.ruleName}</span>
      </p>
    )}

    {cause.remedy === 'cannot-determine' && (
      <p className="mt-2 text-xs text-neutral-700">
        {cause.undeterminedReason
          ? undeterminedReasonText[cause.undeterminedReason]
          : UNDETERMINED_FALLBACK}
      </p>
    )}

    <ClauseGroupList
      references={referencesOfPolarity(cause, 'non-member')}
      requirement="non-member"
      contextName={contextName}
      resolveGroupName={resolveGroupName}
      renderGroupAction={renderBlockingGroupAction}
    />

    <ClauseGroupList
      references={cause.requiredGroups ?? []}
      requirement="member"
      contextName={contextName}
      resolveGroupName={resolveGroupName}
      renderGroupAction={renderGroupAction}
    />

    <FailingClauses clauses={cause.failingClauses} resolveGroupName={resolveGroupName} />

    {onViewClauses && (
      <Button
        variant="ghost"
        size="sm"
        icon="link"
        className="mt-2"
        title={`Open the clause checklist for ${cause.groupName}`}
        onClick={() => onViewClauses(cause)}
      >
        Open clause checklist
      </Button>
    )}
  </li>
);

const formatResolvedValue = (value: RuleExprValue): string => {
  if (Array.isArray(value)) return `[${value.map(formatResolvedValue).join(', ')}]`;
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
};

const clauseGroupNames =
  (clause: ClauseExplanation, resolveGroupName?: GroupNameResolver): GroupNameResolver =>
  (groupId) =>
    resolveGroupName?.(groupId) ??
    clause.groupReferences?.find(
      (reference) => reference.match === 'id' && reference.value === groupId,
    )?.matchedGroupName;

const FailingClauses: React.FC<{
  clauses: readonly ClauseExplanation[];
  resolveGroupName?: GroupNameResolver;
}> = ({ clauses, resolveGroupName }) => {
  if (clauses.length === 0) return null;
  const hidden = clauses.length - CLAUSE_PREVIEW_LIMIT;

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-neutral-600">
        {clauses.length} failing {clauses.length === 1 ? 'clause' : 'clauses'}
      </p>
      <ul className="mt-1 space-y-1">
        {clauses.slice(0, CLAUSE_PREVIEW_LIMIT).map((clause, index) => (
          <li
            key={`${index}-${clause.expressionText}`}
            className="rounded-md bg-neutral-50 px-2 py-1"
          >
            <RuleExpressionText
              text={clause.expressionText}
              resolveGroupName={clauseGroupNames(clause, resolveGroupName)}
            />
            {clause.groupReferences === undefined && (
              <span className="mt-0.5 block text-xs text-neutral-600">
                Resolved value:{' '}
                {clause.resolvedValue === undefined
                  ? 'no value could be read for this clause'
                  : formatResolvedValue(clause.resolvedValue)}
              </span>
            )}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <p className="mt-1 text-xs text-neutral-600">
          +{hidden} more failing {hidden === 1 ? 'clause' : 'clauses'}
        </p>
      )}
    </div>
  );
};

export default CauseWorklistRow;
