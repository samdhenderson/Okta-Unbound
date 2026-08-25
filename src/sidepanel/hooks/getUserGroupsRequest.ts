import type { OktaGroup } from '../../shared/types';
import type { CoreApi } from './useOktaApi/core';
import { nextPageUrl } from './useOktaApi/utilities';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('getUserGroupsRequest');

type MakeApiRequest = CoreApi['makeApiRequest'];

export interface UserGroupMembership {
  group: OktaGroup;
  membershipType: 'UNKNOWN';
  addedDate: undefined;
}

export interface GetUserGroupsResult {
  success: boolean;
  data?: UserGroupMembership[];
  count?: number;
  error?: string;
}

export async function getUserGroupsRequest(
  makeApiRequest: MakeApiRequest,
  userId: string,
): Promise<GetUserGroupsResult> {
  log.debug('Fetching user groups', { userId });

  try {
    let allGroups: OktaGroup[] = [];
    let nextUrl: string | null = `/api/v1/users/${userId}/groups?limit=200`;

    while (nextUrl) {
      const response = await makeApiRequest(nextUrl, { reason: "Load user's groups" });

      if (!response.success) {
        return response;
      }

      const page: OktaGroup[] = response.data || [];
      allGroups = allGroups.concat(page);
      nextUrl = nextPageUrl(nextUrl, response.headers?.link, page.length);
    }

    const memberships: UserGroupMembership[] = allGroups.map((group) => ({
      group,
      membershipType: 'UNKNOWN',
      addedDate: undefined,
    }));

    return { success: true, data: memberships, count: memberships.length };
  } catch (error) {
    log.error('getUserGroups error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user groups',
    };
  }
}
