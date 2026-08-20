import React from 'react';
import { Badge, ListRow, type BadgeVariant } from '../shared';
import Icon, { type IconType } from '../overview/shared/Icon';
import { unevaluableReasonText } from '../../../shared/rules/unevaluableReasonText';
import type { RuleEffect, RuleTransition } from '../../../shared/membership/blastRadiusTypes';

export interface BlastRadiusRuleRowProps {
  effect: RuleEffect;
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
};

const MetaLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <p className="text-xs break-words text-neutral-600">
    <span className="font-medium">{label}: </span>
    {value}
  </p>
);

const BlastRadiusRuleRow: React.FC<BlastRadiusRuleRowProps> = ({ effect }) => {
  const presentation = transitionPresentation[effect.transition];
  const undeterminedReason =
    effect.transition === 'undetermined'
      ? unevaluableReasonText(effect.afterReason ?? effect.beforeReason)
      : null;

  return (
    <ListRow as="li" density="compact">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
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
          {!effect.active && (
            <Badge variant="neutral" title="This rule is INACTIVE in Okta, so it places nobody.">
              Inactive
            </Badge>
          )}
        </div>

        {effect.targetGroupNames.length > 0 && (
          <MetaLine label="Targets" value={effect.targetGroupNames.join(', ')} />
        )}
        {effect.touchedAttributes.length > 0 && (
          <MetaLine label="Reads" value={effect.touchedAttributes.join(', ')} />
        )}
        {undeterminedReason && <p className="text-xs text-neutral-600">{undeterminedReason}</p>}

        {effect.expression !== '' && (
          <code className="rounded-md bg-neutral-50 px-2 py-1 font-mono text-xs break-words whitespace-pre-wrap text-neutral-700">
            {effect.expression}
          </code>
        )}
      </div>
    </ListRow>
  );
};

export default BlastRadiusRuleRow;
