import { useCallback, useState } from 'react';
import { getOrFetch, peek, type EntityKey } from '../cache/entityCache';
import { useOktaApi } from './useOktaApi';
import type { OktaPolicyType } from './useOktaApi/index';
import { createLogger } from '../../shared/utils/logger';
import type { OktaPolicyListItem } from '../../shared/schemas/okta';

const log = createLogger('usePoliciesData');

export const AUTH_POLICY_TYPE: OktaPolicyType = 'ACCESS_POLICY';

export const POLICIES_CACHE_KEY: EntityKey = ['policies', AUTH_POLICY_TYPE];

export interface UsePoliciesDataOptions {
  targetTabId?: number;
  onError: (message: string) => void;
}

export interface UsePoliciesDataReturn {
  policies: OktaPolicyListItem[];
  isLoading: boolean;
  lastFetchTime: string | null;
  loadPolicies: (force?: boolean) => Promise<void>;
}

export function usePoliciesData({
  targetTabId,
  onError,
}: UsePoliciesDataOptions): UsePoliciesDataReturn {
  const [policies, setPolicies] = useState<OktaPolicyListItem[]>(
    () => peek<OktaPolicyListItem[]>(POLICIES_CACHE_KEY) ?? [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);

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
        const loaded = await getOrFetch<OktaPolicyListItem[]>(
          POLICIES_CACHE_KEY,
          () => listPolicies(AUTH_POLICY_TYPE),
          { force },
        );
        setPolicies(loaded);
        setLastFetchTime(new Date().toISOString());
        log.debug('Loaded auth policies', { type: AUTH_POLICY_TYPE, count: loaded.length });
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to load auth policies');
        log.error('loadPolicies failed', { code: 'load_policies_failed', type: AUTH_POLICY_TYPE });
      } finally {
        setIsLoading(false);
      }
    },
    [targetTabId, onError, listPolicies],
  );

  return { policies, isLoading, lastFetchTime, loadPolicies };
}
