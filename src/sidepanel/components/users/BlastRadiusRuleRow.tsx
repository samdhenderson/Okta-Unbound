import React, { useId } from 'react';
import {
  Badge,
  Button,
  ClauseLedger,
  ListRow,
  RuleExpressionText,
  type BadgeVariant,
  type GroupNameResolver,
} from '../shared';
import BlastRadiusCascade, { type CascadeGroupBlock } from './BlastRadiusCascade';
import Icon, { type IconType } from '../shared/Icon';
import { unevaluableReasonText } from '../../../shared/rules/unevaluableReasonText';
import { ruleStatusBadge } from '../../../shared/ruleUtils';
import type { RuleEffect, RuleTransition } from '../../../shared/membership/blastRadiusTypes';
import type { OktaUser } from '../../../shared/types';
import type { RuleGroupContext } from '../../../shared/ruleEvaluator';

export interface BlastRadiusRuleRowProps {
  effect: RuleEffect;
  resolveGroupName?: GroupNameResolver;
  cascadeBlocks?: readonly CascadeGroupBlock[];
  expanded?: boolean;
  onToggle?: (ruleId: string) => void;
  drafted?: OktaUser;
  groupContext?: RuleGroupContext;
}

interface TransitionPresentation {
  readonly label: string;
  readonly variant: BadgeVariant;
  readonly icon: IconType | null;
  readonly iconClass: string;
}

const transitionPresentation: Record<RuleTransition, TransitionPresentation> = {
  'starts-matching': {
    label: 'Starts matching',
    variant: 'success',
    icon: 'plus',
    iconClass: 'text-success',
  },
  'stops-matching': {
    label: 'Stops matching',
    variant: 'warning',
    icon: 'minus',
    iconClass: 'text-warning',
  },
  'unchanged-match': {
    label: 'Still matches',
    variant: 'neutral',
    icon: null,
    iconClass: 'text-neutral-500',
  },
  'unchanged-no-match': {
    label: 'Still does not match',
    variant: 'neutral',
    icon: null,
    iconClass: 'text-neutral-500',
  },
  undetermined: {
    label: 'Could not be evaluated',
    variant: 'neutral',
    icon: null,
    iconClass: 'text-neutral-500',
  },
  'unchanged-unevaluable': {
    label: 'Unaffected by this edit',
    variant: 'neutral',
    icon: null,
    iconClass: 'text-neutral-500',
  },
};

const MetaLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <p className="text-xs break-words text-neutral-600">
    <span className="font-medium">{label}: </span>
    {value}
  </p>
);

const BlastRadiusRuleRow: React.FC<BlastRadiusRuleRowProps> = ({
  effect,
  resolveGroupName,
  cascadeBlocks,
  expanded = false,
  onToggle,
  drafted,
  groupContext,
}) => {
  const presentation = transitionPresentation[effect.transition];
  const undeterminedReason =
    effect.transition === 'undetermined'
      ? unevaluableReasonText(effect.afterReason ?? effect.beforeReason)
      : null;
  const broken = effect.status === 'INVALID' ? ruleStatusBadge('INVALID') : null;
  const ledgerUser = drafted;

  const disclosureId = useId();
  const blocks = cascadeBlocks ?? [];
  const discloses = blocks.length > 0 && onToggle !== undefined;
  const triggerLabel =
    blocks.length === 1 ? `Rules that use ${blocks[0].groupName}` : 'Rules that use these groups';

  return (
    <ListRow
      as="li"
      density="compact"
      body={
        discloses ? (
          <div
            id={disclosureId}
            className="disclose"
            data-open={expanded}
            inert={!expanded || undefined}
          >
            <div>
              <div className="border-t border-neutral-200 px-(--sp-row-x) pt-2 pb-3">
                <BlastRadiusCascade groups={blocks} />
              </div>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-(--sp-inline)">
          {presentation.icon && (
            <Icon
              type={presentation.icon}
              size="xs"
              className={`shrink-0 ${presentation.iconClass}`}
            />
          )}
          <span className="min-w-0 text-sm font-semibold break-words text-neutral-900">
            {effect.ruleName}
          </span>
          <Badge variant={presentation.variant}>{presentation.label}</Badge>
          {broken ? (
            <Badge variant={broken.variant} title={broken.title}>
              {broken.text}
            </Badge>
          ) : (
            !effect.active && (
              <Badge
                variant="neutral"
                title="Okta is not applying this rule — it is deactivated — so it places nobody."
              >
                Not in force
              </Badge>
            )
          )}
        </div>

        {effect.targetGroupNames.length > 0 && (
          <MetaLine label="Targets" value={effect.targetGroupNames.join(', ')} />
        )}
        {effect.touchedAttributes.length > 0 && (
          <MetaLine label="Reads" value={effect.touchedAttributes.join(', ')} />
        )}
        {undeterminedReason && !ledgerUser && (
          <p className="text-xs text-neutral-600">{undeterminedReason}</p>
        )}

        {effect.expression !== '' &&
          (ledgerUser ? (
            <ClauseLedger
              expression={effect.expression}
              user={ledgerUser}
              groupContext={groupContext}
              resolveGroupName={resolveGroupName}
            />
          ) : (
            <div className="rounded-md bg-neutral-50 px-2 py-1">
              <RuleExpressionText
                text={effect.expression}
                tone="subdued"
                resolveGroupName={resolveGroupName}
              />
            </div>
          ))}
        {discloses && (
          <Button
            variant="ghost"
            size="xs"
            expanded={expanded}
            controls={disclosureId}
            onClick={() => onToggle?.(effect.ruleId)}
            className="self-start"
          >
            {triggerLabel}
            <Icon
              type="chevron-right"
              size="sm"
              className={`transition-transform duration-(--dur-quick) ${expanded ? 'rotate-90' : ''}`}
            />
          </Button>
        )}
      </div>
    </ListRow>
  );
};

export default BlastRadiusRuleRow;
