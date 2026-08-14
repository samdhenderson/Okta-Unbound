import { useState, useCallback, useRef } from 'react';
import type { OktaUser, GroupMembership, OktaGroup, FormattedRule } from '../../shared/types';
import { RulesCache } from '../../shared/rulesCache';
import { getOrFetch, peek, invalidate } from '../cache/entityCache';
import { analyzeMemberships, unclassifiedMemberships } from '../../shared/utils/membershipAnalysis';
import { createLogger } from '../../shared/utils/logger';
import { useOktaApi } from './useOktaApi';
import { getUserGroupsRequest } from './getUserGroupsRequest';
import { fetchGroupRulesRequest } from './fetchGroupRulesRequest';

const log = createLogger('useUserMemberships');

const RULE_INVENTORY_KEY = 'groupRuleInventory';

export type RuleInventoryState =
  | { readonly status: 'unresolved' }
  | { readonly status: 'available'; readonly rules: FormattedRule[] }
  | { readonly status: 'unavailable' };

interface UseUserMembershipsOptions {
  targetTabId: number | undefined;
  onError?: (message: string | null) => void;
  onLoadingChange?: (loading: boolean) => void;
}

interface UseUserMembershipsReturn {
  memberships: GroupMembership[];
  isLoading: boolean;
  error: string | null;
  rules: RuleInventoryState;
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
  const [ruleInventory, setRuleInventory] = useState<RuleInventoryState>({ status: 'unresolved' });

  const { makeApiRequest } = useOktaApi({ targetTabId: targetTabId ?? null });

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

  const adoptCachedRuleInventory = useCallback(async (): Promise<void> => {
    const cached = peek<FormattedRule[] | null>(RULE_INVENTORY_KEY);
    if (cached) {
      setRuleInventory({ status: 'available', rules: cached });
      return;
    }
    const cachedRules = await RulesCache.get();
    if (cachedRules) setRuleInventory({ status: 'available', rules: cachedRules.rules });
  }, []);

  const loadRuleInventory = useCallback(async (): Promise<FormattedRule[] | null> => {
    const rules = await getOrFetch<FormattedRule[] | null>(RULE_INVENTORY_KEY, async () => {
      const cachedRules = await RulesCache.get();
      if (cachedRules) {
        log.debug('Using cached rules from global cache');
        return cachedRules.rules;
      }

      log.debug('Cache miss - fetching rules (names not needed for analysis)');
      const rulesResponse = await fetchGroupRulesRequest(makeApiRequest, undefined, {
        resolveGroupNames: false,
      });

      if (!rulesResponse.success) {
        log.warn('Could not fetch rules for analysis:', rulesResponse.error);
        return null;
      }
      return rulesResponse.rules || [];
    });

    if (rules === null) invalidate(RULE_INVENTORY_KEY);

    setRuleInventory(rules === null ? { status: 'unavailable' } : { status: 'available', rules });
    return rules;
  }, [makeApiRequest]);

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
          void adoptCachedRuleInventory();
          return;
        }
      }

      reportLoading(true);

      let degraded = false;

      try {
        const analyzedMemberships = await getOrFetch<GroupMembership[]>(
          ['userMemberships', user.id],
          async () => {
            log.debug('Loading memberships for user:', user.id);

            const groupsResponse = await getUserGroupsRequest(makeApiRequest, user.id);

            if (!groupsResponse.success) {
              throw new Error(groupsResponse.error || 'Failed to fetch user groups');
            }

            const rules = await loadRuleInventory();

            const membershipData: Array<{ group?: OktaGroup }> = groupsResponse.data || [];
            const rawGroups: OktaGroup[] = membershipData.map(
              (m) => m.group || (m as unknown as OktaGroup),
            );

            if (rules === null) {
              degraded = true;
              log.warn('Rules unavailable; reporting memberships as unclassified', {
                userId: user.id,
                groups: rawGroups.length,
              });
              return unclassifiedMemberships(rawGroups);
            }

            return analyzeMemberships(rawGroups, rules, user);
          },
          { force: options?.force },
        );

        if (degraded) invalidate(['userMemberships', user.id]);

        setMemberships(analyzedMemberships);
        log.debug('Loaded memberships:', { count: analyzedMemberships.length, degraded });
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load user memberships');
        setMemberships([]);
        log.error('Membership loading error:', err);
      } finally {
        reportLoading(false);
      }
    },
    [
      targetTabId,
      reportError,
      reportLoading,
      makeApiRequest,
      loadRuleInventory,
      adoptCachedRuleInventory,
    ],
  );

  const clearMemberships = useCallback(() => {
    setMemberships([]);
    reportError(null);
  }, [reportError]);

  return {
    memberships,
    isLoading,
    error,
    rules: ruleInventory,
    loadMemberships,
    clearMemberships,
  };
}
