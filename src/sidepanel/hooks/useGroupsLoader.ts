import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useOktaApi } from './useOktaApi';
import type { GroupSummary } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';
import { RulesCache } from '../../shared/rulesCache';
import { annotateGroupsWithRuleCounts } from '../../shared/rules/groupRuleIndex';
import { toGroupSummary } from '../components/groups/groupSummary';
import {
  GROUPS_CACHE_KEY,
  parseGroupsCache,
  serializeGroupsCache,
} from '../components/groups/groupsCache';

const log = createLogger('useGroupsLoader');

type OktaApi = ReturnType<typeof useOktaApi>;

interface UseGroupsLoaderOptions {
  api: OktaApi;
  setError: Dispatch<SetStateAction<string | null>>;
  setSearchMode: Dispatch<SetStateAction<'live' | 'cached'>>;
  onLoaded: () => void;
}

export function useGroupsLoader({
  api,
  setError,
  setSearchMode,
  onLoaded,
}: UseGroupsLoaderOptions) {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chrome.storage.local.get([GROUPS_CACHE_KEY], (result) => {
      if (result[GROUPS_CACHE_KEY]) {
        try {
          const parsedGroups = parseGroupsCache(result[GROUPS_CACHE_KEY] as string, Date.now());
          if (parsedGroups) {
            setGroups(parsedGroups);
            setSearchMode('cached');
          }
        } catch (err) {
          log.error('Failed to parse groups cache:', err);
        }
      }
    });
  }, [setSearchMode]);

  const loadAllGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      const allGroups = await api.getAllGroups(() => {});

      let groupSummaries: GroupSummary[] = allGroups.map(toGroupSummary);

      const cachedRules = await RulesCache.get();
      const rulesKnown = cachedRules !== null;
      if (cachedRules) {
        groupSummaries = annotateGroupsWithRuleCounts(groupSummaries, cachedRules.rules);
      }

      groupSummaries = groupSummaries.map((g) => ({
        ...g,
        staleness: api.calculateStaleness(g, rulesKnown),
      }));

      try {
        groupSummaries = await api.applyPushGroupMappings(groupSummaries);
      } catch (err) {
        log.warn('Failed to load push group mappings:', err);
      }

      setGroups(groupSummaries);
      setSearchMode('cached');
      onLoaded();

      chrome.storage.local.set({
        [GROUPS_CACHE_KEY]: serializeGroupsCache(groupSummaries, Date.now()),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  return { groups, loading, loadAllGroups };
}
