import { useCallback, useState } from 'react';
import { getOrFetch, peek, peekFetchedAt, type EntityKey } from '../cache/entityCache';
import { cacheKeys } from '../cache/keys';
import { useOktaApi } from './useOktaApi';
import type { OktaPolicyType } from './useOktaApi/index';
import { createLogger } from '../../shared/utils/logger';
import type { OktaPolicyListItem } from '../../shared/schemas/okta';
import type { PolicyListResult } from './useOktaApi/policyOperations';

const log = createLogger('usePoliciesData');

export const AUTH_POLICY_TYPE: OktaPolicyType = 'ACCESS_POLICY';

export const POLICIES_CACHE_KEY: EntityKey = cacheKeys.policies(AUTH_POLICY_TYPE);

export type PolicyReadState = 'unread' | 'listed' | 'forbidden';

export interface UsePoliciesDataOptions {
  targetTabId?: number;
  onError: (message: string) => void;
}

export interface UsePoliciesDataReturn {
  policies: OktaPolicyListItem[];
  readState: PolicyReadState;
  isLoading: boolean;
  lastFetchTime: string | null;
  loadPolicies: (force?: boolean) => Promise<void>;
}

export class PolicyReadForbiddenError extends Error {
  constructor() {
    super('Policy read forbidden');
    this.name = 'PolicyReadForbiddenError';
  }
}

export function fetchPolicyList(
  listPolicies: (type?: OktaPolicyType) => Promise<PolicyListResult>,
  force = false,
): Promise<OktaPolicyListItem[]> {
  return getOrFetch<OktaPolicyListItem[]>(
    POLICIES_CACHE_KEY,
    async () => {
      const result = await listPolicies(AUTH_POLICY_TYPE);
      if (result.outcome === 'listed') return result.policies;
      throw result.outcome === 'forbidden'
        ? new PolicyReadForbiddenError()
        : new Error(result.message);
    },
    { force },
  );
}

function isoFetchedAt(key: EntityKey): string | null {
  const at = peekFetchedAt(key);
  return at === null ? null : new Date(at).toISOString();
}

export function usePoliciesData({
  targetTabId,
  onError,
}: UsePoliciesDataOptions): UsePoliciesDataReturn {
  const [policies, setPolicies] = useState<OktaPolicyListItem[]>(
    () => peek<OktaPolicyListItem[]>(POLICIES_CACHE_KEY) ?? [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [readState, setReadState] = useState<PolicyReadState>('unread');
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(() =>
    isoFetchedAt(POLICIES_CACHE_KEY),
  );

  const { listPolicies } = useOktaApi({ targetTabId: targetTabId ?? null });

  const loadPolicies = useCallback(
    async (force: boolean = false) => {
      if (!targetTabId) {
        onError('No Okta tab connected');
        return;
      }

      setIsLoading(true);
      onError('');

      try {
        const loaded = await fetchPolicyList(listPolicies, force);
        setPolicies(loaded);
        setReadState('listed');
        setLastFetchTime(isoFetchedAt(POLICIES_CACHE_KEY));
        log.debug('Loaded auth policies', { type: AUTH_POLICY_TYPE, count: loaded.length });
      } catch (err) {
        if (err instanceof PolicyReadForbiddenError) {
          setPolicies([]);
          setReadState('forbidden');
          log.debug('Policy read refused', { code: 'load_policies_forbidden' });
        } else {
          onError(err instanceof Error ? err.message : 'Failed to load auth policies');
          setReadState('unread');
          log.error('loadPolicies failed', {
            code: 'load_policies_failed',
            type: AUTH_POLICY_TYPE,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [targetTabId, onError, listPolicies],
  );

  return { policies, readState, isLoading, lastFetchTime, loadPolicies };
}
