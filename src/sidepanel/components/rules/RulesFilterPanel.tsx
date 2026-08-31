import React from 'react';
import FilterPill from '../shared/FilterPill';
import Select from '../shared/Select';
import { RULE_SORT_LABELS, type RuleSortMode } from '../../../shared/rules/similarity';

export type RulesFilterType = 'all' | 'active' | 'paused' | 'conflicts' | 'current-group';

const SORT_OPTIONS: RuleSortMode[] = ['default', 'similarity', 'name'];

export const countActiveRuleFilters = (
  activeFilter: RulesFilterType,
  sortMode: RuleSortMode,
): number => (activeFilter !== 'all' ? 1 : 0) + (sortMode !== 'default' ? 1 : 0);

interface RulesFilterPanelProps {
  activeFilter: RulesFilterType;
  onFilterChange: (filter: RulesFilterType) => void;
  conflictsCount: number;
  showCurrentGroup: boolean;
  sortMode: RuleSortMode;
  onSortChange: (mode: RuleSortMode) => void;
}

const RulesFilterPanel: React.FC<RulesFilterPanelProps> = ({
  activeFilter,
  onFilterChange,
  conflictsCount,
  showCurrentGroup,
  sortMode,
  onSortChange,
}) => (
  <div className="animate-rise-in space-y-(--sp-field) rounded-md border border-neutral-200 bg-white p-(--sp-card)">
    <div className="flex flex-wrap items-center justify-between gap-(--sp-field)">
      <div className="flex flex-wrap gap-(--sp-inline)">
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

export default RulesFilterPanel;
