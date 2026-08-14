import React, { useState, useCallback, useEffect, useId, useRef, memo } from 'react';
import type { FormattedRule } from '../../shared/types';
import { timeAgo } from '../../shared/ruleUtils';
import { Button, IconButton, ListRow } from './shared';

const FLASH_MS = 500;

interface RuleCardProps {
  rule: FormattedRule;
  onActivate?: (ruleId: string) => void;
  onDeactivate?: (ruleId: string) => void;
  onPreviewImpact?: (rule: FormattedRule) => void;
  onAddTargetGroup?: (rule: FormattedRule) => void;
  oktaOrigin?: string | null;
  isHighlighted?: boolean;
}

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
        <React.Fragment key={`${groupId}-${match.index}`}>
          <span className="font-mono text-xs text-neutral-600">{groupId}</span>
          <span
            className="ml-2 px-2 py-0.5 rounded-md bg-primary-light text-primary-text text-xs font-medium border border-primary-highlight"
            title={`Group: ${groupName}`}
          >
            {groupName}
          </span>
        </React.Fragment>,
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

    const hasConflicts = rule.conflicts && rule.conflicts.length > 0;

    const expandedBody = (
      <div
        id={detailsId}
        className="disclose"
        data-open={isExpanded}
        inert={!isExpanded || undefined}
      >
        <div>
          <div className="px-4 pb-4 pt-2 space-y-4 bg-neutral-50 border-t border-neutral-100">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                WHEN
              </div>
              <div className="p-3 bg-white rounded-md border border-neutral-200">
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
                <div className="flex flex-wrap gap-2">
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
                <div className="flex flex-wrap gap-2">
                  {rule.groupIds.map((groupId, index) => {
                    const groupName = rule.groupNames?.[index];
                    const isNameDifferent = groupName && groupName !== groupId;

                    return (
                      <span
                        key={groupId}
                        className="px-2.5 py-1 rounded-md bg-success-light text-success-text text-sm font-medium border border-success-light"
                      >
                        {isNameDifferent ? (
                          <>
                            <span className="font-semibold">{groupName}</span>
                            <span className="ml-1.5 text-xs font-mono opacity-75">
                              ({groupId.substring(0, 8)}...)
                            </span>
                          </>
                        ) : (
                          <span className="font-mono">{groupId}</span>
                        )}
                      </span>
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
                      className="p-3 bg-warning-light rounded-md border border-warning-light"
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
              <div>
                <span className="font-semibold">Rule ID:</span>{' '}
                <span className="font-mono text-neutral-500">{rule.id}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {rule.status === 'ACTIVE' ? (
                <Button variant="secondary" size="sm" onClick={handleDeactivate}>
                  Deactivate Rule
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleActivate}>
                  Activate Rule
                </Button>
              )}
              {onPreviewImpact && rule.groupIds.length > 0 && (
                <Button variant="secondary" size="sm" icon="users" onClick={handlePreviewImpact}>
                  Preview Impact
                </Button>
              )}
              {onAddTargetGroup && (
                <Button variant="secondary" size="sm" icon="plus" onClick={handleAddTargetGroup}>
                  Add Target Group
                </Button>
              )}
              {oktaOrigin && (
                <a
                  href={`${oktaOrigin}/admin/groups#rules`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white text-neutral-900 border border-neutral-200 rounded-md hover:bg-neutral-50 hover:border-neutral-500 transition-colors duration-(--dur-instant)"
                  style={{ fontFamily: 'var(--font-heading)', minHeight: '36px' }}
                  title="Open Rules page in Okta Admin Console (you can search for this rule by name)"
                >
                  <span>View in Okta</span>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
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
        headerClassName="flex cursor-pointer items-center justify-between gap-4"
        onHeaderClick={toggleExpanded}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`
            mt-1 w-2.5 h-2.5 rounded-full shrink-0
            ${rule.status === 'ACTIVE' ? 'bg-success ring-4 ring-success/20' : 'bg-neutral-400 ring-4 ring-neutral-400/20'}
          `}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-neutral-900 text-sm">{rule.name}</h3>
              {rule.affectsCurrentGroup && (
                <span className="px-2 py-0.5 rounded-md bg-primary text-white text-xs font-medium">
                  Current Group
                </span>
              )}
              {hasConflicts && (
                <span className="px-2 py-0.5 rounded-md bg-warning-light text-warning-text text-xs font-medium border border-warning-light">
                  {rule.conflicts!.length} Conflict{rule.conflicts!.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-600 truncate">{rule.condition}</p>
          </div>
        </div>
        <IconButton
          label={isExpanded ? 'Collapse' : 'Expand'}
          variant="ghost"
          size="md"
          expanded={isExpanded}
          controls={detailsId}
          className="shrink-0"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-(--dur-instant) ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </IconButton>
      </ListRow>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.rule.id === nextProps.rule.id &&
      prevProps.rule.name === nextProps.rule.name &&
      prevProps.rule.status === nextProps.rule.status &&
      prevProps.rule.condition === nextProps.rule.condition &&
      prevProps.rule.affectsCurrentGroup === nextProps.rule.affectsCurrentGroup &&
      prevProps.isHighlighted === nextProps.isHighlighted &&
      prevProps.oktaOrigin === nextProps.oktaOrigin &&
      (prevProps.rule.conflicts?.length || 0) === (nextProps.rule.conflicts?.length || 0)
    );
  },
);

RuleCard.displayName = 'RuleCard';

export default RuleCard;
