import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserSearch } from './useUserSearch';
import { useComparisonProfileEdit } from './useComparisonProfileEdit';
import { useUserMemberships } from './useUserMemberships';
import { useComparisonApps } from './useComparisonApps';
import { useGroupCopy } from './useGroupCopy';
import { useOktaApi } from './useOktaApi';
import { useProfileDisplayConfig } from './useProfileDisplayConfig';
import { useEntityQuery } from '../cache/useEntityQuery';
import { cacheKeys, TTL_LONG } from '../cache/keys';
import { userDisplayName } from '../../shared/utils/userDisplay';
import {
  jaccard,
  bucketGroups,
  bucketApps,
  type TabKey,
} from '../components/users/comparison/comparisonAnalytics';
import { classifyAccessCauses } from '../components/users/comparison/accessCause';
import {
  attributeParityRows,
  type AttributeParityResult,
} from '../components/users/comparison/attributeParity';
import {
  allProfileAttributes,
  type AttributeDescriptor,
} from '../components/users/profileAttributes';
import { profileMastering } from '../components/users/profileEditability';
import { profileRuleReads } from '../components/users/profileRuleReads';
import { useGroupNameResolver } from './useGroupNameResolver';
import { extractReferencedGroupIds } from '../../shared/rules/groupRuleIndex';
import type { OktaUser, GroupMembership } from '../../shared/types';
import type { OktaUserProfileSchema } from '../../shared/schemas/okta';

const NO_ATTRIBUTE_PARITY: AttributeParityResult = Object.freeze({
  rows: [],
  hiddenRows: [],
  hiddenDifferences: 0,
  differenceCount: 0,
});

const NO_RULE_READS: Record<string, string[]> = Object.freeze({});

const NO_ATTRIBUTES: readonly AttributeDescriptor[] = Object.freeze([]);

function mergeRuleReads(
  first: Record<string, string[]>,
  second: Record<string, string[]>,
): Record<string, string[]> {
  const merged: Record<string, string[]> = { ...first };
  for (const [name, ruleNames] of Object.entries(second)) {
    const held = merged[name];
    if (!held) {
      merged[name] = [...ruleNames];
      continue;
    }
    merged[name] = [...held, ...ruleNames.filter((ruleName) => !held.includes(ruleName))];
  }
  return merged;
}

export interface UseUserComparisonOptions {
  isActive: boolean;
  searchEnabled?: boolean;
  contextUser: OktaUser;
  contextGroups: GroupMembership[];
  targetTabId: number;
  oktaOrigin?: string | null;
  onGroupsChanged: () => void;
  onContextUserUpdated?: (user: OktaUser) => void;
}

