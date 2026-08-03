import { useCallback, useEffect, useRef, useState } from 'react';
import type { OktaAppListItem } from '../../shared/schemas/okta';
import { createLogger } from '../../shared/utils/logger';
import type { useOktaApi } from './useOktaApi';

const log = createLogger('useAppsData');

type OktaApi = ReturnType<typeof useOktaApi>;

export interface UseAppsDataOptions {
  api: Pick<OktaApi, 'getAllApps'>;
  onError: (message: string) => void;
  targetTabId: number | null;
}

export interface UseAppsDataReturn {
  apps: OktaAppListItem[];
  isLoading: boolean;
  lastFetchTime: string | null;
  loadApps: (force?: boolean) => Promise<void>;
}

export function useAppsData({ api, onError, targetTabId }: UseAppsDataOptions): UseAppsDataReturn {
  const [apps, setApps] = useState<OktaAppListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);

  const getAllAppsRef = useRef(api.getAllApps);
  getAllAppsRef.current = api.getAllApps;

  const loadApps = useCallback(async () => {
    if (targetTabId == null) {
      onError('No Okta tab connected');
      return;
    }

    setIsLoading(true);
    onError('');

    try {
      const loaded = await getAllAppsRef.current();
      setApps(loaded);
      setLastFetchTime(new Date().toISOString());
      log.debug('Loaded applications', { count: loaded.length });
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load applications');
      log.error('Failed to load applications', { code: 'load_apps_failed' });
    } finally {
      setIsLoading(false);
    }
  }, [onError, targetTabId]);

  const autoLoadedFor = useRef<number | null>(null);
  useEffect(() => {
    if (targetTabId == null || autoLoadedFor.current === targetTabId) return;
    autoLoadedFor.current = targetTabId;
    void loadApps();
  }, [targetTabId, loadApps]);

  return { apps, isLoading, lastFetchTime, loadApps };
}
