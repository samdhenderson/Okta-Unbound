import { useCallback, useState } from 'react';
import type { FormattedRule, RuleStats } from '../../shared/types';
import { RulesCache } from '../../shared/rulesCache';
import { useProgress } from '../contexts/ProgressContext';
import { createLogger } from '../../shared/utils/logger';
import { useOktaApi } from './useOktaApi';
import { fetchGroupRulesRequest } from './fetchGroupRulesRequest';

const log = createLogger('RulesTab');

const EMPTY_STATS: RuleStats = { total: 0, active: 0, inactive: 0, conflicts: 0 };

function toOrgWideRules(rules: FormattedRule[] | undefined): FormattedRule[] {
  return (rules ?? []).map(({ affectsCurrentGroup: _scoped, ...rest }) => rest);
}

export interface RulesDataSnapshot {
  rules?: FormattedRule[] | null;
  stats?: RuleStats | null;
  lastFetchTime?: string | null;
}

interface UseRulesDataOptions {
  targetTabId?: number;
  onError: (message: string) => void;
  currentGroupId?: string;
}

interface UseRulesDataReturn {
  rules: FormattedRule[];
  stats: RuleStats;
  apiCost: number | null;
  lastFetchTime: string | null;
  isLoading: boolean;
  loadRules: (force?: boolean) => Promise<void>;
  hydrate: (snapshot: RulesDataSnapshot) => void;
}

export function useRulesData({
  targetTabId,
  onError,
  currentGroupId,
}: UseRulesDataOptions): UseRulesDataReturn {
  const [rules, setRules] = useState<FormattedRule[]>([]);
  const [stats, setStats] = useState<RuleStats>(EMPTY_STATS);
  const [apiCost, setApiCost] = useState<number | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { startProgress, updateProgress, completeProgress } = useProgress();

  const { makeApiRequest } = useOktaApi({ targetTabId: targetTabId ?? null });

  const hydrate = useCallback((snapshot: RulesDataSnapshot) => {
    if (snapshot.rules) setRules(snapshot.rules);
    if (snapshot.stats) setStats(snapshot.stats);
    if (snapshot.lastFetchTime) setLastFetchTime(snapshot.lastFetchTime);
  }, []);

  const loadRules = useCallback(
    async (force: boolean = false) => {
      if (!targetTabId) {
        onError('No Okta tab connected');
        return;
      }

      setIsLoading(true);
      onError('');
      setApiCost(null);

      try {
        log.debug('Fetching rules from tab:', targetTabId);

        startProgress('Loading Rules', 'Loading group rules...', 1);

        let apiRequestCount = 0;

        if (!force) {
          const cached = await RulesCache.get();
          if (cached) {
            log.debug('Using cached rules from global cache');
            setRules(cached.rules);
            setStats(cached.stats);
            setLastFetchTime(new Date(cached.timestamp).toISOString());
            setApiCost(0); // No API calls needed
            updateProgress(1, 1, `Loaded ${cached.rules.length} rules from cache`);
            setTimeout(() => completeProgress(), 500);
            setIsLoading(false);
            return;
          }
        }

        const response = await fetchGroupRulesRequest(makeApiRequest, currentGroupId);

        log.debug('Received response:', { success: response.success });

        if (response.success) {
          const rulesCount = response.rules?.length || 0;
          updateProgress(1, 1, `Loaded ${rulesCount} rules successfully`);

          setRules(response.rules || []);
          setStats(response.stats || EMPTY_STATS);
          setLastFetchTime(new Date().toISOString());

          await RulesCache.set(
            toOrgWideRules(response.rules),
            response.rawRules || [],
            response.stats || EMPTY_STATS,
            response.conflicts || [],
          );

          apiRequestCount = 1;
          setApiCost(apiRequestCount);

          log.debug('Loaded rules successfully:', {
            count: response.rules?.length,
            stats: response.stats,
            apiCost: apiRequestCount,
          });

          setTimeout(() => {
            completeProgress();
          }, 1000);
        } else {
          onError(response.error || 'Failed to fetch rules');
          log.error('Error fetching rules:', response.error);
          completeProgress();
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to communicate with Okta tab');
        log.error('Exception:', err);
        completeProgress();
      } finally {
        setIsLoading(false);
      }
    },
    [
      targetTabId,
      onError,
      currentGroupId,
      makeApiRequest,
      startProgress,
      updateProgress,
      completeProgress,
    ],
  );

  return { rules, stats, apiCost, lastFetchTime, isLoading, loadRules, hydrate };
}
