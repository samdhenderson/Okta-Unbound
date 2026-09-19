import React from 'react';
import { FilterPill, SortPill } from '../shared';
import {
  computeActiveAppFilterCount,
  type AppFilterState,
  type AppGroupsFilter,
  type AppSortField,
  type AppStatusFilter,
} from './appFilters';

const STATUS_OPTIONS: ReadonlyArray<{ value: AppStatusFilter; label: string }> = [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const GROUPS_OPTIONS: ReadonlyArray<{ value: AppGroupsFilter; label: string }> = [
  { value: '', label: 'All' },
  { value: 'no-groups', label: 'Pushes nothing' },
];

const SORT_OPTIONS: ReadonlyArray<{ field: AppSortField; label: string }> = [
  { field: 'label', label: 'Name' },
  { field: 'status', label: 'Status' },
  { field: 'created', label: 'Created' },
];

export const countDisclosedAppAxes = (
  state: Pick<AppFilterState, 'statusFilter' | 'groupsFilter' | 'sortBy' | 'sortDesc'>,
): number =>
  computeActiveAppFilterCount(state) + (state.sortBy !== 'label' || state.sortDesc ? 1 : 0);

export interface AppsFilterPanelProps {
  statusFilter: AppStatusFilter;
  onStatusFilterChange: (value: AppStatusFilter) => void;
  groupsFilter: AppGroupsFilter;
  onGroupsFilterChange: (value: AppGroupsFilter) => void;
  sortBy: AppSortField;
  sortDesc: boolean;
  onToggleSort: (field: AppSortField) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
}

const AppsFilterPanel: React.FC<AppsFilterPanelProps> = ({
  statusFilter,
  onStatusFilterChange,
  groupsFilter,
  onGroupsFilterChange,
  sortBy,
  sortDesc,
  onToggleSort,
  activeFilterCount,
  onClearFilters,
}) => (
  <div className="animate-rise-in space-y-(--sp-field) rounded-md border border-neutral-200 bg-white p-(--sp-card)">
    {activeFilterCount > 0 && (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClearFilters}
          className="press text-xs text-primary-text hover:underline"
        >
          Clear all
        </button>
      </div>
    )}

    <div className="flex flex-wrap items-center gap-(--sp-field)">
      <div
        className="flex items-center gap-(--sp-inline)"
        role="group"
        aria-label="Filter by status"
      >
        <span className="text-xs font-medium text-neutral-600">Status</span>
        {STATUS_OPTIONS.map((option) => (
          <FilterPill
            key={option.value || 'all'}
            active={statusFilter === option.value}
            onClick={() => onStatusFilterChange(option.value)}
          >
            {option.label}
          </FilterPill>
        ))}
      </div>

      <div
        className="flex items-center gap-(--sp-inline)"
        role="group"
        aria-label="Filter by group push"
      >
        <span className="text-xs font-medium text-neutral-600">Group push</span>
        {GROUPS_OPTIONS.map((option) => (
          <FilterPill
            key={option.value || 'all'}
            active={groupsFilter === option.value}
            onClick={() => onGroupsFilterChange(option.value)}
          >
            {option.label}
          </FilterPill>
        ))}
      </div>

      <div
        className="flex items-center gap-(--sp-inline)"
        role="group"
        aria-label="Sort applications"
      >
        <span className="text-xs font-medium text-neutral-600">Sort</span>
        {SORT_OPTIONS.map((option) => (
          <SortPill
            key={option.field}
            field={option.field}
            label={option.label}
            activeField={sortBy}
            descending={sortDesc}
            onToggle={onToggleSort}
          />
        ))}
      </div>
    </div>
  </div>
);

export default AppsFilterPanel;
