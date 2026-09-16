import { useCallback, useMemo, useState } from 'react';
import type { MemberMfaResult, OktaUser } from '../../../shared/types';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useMemberFilters, type MemberFiltersApi } from '../../hooks/useMemberFilters';
import type { MemberSourceContext } from './memberSourceContext';
import { type MemberFilter, type SortField, filterMembers, sortMembers } from './memberAnalytics';

const QUERY_DEBOUNCE_MS = 200;

const NO_MEMBERS: OktaUser[] = [];

export interface UseMemberCohortOptions {
  members: OktaUser[] | null;
  mfaResults: Map<string, MemberMfaResult> | null;
  memberSource?: MemberSourceContext;
  pendingFilter?: MemberFilter | null;
  enabled?: boolean;
}

export interface MemberCohort {
  query: string;
  setQuery: (value: string) => void;
  debouncedQuery: string;
  filters: MemberFiltersApi;
  sortBy: SortField;
  sortDesc: boolean;
  toggleSort: (field: SortField) => void;
  filtered: OktaUser[];
  sorted: OktaUser[];
  resetKey: string;
}

export function useMemberCohort(options: UseMemberCohortOptions): MemberCohort {
  const { members, mfaResults, memberSource, pendingFilter, enabled = true } = options;

  const [query, setQuery] = useState('');
  const filters = useMemberFilters({ pendingFilter });
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortDesc, setSortDesc] = useState(false);

  const debouncedQuery = useDebouncedValue(query, QUERY_DEBOUNCE_MS);

  const sourceBuckets = useMemo(() => {
    if (!memberSource) return null;
    const named = new Set(memberSource.segments.map((segment) => segment.key));
    const merged = new Map<string, ReadonlySet<string>>(memberSource.index.userIdsByBucket);
    const tail = new Set<string>();
    for (const [key, userIds] of memberSource.index.userIdsByBucket) {
      if (key.startsWith('rule:') && !named.has(key)) {
        for (const userId of userIds) tail.add(userId);
      }
    }
    if (tail.size > 0) merged.set('otherRules', tail);
    return merged;
  }, [memberSource]);

  const activeFilters = filters.filters;

  const filtered = useMemo(
    () =>
      enabled && members
        ? filterMembers(members, debouncedQuery, activeFilters, mfaResults, sourceBuckets)
        : NO_MEMBERS,
    [enabled, members, debouncedQuery, activeFilters, mfaResults, sourceBuckets],
  );

  const sorted = useMemo(
    () => (enabled ? sortMembers(filtered, sortBy, sortDesc, mfaResults) : NO_MEMBERS),
    [enabled, filtered, sortBy, sortDesc, mfaResults],
  );

  const toggleSort = useCallback((field: SortField) => {
    setSortBy((prevField) => {
      if (prevField === field) {
        setSortDesc((descending) => !descending);
        return prevField;
      }
      setSortDesc(false);
      return field;
    });
  }, []);

  const resetKey = `${debouncedQuery}__${filters.key}__${members?.length ?? 0}__${sortBy}__${sortDesc}`;

  return {
    query,
    setQuery,
    debouncedQuery,
    filters,
    sortBy,
    sortDesc,
    toggleSort,
    filtered,
    sorted,
    resetKey,
  };
}
