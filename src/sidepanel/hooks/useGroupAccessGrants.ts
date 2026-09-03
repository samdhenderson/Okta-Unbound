import { useCallback, useRef, useState } from 'react';
import { z } from 'zod';
import { useOwedLoad } from './useOwedLoad';
import { useOktaApi } from './useOktaApi';
import { fetchAllPages, OKTA_PAGE_SIZE } from '../../shared/utils/oktaPagination';
import { oktaAppListItemSchema } from '../../shared/schemas/okta';
import { createLogger } from '../../shared/utils/logger';
import type { SourceStatus } from './useGroupSource';

const log = createLogger('useGroupAccessGrants');

export interface AppGrant {
  id: string;
  label: string;
  status?: string;
  signOnMode?: string;
  lastUpdated?: Date;
}

export interface RoleGrant {
  id: string;
  label: string;
}

export type RolesReadStatus = 'loading' | 'available' | 'unavailable';

const oktaGroupRoleRowSchema = z
  .object({
    id: z.string(),
    label: z.string().optional(),
    type: z.string().optional(),
  })
  .passthrough();

export interface UseGroupAccessGrantsReturn {
  apps: AppGrant[];
  appsStatus: SourceStatus;
  appsError: string | null;
  roles: RoleGrant[];
  rolesStatus: RolesReadStatus;
  reload: () => void;
}

function toAppGrant(app: {
  id: string;
  label?: string;
  name?: string;
  status?: string;
  signOnMode?: string;
  lastUpdated?: string | null;
}): AppGrant {
  const lastUpdated = app.lastUpdated ? new Date(app.lastUpdated) : undefined;
  return {
    id: app.id,
    label: app.label ?? app.name ?? app.id,
    status: app.status,
    signOnMode: app.signOnMode,
    lastUpdated: lastUpdated && !Number.isNaN(lastUpdated.getTime()) ? lastUpdated : undefined,
  };
}

function toRoleGrant(role: { id: string; label?: string; type?: string }): RoleGrant {
  return { id: role.id, label: role.label ?? role.type ?? 'Admin role' };
}

export function useGroupAccessGrants(
  groupId: string,
  targetTabId?: number,
  enabled = true,
): UseGroupAccessGrantsReturn {
  const api = useOktaApi({ targetTabId: targetTabId ?? null });
  const { makeApiRequest } = api;

  const [apps, setApps] = useState<AppGrant[]>([]);
  const [appsStatus, setAppsStatus] = useState<SourceStatus>('loading');
  const [appsError, setAppsError] = useState<string | null>(null);

  const [roles, setRoles] = useState<RoleGrant[]>([]);
  const [rolesStatus, setRolesStatus] = useState<RolesReadStatus>('loading');

  const runIdRef = useRef(0);

  const [lastGroupId, setLastGroupId] = useState(groupId);
  if (groupId !== lastGroupId) {
    setLastGroupId(groupId);
    setApps([]);
    setAppsStatus('loading');
    setAppsError(null);
    setRoles([]);
    setRolesStatus('loading');
  }

  const load = useCallback(() => {
    const runId = ++runIdRef.current;
    setAppsStatus('loading');
    setAppsError(null);
    setRolesStatus('loading');

    fetchAllPages(
      (url) => makeApiRequest(url, { reason: 'Load group app assignments' }),
      `/api/v1/groups/${groupId}/apps?limit=${OKTA_PAGE_SIZE}`,
      {
        schema: oktaAppListItemSchema,
        context: 'GET /api/v1/groups/{id}/apps',
      },
    )
      .then((items) => {
        if (runId !== runIdRef.current) return;
        setApps(items.map(toAppGrant));
        setAppsStatus('done');
      })
      .catch((err) => {
        if (runId !== runIdRef.current) return;
        log.error('Failed to load group app assignments:', err);
        setAppsError(err instanceof Error ? err.message : 'Failed to load app assignments');
        setAppsStatus('error');
      });

    fetchAllPages(
      (url) => makeApiRequest(url, { reason: 'Load group admin roles' }),
      `/api/v1/groups/${groupId}/roles`,
      {
        schema: oktaGroupRoleRowSchema,
        context: 'GET /api/v1/groups/{id}/roles',
      },
    )
      .then((items) => {
        if (runId !== runIdRef.current) return;
        setRoles(items.map(toRoleGrant));
        setRolesStatus('available');
      })
      .catch((err) => {
        if (runId !== runIdRef.current) return;
        log.debug('Group admin-roles read unavailable (degrading to hidden)', {
          groupId,
          message: err instanceof Error ? err.message : String(err),
        });
        setRoles([]);
        setRolesStatus('unavailable');
      });
  }, [groupId, makeApiRequest]);

  useOwedLoad(targetTabId == null ? groupId : `${targetTabId}:${groupId}`, enabled, load);

  return { apps, appsStatus, appsError, roles, rolesStatus, reload: load };
}