export function useUserComparison({
  isActive,
  searchEnabled,
  contextUser,
  contextGroups,
  targetTabId,
  oktaOrigin,
  onGroupsChanged,
  onContextUserUpdated,
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
  } = useUserMemberships({ targetTabId, oktaOrigin });

  const [comparedUser, setComparedUser] = useState<OktaUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const { contextApps, comparedApps, isLoadingApps, appsLoaded, appsIncomplete, resetApps } =
    useComparisonApps({
      targetTabId,
      contextUserId: contextUser.id,
      comparedUser,
    });

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

  const { getUserProfileSchema } = useOktaApi({ targetTabId });

  const { data: userSchema } = useEntityQuery<OktaUserProfileSchema | null>(
    cacheKeys.userSchema(oktaOrigin),
    getUserProfileSchema,
    { ttl: TTL_LONG, enabled: isActive && comparedUser !== null },
  );

  const contextAttributes = useMemo(
    () => allProfileAttributes(contextUser, userSchema),
    [contextUser, userSchema],
  );

  const comparedAttributes = useMemo(
    () => (comparedUser ? allProfileAttributes(comparedUser, userSchema) : NO_ATTRIBUTES),
    [comparedUser, userSchema],
  );

  const contextMastering = useMemo(
    () => profileMastering(appsLoaded ? contextApps : undefined, !appsIncomplete),
    [appsLoaded, contextApps, appsIncomplete],
  );

  const comparedMastering = useMemo(
    () => profileMastering(appsLoaded ? comparedApps : undefined, !appsIncomplete),
    [appsLoaded, comparedApps, appsIncomplete],
  );

  const knownAttributeNames = useMemo(() => {
    const names = new Set<string>();
    for (const attribute of contextAttributes) names.add(attribute.name);
    for (const attribute of comparedAttributes) names.add(attribute.name);
    return [...names];
  }, [contextAttributes, comparedAttributes]);

  const { config: attributeConfig } = useProfileDisplayConfig(oktaOrigin, knownAttributeNames);

  const attributeParity = useMemo(
    () =>
      comparedUser
        ? attributeParityRows(contextUser, comparedUser, userSchema, attributeConfig)
        : NO_ATTRIBUTE_PARITY,
    [contextUser, comparedUser, userSchema, attributeConfig],
  );

  const attributeRuleReads = useMemo(() => {
    if (ruleInventory.status !== 'available') return NO_RULE_READS;
    const contextReads = profileRuleReads(ruleInventory.rules, contextUser, contextGroups);
    if (!comparedUser) return contextReads;
    return mergeRuleReads(
      contextReads,
      profileRuleReads(ruleInventory.rules, comparedUser, comparedGroups),
    );
  }, [ruleInventory, contextUser, contextGroups, comparedUser, comparedGroups]);

  const contextName = userDisplayName(contextUser);
  const comparedName = comparedUser ? userDisplayName(comparedUser) : '';

  const attributeEdit = useComparisonProfileEdit({
    contextUser,
    contextName,
    contextAttributes,
    contextMastering,
    contextMemberships: contextGroups,
    ...(onContextUserUpdated === undefined ? {} : { onContextUserUpdated }),
    comparedUser,
    comparedName,
    comparedAttributes,
    comparedMastering,
    comparedMemberships: comparedGroups,
    onComparedUserUpdated: setComparedUser,
    rules: ruleInventory,
    oktaOrigin,
    targetTabId,
    enabled: isActive && comparedUser !== null,
  });

  const causes = useMemo(() => {
    if (ruleInventory.status === 'unresolved') return undefined;
    return classifyAccessCauses({
      onlyCompared: groupBuckets.onlyCompared,
      contextUser,
      rules: ruleInventory.status === 'available' ? ruleInventory.rules : null,
      contextGroups,
    });
  }, [groupBuckets.onlyCompared, contextUser, contextGroups, ruleInventory]);

  const knownGroupNames = useMemo(() => {
    const byId = new Map<string, string>();
    for (const membership of [...contextGroups, ...comparedGroups]) {
      byId.set(membership.group.id, membership.group.profile.name);
    }
    return byId;
  }, [contextGroups, comparedGroups]);

  const { resolveGroupName, request: requestGroupNames } = useGroupNameResolver({
    targetTabId,
    oktaOrigin,
    known: knownGroupNames,
    enabled: isActive,
  });

  const referencedGroupIds = useMemo(() => {
    if (!causes) return [];
    const ids = new Set<string>();
    for (const cause of causes) {
      for (const reference of [...(cause.requiredGroups ?? []), ...(cause.blockingGroups ?? [])]) {
        if (reference.match === 'id') ids.add(reference.value);
      }
      for (const clause of cause.failingClauses) {
        for (const id of extractReferencedGroupIds(clause.expressionText)) ids.add(id);
      }
    }
    return [...ids];
  }, [causes]);

  useEffect(() => {
    if (referencedGroupIds.length > 0) requestGroupNames(referencedGroupIds);
  }, [referencedGroupIds, requestGroupNames]);

  const groupDiffCount = groupBuckets.onlyCompared.length + groupBuckets.onlyContext.length;
  const appDiffCount = appBuckets.onlyCompared.length + appBuckets.onlyContext.length;
  const attributeDiffCount = attributeParity.differenceCount;

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
    attributeParity,
    attributeDiffCount,
    attributeConfig,
    attributeRuleReads,
    attributeEdit,
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
