import React from 'react';
import { ActionBar, type ActionDescriptor } from '../shared';

export interface AppsListActionBarProps {
  search?: React.ReactNode;
  selectedCount: number;
  filteredCount: number;
  allFilteredSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const AppsListActionBar: React.FC<AppsListActionBarProps> = ({
  search,
  selectedCount,
  filteredCount,
  allFilteredSelected,
  onSelectAll,
  onDeselectAll,
}) => {
  const registerActions: ActionDescriptor[] = [
    ...(selectedCount > 0
      ? [
          {
            id: 'deselect-all',
            label: 'Deselect all',
            variant: 'link' as const,
            onClick: onDeselectAll,
            title: 'Clear every selected app, including any picked on another screen',
            priority: 'pinned' as const,
          },
        ]
      : []),
    {
      id: 'select-all',
      label: 'Select all',
      variant: 'link',
      onClick: onSelectAll,
      disabled: filteredCount === 0 || allFilteredSelected,
      title:
        filteredCount === 0
          ? 'No applications match the current search and filters'
          : allFilteredSelected
            ? `All ${filteredCount.toLocaleString()} apps matching the current search and filters are already selected`
            : `Replace the app selection with the ${filteredCount.toLocaleString()} apps matching the current search and filters`,
      priority: 'pinned',
    },
  ];

  return (
    <ActionBar
      ariaLabel="Actions for the applications list"
      actions={[]}
      subRow={search}
      register={{
        ariaLabel: 'Selection actions for the applications list',
        actions: registerActions,
      }}
      testId="apps-list-action-bar"
    />
  );
};

export default AppsListActionBar;
