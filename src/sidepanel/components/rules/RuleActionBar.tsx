import React from 'react';
import { ActionBar, type ActionDescriptor } from '../shared';
import RuleLifecycleActions from './RuleLifecycleActions';
import type { FormattedRule } from '../../../shared/types';

export interface RuleActionBarProps {
  rule: FormattedRule;
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

const RuleActionBar: React.FC<RuleActionBarProps> = ({
  rule,
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
  const actions: ActionDescriptor[] = [
    ...(onPreviewImpact
      ? [
          {
            id: 'preview-impact',
            label: 'Preview impact',
            icon: 'users',
            variant: 'primary',
            onClick: onPreviewImpact,
            title: 'Work out who would stop being attributed to this rule. Writes nothing.',
          } satisfies ActionDescriptor,
        ]
      : []),
  ];

  return (
    <ActionBar
      ariaLabel={`Actions for ${rule.name}`}
      sticky={sticky}
      actions={actions}
      tierOpen={tierOpen}
      onTierOpenChange={onTierOpenChange}
      testId="rule-action-bar"
      expansion={
        <RuleLifecycleActions
          rule={rule}
          isLifecycleLoading={isLifecycleLoading}
          isConfirmingActivate={isConfirmingActivate}
          onRequestActivate={onRequestActivate}
          onCancelActivate={onCancelActivate}
          onConfirmActivate={onConfirmActivate}
          onRequestDeactivate={onRequestDeactivate}
          onAddTargetGroup={onAddTargetGroup}
        />
      }
    />
  );
};

export default RuleActionBar;
