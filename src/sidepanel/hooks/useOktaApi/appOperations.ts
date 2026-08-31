import { z } from 'zod';
import type { CoreApi } from './core';
import type { RequestResult } from '@/shared/scheduler/types';
import { oktaAppListItemSchema, type OktaAppListItem } from '@/shared/schemas/okta';
import {
  oktaAppUserSchema,
  oktaAppGroupSchema,
  oktaAppGroupAssignmentSchema,
} from '@/shared/schemas/okta';
import { parseOkta, parseOktaList } from '@/shared/schemas/okta';
import { fetchAllPages, OKTA_PAGE_SIZE } from '@/shared/utils/oktaPagination';
import { readTotalCount } from '@/shared/snapshot/syncMeta';
import { isSessionExpired, NO_HTTP_STATUS } from '@/shared/scheduler/requestResult';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('useOktaApi');

const HTTP_NOT_FOUND = 404;

export interface AppAssignmentCounts {
  users: number;
  groups: number;
}

export type AppLookup =
  | { kind: 'found'; app: OktaAppListItem }
  | { kind: 'missing' }
  | { kind: 'session-expired' }
  | { kind: 'failed'; status: number };

export interface AppSummary {
  id: string;
  label: string;
  status?: string;
}

export function createAppOperations(coreApi: CoreApi) {
  const searchApps = async (query: string): Promise<AppSummary[]> => {
    if (!query || query.length < 2) return [];
    try {
      const response = await coreApi.makeApiRequest(
        `/api/v1/apps?q=${encodeURIComponent(query)}&limit=20`,
        { reason: 'Search apps by name' },
      );
      if (!response.success) return [];
      const apps = parseOktaList(oktaAppListItemSchema, response.data, 'GET /api/v1/apps?q');
      return apps.map((app) => ({
        id: app.id,
        label: app.label || app.name || app.id,
        status: app.status,
      }));
    } catch {
      log.error('searchApps failed', { code: 'search_failed' });
      return [];
    }
  };

  const getAppById = async (appId: string): Promise<AppLookup> => {
    let response: RequestResult;
    try {
      response = await coreApi.makeApiRequest(`/api/v1/apps/${encodeURIComponent(appId)}`, {
        reason: 'Load app details',
      });
    } catch {
      log.error('getAppById transport failed', { code: 'get_app_failed', appId });
      return { kind: 'failed', status: NO_HTTP_STATUS };
    }

    if (!response.success) {
      if (response.status === HTTP_NOT_FOUND) return { kind: 'missing' };
      if (isSessionExpired(response)) return { kind: 'session-expired' };
      log.error('getAppById failed', {
        code: 'get_app_failed',
        appId,
        status: response.status,
      });
      return { kind: 'failed', status: response.status };
    }

    const status = response.status ?? NO_HTTP_STATUS;
    if (!response.data) return { kind: 'failed', status };
    try {
      return {
        kind: 'found',
        app: parseOkta(oktaAppListItemSchema, response.data, 'GET /api/v1/apps/{id}'),
      };
    } catch {
      log.error('getAppById validation failed', { code: 'get_app_invalid', appId });
      return { kind: 'failed', status };
    }
  };

  const countAssignments = async <T>(
    probeUrl: string,
    walkUrl: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    context: string,
    planId?: string,
  ): Promise<number> => {
    const request = (url: string) =>
      coreApi.makeApiRequest(url, {
        method: 'GET',
        priority: 'low',
        reason: 'Count app assignments',
        planId,
      });

    const probe = await request(probeUrl);
    if (probe.success) {
      const total = readTotalCount(probe.headers);
      if (total !== null) return total;
    }

    const rows = await fetchAllPages(request, walkUrl, { schema, context });
    return rows.length;
  };

  const getAppAssignmentCounts = async (appId: string): Promise<AppAssignmentCounts | null> => {
    const encodedId = encodeURIComponent(appId);
    try {
      const { users, groups } = await coreApi.withPlan(
        'Count app assignments',
        [{ endpoint: `/api/v1/apps`, method: 'GET', estimate: { kind: 'atLeast', requests: 2 } }],
        async (plan) => {
          const [users, groups] = await Promise.all([
            countAssignments(
              `/api/v1/apps/${encodedId}/users?limit=1`,
              `/api/v1/apps/${encodedId}/users?limit=${OKTA_PAGE_SIZE}`,
              oktaAppUserSchema,
              'GET /api/v1/apps/{id}/users',
              plan.planId,
            ),
            countAssignments(
              `/api/v1/apps/${encodedId}/groups?limit=1`,
              `/api/v1/apps/${encodedId}/groups?limit=${OKTA_PAGE_SIZE}`,
              oktaAppGroupSchema,
              'GET /api/v1/apps/{id}/groups',
              plan.planId,
            ),
          ]);
          return { users, groups };
        },
      );
      return { users, groups };
    } catch {
      log.error('getAppAssignmentCounts failed', { code: 'app_assignment_counts_failed', appId });
      return null;
    }
  };

  const getAppGroupAssignments = async (
    appId: string,
    planId?: string,
  ): Promise<string[] | null> => {
    try {
      const groups = await fetchAllPages(
        (url) =>
          coreApi.makeApiRequest(url, {
            method: 'GET',
            priority: 'low',
            reason: 'Load app group assignments',
            planId,
          }),
        `/api/v1/apps/${encodeURIComponent(appId)}/groups?limit=${OKTA_PAGE_SIZE}`,
        {
          schema: oktaAppGroupAssignmentSchema,
          context: 'GET /api/v1/apps/{id}/groups',
        },
      );
      return groups.map((group) => group.id);
    } catch {
      log.error('getAppGroupAssignments failed', { code: 'app_group_assignments_failed', appId });
      return null;
    }
  };

  return {
    searchApps,
    getAppById,
    getAppAssignmentCounts,
    getAppGroupAssignments,
  };
}
