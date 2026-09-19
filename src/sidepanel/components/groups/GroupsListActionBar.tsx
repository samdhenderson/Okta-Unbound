import React from 'react';
import { ActionBar, type ActionDescriptor } from '../shared';

interface GroupsListActionBarProps {
  search?: React.ReactNode;
  selectedCount: number;
  filteredCount: number;
  onCompare: () => void;
  onExportSelection: () => void;
  onExportGroupsList: () => void;
}

const GroupsListActionBar: React.FC<GroupsListActionBarProps> = ({
  search,
  selectedCount,
  filteredCount,
  onCompare,
  onExportSelection,
  onExportGroupsList,
}) => {
  const actions: ActionDescriptor[] = [
    {
      id: 'export-list',
      label: 'Export list',
      icon: 'download',
      variant: 'primary',
      onClick: onExportGroupsList,
      disabled: filteredCount === 0,
      title:
        filteredCount === 0
          ? 'No groups match the current filter, so there is nothing to export'
          : 'Export the current groups list as CSV',
    },
  ];

  const registerActions: ActionDescriptor[] = [
    ...(selectedCount >= 2 && selectedCount <= 5
      ? [
          {
            id: 'compare',
            label: 'Compare',
            icon: 'chart' as const,
            onClick: onCompare,
            title: `Compare the ${selectedCount} selected groups`,
          },
        ]
      : []),

    ...(selectedCount > 0
      ? [
          {
            id: 'export-selection',
            label: 'Export',
            icon: 'download' as const,
            onClick: onExportSelection,
            title: `Export the ${selectedCount} selected ${selectedCount === 1 ? 'group' : 'groups'}`,
            priority: 'tier' as const,
          },
        ]
      : []),
  ];

  return (
    <ActionBar
      ariaLabel="Actions for the groups list"
      actions={actions}
      subRow={search}
      register={{ ariaLabel: 'Selection actions for the groups list', actions: registerActions }}
      testId="groups-list-action-bar"
    />
  );
};

export default GroupsListActionBar;
