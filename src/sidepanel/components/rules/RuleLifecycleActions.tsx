import React from 'react';
import { Button, Eyebrow, Modal } from '../shared';
import type { FormattedRule } from '../../../shared/types';

export interface RuleLifecycleActionsProps {
  rule: FormattedRule;
  isLifecycleLoading?: boolean;
  isConfirmingActivate: boolean;
  onRequestActivate: () => void;
  onCancelActivate: () => void;
  onConfirmActivate: () => void;
  onRequestDeactivate: () => void;
  onAddTargetGroup?: () => void;
}

const targetPhrase = (rule: FormattedRule): string => {
  const n = rule.groupIds.length;
  if (n === 0) return 'no groups';
  return n === 1 ? '1 group' : `${n} groups`;
};

const RuleLifecycleActions: React.FC<RuleLifecycleActionsProps> = ({
  rule,
  isLifecycleLoading = false,
  isConfirmingActivate,
  onRequestActivate,
  onCancelActivate,
  onConfirmActivate,
  onRequestDeactivate,
  onAddTargetGroup,
}) => {
  const isActive = rule.status === 'ACTIVE';

  return (
    <>
      <div className="space-y-(--sp-field)">
        <div className="flex items-center justify-between gap-2">
          <Eyebrow>Rule state</Eyebrow>
          <span className="text-xs text-neutral-600">Each asks to confirm</span>
        </div>

        {onAddTargetGroup && (
          <div className="flex flex-wrap items-center justify-between gap-(--sp-field)">
            <span className="text-xs text-neutral-600">
              Creates a replacement rule and retires this one
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon="plus"
              disabled={isLifecycleLoading}
              onClick={onAddTargetGroup}
            >
              Add target group
            </Button>
          </div>
        )}

        {onAddTargetGroup && <div className="h-px bg-neutral-200" />}

        <div className="flex flex-wrap items-center justify-between gap-(--sp-field)">
          <span className="text-xs text-danger-text">
            {isActive
              ? 'Stops adding members. Everyone it already added stays where they are.'
              : `Adds every matching user to ${targetPhrase(rule)}. Pausing it again removes nobody.`}
          </span>
          {isActive ? (
            <Button
              variant="danger"
              size="sm"
              icon="pause"
              disabled={isLifecycleLoading}
              onClick={onRequestDeactivate}
            >
              Deactivate rule
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon="bolt"
              disabled={isLifecycleLoading}
              onClick={onRequestActivate}
            >
              Activate rule
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={isConfirmingActivate}
        onClose={onCancelActivate}
        title="Activate rule"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={onCancelActivate}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={onConfirmActivate}>
              Activate
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-700">
          <span className="font-semibold">{rule.name}</span> will start adding every user its
          condition matches to {targetPhrase(rule)}.
        </p>
        <p className="mt-2 text-sm text-neutral-700">
          Pausing the rule afterwards does <span className="font-semibold">not</span> remove anyone
          it added — Okta&rsquo;s rule engine only ever adds members. Those people stay in the
          groups, no longer attributed to any rule.
        </p>
      </Modal>
    </>
  );
};

export default RuleLifecycleActions;
