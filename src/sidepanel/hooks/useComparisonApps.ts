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
  appsIncomplete: boolean;
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
  const [appsIncomplete, setAppsIncomplete] = useState(false);

  useEffect(() => {
    if (!comparedUser) return;

    let cancelled = false;
    setIsLoadingApps(true);
    Promise.all([getUserApps(contextUserId), getUserApps(comparedUser.id)])
      .then(([context, compared]) => {
        if (cancelled) return;
        setContextApps(context.apps);
        setComparedApps(compared.apps);
        setAppsIncomplete(!context.complete || !compared.complete);
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
    setAppsIncomplete(false);
  }, []);

  return { contextApps, comparedApps, isLoadingApps, appsIncomplete, resetApps };
}
