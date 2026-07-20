import type { MessageResponse, OktaUser, OktaGroup, UserInfo, UserStatus } from '../shared/types';
import { createLogger } from '../shared/utils/logger';
import { oktaUserSchema, parseOkta } from '../shared/schemas/okta';
import { extractUserIdFromUrl, extractUserNameFromPage } from './pageContext';
import { handleMakeApiRequest } from './apiRequest';

const log = createLogger('Content');

export async function handleGetUserInfo(): Promise<MessageResponse<UserInfo>> {
  log.debug('Processing getUserInfo request');

  try {
    const url = window.location.href;
    log.debug('Current page location', { path: window.location.pathname });

    const userId = extractUserIdFromUrl(url);
    log.debug('Extracted userId', { userId });

    if (!userId) {
      return {
        success: false,
        error: 'Not on a user page. Please navigate to a specific user page.',
      };
    }

    let userName: string | undefined;
    let userEmail: string | undefined;
    let userStatus: UserStatus | undefined;

    log.debug('Fetching user details from API');
    try {
      const response = await handleMakeApiRequest(`/api/v1/users/${userId}`, 'GET');
      if (response.success) {
        const user = parseOkta(oktaUserSchema, response.data, 'GET /api/v1/users/{id}');
        const profile = user.profile;
        userName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        userEmail = profile.email;
        userStatus = user.status;
        log.debug('Fetched user details from API', {
          hasName: Boolean(userName),
          hasEmail: Boolean(userEmail),
          userStatus,
        });
      }
    } catch (e) {
      log.warn('Failed to fetch user details from API', e);
    }

    if (!userName) {
      userName = extractUserNameFromPage() || undefined;
      log.debug('Extracted userName from page (fallback)', { found: Boolean(userName) });
    }

    const result: UserInfo = {
      userId,
      userName: userName || 'Unknown',
      userEmail,
      userStatus,
    };

    log.debug('getUserInfo result', {
      userId: result.userId,
      hasName: result.userName !== 'Unknown',
      hasEmail: Boolean(result.userEmail),
      userStatus: result.userStatus,
    });
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    log.error('getUserInfo error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleSearchUsers(query: string): Promise<MessageResponse> {
  log.debug('Processing searchUsers request', { queryLength: query.length });

  try {
    const trimmedQuery = query.trim();

    let users: OktaUser[] = [];

    const qParam = encodeURIComponent(trimmedQuery);
    const qSearchUrl = `/api/v1/users?q=${qParam}&limit=20`;

    log.debug('Searching users with q parameter');
    let response = await handleMakeApiRequest(qSearchUrl, 'GET');

    if (response.success && response.data && response.data.length > 0) {
      users = response.data;
      log.debug('Found users with q search', { count: users.length });
    } else {
      const searchParam = encodeURIComponent(trimmedQuery);
      const searchUrl = `/api/v1/users?search=${searchParam}&limit=20`;

      log.debug('Trying search parameter');
      response = await handleMakeApiRequest(searchUrl, 'GET');

      if (response.success && response.data) {
        users = response.data;
        log.debug('Found users with search parameter', { count: users.length });
      }
    }

    if (users.length === 0 && trimmedQuery.includes('@')) {
      const filterUrl = `/api/v1/users?filter=profile.email eq "${trimmedQuery}"&limit=20`;
      log.debug('Trying email filter');
      response = await handleMakeApiRequest(filterUrl, 'GET');

      if (response.success && response.data) {
        users = response.data;
        log.debug('Found users with email filter', { count: users.length });
      }
    }

    return {
      success: true,
      data: users,
      count: users.length,
    };
  } catch (error) {
    log.error('searchUsers error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search users',
    };
  }
}

export async function handleGetUserGroups(userId: string): Promise<MessageResponse> {
  log.debug('Processing getUserGroups request', { userId });

  try {
    let allGroups: OktaGroup[] = [];
    let nextUrl: string | null = `/api/v1/users/${userId}/groups?limit=200`;

    while (nextUrl) {
      const response = await handleMakeApiRequest(nextUrl, 'GET');

      if (!response.success) {
        return response;
      }

      allGroups = allGroups.concat(response.data || []);

      nextUrl = null;
      if (response.headers?.link) {
        const links = response.headers.link.split(',');
        for (const link of links) {
          if (link.includes('rel="next"')) {
            const match = link.match(/<([^>]+)>/);
            if (match) {
              const fullUrl = new URL(match[1]);
              nextUrl = fullUrl.pathname + fullUrl.search;
              break;
            }
          }
        }
      }
    }

    const memberships = allGroups.map((group) => ({
      group: group,
      membershipType: 'UNKNOWN', // We don't know the source from this endpoint
      addedDate: undefined, // Not available from Okta API
    }));

    return {
      success: true,
      data: memberships,
      count: memberships.length,
    };
  } catch (error) {
    log.error('getUserGroups error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user groups',
    };
  }
}

export async function handleGetUserContext(userId: string): Promise<MessageResponse> {
  log.debug('Processing getUserContext request', { userId });

  try {
    const endpoint = `/admin/users/search?iDisplayLength=1&sColumns=user.id%2CmanagedBy.rules&sSearch=${userId}`;

    const response = await handleMakeApiRequest(endpoint, 'GET');

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    const responseData = response.data;
    if (!responseData?.aaData?.[0]) {
      return {
        success: false,
        error: 'User context not found or invalid response',
      };
    }

    const userData = responseData.aaData[0];
    const managedByRulesRaw = userData[1]; // Index 1 because sColumns="user.id,managedBy.rules"

    let rules: string[] = [];
    if (managedByRulesRaw) {
      if (Array.isArray(managedByRulesRaw)) {
        rules = managedByRulesRaw;
      } else if (typeof managedByRulesRaw === 'string' && managedByRulesRaw.trim()) {
        rules = [managedByRulesRaw];
      } else if (
        typeof managedByRulesRaw === 'object' &&
        (managedByRulesRaw.id || managedByRulesRaw.ruleId)
      ) {
        rules = [managedByRulesRaw.id || managedByRulesRaw.ruleId];
      }
    }

    return {
      success: true,
      data: {
        userId: userData[0],
        managedByRules: rules,
      },
    };
  } catch (error) {
    log.error('getUserContext error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user context',
    };
  }
}

export async function handleGetUserDetails(userId: string): Promise<MessageResponse> {
  log.debug('Processing getUserDetails request', { userId });

  try {
    const response = await handleMakeApiRequest(`/api/v1/users/${userId}`, 'GET');

    if (!response.success) {
      return response;
    }

    log.debug('Retrieved user details');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    log.error('getUserDetails error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user details',
    };
  }
}
