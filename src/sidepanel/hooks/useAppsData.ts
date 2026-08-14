import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getOrFetch, peek, peekFetchedAt, type EntityKey } from '../cache/entityCache';
import { cacheKeys } from '../cache/keys';
import type { OktaAppListItem } from '../../shared/schemas/okta';
import { createLogger } from '../../shared/utils/logger';
import type { useOktaApi } from './useOktaApi';

const log = createLogger('useAppsData');

type OktaApi = ReturnType<typeof useOktaApi>;

export function appsCacheKey(oktaOrigin?: string | null): EntityKey {
  return cacheKeys.apps(oktaOrigin);
}

function isoFetchedAt(key: EntityKey): string | null {
  const at = peekFetchedAt(key);
  return at === null ? null : new Date(at).toISOString();
}

export interface UseAppsDataOptions {
  api: Pick<OktaApi, 'getAllApps'>;
  onError: (message: string) => void;
  targetTabId: number | null;
  oktaOrigin?: string | null;
  enabled?: boolean;
}

export interface UseAppsDataReturn {
  apps: OktaAppListItem[];
  isLoading: boolean;
  lastFetchTime: string | null;
  loadApps: (force?: boolean) => Promise<void>;
}

export function useAppsData({
  api,
  onError,
  targetTabId,
  oktaOrigin,
  enabled = true,
}: UseAppsDataOptions): UseAppsDataReturn {
  const cacheKey = useMemo(() => appsCacheKey(oktaOrigin), [oktaOrigin]);

  const [apps, setApps] = useState<OktaAppListItem[]>(
    () => peek<OktaAppListItem[]>(cacheKey) ?? [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(() => isoFetchedAt(cacheKey));

  const getAllAppsRef = useRef(api.getAllApps);
  getAllAppsRef.current = api.getAllApps;

  const loadApps = useCallback(
    async (force: boolean = false) => {
      if (targetTabId == null) {
        onError('No Okta tab connected');
        return;
      }

      setIsLoading(true);
      onError('');

      try {
        const loaded = await getOrFetch<OktaAppListItem[]>(
          cacheKey,
          () => getAllAppsRef.current(),
          { force },
        );
        setApps(loaded);
        setLastFetchTime(isoFetchedAt(cacheKey));
        log.debug('Loaded applications', { count: loaded.length });
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to load applications');
        log.error('Failed to load applications', { code: 'load_apps_failed' });
      } finally {
        setIsLoading(false);
      }
    },
    [onError, targetTabId, cacheKey],
  );

  const seededFor = useRef(cacheKey);
  useEffect(() => {
    if (seededFor.current === cacheKey) return;
    seededFor.current = cacheKey;
    setApps(peek<OktaAppListItem[]>(cacheKey) ?? []);
    setLastFetchTime(isoFetchedAt(cacheKey));
  }, [cacheKey]);

  const autoLoadedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled || targetTabId == null) return;
    const target = `${targetTabId}\u0000${oktaOrigin ?? ''}`;
    if (autoLoadedFor.current === target) return;
    autoLoadedFor.current = target;
    void loadApps();
  }, [enabled, targetTabId, oktaOrigin, loadApps]);

  return { apps, isLoading, lastFetchTime, loadApps };
}
