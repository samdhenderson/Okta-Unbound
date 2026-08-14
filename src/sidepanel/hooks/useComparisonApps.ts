import { useState, useEffect, useCallback } from 'react';
import { useOktaApi } from './useOktaApi';
import type { OktaUser } from '../../shared/types';
import type { AppEntry } from '../components/users/comparison/comparisonAnalytics';

interface UseComparisonAppsOptions {
  targetTabId: number;
  contextUserId: string;
  comparedUser: OktaUser | null;
}

interface UseComparisonAppsReturn {
  contextApps: AppEntry[];
  comparedApps: AppEntry[];
  isLoadingApps: boolean;
  resetApps: () => void;
}

export function useComparisonApps({
  targetTabId,
  contextUserId,
  comparedUser,
}: UseComparisonAppsOptions): UseComparisonAppsReturn {
  const { getUserApps } = useOktaApi({ targetTabId: targetTabId ?? null });

  const [contextApps, setContextApps] = useState<AppEntry[]>([]);
  const [comparedApps, setComparedApps] = useState<AppEntry[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  useEffect(() => {
    if (!comparedUser) return;

    let cancelled = false;
    setIsLoadingApps(true);
    Promise.all([getUserApps(contextUserId), getUserApps(comparedUser.id)])
      .then(([ctxApps, cmpApps]) => {
        if (cancelled) return;
        setContextApps(ctxApps);
        setComparedApps(cmpApps);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingApps(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparedUser]);

  const resetApps = useCallback(() => {
    setContextApps([]);
    setComparedApps([]);
  }, []);

  return { contextApps, comparedApps, isLoadingApps, resetApps };
}
