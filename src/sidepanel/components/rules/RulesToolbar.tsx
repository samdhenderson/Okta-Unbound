import React from 'react';
import FilterPill from '../shared/FilterPill';
import Select from '../shared/Select';
import Input from '../shared/Input';
import Icon from '../shared/Icon';
import { RULE_SORT_LABELS, type RuleSortMode } from '../../../shared/rules/similarity';

export type RulesFilterType = 'all' | 'active' | 'paused' | 'conflicts' | 'current-group';

const SORT_OPTIONS: RuleSortMode[] = ['default', 'similarity', 'name'];

interface RulesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: RulesFilterType;
  onFilterChange: (filter: RulesFilterType) => void;
  conflictsCount: number;
  showCurrentGroup: boolean;
  sortMode: RuleSortMode;
  onSortChange: (mode: RuleSortMode) => void;
}

const RulesToolbar: React.FC<RulesToolbarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  conflictsCount,
  showCurrentGroup,
  sortMode,
  onSortChange,
}) => (
  <div className="space-y-3">
    <Input
      type="search"
      value={searchQuery}
      onChange={onSearchChange}
      placeholder="Search rules by name, condition, or attributes..."
      icon={<Icon type="search" size="sm" />}
    />

    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        <FilterPill active={activeFilter === 'all'} onClick={() => onFilterChange('all')}>
          All Rules
        </FilterPill>
        <FilterPill active={activeFilter === 'active'} onClick={() => onFilterChange('active')}>
          Active Only
        </FilterPill>
        <FilterPill active={activeFilter === 'paused'} onClick={() => onFilterChange('paused')}>
          Paused
        </FilterPill>
        <FilterPill
          active={activeFilter === 'conflicts'}
          onClick={() => onFilterChange('conflicts')}
          disabled={conflictsCount === 0}
        >
          Conflicts ({conflictsCount})
        </FilterPill>
        {showCurrentGroup && (
          <FilterPill
            active={activeFilter === 'current-group'}
            onClick={() => onFilterChange('current-group')}
          >
            Current Group
          </FilterPill>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-neutral-500">Sort</span>
        <Select
          value={sortMode}
          onChange={(value) => onSortChange(value as RuleSortMode)}
          options={SORT_OPTIONS.map((mode) => ({ value: mode, label: RULE_SORT_LABELS[mode] }))}
          fullWidth={false}
          ariaLabel="Sort rules"
        />
      </div>
    </div>
  </div>
);

export default RulesToolbar;
