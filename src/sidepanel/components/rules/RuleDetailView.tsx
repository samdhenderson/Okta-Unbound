import React from 'react';
import { CopyableId, DetailSection, EntityLink } from '../shared';
import Icon from '../shared/Icon';
import RuleActionBar from './RuleActionBar';
import type { FormattedRule } from '../../../shared/types';

export interface RuleDetailViewProps {
  rule: FormattedRule;
  oktaOrigin?: string | null;
  onPreviewImpact?: () => void;
  tierOpen: boolean;
  onTierOpenChange: (open: boolean) => void;
  isLifecycleLoading?: boolean;
  isConfirmingActivate: boolean;
  onRequestActivate: () => void;
  onCancelActivate: () => void;
  onConfirmActivate: () => void;
  onRequestDeactivate: () => void;
  onAddTargetGroup?: () => void;
  sticky?: boolean;
}

const MissingGroupChip: React.FC<{ groupId: string }> = ({ groupId }) => (
  <span
    className="inline-flex max-w-full items-center gap-1 rounded-md border border-warning bg-warning-light px-2 py-0.5 text-xs"
    title="No group in this org has this id. The rule still lists it, and adds nobody to it."
  >
    <Icon type="alert" size="xs" className="shrink-0 text-warning-text" />
    <span className="shrink-0 text-warning-text">Group no longer exists</span>
    <CopyableId value={groupId} label={`Copy group id ${groupId}`} />
  </span>
);

const renderConditionWithGroupBadges = (
  expression: string,
  allGroupNamesMap?: Record<string, string>,
): React.ReactNode => {
  if (!allGroupNamesMap || Object.keys(allGroupNamesMap).length === 0) return expression;

  const groupIdPattern = /\b00g[a-zA-Z0-9]{17}\b/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = groupIdPattern.exec(expression)) !== null) {
    const groupId = match[0];
    const groupName = allGroupNamesMap[groupId];

    if (match.index > lastIndex) parts.push(expression.substring(lastIndex, match.index));

    if (groupName && groupName !== groupId) {
      parts.push(
        <EntityLink
          key={`${groupId}-${match.index}`}
          type="group"
          id={groupId}
          name={groupName}
          copyId
          copyIdLabel={`Copy group id ${groupId}`}
          className="align-middle"
        />,
      );
    } else {
      parts.push(groupId);
    }

    lastIndex = match.index + groupId.length;
  }

  if (lastIndex < expression.length) parts.push(expression.substring(lastIndex));

  return parts.length > 0 ? parts : expression;
};

const RuleDetailView: React.FC<RuleDetailViewProps> = ({
  rule,
  oktaOrigin,
  onPreviewImpact,
  tierOpen,
  onTierOpenChange,
  isLifecycleLoading,
  isConfirmingActivate,
  onRequestActivate,
  onCancelActivate,
  onConfirmActivate,
  onRequestDeactivate,
  onAddTargetGroup,
  sticky = true,
}) => {
  const hasConflicts = Boolean(rule.conflicts && rule.conflicts.length > 0);
  const missingTargetCount = rule.missingGroupIds?.length ?? 0;

  return (
    <div className="space-y-(--sp-rung)">
      <RuleActionBar
        rule={rule}
        onPreviewImpact={onPreviewImpact}
        tierOpen={tierOpen}
        onTierOpenChange={onTierOpenChange}
        isLifecycleLoading={isLifecycleLoading}
        isConfirmingActivate={isConfirmingActivate}
        onRequestActivate={onRequestActivate}
        onCancelActivate={onCancelActivate}
        onConfirmActivate={onConfirmActivate}
        onRequestDeactivate={onRequestDeactivate}
        onAddTargetGroup={onAddTargetGroup}
        sticky={sticky}
      />

      <DetailSection
        title="When"
        description="The condition Okta evaluates against every user in the org."
      >
        <div className="rounded-md border border-neutral-200 bg-white p-(--sp-card)">
          <code className="block overflow-x-auto font-mono text-sm text-neutral-900">
            {renderConditionWithGroupBadges(
              rule.conditionExpression || rule.condition,
              rule.allGroupNamesMap,
            )}
          </code>
        </div>

        {rule.userAttributes.length > 0 && (
          <div className="mt-(--sp-card)">
            <p className="mb-2 text-xs text-neutral-600">Profile attributes it reads</p>
            <div className="flex flex-wrap gap-(--sp-inline)">
              {rule.userAttributes.map((attr) => (
                <span
                  key={attr}
                  className="rounded-md border border-primary-highlight bg-primary-light px-2.5 py-1 text-sm font-medium text-primary-text"
                >
                  {attr}
                </span>
              ))}
            </div>
          </div>
        )}
      </DetailSection>

      <DetailSection
        title="Then add to groups"
        description={
          rule.groupIds.length > 0
            ? missingTargetCount > 0
              ? `Everyone the condition matches is added to each of these. ${missingTargetCount === 1 ? 'One target no longer exists' : `${missingTargetCount} targets no longer exist`}, so that part of the rule does nothing.`
              : 'Everyone the condition matches is added to each of these.'
            : undefined
        }
      >
        {rule.groupIds.length > 0 ? (
          <div className="flex flex-wrap gap-(--sp-inline)">
            {rule.groupIds.map((groupId, index) => {
              const groupName = rule.groupNames?.[index];
              const resolvedName = groupName !== groupId ? groupName : undefined;
              const isMissing = rule.missingGroupIds?.includes(groupId) ?? false;

              if (isMissing) return <MissingGroupChip key={groupId} groupId={groupId} />;

              return resolvedName ? (
                <EntityLink
                  key={groupId}
                  type="group"
                  id={groupId}
                  name={resolvedName}
                  copyId
                  copyIdLabel={`Copy group id ${groupId}`}
                />
              ) : (
                <EntityLink
                  key={groupId}
                  type="group"
                  id={groupId}
                  unresolvedReason="This rule assigns to this group id. No name for it was loaded into this view."
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            This rule assigns to no groups, so it adds nobody anywhere. Its condition is evaluated
            and the result is discarded.
          </p>
        )}
      </DetailSection>

      {hasConflicts && (
        <DetailSection
          title="Conflicts"
          description="Other loaded rules whose conditions overlap this one."
        >
          <div className="space-y-2">
            {rule.conflicts!.map((conflict, idx) => (
              <div
                key={idx}
                className="rounded-md border border-warning bg-warning-light p-(--sp-card)"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase ${
                      conflict.severity === 'high'
                        ? 'border border-danger-light bg-danger-light text-danger-text'
                        : 'border border-warning bg-warning-light text-warning-text'
                    }`}
                  >
                    {conflict.severity}
                  </span>
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-neutral-900">
                      Conflicts with: <span className="font-semibold">{conflict.rule2.name}</span>
                    </div>
                    <div className="text-xs text-neutral-600">{conflict.reason}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {oktaOrigin && (
        <DetailSection title="In Okta">
          <a
            href={`${oktaOrigin}/admin/groups#rules`}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 hover:border-neutral-500 hover:bg-neutral-50"
          >
            <span>Open the rules page</span>
            <Icon type="external-link" size="sm" />
          </a>
          <p className="mt-2 text-xs text-neutral-500">
            Okta has no direct link to a single rule, so this opens the org&rsquo;s rules list.
            Search it for <span className="font-medium text-neutral-700">{rule.name}</span>.
          </p>
        </DetailSection>
      )}
    </div>
  );
};

export default RuleDetailView;
