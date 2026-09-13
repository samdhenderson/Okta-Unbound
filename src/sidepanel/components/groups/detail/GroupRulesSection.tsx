import React, { useMemo } from 'react';
import {
  AlertMessage,
  DetailSection,
  LoadingSpinner,
  RuleExpressionText,
  type GroupNameResolver,
} from '../../shared';
import RuleCard from '../../RuleCard';
import { useRungSelection } from '../../../selection/useRungSelection';
import type { FeedingRule, SourceStatus } from '../../../hooks/useGroupSource';
import type { ReferencingRule } from '../../../hooks/useGroupRuleReferences';
import type { FormattedRule } from '../../../../shared/types';

const ruleName = (rule: FormattedRule) => rule.name;

const RuleConditionLine: React.FC<{
  rule: FormattedRule;
  resolveGroupName?: GroupNameResolver;
}> = ({ rule, resolveGroupName: resolveFromHost }) => {
  const names = rule.allGroupNamesMap;
  const resolveGroupName = useMemo<GroupNameResolver | undefined>(
    () => (groupId) => names?.[groupId] ?? resolveFromHost?.(groupId),
    [names, resolveFromHost],
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
  resolveGroupName?: GroupNameResolver;
  selectedRuleIds: Set<string>;
  onToggleSelect: (ruleId: string) => void;
}> = ({
  heading,
  hint,
  status,
  error,
  emptyMessage,
  rules,
  onNavigateToRule,
  resolveGroupName,
  selectedRuleIds,
  onToggleSelect,
}) => (
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
              <RuleCard
                rule={rule}
                onOpenInRulesTab={onNavigateToRule}
                selected={selectedRuleIds.has(rule.id)}
                onToggleSelect={onToggleSelect}
              />
              <RuleConditionLine rule={rule} resolveGroupName={resolveGroupName} />
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
  resolveGroupName?: GroupNameResolver;
}

const GroupRulesSection: React.FC<GroupRulesSectionProps> = ({
  assigningRules,
  assigningStatus,
  assigningError,
  referencingRules,
  referencingStatus,
  referencingError,
  onNavigateToRule,
  resolveGroupName,
}) => {
  const allRules = useMemo(() => {
    const byId = new Map<string, FormattedRule>();
    for (const rule of [...assigningRules, ...referencingRules]) byId.set(rule.id, rule);
    return [...byId.values()];
  }, [assigningRules, referencingRules]);

  const { selectedIds: selectedRuleIds, toggleSelect: onToggleSelect } = useRungSelection(
    'rule',
    allRules,
    ruleName,
  );

  return (
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
          resolveGroupName={resolveGroupName}
          selectedRuleIds={selectedRuleIds}
          onToggleSelect={onToggleSelect}
        />

        <RuleRelationList
          heading="References this group in a condition"
          hint="These rules read this group's membership to decide some other group. Only references by group id are detected — a rule matching on group name is not listed."
          status={referencingStatus}
          error={referencingError}
          emptyMessage="No rule condition references this group by id."
          rules={referencingRules}
          onNavigateToRule={onNavigateToRule}
          resolveGroupName={resolveGroupName}
          selectedRuleIds={selectedRuleIds}
          onToggleSelect={onToggleSelect}
        />
      </div>
    </DetailSection>
  );
};

export default GroupRulesSection;
