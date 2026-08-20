import { useEffect, useMemo, useRef, useState } from 'react';
import { useOktaApi } from './useOktaApi';
import { useEntityQuery } from '../cache/useEntityQuery';
import { getOrFetch } from '../cache/entityCache';
import { cacheKeys, TTL_LONG } from '../cache/keys';
import { createLogger } from '../../shared/utils/logger';
import { summarizeAppSources, indexAppsByGroup } from '../components/users/appSourceSummary';
import type { AppsByGroupId } from '../components/users/appSourceSummary';
import type { GroupMembership } from '../../shared/types';
import type { UserAppAssignment, UserAppsResult } from './useOktaApi/userOperations';

const log = createLogger('useUserApps');

export interface UseUserAppsOptions {
  targetTabId: number | null;
  memberships: GroupMembership[];
  enabled?: boolean;
}

export interface UseUserAppsResult {
  apps: UserAppAssignment[];
  isLoading: boolean;
  error: string | null;
  complete: boolean;
  hasLoaded: boolean;
  appsByGroupId: AppsByGroupId;
  isResolvingSources: boolean;
}

function unresolvedGroupApps(apps: UserAppAssignment[]): UserAppAssignment[] {
  return apps.filter((app) => app.grantGroupId === undefined && app.scope === 'GROUP');
}

export function useUserApps(
  userId: string | null,
  { targetTabId, memberships, enabled = true }: UseUserAppsOptions,
): UseUserAppsResult {
  const { getUserApps, getAppGroupAssignments, runOperation } = useOktaApi({ targetTabId });

  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [isResolvingSources, setIsResolvingSources] = useState(false);

  const query = useEntityQuery<UserAppsResult>(
    cacheKeys.userApps(userId ?? 'none'),
    () => getUserApps(userId as string),
    { enabled: enabled && Boolean(userId) },
  );

  const data = query.data;

  const attemptedRef = useRef<string | null>(null);

  useEffect(() => {
    setResolved({});
    attemptedRef.current = null;
  }, [userId]);

  const membershipIdsRef = useRef<string[]>([]);
  // eslint-disable-next-line react-hooks/refs
  membershipIdsRef.current = memberships.map((m) => m.group.id);
  const apiRef = useRef({ getAppGroupAssignments, runOperation });
  // eslint-disable-next-line react-hooks/refs
  apiRef.current = { getAppGroupAssignments, runOperation };

  const pending = useMemo(() => (data ? unresolvedGroupApps(data.apps) : []), [data]);
  const pendingKey = pending.map((app) => app.id).join(',');

  useEffect(() => {
    if (!enabled || !userId || pendingKey === '') return;

    const latch = `${userId}:${pendingKey}`;
    if (attemptedRef.current === latch) return;
    attemptedRef.current = latch;

    const appIds = pendingKey.split(',');
    const memberGroupIds = new Set(membershipIdsRef.current);
    let cancelled = false;

    setIsResolvingSources(true);

    apiRef.current
      .runOperation<string, [string, string] | null>(
        'Name the groups granting these apps',
        appIds,
        async (appId) => {
          const groupIds = await getOrFetch<string[] | null>(
            cacheKeys.appGroups(appId),
            () => apiRef.current.getAppGroupAssignments(appId),
            { ttl: TTL_LONG },
          );
          if (!groupIds) return null;

          const candidates = groupIds.filter((id) => memberGroupIds.has(id));
          return candidates.length === 1 ? [appId, candidates[0]] : null;
        },
        { message: ({ completed, total }) => `Naming granting groups (${completed}/${total})` },
      )
      .then((outcome) => {
        if (cancelled) return;
        const named: Record<string, string> = {};
        for (const result of outcome.results) {
          if (result.status === 'fulfilled' && result.value) {
            named[result.value[0]] = result.value[1];
          }
        }
        setResolved((prev) => ({ ...prev, ...named }));
        log.info('granting-group fallback finished', {
          code: 'user_apps_grant_group_fallback',
          attempted: outcome.total,
          resolved: Object.keys(named).length,
          failed: outcome.failed,
          cancelled: outcome.cancelled,
        });
      })
      .finally(() => {
        if (!cancelled) setIsResolvingSources(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, userId, pendingKey]);

  const apps = useMemo(() => {
    if (!data) return [];
    if (Object.keys(resolved).length === 0) return data.apps;
    return data.apps.map((app) =>
      app.grantGroupId === undefined && resolved[app.id]
        ? { ...app, grantGroupId: resolved[app.id] }
        : app,
    );
  }, [data, resolved]);

  const appsByGroupId = useMemo(
    () => indexAppsByGroup(summarizeAppSources(apps, memberships).rows),
    [apps, memberships],
  );

  return {
    apps,
    isLoading: query.isLoading,
    error: query.error,
    hasLoaded: data !== null,
    complete: data ? data.complete : true,
    appsByGroupId,
    isResolvingSources,
  };
}

export type { AppsByGroupId };
