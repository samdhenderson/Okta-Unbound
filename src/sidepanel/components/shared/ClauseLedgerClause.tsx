import React from 'react';
import Icon, { type IconType } from './Icon';
import RuleExpressionText, { type GroupNameResolver } from './RuleExpressionText';
import StableWidth from './StableWidth';
import GroupReferenceChip from './GroupReferenceChip';
import ClausePhrase from './ClausePhrase';
import { formatRuleValue } from './ruleValueText';
import { UNEVALUABLE_REASON_TEXT } from '../../../shared/rules/unevaluableReasonText';
import {
  type AttributeRead,
  type ClauseStatus,
  type LeafClauseNode,
} from '../../../shared/rules/explainExpression';

export interface ClauseLedgerClauseProps {
  leaf: LeafClauseNode;
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

const WIDEST_STATUS = Object.values(statusPresentation).reduce((a, b) =>
  b.label.length > a.label.length ? b : a,
);

const StatusChip: React.FC<{ presentation: StatusPresentation }> = ({ presentation }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${presentation.chipClass}`}
  >
    <span aria-hidden="true" className="inline-flex">
      <Icon type={presentation.icon} size="sm" className={presentation.iconClass} />
    </span>
    {presentation.label}
  </span>
);

const GroupClauseLabel: React.FC<{ leaf: LeafClauseNode }> = ({ leaf }) => {
  const count = leaf.groupReferences?.length ?? 0;
  const noun = count === 1 ? 'this group' : 'any of these groups';

  return (
    <span className="min-w-0 text-xs text-neutral-900">
      {leaf.groupRequirement === 'non-member' ? (
        <>
          <strong>Not</strong> a member of {noun}
        </>
      ) : (
        <>Member of {noun}</>
      )}
    </span>
  );
};

const AttributeReadLine: React.FC<{ read: AttributeRead }> = ({ read }) => (
  <p className="text-xs text-neutral-500">
    <span className="font-mono">{read.path}</span> →{' '}
    {read.value === null ? (
      <span>not set</span>
    ) : (
      <span className="font-mono text-xs text-neutral-700">{formatRuleValue(read.value)}</span>
    )}
  </p>
);

const ClauseLedgerClause: React.FC<ClauseLedgerClauseProps> = ({ leaf, resolveGroupName }) => {
  const presentation = statusPresentation[leaf.status];
  const isGroupClause = leaf.groupRequirement !== undefined;

  return (
    <div className="rounded-md border border-neutral-200 bg-white p-(--sp-card)">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        {isGroupClause ? (
          <GroupClauseLabel leaf={leaf} />
        ) : leaf.predicate ? (
          <ClausePhrase predicate={leaf.predicate} className="min-w-0" />
        ) : (
          <RuleExpressionText
            text={leaf.expressionText}
            resolveGroupName={resolveGroupName}
            className="min-w-0"
          />
        )}
        <StableWidth reserve={<StatusChip presentation={WIDEST_STATUS} />} align="end">
          <StatusChip presentation={presentation} />
        </StableWidth>
      </div>

      {leaf.groupReferences && leaf.groupReferences.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {leaf.groupReferences.map((reference) => (
            <GroupReferenceChip
              key={`${reference.match}-${reference.value}`}
              reference={reference}
              hasContext
              resolveGroupName={resolveGroupName}
            />
          ))}
        </div>
      )}

      {leaf.reads.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {leaf.reads.map((read) => (
            <AttributeReadLine key={read.path} read={read} />
          ))}
        </div>
      )}

      {leaf.reasonCode && (
        <p className="mt-1 text-xs text-neutral-600">{UNEVALUABLE_REASON_TEXT[leaf.reasonCode]}</p>
      )}
    </div>
  );
};

export default ClauseLedgerClause;
