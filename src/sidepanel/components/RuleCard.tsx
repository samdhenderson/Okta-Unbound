import React, { useState, useCallback, useEffect, useId, useRef, memo } from 'react';
import type { FormattedRule } from '../../shared/types';
import { timeAgo } from '../../shared/ruleUtils';
import { Badge, Button, CopyableId, EntityLink, IconButton, ListRow } from './shared';
import Icon from './shared/Icon';

const FLASH_MS = 500;

interface RuleCardProps {
  rule: FormattedRule;
  onActivate?: (ruleId: string) => void;
  onDeactivate?: (ruleId: string) => void;
  onPreviewImpact?: (rule: FormattedRule) => void;
  onAddTargetGroup?: (rule: FormattedRule) => void;
  onOpenInRulesTab?: (ruleId: string) => void;
  oktaOrigin?: string | null;
  isHighlighted?: boolean;
}

const UnnamedGroupChip: React.FC<{
  groupId: string;
}> = ({ groupId }) => (
  <span
    className="inline-flex max-w-full items-center gap-1 rounded-md border border-dashed border-neutral-300 px-2 py-0.5 text-xs"
    title="This rule assigns to this group id. No name for it was loaded into this view."
  >
    <Icon type="users" size="xs" className="shrink-0 text-neutral-500" />
    <span className="shrink-0 italic text-neutral-600">Group name not loaded</span>
    <CopyableId value={groupId} label={`Copy group id ${groupId}`} />
  </span>
);

const renderConditionWithGroupBadges = (
  expression: string,
  allGroupNamesMap?: Record<string, string>,
): React.ReactNode => {
  if (!allGroupNamesMap || Object.keys(allGroupNamesMap).length === 0) {
    return expression;
  }

  const groupIdPattern = /\b00g[a-zA-Z0-9]{17}\b/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = groupIdPattern.exec(expression)) !== null) {
    const groupId = match[0];
    const groupName = allGroupNamesMap[groupId];

    if (match.index > lastIndex) {
      parts.push(expression.substring(lastIndex, match.index));
    }

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

  if (lastIndex < expression.length) {
    parts.push(expression.substring(lastIndex));
  }

  return parts.length > 0 ? parts : expression;
};

