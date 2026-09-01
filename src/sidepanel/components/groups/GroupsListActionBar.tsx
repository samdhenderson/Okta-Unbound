import React from 'react';
import { ActionBar, type ActionDescriptor } from '../shared';

export type ActivePanel = 'none' | 'bulk' | 'crossSearch' | 'collections' | 'cleanup';

interface GroupsListActionBarProps {
  search?: React.ReactNode;
  selectedCount: number;
  filteredCount: number;
  activePanel: ActivePanel;
  crossSearchBadge: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCompare: () => void;
  onMerge: () => void;
  onTogglePanel: (panel: ActivePanel) => void;
  onExportSelection: () => void;
  onExportGroupsList: () => void;
}

const GroupsListActionBar: React.FC<GroupsListActionBarProps> = ({
  search,
  selectedCount,
  filteredCount,
  activePanel,
  crossSearchBadge,
  onSelectAll,
  onDeselectAll,
  onCompare,
  onMerge,
  onTogglePanel,
  onExportSelection,
  onExportGroupsList,
}) => {
  const panelAction = (
    panel: Exclude<ActivePanel, 'none'>,
    closedLabel: string,
    openLabel: string,
    icon: ActionDescriptor['icon'],
    restingPriority: ActionDescriptor['priority'] = 'flex',
  ): ActionDescriptor => {
    const open = activePanel === panel;
    return {
      id: panel,
      label: open ? openLabel : closedLabel,
      icon,
      onClick: () => onTogglePanel(panel),
      priority: open ? 'pinned' : restingPriority,
    };
  };

  const actions: ActionDescriptor[] = [
    ...(selectedCount > 0
      ? [
          {
            id: 'deselect-all',
            label: 'Deselect all',
            onClick: onDeselectAll,
            priority: 'pinned' as const,
          },
        ]
      : []),
    {
      id: 'select-all',
      label: `Select all (${filteredCount})`,
      onClick: onSelectAll,
      disabled: filteredCount === 0 || selectedCount === filteredCount,
      title: 'Select every group the current filter matches',
      priority: 'pinned' as const,
    },
    ...(selectedCount >= 2 && selectedCount <= 5
      ? [
          {
            id: 'compare',
            label: `Compare (${selectedCount})`,
            icon: 'chart' as const,
            onClick: onCompare,
          },
        ]
      : []),
    ...(selectedCount > 0
      ? [
          {
            id: 'export-selection',
            label: `Export (${selectedCount})`,
            icon: 'download' as const,
            onClick: onExportSelection,
          },
        ]
      : []),
    panelAction(
      'crossSearch',
      crossSearchBadge > 0 ? `Cross-search (${crossSearchBadge})` : 'Cross-search',
      'Hide cross-search',
      'search',
    ),
    panelAction('collections', 'Collections', 'Hide collections', 'clipboard'),
    {
      id: 'export-list',
      label: 'Export list',
      icon: 'download',
      variant: 'primary',
      onClick: onExportGroupsList,
      disabled: filteredCount === 0,
      title: 'Export the current groups list as CSV',
    },

    ...(selectedCount >= 2
      ? [
          {
            id: 'merge',
            label: `Merge (${selectedCount})`,
            icon: 'link' as const,
            onClick: onMerge,
            priority: 'tier' as const,
            title: 'Copies members into one survivor and empties the others',
          },
        ]
      : []),
    ...(selectedCount > 0
      ? [panelAction('bulk', 'Bulk actions', 'Hide bulk actions', 'list', 'tier')]
      : []),
    panelAction('cleanup', 'Cleanup', 'Hide cleanup', 'sparkles', 'tier'),
  ];

  return (
    <ActionBar
      ariaLabel="Actions for the groups list"
      actions={actions}
      subRow={search}
      testId="groups-list-action-bar"
    />
  );
};

export default GroupsListActionBar;
