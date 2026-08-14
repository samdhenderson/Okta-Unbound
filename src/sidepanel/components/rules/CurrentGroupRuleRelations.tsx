import React from 'react';
import { Button } from '../shared';
import { extractReferencedGroupIds } from '../../../shared/rules/groupRuleIndex';
import type { FormattedRule } from '../../../shared/types';

interface CurrentGroupRuleRelationsProps {
  rules: FormattedRule[];
  currentGroupId?: string;
  onFocusRule?: (ruleId: string) => void;
}

const RuleStatusPill: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border ${
      status === 'ACTIVE'
        ? 'bg-success-light text-success-text border-success-light'
        : 'bg-neutral-100 text-neutral-500 border-neutral-200'
    }`}
  >
    {status === 'ACTIVE' ? 'Active' : 'Inactive'}
  </span>
);

const RuleRow: React.FC<{
  rule: FormattedRule;
  showCondition?: boolean;
  onFocusRule?: (ruleId: string) => void;
}> = ({ rule, showCondition = false, onFocusRule }) => (
  <li className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5">
    <div className="flex min-w-0 flex-col">
      <div className="flex min-w-0 items-center gap-2">
        <RuleStatusPill status={rule.status} />
        <span className="truncate text-sm text-neutral-900">{rule.name}</span>
      </div>
      {showCondition && rule.conditionExpression && (
        <code className="mt-0.5 truncate font-mono text-[11px] text-neutral-500">
          {rule.conditionExpression}
        </code>
      )}
    </div>
    {onFocusRule && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFocusRule(rule.id)}
        title={`Scroll to the card for ${rule.name}`}
      >
        View
      </Button>
    )}
  </li>
);

const RelationList: React.FC<{
  heading: string;
  hint: string;
  emptyMessage: string;
  rules: FormattedRule[];
  showCondition?: boolean;
  subordinate?: boolean;
  onFocusRule?: (ruleId: string) => void;
}> = ({
  heading,
  hint,
  emptyMessage,
  rules,
  showCondition = false,
  subordinate = false,
  onFocusRule,
}) => (
  <div>
    <h4
      className={
        subordinate
          ? 'text-[11px] font-semibold uppercase tracking-wider text-neutral-500'
          : 'text-xs font-semibold uppercase tracking-wider text-neutral-700'
      }
    >
      {heading}
      {rules.length > 0 && ` (${rules.length})`}
    </h4>
    <p className={`mt-0.5 ${subordinate ? 'text-[11px]' : 'text-xs'} text-neutral-500`}>{hint}</p>
    {rules.length === 0 ? (
      <p className="mt-2 text-sm text-neutral-500">{emptyMessage}</p>
    ) : (
      <ul className="mt-2 space-y-1.5">
        {rules.map((rule) => (
          <RuleRow
            key={rule.id}
            rule={rule}
            showCondition={showCondition}
            onFocusRule={onFocusRule}
          />
        ))}
      </ul>
    )}
  </div>
);

const CurrentGroupRuleRelations: React.FC<CurrentGroupRuleRelationsProps> = ({
  rules,
  currentGroupId,
  onFocusRule,
}) => {
  const { assigning, referencing } = React.useMemo(() => {
    const assigningRules: FormattedRule[] = [];
    const referencingRules: FormattedRule[] = [];
    if (!currentGroupId) return { assigning: assigningRules, referencing: referencingRules };
    for (const rule of rules) {
      if (rule.groupIds?.includes(currentGroupId)) assigningRules.push(rule);
      if (extractReferencedGroupIds(rule.conditionExpression).includes(currentGroupId)) {
        referencingRules.push(rule);
      }
    }
    return { assigning: assigningRules, referencing: referencingRules };
  }, [rules, currentGroupId]);

  if (!currentGroupId) return null;

  return (
    <section
      aria-labelledby="current-group-rule-relations-heading"
      className="rounded-md border border-neutral-200 bg-white"
    >
      <div className="border-b border-neutral-100 px-4 py-3">
        <h3
          id="current-group-rule-relations-heading"
          className="text-sm font-semibold text-neutral-900"
        >
          Rules and the current group
        </h3>
        <p className="mt-0.5 text-xs text-neutral-600">
          Two opposite relationships, kept apart: rules that put members in this group, and rules
          that only read it to decide something else.
        </p>
      </div>

      <div className="space-y-3 px-4 py-3">
        <RelationList
          heading="Assigns members into this group"
          hint="These rules add users here — the group's automated intake."
          emptyMessage="No loaded rule assigns users to this group. Members are added manually or by app push."
          rules={assigning}
          onFocusRule={onFocusRule}
        />

        <div className="rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2.5">
          <RelationList
            heading="References this group by ID in a condition"
            hint={
              "These rules read this group's membership to decide some other group — they add " +
              'nobody here. Only references by group ID are detected (isMemberOfGroup / ' +
              'isMemberOfAnyGroup); a rule matching on group name, such as ' +
              'isMemberOfGroupName("…"), also reads this group but is not listed.'
            }
            emptyMessage="No loaded rule references this group by ID in its condition. Name-based conditions are not detected, so this is not proof that nothing reads this group."
            rules={referencing}
            showCondition
            subordinate
            onFocusRule={onFocusRule}
          />
        </div>
      </div>
    </section>
  );
};

export default CurrentGroupRuleRelations;
