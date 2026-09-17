import React from 'react';
import { ActionBar, type ActionDescriptor } from '../shared';

export interface PoliciesListActionBarProps {
  search?: React.ReactNode;
  selectedCount: number;
  filteredCount: number;
  allFilteredSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const PoliciesListActionBar: React.FC<PoliciesListActionBarProps> = ({
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
            title: 'Clear every selected policy, including any picked on another screen',
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
          ? 'No policies match the current search'
          : allFilteredSelected
            ? `All ${filteredCount.toLocaleString()} policies matching the current search are already selected`
            : `Replace the policy selection with the ${filteredCount.toLocaleString()} policies matching the current search`,
      priority: 'pinned',
    },
  ];

  return (
    <ActionBar
      ariaLabel="Actions for the auth policies list"
      actions={[]}
      subRow={search}
      register={{
        ariaLabel: 'Selection actions for the auth policies list',
        actions: registerActions,
      }}
      testId="policies-list-action-bar"
    />
  );
};

export default PoliciesListActionBar;
