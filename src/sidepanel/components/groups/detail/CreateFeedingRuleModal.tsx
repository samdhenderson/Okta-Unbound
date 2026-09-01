import React from 'react';
import { AlertMessage, Button, Input, Modal, Textarea } from '../../shared';

export interface CreateFeedingRuleModalProps {
  isOpen: boolean;
  groupName: string;
  name: string;
  onNameChange: (value: string) => void;
  nameError: string | null;
  expression: string;
  onExpressionChange: (value: string) => void;
  expressionNotice: string | null;
  canSubmit: boolean;
  isCreating: boolean;
  error: string | null;
  createdRuleName: string | null;
  createdRuleId: string | null;
  onClose: () => void;
  onConfirm: () => void;
  onNavigateToRule?: (ruleId: string) => void;
}

const CreateFeedingRuleModal: React.FC<CreateFeedingRuleModalProps> = ({
  isOpen,
  groupName,
  name,
  onNameChange,
  nameError,
  expression,
  onExpressionChange,
  expressionNotice,
  canSubmit,
  isCreating,
  error,
  createdRuleName,
  createdRuleId,
  onClose,
  onConfirm,
  onNavigateToRule,
}) => {
  const created = createdRuleName !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={created ? 'Rule created' : `Create a rule that feeds ${groupName}`}
      size="md"
      footer={
        created ? (
          <div className="flex justify-end gap-2">
            {createdRuleId && onNavigateToRule && (
              <Button
                variant="secondary"
                size="sm"
                icon="external-link"
                onClick={() => onNavigateToRule(createdRuleId)}
              >
                Open in Rules tab
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirm}
              disabled={!canSubmit}
              loading={isCreating}
            >
              Create rule
            </Button>
          </div>
        )
      }
    >
      {created ? (
        <div className="space-y-(--sp-field)">
          <p className="text-sm text-neutral-700">
            <strong className="text-neutral-900">{createdRuleName}</strong> now targets{' '}
            <strong className="text-neutral-900">{groupName}</strong>, and it is{' '}
            <strong className="text-neutral-900">inactive</strong>. Nobody has been added.
          </p>
          <p className="text-xs text-neutral-600">
            Activating it is what starts the grants — and what cannot be undone by deactivating it
            again.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="Rule name"
            value={name}
            onChange={onNameChange}
            placeholder="Engineering intake"
            {...(nameError ? { error: nameError } : { hint: 'Must be unique across the org.' })}
          />

          <Textarea
            label="Match expression"
            value={expression}
            onChange={onExpressionChange}
            rows={3}
            placeholder={'user.department == "Engineering"'}
            hint="Okta Expression Language, evaluated against each user's profile."
          />

          {expressionNotice && (
            <AlertMessage message={{ text: expressionNotice, type: 'warning' }} />
          )}

          <div className="space-y-(--sp-field) rounded-md border border-neutral-200 p-(--sp-card)">
            <p className="text-xs text-danger-text">
              A rule grants memberships as it matches, and deleting it later does not take those
              memberships back. Removing them is a separate job, one member at a time.
            </p>
            <p className="text-xs text-neutral-600">
              Okta creates the rule <strong className="text-neutral-900">inactive</strong>, so
              nobody is added until you activate it.
            </p>
            <p className="text-xs text-neutral-600">
              How many people this would add to {groupName} is{' '}
              <strong className="text-neutral-900">not predicted here</strong>: this panel has not
              evaluated the expression against your org&rsquo;s users. Okta decides who matches,
              applies rules asynchronously, and honours exclusions this panel cannot see.
            </p>
          </div>

          {error && <AlertMessage message={{ text: error, type: 'danger' }} />}
        </div>
      )}
    </Modal>
  );
};

export default CreateFeedingRuleModal;
