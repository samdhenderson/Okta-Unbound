import React, { useState } from 'react';
import {
  ActionBar,
  AlertMessage,
  Button,
  Eyebrow,
  Modal,
  type ActionDescriptor,
} from '../../shared';
import type { GroupSummary } from '../../../../shared/types';

export interface GroupActionBarProps {
  group: GroupSummary;
  targetTabId: number | null;
  onExportGroup?: (groupId: string, groupName: string) => void;
  onAddMember: () => void;
  onCompare: () => void;
  deprovisionedCount?: number;
  onRemoveDeprovisioned?: () => void;
  isRemoving?: boolean;
  removeError?: string | null;
  onCreateFeedingRule: () => void;
  sticky?: boolean;
}

const GroupActionBar: React.FC<GroupActionBarProps> = ({
  group,
  targetTabId,
  onExportGroup,
  onAddMember,
  onCompare,
  deprovisionedCount,
  onRemoveDeprovisioned,
  isRemoving = false,
  removeError = null,
  onCreateFeedingRule,
  sticky = true,
}) => {
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const canRemoveDeprovisioned =
    onRemoveDeprovisioned !== undefined &&
    group.type !== 'APP_GROUP' &&
    deprovisionedCount !== undefined &&
    deprovisionedCount > 0;
  const actions: ActionDescriptor[] = [
    ...(onExportGroup
      ? [
          {
            id: 'export-members',
            label: 'Export members',
            icon: 'download',
            variant: 'primary',
            onClick: () => onExportGroup(group.id, group.name),
            title:
              "Export this group's members (opens the Export tab with column picker + presets)",
          } satisfies ActionDescriptor,
        ]
      : []),
    {
      id: 'add-member',
      label: 'Add',
      icon: 'plus',
      priority: 'flex',
      onClick: onAddMember,
      disabled: targetTabId === null,
      title: 'Add a member to this group',
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: 'users',
      priority: 'flex',
      onClick: onCompare,
      disabled: targetTabId === null,
      title: 'Compare this group’s membership with another group',
    },
    ...(canRemoveDeprovisioned
      ? [
          {
            id: 'remove-deprovisioned',
            label: `Remove ${deprovisionedCount} deprovisioned`,
            icon: 'trash',
            variant: 'danger',
            priority: 'tier',
            onClick: () => setConfirmingRemove(true),
            disabled: targetTabId === null,
            title: 'Remove every deprovisioned member from this group',
          } satisfies ActionDescriptor,
        ]
      : []),
  ];

  return (
    <>
      <ActionBar
        ariaLabel={`Actions for ${group.name}`}
        sticky={sticky}
        actions={actions}
        expansion={
          <div className="space-y-(--sp-field)">
            <div className="flex items-center justify-between gap-2">
              <Eyebrow>Automated intake</Eyebrow>
              <span className="text-xs text-neutral-600">Asks to confirm</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-(--sp-field)">
              <span className="text-xs text-danger-text">
                Memberships a rule grants outlive the rule
              </span>
              <Button
                variant="secondary"
                size="sm"
                icon="plus"
                onClick={onCreateFeedingRule}
                disabled={targetTabId === null}
                title={
                  targetTabId === null
                    ? 'Connect an Okta tab to create a rule'
                    : 'Create a rule that assigns users to this group'
                }
              >
                Create feeding rule
              </Button>
            </div>
          </div>
        }
      />

      <Modal
        isOpen={confirmingRemove}
        onClose={() => setConfirmingRemove(false)}
        title="Remove deprovisioned members"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmingRemove(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmingRemove(false);
                onRemoveDeprovisioned?.();
              }}
              loading={isRemoving}
              disabled={isRemoving}
            >
              Remove {deprovisionedCount}
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          This will remove <strong>{deprovisionedCount}</strong> deprovisioned member
          {deprovisionedCount === 1 ? '' : 's'} from <strong>{group.name}</strong>. This action
          cannot be undone.
        </p>
        {removeError && (
          <AlertMessage message={{ text: removeError, type: 'danger' }} className="mt-3" />
        )}
      </Modal>
    </>
  );
};

export default GroupActionBar;
