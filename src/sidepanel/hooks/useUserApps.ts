import { useEffect, useMemo, useRef, useState } from 'react';
import { useOktaApi } from './useOktaApi';
import { useEntityQuery } from '../cache/useEntityQuery';
import { getOrFetch } from '../cache/entityCache';
import { readAppGroupsFromSnapshot } from '../cache/appGroupSnapshot';
import { cacheKeys, TTL_LONG } from '../cache/keys';
import { createLogger } from '../../shared/utils/logger';
import { summarizeAppSources, indexAppsByGroup } from '../components/users/appSourceSummary';
import type { AppsByGroupId } from '../components/users/appSourceSummary';
import type { GroupMembership } from '../../shared/types';
import type { UserAppAssignment, UserAppsResult } from './useOktaApi/userOperations';

const log = createLogger('useUserApps');

export interface UseUserAppsOptions {
  targetTabId: number | null;
  memberships: GroupMembership[] | undefined;
  oktaOrigin?: string | null;
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

function nameGrantor(
  appId: string,
  groupIds: string[] | null,
  memberGroupIds: Set<string>,
): [string, string] | null {
  if (!groupIds) return null;
  const candidates = groupIds.filter((id) => memberGroupIds.has(id));
  return candidates.length === 1 ? [appId, candidates[0]] : null;
}

interface ResolveGrantingGroupsOptions {
  appIds: string[];
  memberGroupIds: Set<string>;
  oktaOrigin?: string | null;
  api: {
    getAppGroupAssignments: (appId: string, planId?: string) => Promise<string[] | null>;
    runOperation: ReturnType<typeof useOktaApi>['runOperation'];
  };
  onResolved: (named: Record<string, string>) => void;
}

async function resolveGrantingGroups({
  appIds,
  memberGroupIds,
  oktaOrigin,
  api,
  onResolved,
}: ResolveGrantingGroupsOptions): Promise<void> {
  let fromSnapshot = new Map<string, string[]>();
  try {
    fromSnapshot = await readAppGroupsFromSnapshot(oktaOrigin);
  } catch {
    log.warn('Snapshot app-group read failed; walking every app instead', {
      code: 'user_apps_snapshot_read_failed',
    });
  }

  const servedLocally: Record<string, string> = {};
  const toWalk: string[] = [];
  for (const appId of appIds) {
    const groupIds = fromSnapshot.get(appId);
    if (groupIds === undefined) {
      toWalk.push(appId);
      continue;
    }
    const named = nameGrantor(appId, groupIds, memberGroupIds);
    if (named) servedLocally[named[0]] = named[1];
  }
  onResolved(servedLocally);

  if (toWalk.length === 0) {
    log.info('granting-group fallback served entirely from the snapshot', {
      code: 'user_apps_grant_group_fallback',
      attempted: appIds.length,
      fromSnapshot: appIds.length,
      resolved: Object.keys(servedLocally).length,
    });
    return;
  }

  const outcome = await api.runOperation<string, [string, string] | null>(
    'Name the groups granting these apps',
    toWalk,
    async (appId, _index, planId) =>
      nameGrantor(
        appId,
        await getOrFetch<string[] | null>(
          cacheKeys.appGroups(appId),
          () => api.getAppGroupAssignments(appId, planId),
          { ttl: TTL_LONG },
        ),
        memberGroupIds,
      ),
    {
      message: ({ completed, total }) => `Naming granting groups (${completed}/${total})`,
      plan: { endpoint: '/api/v1/apps', method: 'GET' },
    },
  );

  const named: Record<string, string> = {};
  for (const result of outcome.results) {
    if (result.status === 'fulfilled' && result.value) {
      named[result.value[0]] = result.value[1];
    }
  }
  onResolved(named);

  log.info('granting-group fallback finished', {
    code: 'user_apps_grant_group_fallback',
    attempted: appIds.length,
    fromSnapshot: appIds.length - toWalk.length,
    resolved: Object.keys(named).length + Object.keys(servedLocally).length,
    failed: outcome.failed,
    cancelled: outcome.cancelled,
  });
}

export function useUserApps(
  userId: string | null,
  { targetTabId, memberships, oktaOrigin, enabled = true }: UseUserAppsOptions,
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
  membershipIdsRef.current = (memberships ?? []).map((m) => m.group.id);
  const apiRef = useRef({ getAppGroupAssignments, runOperation });
  // eslint-disable-next-line react-hooks/refs
  apiRef.current = { getAppGroupAssignments, runOperation };

  const pending = useMemo(() => (data ? unresolvedGroupApps(data.apps) : []), [data]);
  const pendingKey = pending.map((app) => app.id).join(',');

  useEffect(() => {
    if (!enabled || !userId || pendingKey === '') return;

    const latch = `${userId}:${oktaOrigin ?? ''}:${pendingKey}`;
    if (attemptedRef.current === latch) return;
    attemptedRef.current = latch;

    let cancelled = false;
    setIsResolvingSources(true);

    resolveGrantingGroups({
      appIds: pendingKey.split(','),
      memberGroupIds: new Set(membershipIdsRef.current),
      oktaOrigin,
      api: apiRef.current,
      onResolved: (named) => {
        if (!cancelled && Object.keys(named).length > 0) {
          setResolved((prev) => ({ ...prev, ...named }));
        }
      },
    }).finally(() => {
      if (!cancelled) setIsResolvingSources(false);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, userId, oktaOrigin, pendingKey]);

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
    () => indexAppsByGroup(summarizeAppSources(apps, memberships ?? []).rows),
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
