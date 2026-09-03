import React, { useMemo } from 'react';
import { AlertMessage, DetailSection, LoadingSpinner, RuleExpressionText } from '../../shared';
import RuleCard from '../../RuleCard';
import type { FeedingRule, SourceStatus } from '../../../hooks/useGroupSource';
import type { ReferencingRule } from '../../../hooks/useGroupRuleReferences';
import type { FormattedRule } from '../../../../shared/types';

const RuleConditionLine: React.FC<{ rule: FormattedRule }> = ({ rule }) => {
  const names = rule.allGroupNamesMap;
  const resolveGroupName = useMemo(
    () => (names ? (groupId: string) => names[groupId] : undefined),
    [names],
  );

  const expression = rule.conditionExpression || rule.condition;
  if (!expression) return null;

  return (
    <div className="mt-1 flex items-baseline gap-(--sp-inline) rounded-md border border-neutral-200 bg-neutral-50 px-(--sp-inline) py-1.5">
      <span className="shrink-0 text-xs font-medium text-neutral-500">When</span>
      <RuleExpressionText
        text={expression}
        resolveGroupName={resolveGroupName}
        className="min-w-0 flex-1 font-mono text-xs whitespace-pre-wrap text-neutral-900"
      />
    </div>
  );
};

const RuleRelationList: React.FC<{
  heading: string;
  hint: string;
  status: SourceStatus;
  error: string | null;
  emptyMessage: string;
  rules: FormattedRule[];
  onNavigateToRule?: (ruleId: string) => void;
}> = ({ heading, hint, status, error, emptyMessage, rules, onNavigateToRule }) => (
  <div>
    <h3 className="text-xs font-medium text-neutral-600">
      {heading}
      {status === 'done' && ` (${rules.length})`}
    </h3>
    <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>
    <div className="mt-2">
      {status === 'loading' || status === 'idle' ? (
        <LoadingSpinner size="sm" message="Loading rules…" centered />
      ) : status === 'error' ? (
        <AlertMessage message={{ text: error || 'Failed to load rules.', type: 'danger' }} />
      ) : rules.length === 0 ? (
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id}>
              <RuleCard rule={rule} onOpenInRulesTab={onNavigateToRule} />
              <RuleConditionLine rule={rule} />
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

interface GroupRulesSectionProps {
  assigningRules: FeedingRule[];
  assigningStatus: SourceStatus;
  assigningError: string | null;
  referencingRules: ReferencingRule[];
  referencingStatus: SourceStatus;
  referencingError: string | null;
  onNavigateToRule?: (ruleId: string) => void;
}

const GroupRulesSection: React.FC<GroupRulesSectionProps> = ({
  assigningRules,
  assigningStatus,
  assigningError,
  referencingRules,
  referencingStatus,
  referencingError,
  onNavigateToRule,
}) => (
  <DetailSection title="Rules">
    <div className="space-y-4">
      <RuleRelationList
        heading="Assigns members into this group"
        hint="These rules add users here — the group's automated intake."
        status={assigningStatus}
        error={assigningError}
        emptyMessage="No rule assigns users to this group. Members are added manually or by app push."
        rules={assigningRules}
        onNavigateToRule={onNavigateToRule}
      />

      <RuleRelationList
        heading="References this group in a condition"
        hint="These rules read this group's membership to decide some other group. Only references by group id are detected — a rule matching on group name is not listed."
        status={referencingStatus}
        error={referencingError}
        emptyMessage="No rule condition references this group by id."
        rules={referencingRules}
        onNavigateToRule={onNavigateToRule}
      />
    </div>
  </DetailSection>
);

export default GroupRulesSection;