const RuleCard: React.FC<RuleCardProps> = memo(
  ({
    rule,
    onActivate,
    onDeactivate,
    onPreviewImpact,
    onAddTargetGroup,
    onOpenInRulesTab,
    oktaOrigin,
    isHighlighted = false,
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const detailsId = useId();
    const [isFlashing, setIsFlashing] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (isHighlighted) {
        setIsExpanded(true);
        setIsFlashing(true);
      }
    }, [isHighlighted]);

    useEffect(() => {
      if (!isFlashing) return;
      const card = cardRef.current;
      const finish = (event?: { target: unknown }) => {
        if (event && event.target !== card) return;
        setIsFlashing(false);
      };
      const timer = window.setTimeout(finish, FLASH_MS);
      card?.addEventListener('animationend', finish);
      return () => {
        window.clearTimeout(timer);
        card?.removeEventListener('animationend', finish);
      };
    }, [isFlashing]);

    const toggleExpanded = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const handleActivate = useCallback(() => {
      onActivate?.(rule.id);
    }, [onActivate, rule.id]);

    const handleDeactivate = useCallback(() => {
      onDeactivate?.(rule.id);
    }, [onDeactivate, rule.id]);

    const handlePreviewImpact = useCallback(() => {
      onPreviewImpact?.(rule);
    }, [onPreviewImpact, rule]);

    const handleAddTargetGroup = useCallback(() => {
      onAddTargetGroup?.(rule);
    }, [onAddTargetGroup, rule]);

    const handleOpenInRulesTab = useCallback(() => {
      onOpenInRulesTab?.(rule.id);
    }, [onOpenInRulesTab, rule.id]);

    const hasConflicts = rule.conflicts && rule.conflicts.length > 0;

    const expandedBody = (
      <div
        id={detailsId}
        className="disclose"
        data-open={isExpanded}
        inert={!isExpanded || undefined}
      >
        <div>
          <div className="px-(--sp-card) pb-(--sp-card) pt-2 space-y-(--sp-card) bg-neutral-50 border-t border-neutral-100">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                WHEN
              </div>
              <div className="p-(--sp-card) bg-white rounded-md border border-neutral-200">
                <code className="text-sm text-neutral-900 font-mono block overflow-x-auto">
                  {renderConditionWithGroupBadges(
                    rule.conditionExpression || rule.condition,
                    rule.allGroupNamesMap,
                  )}
                </code>
              </div>
            </div>

            {rule.userAttributes.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                  USES ATTRIBUTES
                </div>
                <div className="flex flex-wrap gap-(--sp-inline)">
                  {rule.userAttributes.map((attr) => (
                    <span
                      key={attr}
                      className="px-2.5 py-1 rounded-md bg-primary-light text-primary-text text-sm font-medium border border-primary-highlight"
                    >
                      {attr}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {rule.groupIds.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                  THEN ADD TO GROUPS
                </div>
                <div className="flex flex-wrap gap-(--sp-inline)">
                  {rule.groupIds.map((groupId, index) => {
                    const groupName = rule.groupNames?.[index];
                    const resolvedName = groupName !== groupId ? groupName : undefined;

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
                      <UnnamedGroupChip key={groupId} groupId={groupId} />
                    );
                  })}
                </div>
              </div>
            )}

            {hasConflicts && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-warning-text mb-2">
                  CONFLICTS DETECTED
                </div>
                <div className="space-y-2">
                  {rule.conflicts!.map((conflict, idx) => (
                    <div
                      key={idx}
                      className="p-(--sp-card) bg-warning-light rounded-md border border-warning-light"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`
                        px-2 py-0.5 rounded-md text-xs font-bold uppercase
                        ${conflict.severity === 'high' ? 'bg-danger-light text-danger-text border border-danger-light' : 'bg-warning-light text-warning-text border border-warning-light'}
                      `}
                        >
                          {conflict.severity}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm text-neutral-900 mb-1">
                            Conflicts with:{' '}
                            <span className="font-semibold">{conflict.rule2.name}</span>
                          </div>
                          <div className="text-xs text-neutral-600">{conflict.reason}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-200 flex flex-wrap gap-4 text-xs text-neutral-600">
              <div>
                <span className="font-semibold">Last updated:</span>{' '}
                <span>{timeAgo(rule.lastUpdated)}</span>
              </div>
              <div className="flex min-w-0 items-center gap-1">
                <span className="shrink-0 font-semibold">Rule ID:</span>
                <CopyableId value={rule.id} label={`Copy rule id for ${rule.name || rule.id}`} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {rule.status === 'ACTIVE'
                ? onDeactivate && (
                    <Button
                      variant="secondary"
                      size="sm"

                      onClick={handleDeactivate}
                    >
                      Deactivate Rule
                    </Button>
                  )
                : onActivate && (
                    <Button variant="primary" size="sm" onClick={handleActivate}>
                      Activate Rule
                    </Button>
                  )}
              {onPreviewImpact && rule.groupIds.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="users"

                  onClick={handlePreviewImpact}
                >
                  Preview Impact
                </Button>
              )}
              {onAddTargetGroup && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="plus"

                  onClick={handleAddTargetGroup}
                >
                  Add Target Group
                </Button>
              )}
              {onOpenInRulesTab && (
                <Button
                  variant="secondary"
                  size="sm"

                  onClick={handleOpenInRulesTab}
                  title={`Open rule ${rule.name} in the Rules tab`}
                >
                  Open in Rules tab
                </Button>
              )}
              {oktaOrigin && (
                <a
                  href={`${oktaOrigin}/admin/groups#rules`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white text-neutral-900 border border-neutral-200 rounded-md hover:bg-neutral-50 hover:border-neutral-500"
                  style={{ fontFamily: 'var(--font-heading)', minHeight: '36px' }}
                  title="Open Rules page in Okta Admin Console (you can search for this rule by name)"
                >
                  <span>View in Okta</span>
                  <Icon type="external-link" size="sm" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <ListRow
        elementRef={cardRef}
        state={rule.affectsCurrentGroup ? 'selected' : 'default'}
        flash={isFlashing}
        body={expandedBody}
        headerClassName="flex cursor-pointer items-center justify-between gap-4 press press-subtle"
        onHeaderClick={toggleExpanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-(--sp-inline) flex-wrap mb-1">
            <h3 className="font-semibold text-neutral-900 text-sm">{rule.name}</h3>
            <Badge variant={rule.status === 'ACTIVE' ? 'success' : 'neutral'}>{rule.status}</Badge>
            {rule.affectsCurrentGroup && (
              <Badge variant="primary" solid>
                Current Group
              </Badge>
            )}
            {hasConflicts && (
              <Badge variant="warning">
                {rule.conflicts!.length} Conflict{rule.conflicts!.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="text-sm text-neutral-600 truncate">{rule.condition}</p>
        </div>
        <IconButton
          label={`${isExpanded ? 'Collapse' : 'Expand'} ${rule.name}`}
          variant="ghost"
          size="md"
          expanded={isExpanded}
          controls={detailsId}
          className="shrink-0"
        >
          <Icon
            type="chevron-right"
            size="sm"
            className={`transition-transform duration-(--dur-instant) ${isExpanded ? 'rotate-90' : ''}`}
          />
        </IconButton>
      </ListRow>
    );
  },
);

RuleCard.displayName = 'RuleCard';

export default RuleCard;
