import React from 'react';
import Input from '../shared/Input';
import Icon from '../shared/Icon';
import FilterToggle from '../shared/FilterToggle';

interface RulesSearchRowProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
}

const RulesSearchRow: React.FC<RulesSearchRowProps> = ({
  searchQuery,
  onSearchChange,
  filtersOpen,
  onToggleFilters,
  activeFilterCount,
}) => (
  <div className="flex gap-2">
    <div className="min-w-0 flex-1">
      <Input
        type="search"
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search rules by name, condition, or attributes..."
        size="lg"
        icon={<Icon type="search" size="md" />}
      />
    </div>
    <FilterToggle
      open={filtersOpen}
      activeCount={activeFilterCount}
      onToggle={onToggleFilters}
      size="lg"
      title="Filter and sort the rules list"
    />
  </div>
);

export default RulesSearchRow;
