import { useState, useEffect, useCallback } from 'react';
import { useOktaApi } from './useOktaApi';
import type { OktaUser } from '../../shared/types';
import type { UserAppAssignment } from './useOktaApi/userOperations';

interface UseComparisonAppsOptions {
  targetTabId: number;
  contextUserId: string;
  comparedUser: OktaUser | null;
}

interface UseComparisonAppsReturn {
  contextApps: UserAppAssignment[];
  comparedApps: UserAppAssignment[];
  isLoadingApps: boolean;
  appsLoaded: boolean;
  appsIncomplete: boolean;
  resetApps: () => void;
}

export function useComparisonApps({
  targetTabId,
  contextUserId,
  comparedUser,
}: UseComparisonAppsOptions): UseComparisonAppsReturn {
  const { getUserApps } = useOktaApi({ targetTabId: targetTabId ?? null });

  const [contextApps, setContextApps] = useState<UserAppAssignment[]>([]);
  const [comparedApps, setComparedApps] = useState<UserAppAssignment[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [appsLoaded, setAppsLoaded] = useState(false);
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
        setAppsLoaded(true);
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
    setAppsLoaded(false);
  }, []);

  return { contextApps, comparedApps, isLoadingApps, appsLoaded, appsIncomplete, resetApps };
}
