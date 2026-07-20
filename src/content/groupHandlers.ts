import type { MessageRequest, MessageResponse, OktaUser, GroupInfo } from '../shared/types';
import { createLogger } from '../shared/utils/logger';
import {
  oktaGroupSchema,
  oktaGroupListItemSchema,
  oktaUserListItemSchema,
  parseOkta,
  parseOktaList,
} from '../shared/schemas/okta';
import { extractGroupIdFromUrl, extractGroupNameFromPage } from './pageContext';
import { handleMakeApiRequest } from './apiRequest';
import { convertToCSV, downloadFile } from './exportHelpers';

const log = createLogger('Content');

export async function handleGetGroupInfo(): Promise<MessageResponse<GroupInfo>> {
  log.debug('Processing getGroupInfo request');

  try {
    const url = window.location.href;
    log.debug('Current page location', { path: window.location.pathname });

    const groupId = extractGroupIdFromUrl(url);
    log.debug('Extracted groupId', { groupId });

    if (!groupId) {
      return {
        success: false,
        error: 'Not on a group page. Please navigate to a specific group page.',
      };
    }

    let groupName = extractGroupNameFromPage();
    log.debug('Extracted groupName from page', { found: Boolean(groupName) });

    if (!groupName) {
      log.debug('Fetching group name from API');
      try {
        const response = await handleMakeApiRequest(`/api/v1/groups/${groupId}`, 'GET');
        if (response.success) {
          const group = parseOkta(oktaGroupSchema, response.data, 'GET /api/v1/groups/{id}');
          groupName = group.profile.name;
          log.debug('Fetched groupName from API', { found: Boolean(groupName) });
        }
      } catch (e) {
        log.warn('Failed to fetch group name from API', e);
      }
    }

    const result: GroupInfo = {
      groupId,
      groupName: groupName || 'Unknown',
    };

    log.debug('getGroupInfo result', {
      groupId: result.groupId,
      hasName: result.groupName !== 'Unknown',
    });
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    log.error('getGroupInfo error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleExportGroupMembers(request: MessageRequest): Promise<MessageResponse> {
  log.debug('Processing exportGroupMembers request');

  try {
    const { groupId, groupName, format, statusFilter } = request;

    const members = await fetchAllGroupMembers(groupId!);

    let filteredMembers = members;
    if (statusFilter) {
      filteredMembers = members.filter((u: OktaUser) => u.status === statusFilter);
    }

    const filename = `${groupName}_members_${new Date().toISOString().split('T')[0]}.${format}`;
    let content: string;

    if (format === 'csv') {
      content = convertToCSV(filteredMembers);
    } else {
      content = JSON.stringify(filteredMembers, null, 2);
    }

    downloadFile(filename, content, format === 'csv' ? 'text/csv' : 'application/json');

    return {
      success: true,
      count: filteredMembers.length,
    };
  } catch (error) {
    log.error('exportGroupMembers error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}

export async function fetchAllGroupMembers(groupId: string): Promise<OktaUser[]> {
  let allMembers: OktaUser[] = [];
  let nextUrl: string | null = `/api/v1/groups/${groupId}/users?limit=200`;

  while (nextUrl) {
    const response = await handleMakeApiRequest(nextUrl, 'GET');

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch group members');
    }

    allMembers = allMembers.concat(
      parseOktaList(oktaUserListItemSchema, response.data, 'GET /api/v1/groups/{id}/users'),
    );

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

  return allMembers;
}

export async function handleSearchGroups(query: string): Promise<MessageResponse> {
  log.debug('Processing searchGroups request', { queryLength: query.length });

  try {
    const trimmedQuery = query.trim();

    const qParam = encodeURIComponent(trimmedQuery);
    const searchUrl = `/api/v1/groups?q=${qParam}&limit=20&expand=stats`;

    log.debug('Searching groups with q parameter');
    const response = await handleMakeApiRequest(searchUrl, 'GET');

    if (response.success && response.data) {
      const groups = parseOktaList(oktaGroupListItemSchema, response.data, 'GET /api/v1/groups?q');
      log.debug('Found groups', { count: groups.length });

      return {
        success: true,
        data: groups,
        count: groups.length,
      };
    }

    return {
      success: true,
      data: [],
      count: 0,
    };
  } catch (error) {
    log.error('searchGroups error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search groups',
    };
  }
}
