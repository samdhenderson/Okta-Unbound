import React from 'react';
import { FilterPill, Input, SortPill } from '../shared';
import Icon from '../shared/Icon';
import type { AppGroupsFilter, AppSortField, AppStatusFilter } from './appFilters';

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

export interface AppsToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  statusFilter: AppStatusFilter;
  onStatusFilterChange: (value: AppStatusFilter) => void;
  groupsFilter: AppGroupsFilter;
  onGroupsFilterChange: (value: AppGroupsFilter) => void;
  sortBy: AppSortField;
  sortDesc: boolean;
  onToggleSort: (field: AppSortField) => void;
  resultCount: number;
  totalCount: number;
}

const AppsToolbar: React.FC<AppsToolbarProps> = ({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  groupsFilter,
  onGroupsFilterChange,
  sortBy,
  sortDesc,
  onToggleSort,
  resultCount,
  totalCount,
}) => (
  <div className="space-y-(--sp-field)">
    <Input
      type="search"
      value={searchQuery}
      onChange={onSearchQueryChange}
      ariaLabel="Search applications"
      placeholder="Search..."
      icon={<Icon type="search" size="md" />}
    />

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

      <span className="ml-auto text-xs text-neutral-500">
        Showing {resultCount.toLocaleString()} of {totalCount.toLocaleString()}
      </span>
    </div>
  </div>
);

export default AppsToolbar;
