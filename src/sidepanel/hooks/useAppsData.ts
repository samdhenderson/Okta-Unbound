import { useCallback } from 'react';
import { useOwedLoad } from './useOwedLoad';
import { useOrgSnapshot } from '../cache/useOrgSnapshot';
import type { OktaAppListItem } from '../../shared/schemas/okta';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useAppsData');

export interface UseAppsDataOptions {
  onError: (message: string) => void;
  targetTabId: number | null;
  oktaOrigin?: string | null;
  enabled?: boolean;
}

export interface UseAppsDataReturn {
  apps: OktaAppListItem[];
  isLoading: boolean;
  lastFetchTime: string | null;
  complete: boolean;
  loadApps: (force?: boolean) => Promise<void>;
}

export function useAppsData({
  onError,
  targetTabId,
  oktaOrigin,
  enabled = true,
}: UseAppsDataOptions): UseAppsDataReturn {
  const snapshot = useOrgSnapshot<OktaAppListItem>('apps', oktaOrigin, targetTabId, { enabled });
  const { rows: apps, sync, isSyncing, isReading, complete, lastFullWalkAt } = snapshot;

  const loadApps = useCallback(
    async (force: boolean = false) => {
      if (targetTabId == null) {
        onError('No Okta tab connected');
        return;
      }
      onError('');
      const failure = await sync(force);
      if (failure) {
        onError(failure);
        log.error('Failed to load applications', { code: 'load_apps_failed' });
      }
    },
    [onError, sync, targetTabId],
  );

  useOwedLoad(
    targetTabId == null ? null : `${targetTabId}\u0000${oktaOrigin ?? ''}`,
    enabled,
    () => {
      void loadApps();
    },
  );

  return {
    apps,
    isLoading: isSyncing || isReading,
    lastFetchTime: lastFullWalkAt === null ? null : new Date(lastFullWalkAt).toISOString(),
    complete,
    loadApps,
  };
}
