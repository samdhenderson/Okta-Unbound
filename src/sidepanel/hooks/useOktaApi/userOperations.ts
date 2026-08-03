import type { CoreApi } from './core';
import type { OktaFactor, MemberMfaResult, OktaUser } from '../../../shared/types';
import { summarizeFactors } from '../../../shared/utils/mfaUtils';
import { fetchAllPages, OKTA_PAGE_SIZE } from '@/shared/utils/oktaPagination';
import { oktaAppListItemSchema, type OktaAppListItem } from '@/shared/schemas/okta';
import { createLogger } from '../../../shared/utils/logger';

const log = createLogger('useOktaApi');

export function createUserOperations(coreApi: CoreApi) {
  const getUserLastLogin = async (userId: string): Promise<Date | null> => {
    try {
      const response = await coreApi.makeApiRequest(`/api/v1/users/${userId}`);
      if (response.success && response.data?.lastLogin) {
        return new Date(response.data.lastLogin);
      }
      return null;
    } catch (error) {
      log.error(`Failed to get last login for user ${userId}:`, error);
      return null;
    }
  };

  const getUserAppAssignments = async (userId: string): Promise<number> => {
    try {
      const response = await coreApi.makeApiRequest(
        `/api/v1/apps?filter=user.id+eq+"${userId}"&limit=${OKTA_PAGE_SIZE}`,
      );
      if (response.success && response.data) {
        const firstPageCount = response.data.length;

        const linkHeader = response.headers?.['link'] || response.headers?.['Link'];
        const hasMorePages = linkHeader && linkHeader.includes('rel="next"');

        if (hasMorePages) {
          return firstPageCount;
        }

        return firstPageCount;
      }
      return 0;
    } catch (error) {
      log.error(`Failed to get app assignments for user ${userId}:`, error);
      return 0;
    }
  };

  const getUserApps = async (userId: string): Promise<Array<{ id: string; label: string }>> => {
    const apps: Array<{ id: string; label: string }> = [];

    try {
      await fetchAllPages<OktaAppListItem>(
        (url) => coreApi.makeApiRequest(url),
        `/api/v1/apps?filter=user.id+eq+"${userId}"&limit=${OKTA_PAGE_SIZE}`,
        {
          schema: oktaAppListItemSchema,
          onPage: (page) => {
            for (const app of page) {
              apps.push({ id: app.id, label: app.label || app.name || app.id });
            }
          },
        },
      );
    } catch (error) {
      log.error(`Failed to list apps for user ${userId}:`, error);
    }

    return apps;
  };

  const batchGetUserDetails = async (
    userIds: string[],
    onProgress?: (current: number, total: number) => void,
  ): Promise<Map<string, OktaUser>> => {
    const userDetailsMap = new Map<string, OktaUser>();
    const total = userIds.length;
    const reportInterval = 3;
    let processed = 0;

    await coreApi.runOperation(
      'Load user details',
      userIds,
      async (userId) => {
        try {
          const response = await coreApi.makeApiRequest(
            `/api/v1/users/${userId}`,
            'GET',
            undefined,
            'low',
          );
          if (response.success && response.data) {
            userDetailsMap.set(userId, response.data);
          }
        } catch (error) {
          log.error(`Failed to fetch user ${userId}:`, error);
        } finally {
          processed += 1;
          if (processed % reportInterval === 0 || processed === total) {
            onProgress?.(processed, total);
          }
        }
      },
      { message: (p) => `Loading user details (${p.completed}/${p.total})` },
    );

    return userDetailsMap;
  };

  const scanGroupMfa = async (
    userIds: string[],
    _onProgress?: (current: number, total: number) => void,
  ): Promise<Map<string, MemberMfaResult>> => {
    const resultMap = new Map<string, MemberMfaResult>();

    await coreApi.runOperation(
      'MFA scan',
      userIds,
      async (userId) => {
        try {
          const response = await coreApi.makeApiRequest(
            `/api/v1/users/${userId}/factors`,
            'GET',
            undefined,
            'low',
          );
          const factors: OktaFactor[] =
            response.success && Array.isArray(response.data) ? response.data : [];
          resultMap.set(userId, summarizeFactors(userId, factors));
        } catch (error) {
          log.error(`Failed to fetch factors for user ${userId}:`, error);
          resultMap.set(userId, summarizeFactors(userId, []));
        }
      },
      { message: (p) => `Scanned ${p.completed}/${p.total} members` },
    );

    return resultMap;
  };

  const getUserGroupMemberships = async (userId: string): Promise<number> => {
    try {
      const response = await coreApi.makeApiRequest(`/api/v1/users/${userId}/groups?limit=1`);
      if (response.success && response.headers?.['x-total-count']) {
        return parseInt(response.headers['x-total-count'], 10);
      }
      return 0;
    } catch (error) {
      log.error(`Failed to get group memberships for user ${userId}:`, error);
      return 0;
    }
  };

  const searchUsers = async (
    query: string,
  ): Promise<
    Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      login: string;
      status: string;
    }>
  > => {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const response = await coreApi.makeApiRequest(
        `/api/v1/users?q=${encodeURIComponent(query)}&limit=20`,
      );

      if (response.success && response.data) {
        return response.data.map((user: OktaUser) => ({
          id: user.id,
          email: user.profile?.email || '',
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          login: user.profile?.login || '',
          status: user.status || 'UNKNOWN',
        }));
      }
      return [];
    } catch (error) {
      log.error('searchUsers error:', error);
      return [];
    }
  };

  const getUserById = async (
    userId: string,
  ): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    login: string;
    status: string;
  } | null> => {
    try {
      const response = await coreApi.makeApiRequest(`/api/v1/users/${userId}`);
      if (response.success && response.data) {
        const user = response.data;
        return {
          id: user.id,
          email: user.profile?.email || '',
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          login: user.profile?.login || '',
          status: user.status || 'UNKNOWN',
        };
      }
      return null;
    } catch (error) {
      log.error('getUserById error:', error);
      return null;
    }
  };

  const suspendUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const result = await coreApi.makeApiRequest(
      `/api/v1/users/${userId}/lifecycle/suspend`,
      'POST',
    );
    return { success: result.success, error: result.error };
  };

  const unsuspendUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const result = await coreApi.makeApiRequest(
      `/api/v1/users/${userId}/lifecycle/unsuspend`,
      'POST',
    );
    return { success: result.success, error: result.error };
  };

  const resetPassword = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const result = await coreApi.makeApiRequest(
      `/api/v1/users/${userId}/lifecycle/reset_password?sendEmail=true`,
      'POST',
    );
    return { success: result.success, error: result.error };
  };

  return {
    getUserLastLogin,
    getUserAppAssignments,
    getUserApps,
    batchGetUserDetails,
    scanGroupMfa,
    getUserGroupMemberships,
    searchUsers,
    getUserById,
    suspendUser,
    unsuspendUser,
    resetPassword,
  };
}
