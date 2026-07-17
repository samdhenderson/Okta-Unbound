import { useState, useCallback, useRef } from 'react';
import type { OktaUser, GroupMembership, OktaGroup, FormattedRule } from '../../shared/types';
import { RulesCache } from '../../shared/rulesCache';
import { getOrFetch, peek } from '../cache/entityCache';
import { analyzeMemberships } from '../../shared/utils/membershipAnalysis';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useUserMemberships');

interface UseUserMembershipsOptions {
  targetTabId: number | undefined;
  onError?: (message: string | null) => void;
  onLoadingChange?: (loading: boolean) => void;
}

interface UseUserMembershipsReturn {
  memberships: GroupMembership[];
  isLoading: boolean;
  error: string | null;
  loadMemberships: (user: OktaUser, options?: { force?: boolean }) => Promise<void>;
  clearMemberships: () => void;
}

export function useUserMemberships({
  targetTabId,
  onError,
  onLoadingChange,
}: UseUserMembershipsOptions): UseUserMembershipsReturn {
  const [memberships, setMemberships] = useState<GroupMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbacksRef = useRef({ onError, onLoadingChange });
  callbacksRef.current = { onError, onLoadingChange };

  const reportError = useCallback((message: string | null) => {
    setError(message);
    callbacksRef.current.onError?.(message);
  }, []);
  const reportLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    callbacksRef.current.onLoadingChange?.(loading);
  }, []);

  const loadMemberships = useCallback(
    async (user: OktaUser, options?: { force?: boolean }) => {
      if (!targetTabId) {
        reportError('No Okta tab connected');
        return;
      }

      reportError(null);

      if (!options?.force) {
        const cached = peek<GroupMembership[]>(['userMemberships', user.id]);
        if (cached) {
          setMemberships(cached);
          reportLoading(false);
          return;
        }
      }

      reportLoading(true);

      try {
        const analyzedMemberships = await getOrFetch<GroupMembership[]>(
          ['userMemberships', user.id],
          async () => {
            log.debug('Loading memberships for user:', user.id);

            const groupsResponse = await chrome.tabs.sendMessage(targetTabId, {
              action: 'getUserGroups',
              userId: user.id,
            });

            if (!groupsResponse.success) {
              throw new Error(groupsResponse.error || 'Failed to fetch user groups');
            }

            let rules: FormattedRule[] = [];
            const cachedRules = await RulesCache.get();

            if (cachedRules) {
              log.debug('Using cached rules from global cache');
              rules = cachedRules.rules;
            } else {
              log.debug('Cache miss - fetching rules');
              const rulesResponse = await chrome.tabs.sendMessage(targetTabId, {
                action: 'fetchGroupRules',
              });

              if (!rulesResponse.success) {
                log.warn('Could not fetch rules for analysis:', rulesResponse.error);
              } else {
                rules = rulesResponse.rules || [];
                await RulesCache.set(
                  rules,
                  [],
                  rulesResponse.stats || { total: 0, active: 0, inactive: 0, conflicts: 0 },
                  rulesResponse.conflicts || [],
                );
              }
            }

            const membershipData: Array<{ group?: OktaGroup }> = groupsResponse.data || [];
            const rawGroups: OktaGroup[] = membershipData.map(
              (m) => m.group || (m as unknown as OktaGroup),
            );
            return analyzeMemberships(rawGroups, rules, user);
          },
          { force: options?.force },
        );

        setMemberships(analyzedMemberships);
        log.debug('Loaded memberships:', { count: analyzedMemberships.length });
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load user memberships');
        setMemberships([]);
        log.error('Membership loading error:', err);
      } finally {
        reportLoading(false);
      }
    },
    [targetTabId, reportError, reportLoading],
  );

  const clearMemberships = useCallback(() => {
    setMemberships([]);
    reportError(null);
  }, [reportError]);

  return {
    memberships,
    isLoading,
    error,
    loadMemberships,
    clearMemberships,
  };
}
