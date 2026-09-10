import type { OktaUser } from '../../shared/types';
import type { CoreApi } from './useOktaApi/core';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('searchUsersRequest');

type MakeApiRequest = CoreApi['makeApiRequest'];

export interface SearchUsersResult {
  success: boolean;
  data?: OktaUser[];
  count?: number;
  error?: string;
}

const SEARCHED_FIELDS = [
  'profile.firstName',
  'profile.lastName',
  'profile.login',
  'profile.email',
] as const;

function scimString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function nameSearchExpression(query: string): string {
  const clauses = SEARCHED_FIELDS.map((field) => `${field} sw ${scimString(query)}`);

  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const first = scimString(tokens[0]);
    const last = scimString(tokens[tokens.length - 1]);
    clauses.push(`(profile.firstName sw ${first} and profile.lastName sw ${last})`);
  }

  return clauses.join(' or ');
}

export async function searchUsersRequest(
  makeApiRequest: MakeApiRequest,
  rawQuery: string,
): Promise<SearchUsersResult> {
  try {
    const trimmedQuery = rawQuery.trim();
    let users: OktaUser[] = [];

    const qParam = encodeURIComponent(trimmedQuery);
    let response = await makeApiRequest(`/api/v1/users?q=${qParam}&limit=20`, {
      method: 'GET',
      priority: 'interactive',
      reason: 'Search users',
    });

    if (response.success && response.data && response.data.length > 0) {
      users = response.data;
    } else {
      const searchParam = encodeURIComponent(nameSearchExpression(trimmedQuery));
      response = await makeApiRequest(`/api/v1/users?search=${searchParam}&limit=20`, {
        method: 'GET',
        priority: 'interactive',
        reason: 'Search users',
      });
      if (response.success && response.data) {
        users = response.data;
      }
    }

    if (users.length === 0 && trimmedQuery.includes('@')) {
      response = await makeApiRequest(
        `/api/v1/users?filter=profile.email eq "${trimmedQuery}"&limit=20`,
        {
          method: 'GET',
          priority: 'interactive',
          reason: 'Search users',
        },
      );
      if (response.success && response.data) {
        users = response.data;
      }
    }

    log.debug('User search complete', { count: users.length });
    return { success: true, data: users, count: users.length };
  } catch (error) {
    log.error('searchUsers error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search users',
    };
  }
}
