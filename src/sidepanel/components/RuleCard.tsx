import React, { useState, useCallback, useEffect, useId, useRef, memo } from 'react';
import type { FormattedRule } from '../../shared/types';
import { ruleStatusBadge } from '../../shared/ruleUtils';
import { Badge, ListRow, StretchedButton } from './shared';
import Icon from './shared/Icon';

const FLASH_MS = 500;

interface RuleCardProps {
  rule: FormattedRule;
  onOpenRule?: (rule: FormattedRule) => void;
  onOpenInRulesTab?: (ruleId: string) => void;
  isHighlighted?: boolean;
}

const RuleCard: React.FC<RuleCardProps> = memo(
  ({ rule, onOpenRule, onOpenInRulesTab, isHighlighted = false }) => {
    const [isFlashing, setIsFlashing] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const nameId = useId();

    useEffect(() => {
      if (isHighlighted) setIsFlashing(true);
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

    const handleOpen = useCallback(() => {
      if (onOpenRule) {
        onOpenRule(rule);
        return;
      }
      onOpenInRulesTab?.(rule.id);
    }, [onOpenRule, onOpenInRulesTab, rule]);

    const canOpen = Boolean(onOpenRule || onOpenInRulesTab);
    const opensInRulesTab = !onOpenRule && Boolean(onOpenInRulesTab);
    const hasConflicts = Boolean(rule.conflicts && rule.conflicts.length > 0);
    const missingTargets = rule.missingGroupIds?.length ?? 0;
    const statusBadge = ruleStatusBadge(rule.status);

    return (
      <ListRow
        elementRef={cardRef}
        state={rule.affectsCurrentGroup ? 'selected' : 'default'}
        flash={isFlashing}
        className="relative flex items-center justify-between gap-4"
      >
        {canOpen && (
          <StretchedButton
            label={opensInRulesTab ? 'Open rule in the Rules tab' : 'Open rule'}
            describedBy={nameId}
            title={
              opensInRulesTab
                ? `Open rule ${rule.name} in the Rules tab`
                : `Open the detail view for ${rule.name}`
            }
            onClick={handleOpen}
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-(--sp-inline)">
            <h3 id={nameId} className="text-sm font-semibold text-neutral-900">
              {rule.name}
            </h3>
            <Badge variant={statusBadge.variant} title={statusBadge.title}>
              {statusBadge.text}
            </Badge>
            {rule.affectsCurrentGroup && (
              <Badge variant="primary" solid>
                Current Group
              </Badge>
            )}
            {missingTargets > 0 && (
              <Badge variant="warning">
                {missingTargets === 1 ? 'Target missing' : `${missingTargets} targets missing`}
              </Badge>
            )}
            {hasConflicts && (
              <Badge variant="warning">
                {rule.conflicts!.length} Conflict{rule.conflicts!.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="truncate text-sm text-neutral-600">{rule.condition}</p>
        </div>
        {canOpen && <Icon type="chevron-right" size="sm" className="shrink-0 text-neutral-400" />}
      </ListRow>
    );
  },
);

RuleCard.displayName = 'RuleCard';

export default RuleCard;
