import React from 'react';
import { ActionBar, type ActionDescriptor } from '../../shared';
import type { GroupSummary } from '../../../../shared/types';

export interface GroupActionBarProps {
  group: GroupSummary;
  targetTabId: number | null;
  onExportGroup?: (groupId: string, groupName: string) => void;
  onAddMember: () => void;
  onCompare: () => void;
  sticky?: boolean;
}

const GroupActionBar: React.FC<GroupActionBarProps> = ({
  group,
  targetTabId,
  onExportGroup,
  onAddMember,
  onCompare,
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

  return <ActionBar ariaLabel={`Actions for ${group.name}`} sticky={sticky} actions={actions} />;
};

export default GroupActionBar;
