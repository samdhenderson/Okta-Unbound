import { useState, useMemo, useCallback } from 'react';
import type { GroupSummary } from '../../shared/types';
import {
  filterAndSortGroups,
  computeActiveFilterCount,
  type SortField,
  type PushFilter,
  type RuleFilter,
} from '../components/groups/groupFilters';

interface UseGroupFiltersOptions {
  groups: GroupSummary[];
  searchMode: 'live' | 'cached';
  liveSearchResults: GroupSummary[];
}

export function useGroupFilters({ groups, searchMode, liveSearchResults }: UseGroupFiltersOptions) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sizeFilter, setSizeFilter] = useState<string>('');
  const [pushFilter, setPushFilter] = useState<PushFilter>('');
  const [pushAppFilter, setPushAppFilter] = useState<Set<string>>(new Set());
  const [ruleFilter, setRuleFilter] = useState<RuleFilter>('');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortDesc, setSortDesc] = useState(false);

  const activeFilterCount = computeActiveFilterCount({
    typeFilter,
    sizeFilter,
    pushFilter,
    pushAppFilter,
    ruleFilter,
  });

  const filteredGroups = useMemo(() => {
    if (searchMode === 'live') return liveSearchResults;

    return filterAndSortGroups(groups, {
      searchQuery,
      typeFilter,
      sizeFilter,
      pushFilter,
      pushAppFilter,
      ruleFilter,
      sortBy,
      sortDesc,
    });
  }, [
    searchMode,
    liveSearchResults,
    groups,
    searchQuery,
    typeFilter,
    sizeFilter,
    pushFilter,
    pushAppFilter,
    ruleFilter,
    sortBy,
    sortDesc,
  ]);

  const availablePushApps = useMemo(() => {
    const apps = new Map<string, string>();
    for (const group of groups) {
      if (group.pushMappings) {
        for (const mapping of group.pushMappings) {
          if (!apps.has(mapping.appId)) {
            apps.set(mapping.appId, mapping.appName || mapping.appId);
          }
        }
      }
    }
    return Array.from(apps.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [groups]);

  const clearFilters = useCallback(() => {
    setTypeFilter('');
    setSizeFilter('');
    setPushFilter('');
    setPushAppFilter(new Set());
    setRuleFilter('');
    setSearchQuery('');
  }, []);

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortBy === field) {
        setSortDesc((prev) => !prev);
      } else {
        setSortBy(field);
        setSortDesc(field !== 'name'); // default desc for numeric fields
      }
    },
    [sortBy],
  );

  return {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    sizeFilter,
    setSizeFilter,
    pushFilter,
    setPushFilter,
    pushAppFilter,
    setPushAppFilter,
    ruleFilter,
    setRuleFilter,
    sortBy,
    sortDesc,
    filteredGroups,
    activeFilterCount,
    availablePushApps,
    clearFilters,
    toggleSort,
  };
}
