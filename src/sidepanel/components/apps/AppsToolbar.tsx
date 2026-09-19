import React from 'react';
import { Input } from '../shared';
import FilterToggle from '../shared/FilterToggle';
import Icon from '../shared/Icon';

export interface AppsToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
}

const AppsToolbar: React.FC<AppsToolbarProps> = ({
  searchQuery,
  onSearchQueryChange,
  filtersOpen,
  onToggleFilters,
  activeFilterCount,
}) => (
  <div className="flex gap-2">
    <div className="min-w-0 flex-1">
      <Input
        type="search"
        value={searchQuery}
        onChange={onSearchQueryChange}
        ariaLabel="Search applications"
        placeholder="Search..."
        size="lg"
        icon={<Icon type="search" size="md" />}
      />
    </div>
    <FilterToggle
      open={filtersOpen}
      activeCount={activeFilterCount}
      onToggle={onToggleFilters}
      size="lg"
    />
  </div>
);

export default AppsToolbar;
