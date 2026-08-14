import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserSearch } from './useUserSearch';
import { useUserMemberships } from './useUserMemberships';
import { useComparisonApps } from './useComparisonApps';
import { useGroupCopy } from './useGroupCopy';
import { userDisplayName } from '../../shared/utils/userDisplay';
import {
  jaccard,
  bucketGroups,
  bucketApps,
  type TabKey,
} from '../components/users/comparison/comparisonAnalytics';
import { classifyAccessCauses } from '../components/users/comparison/accessCause';
import { loadCachedGroupNames } from './fetchGroupRulesRequest';
import type { OktaUser, GroupMembership } from '../../shared/types';

export interface UseUserComparisonOptions {
  isActive: boolean;
  searchEnabled?: boolean;
  contextUser: OktaUser;
  contextGroups: GroupMembership[];
  targetTabId: number;
  onGroupsChanged: () => void;
}

export function useUserComparison({
  isActive,
  searchEnabled,
  contextUser,
  contextGroups,
  targetTabId,
  onGroupsChanged,
}: UseUserComparisonOptions) {
  const { searchQuery, setSearchQuery, searchResults, isSearching, clearSearch } = useUserSearch({
    targetTabId,
    enabled: searchEnabled ?? isActive,
  });

  const {
    memberships: comparedGroups,
    isLoading: isLoadingGroups,
    error: groupsError,
    rules: ruleInventory,
    loadMemberships,
    clearMemberships,
  } = useUserMemberships({ targetTabId });

  const [comparedUser, setComparedUser] = useState<OktaUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const { contextApps, comparedApps, isLoadingApps, appsIncomplete, resetApps } = useComparisonApps(
    {
      targetTabId,
      contextUserId: contextUser.id,
      comparedUser,
    },
  );

  const onComparedGroupsChanged = useCallback(() => {
    if (comparedUser) void loadMemberships(comparedUser, { force: true });
  }, [comparedUser, loadMemberships]);

  const {
    addedToContextIds,
    addedToComparedIds,
    addingGroupId,
    addError,
    setAddError,
    addToContext,
    addToCompared,
    resetCopyState,
    resetForChangeUser,
  } = useGroupCopy({
    targetTabId,
    contextUser,
    comparedUser,
    onContextGroupsChanged: onGroupsChanged,
    onComparedGroupsChanged,
  });

  useEffect(() => {
    if (!isActive) {
      setComparedUser(null);
      resetApps();
      resetCopyState();
      setActiveTab('overview');
      clearSearch();
      clearMemberships();
    }
  }, [isActive, resetApps, resetCopyState, clearSearch, clearMemberships]);

  useEffect(() => {
    if (comparedUser) loadMemberships(comparedUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparedUser]);

  const selectUser = useCallback((user: OktaUser) => {
    setComparedUser(user);
    setActiveTab('overview');
  }, []);

  const changeUser = useCallback(() => {
    setComparedUser(null);
    resetApps();
    resetForChangeUser();
    setActiveTab('overview');
    clearMemberships();
    clearSearch();
  }, [resetApps, resetForChangeUser, clearMemberships, clearSearch]);

  const groupBuckets = useMemo(
    () => bucketGroups(contextGroups, comparedGroups, addedToContextIds, addedToComparedIds),
    [contextGroups, comparedGroups, addedToContextIds, addedToComparedIds],
  );

  const appBuckets = useMemo(
    () => bucketApps(contextApps, comparedApps),
    [contextApps, comparedApps],
  );

  const causes = useMemo(() => {
    if (ruleInventory.status === 'unresolved') return undefined;
    return classifyAccessCauses({
      onlyCompared: groupBuckets.onlyCompared,
      contextUser,
      rules: ruleInventory.status === 'available' ? ruleInventory.rules : null,
      contextGroups,
    });
  }, [groupBuckets.onlyCompared, contextUser, contextGroups, ruleInventory]);

  const [cachedGroupNames, setCachedGroupNames] = useState<ReadonlyMap<string, string>>(
    () => new Map(),
  );

  useEffect(() => {
    if (!isActive) return;
    let cancelled = false;
    void loadCachedGroupNames().then((names) => {
      if (!cancelled) setCachedGroupNames(names);
    });
    return () => {
      cancelled = true;
    };
  }, [isActive]);

  const resolveGroupName = useMemo(() => {
    const byId = new Map(cachedGroupNames);
    for (const membership of [...contextGroups, ...comparedGroups]) {
      byId.set(membership.group.id, membership.group.profile.name);
    }
    return (groupId: string): string | undefined => byId.get(groupId);
  }, [cachedGroupNames, contextGroups, comparedGroups]);

  const groupDiffCount = groupBuckets.onlyCompared.length + groupBuckets.onlyContext.length;
  const appDiffCount = appBuckets.onlyCompared.length + appBuckets.onlyContext.length;

  const groupSimilarity = jaccard(
    groupBuckets.shared.length,
    groupBuckets.shared.length + groupBuckets.onlyCompared.length + groupBuckets.onlyContext.length,
  );
  const appSimilarity = appsIncomplete
    ? null
    : jaccard(
        appBuckets.shared.length,
        appBuckets.shared.length + appBuckets.onlyCompared.length + appBuckets.onlyContext.length,
      );

  const overallSimilarity = !comparedUser
    ? 0
    : appSimilarity === null
      ? groupSimilarity
      : Math.round((groupSimilarity + appSimilarity) / 2);
  const similarityScope: 'both' | 'groups-only' = appSimilarity === null ? 'groups-only' : 'both';

  const isLoading = isLoadingGroups || isLoadingApps;
  const loadError = groupsError;

  const contextName = userDisplayName(contextUser);
  const comparedName = comparedUser ? userDisplayName(comparedUser) : '';

  return {
    comparedUser,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    activeTab,
    setActiveTab,
    groupBuckets,
    appBuckets,
    causes,
    groupDiffCount,
    appDiffCount,
    groupSimilarity,
    appSimilarity,
    overallSimilarity,
    similarityScope,
    appsIncomplete,
    isLoading,
    loadError,
    addingGroupId,
    addError,
    setAddError,
    addToContext,
    addToCompared,
    contextName,
    comparedName,
    resolveGroupName,
    selectUser,
    changeUser,
  };
}

export type UserComparisonState = ReturnType<typeof useUserComparison>;
