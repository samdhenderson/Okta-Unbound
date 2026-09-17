import { useState, useCallback, useRef } from 'react';
import type {
  OktaUser,
  GroupMembership,
  OktaGroup,
  OktaGroupRule,
  FormattedRule,
} from '../../shared/types';
import { detectConflicts, formatRuleForDisplay } from '../../shared/ruleUtils';
import { orgSnapshotStore } from '../../shared/snapshot/orgSnapshotStore';
import { getOrFetch, peek, setEntry, invalidate } from '../cache/entityCache';
import { cacheKeys, RULE_INVENTORY_KEY } from '../cache/keys';
import { analyzeMemberships, unclassifiedMemberships } from '../../shared/utils/membershipAnalysis';
import { groupContextOfGroups } from '../../shared/membership/groupContext';
import { createLogger } from '../../shared/utils/logger';
import { useOktaApi } from './useOktaApi';
import { getUserGroupsRequest } from './getUserGroupsRequest';
import { fetchGroupRulesRequest } from './fetchGroupRulesRequest';

const log = createLogger('useUserMemberships');

export type RuleInventoryState =
  | { readonly status: 'unresolved' }
  | { readonly status: 'available'; readonly rules: FormattedRule[] }
  | { readonly status: 'unavailable' };

interface UseUserMembershipsOptions {
  targetTabId: number | undefined;
  oktaOrigin?: string | null;
  onError?: (message: string | null) => void;
  onLoadingChange?: (loading: boolean) => void;
}

interface UseUserMembershipsReturn {
  memberships: GroupMembership[] | undefined;
  isLoading: boolean;
  error: string | null;
  rules: RuleInventoryState;
  loadMemberships: (user: OktaUser, options?: { force?: boolean }) => Promise<void>;
  clearMemberships: () => void;
}

export function useUserMemberships({
  targetTabId,
  oktaOrigin,
  onError,
  onLoadingChange,
}: UseUserMembershipsOptions): UseUserMembershipsReturn {
  const [memberships, setMemberships] = useState<GroupMembership[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ruleInventory, setRuleInventory] = useState<RuleInventoryState>({ status: 'unresolved' });

  const { makeApiRequest } = useOktaApi({ targetTabId: targetTabId ?? null });

  const callbacksRef = useRef({ onError, onLoadingChange });
  callbacksRef.current = { onError, onLoadingChange };

  const oktaOriginRef = useRef(oktaOrigin);
  oktaOriginRef.current = oktaOrigin;

  const reportError = useCallback((message: string | null) => {
    setError(message);
    callbacksRef.current.onError?.(message);
  }, []);
  const reportLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    callbacksRef.current.onLoadingChange?.(loading);
  }, []);

  const deriveSnapshotRuleInventory = useCallback(async (): Promise<FormattedRule[] | null> => {
    const origin = oktaOriginRef.current;
    if (!origin) return null;
    const meta = await orgSnapshotStore.getMeta('rules', origin);
    if (!meta.complete) return null;
    const rawRules = await orgSnapshotStore.getCollection<OktaGroupRule>('rules', origin);
    const conflicts = detectConflicts(rawRules);
    return rawRules.map((rule) => formatRuleForDisplay(rule, undefined, conflicts));
  }, []);

  const adoptCachedRuleInventory = useCallback(async (): Promise<boolean> => {
    const cached = peek<FormattedRule[] | null>(RULE_INVENTORY_KEY);
    if (cached) {
      setRuleInventory({ status: 'available', rules: cached });
      return true;
    }
    const derived = await deriveSnapshotRuleInventory();
    if (!derived) return false;
    setEntry(RULE_INVENTORY_KEY, derived);
    setRuleInventory({ status: 'available', rules: derived });
    return true;
  }, [deriveSnapshotRuleInventory]);

  const loadRuleInventory = useCallback(async (): Promise<FormattedRule[] | null> => {
    const rules = await getOrFetch<FormattedRule[] | null>(RULE_INVENTORY_KEY, async () => {
      const derived = await deriveSnapshotRuleInventory();
      if (derived) {
        log.debug('Deriving the rule inventory from the org snapshot', { count: derived.length });
        return derived;
      }

      log.debug('Snapshot cold - fetching rules (names not needed for analysis)');
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
  }, [deriveSnapshotRuleInventory, makeApiRequest]);

  const ensureRuleInventory = useCallback(async (): Promise<void> => {
    if (await adoptCachedRuleInventory()) return;
    await loadRuleInventory();
  }, [adoptCachedRuleInventory, loadRuleInventory]);

  const loadMemberships = useCallback(
    async (user: OktaUser, options?: { force?: boolean }) => {
      if (!targetTabId) {
        reportError('No Okta tab connected');
        return;
      }

      reportError(null);

      if (!options?.force) {
        const cached = peek<GroupMembership[]>(cacheKeys.userMemberships(user.id));
        if (cached) {
          setMemberships(cached);
          reportLoading(false);
          void ensureRuleInventory();
          return;
        }
      }

      reportLoading(true);

      let degraded = false;

      try {
        const analyzedMemberships = await getOrFetch<GroupMembership[]>(
          cacheKeys.userMemberships(user.id),
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

            return analyzeMemberships(rawGroups, rules, user, {
              groups: groupContextOfGroups(rawGroups),
            });
          },
          { force: options?.force },
        );

        if (degraded) invalidate(cacheKeys.userMemberships(user.id));

        setMemberships(analyzedMemberships);
        log.debug('Loaded memberships:', { count: analyzedMemberships.length, degraded });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load user memberships';
        reportError(message);
        setMemberships(undefined);
        log.error('Membership loading error:', message);
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
      ensureRuleInventory,
    ],
  );

  const clearMemberships = useCallback(() => {
    setMemberships(undefined);
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
