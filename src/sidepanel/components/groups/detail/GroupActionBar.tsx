import React from 'react';
import { ActionBar, Button, Eyebrow, type ActionDescriptor } from '../../shared';
import type { GroupSummary } from '../../../../shared/types';

export interface GroupActionBarProps {
  group: GroupSummary;
  targetTabId: number | null;
  onExportGroup?: (groupId: string, groupName: string) => void;
  onAddMember: () => void;
  onCompare: () => void;
  onCreateFeedingRule: () => void;
  sticky?: boolean;
}

const GroupActionBar: React.FC<GroupActionBarProps> = ({
  group,
  targetTabId,
  onExportGroup,
  onAddMember,
  onCompare,
  onCreateFeedingRule,
  sticky = true,
}) => {
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
      title: 'Compare this group\u2019s membership with another group',
    },
  ];

  return (
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
  );
};

export default GroupActionBar;
