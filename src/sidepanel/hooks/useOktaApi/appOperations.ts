import type { CoreApi } from './core';
import { oktaAppListItemSchema, type OktaAppListItem } from '@/shared/schemas/okta';
import {
  oktaAppUserSchema,
  oktaAppGroupSchema,
  oktaAppGroupAssignmentSchema,
} from '@/shared/schemas/okta';
import { parseOkta, parseOktaList } from '@/shared/schemas/okta';
import { fetchAllPages, OKTA_PAGE_SIZE } from '@/shared/utils/oktaPagination';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('useOktaApi');

export interface AppAssignmentCounts {
  users: number;
  groups: number;
}

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

  const getAllApps = async (): Promise<OktaAppListItem[]> =>
    fetchAllPages<OktaAppListItem>(
      (url) => coreApi.makeApiRequest(url),
      `/api/v1/apps?limit=${OKTA_PAGE_SIZE}`,
      {
        schema: oktaAppListItemSchema,
        context: 'GET /api/v1/apps',
        errorMessage: 'Failed to fetch apps',
      },
    );

  const getAppById = async (appId: string): Promise<OktaAppListItem | null> => {
    try {
      const response = await coreApi.makeApiRequest(`/api/v1/apps/${encodeURIComponent(appId)}`);
      if (!response.success || !response.data) return null;
      return parseOkta(oktaAppListItemSchema, response.data, 'GET /api/v1/apps/{id}');
    } catch {
      log.error('getAppById failed', { code: 'get_app_failed', appId });
      return null;
    }
  };

  const getAppAssignmentCounts = async (appId: string): Promise<AppAssignmentCounts | null> => {
    const encodedId = encodeURIComponent(appId);
    try {
      const [users, groups] = await Promise.all([
        fetchAllPages(
          (url) => coreApi.makeApiRequest(url, 'GET', undefined, 'low'),
          `/api/v1/apps/${encodedId}/users?limit=${OKTA_PAGE_SIZE}`,
          { schema: oktaAppUserSchema, context: 'GET /api/v1/apps/{id}/users' },
        ),
        fetchAllPages(
          (url) => coreApi.makeApiRequest(url, 'GET', undefined, 'low'),
          `/api/v1/apps/${encodedId}/groups?limit=${OKTA_PAGE_SIZE}`,
          { schema: oktaAppGroupSchema, context: 'GET /api/v1/apps/{id}/groups' },
        ),
      ]);
      return { users: users.length, groups: groups.length };
    } catch {
      log.error('getAppAssignmentCounts failed', { code: 'app_assignment_counts_failed', appId });
      return null;
    }
  };

  const getAppGroupAssignments = async (appId: string): Promise<string[] | null> => {
    try {
      const groups = await fetchAllPages(
        (url) => coreApi.makeApiRequest(url, 'GET', undefined, 'low'),
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
    getAllApps,
    getAppById,
    getAppAssignmentCounts,
    getAppGroupAssignments,
  };
}
