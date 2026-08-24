import { useCallback, useEffect, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GroupSummary, OktaGroupRule, PushGroupMapping } from '../../shared/types';
import { detectConflicts, formatRuleForDisplay } from '../../shared/ruleUtils';
import { annotateGroupsWithRuleCounts } from '../../shared/rules/groupRuleIndex';
import { toGroupSummary, type RawOktaGroup } from '../components/groups/groupSummary';
import { useOrgSnapshot } from '../cache/useOrgSnapshot';
import { splitShardedId } from '../../shared/snapshot/types';
import type { OktaAppGroupAssignment, OktaAppListItem } from '../../shared/schemas/okta';

interface UseGroupsLoaderOptions {
  targetTabId: number | null;
  oktaOrigin?: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  setSearchMode: Dispatch<SetStateAction<'live' | 'cached'>>;
  onLoaded: () => void;
  enabled?: boolean;
}

export interface UseGroupsLoaderResult {
  groups: GroupSummary[];
  loading: boolean;
  complete: boolean;
  lastFullWalkAt: number | null;
  loadAllGroups: (force?: boolean) => Promise<void>;
}

export function useGroupsLoader({
  targetTabId,
  oktaOrigin,
  setError,
  setSearchMode,
  onLoaded,
  enabled = true,
}: UseGroupsLoaderOptions): UseGroupsLoaderResult {
  const groupSnapshot = useOrgSnapshot<RawOktaGroup>('groups', oktaOrigin, targetTabId, {
    enabled,
  });
  const ruleSnapshot = useOrgSnapshot<OktaGroupRule>('rules', oktaOrigin, targetTabId, {
    enabled,
  });
  const appSnapshot = useOrgSnapshot<OktaAppListItem>('apps', oktaOrigin, targetTabId, {
    enabled,
  });
  const appGroupSnapshot = useOrgSnapshot<OktaAppGroupAssignment>(
    'appGroups',
    oktaOrigin,
    targetTabId,
    { enabled },
  );

  const { rows: rawGroups } = groupSnapshot;
  const { rows: rawRules } = ruleSnapshot;
  const { rows: rawApps } = appSnapshot;
  const { records: assignmentRecords } = appGroupSnapshot;

  const appNames = useMemo(() => {
    const byId = new Map<string, string>();
    for (const app of rawApps) {
      const label = app.label || app.name;
      if (app.id && label) byId.set(app.id, label);
    }
    return byId;
  }, [rawApps]);

  const mappingsByGroup = useMemo(() => {
    const byGroup = new Map<string, PushGroupMapping[]>();
    for (const record of assignmentRecords) {
      const key = splitShardedId(record.id);
      if (!key) continue;
      const appId = key.shardKey;
      const assignment = record.entity;
      const linked = assignment._links?.group?.href?.split('/').pop();
      const groupId = linked || key.entityId;
      if (!groupId) continue;

      const mappings = byGroup.get(groupId) ?? [];
      mappings.push({
        mappingId: assignment.id || `${appId}_${groupId}`,
        sourceUserGroupId: groupId,
        targetGroupName: assignment.profile?.name || assignment.profile?.groupName || '',
        priority: assignment.priority,
        appId,
        appName: appNames.get(appId),
      });
      byGroup.set(groupId, mappings);
    }
    return byGroup;
  }, [appNames, assignmentRecords]);

  const groups = useMemo(() => {
    let summaries = rawGroups.map(toGroupSummary);
    if (rawRules.length > 0) {
      const conflicts = detectConflicts(rawRules);
      const rules = rawRules.map((rule) => formatRuleForDisplay(rule, undefined, conflicts));
      summaries = annotateGroupsWithRuleCounts(summaries, rules);
    }
    if (mappingsByGroup.size === 0 && appNames.size === 0) return summaries;

    return summaries.map((group) => {
      const mappings = mappingsByGroup.get(group.id);
      const updates: Partial<GroupSummary> = {};
      if (mappings && mappings.length > 0) updates.pushMappings = mappings;
      if (!group.sourceAppName && group.sourceAppId) {
        const appName = appNames.get(group.sourceAppId);
        if (appName && appName !== group.sourceAppId) updates.sourceAppName = appName;
      }
      return Object.keys(updates).length > 0 ? { ...group, ...updates } : group;
    });
  }, [appNames, mappingsByGroup, rawGroups, rawRules]);

  const { sync: syncGroups } = groupSnapshot;

  const loadAllGroups = useCallback(
    async (force: boolean = false) => {
      setError(null);
      const failure = await syncGroups(force);
      if (failure) {
        setError(failure);
        return;
      }
      setSearchMode('cached');
      onLoaded();
    },
    [onLoaded, setError, setSearchMode, syncGroups],
  );

  const hasRows = rawGroups.length > 0;
  useEffect(() => {
    if (hasRows) setSearchMode('cached');
  }, [hasRows, setSearchMode]);

  return {
    groups,
    loading: groupSnapshot.isSyncing || groupSnapshot.isReading,
    complete: groupSnapshot.complete,
    lastFullWalkAt: groupSnapshot.lastFullWalkAt,
    loadAllGroups,
  };
}
