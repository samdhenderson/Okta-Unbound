import type { GroupSummary } from '../../../shared/types';
import { parseRegexQuery } from '../../../shared/utils/regexQuery';

export { parseRegexQuery } from '../../../shared/utils/regexQuery';

export type SortField = 'name' | 'memberCount' | 'lastUpdated' | 'lastMembershipUpdated';
export type PushFilter = '' | 'pushed' | 'not_pushed';
export type RuleFilter = '' | 'ruled' | 'unruled';

export interface GroupFilterState {
  searchQuery: string;
  typeFilter: string;
  sizeFilter: string;
  pushFilter: PushFilter;
  pushAppFilter: Set<string>;
  ruleFilter: RuleFilter;
  sortBy: SortField;
  sortDesc: boolean;
}

export function matchesSearchQuery(group: GroupSummary, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const regex = parseRegexQuery(trimmed);
  if (regex) {
    return (
      regex.test(group.name) ||
      (group.description ? regex.test(group.description) : false) ||
      regex.test(group.id)
    );
  }

  const q = trimmed.toLowerCase();
  return (
    group.name.toLowerCase().includes(q) ||
    (group.description?.toLowerCase().includes(q) ?? false) ||
    group.id.toLowerCase().includes(q)
  );
}

export function matchesSizeFilter(memberCount: number, sizeFilter: string): boolean {
  switch (sizeFilter) {
    case 'empty':
      return memberCount === 0;
    case 'small':
      return memberCount > 0 && memberCount < 50;
    case 'medium':
      return memberCount >= 50 && memberCount < 200;
    case 'large':
      return memberCount >= 200 && memberCount < 1000;
    case 'xlarge':
      return memberCount >= 1000;
    default:
      return true;
  }
}

export function compareGroupsBy(a: GroupSummary, b: GroupSummary, sortBy: SortField): number {
  switch (sortBy) {
    case 'name':
      return a.name.localeCompare(b.name);
    case 'memberCount':
      return a.memberCount - b.memberCount;
    case 'lastUpdated':
      if (!a.lastUpdated) return 1;
      if (!b.lastUpdated) return -1;
      return a.lastUpdated.getTime() - b.lastUpdated.getTime();
    case 'lastMembershipUpdated':
      if (!a.lastMembershipUpdated) return 1;
      if (!b.lastMembershipUpdated) return -1;
      return a.lastMembershipUpdated.getTime() - b.lastMembershipUpdated.getTime();
    default:
      return 0;
  }
}

export function filterAndSortGroups(
  groups: GroupSummary[],
  state: GroupFilterState,
): GroupSummary[] {
  let filtered = [...groups];

  if (state.searchQuery.trim()) {
    filtered = filtered.filter((g) => matchesSearchQuery(g, state.searchQuery));
  }

  if (state.typeFilter) {
    filtered = filtered.filter((g) => g.type === state.typeFilter);
  }

  if (state.sizeFilter) {
    filtered = filtered.filter((g) => matchesSizeFilter(g.memberCount, state.sizeFilter));
  }

  if (state.pushFilter) {
    filtered = filtered.filter((g) => {
      const hasPush = g.pushMappings && g.pushMappings.length > 0;
      return state.pushFilter === 'pushed' ? hasPush : !hasPush;
    });
  }

  if (state.pushAppFilter.size > 0) {
    filtered = filtered.filter((g) => {
      if (!g.pushMappings || g.pushMappings.length === 0) return false;
      return g.pushMappings.some((m) => state.pushAppFilter.has(m.appId));
    });
  }

  if (state.ruleFilter) {
    filtered = filtered.filter((g) => (state.ruleFilter === 'ruled' ? g.hasRules : !g.hasRules));
  }

  filtered.sort((a, b) => {
    const cmp = compareGroupsBy(a, b, state.sortBy);
    return state.sortDesc ? -cmp : cmp;
  });

  return filtered;
}

export function computeActiveFilterCount(
  state: Pick<
    GroupFilterState,
    'typeFilter' | 'sizeFilter' | 'pushFilter' | 'pushAppFilter' | 'ruleFilter'
  >,
): number {
  return (
    [state.typeFilter, state.sizeFilter, state.pushFilter, state.ruleFilter].filter(Boolean)
      .length + (state.pushAppFilter.size > 0 ? 1 : 0)
  );
}
