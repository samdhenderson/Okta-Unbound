import type {
  MessageRequest,
  MessageResponse,
  OktaUser,
  OktaGroup,
  OktaGroupRule,
  RuleConflict,
  GroupInfo,
  UserInfo,
  UserStatus,
  ApiResponse,
} from '../shared/types';
import { getCacheEntry, setCacheEntry } from '../shared/cache';
import { createLogger } from '../shared/utils/logger';
import { oktaUserSchema, oktaGroupSchema, parseOkta } from '../shared/schemas/okta';

const log = createLogger('Content');

log.debug('Content script loaded', {
  readyState: document.readyState,
});

chrome.runtime.onMessage.addListener(
  (
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void,
  ) => {
    log.debug('Received message', {
      action: request.action,
      from: sender.id,
    });

    switch (request.action) {
      case 'getGroupInfo':
        handleGetGroupInfo().then(sendResponse);
        return true;

      case 'getUserInfo':
        handleGetUserInfo().then(sendResponse);
        return true;

      case 'getAppInfo':
        handleGetAppInfo().then(sendResponse);
        return true;

      case 'makeApiRequest':
        if (!request.endpoint) {
          sendResponse({ success: false, error: 'Missing endpoint' });
          return true;
        }
        handleMakeApiRequest(request.endpoint, request.method, request.body).then(sendResponse);
        return true;

      case 'exportGroupMembers':
        if (!request.groupId || !request.format) {
          sendResponse({ success: false, error: 'Missing groupId or format' });
          return true;
        }
        handleExportGroupMembers(request).then(sendResponse);
        return true;

      case 'fetchGroupRules':
        handleFetchGroupRules(request.groupId).then(sendResponse);
        return true;

      case 'activateRule':
        if (!request.ruleId) {
          sendResponse({ success: false, error: 'Missing ruleId' });
          return true;
        }
        handleActivateRule(request.ruleId).then(sendResponse);
        return true;

      case 'deactivateRule':
        if (!request.ruleId) {
          sendResponse({ success: false, error: 'Missing ruleId' });
          return true;
        }
        handleDeactivateRule(request.ruleId).then(sendResponse);
        return true;

      case 'searchUsers':
        if (!request.query) {
          sendResponse({ success: false, error: 'Missing query' });
          return true;
        }
        handleSearchUsers(request.query).then(sendResponse);
        return true;

      case 'searchGroups':
        if (!request.query) {
          sendResponse({ success: false, error: 'Missing query' });
          return true;
        }
        handleSearchGroups(request.query).then(sendResponse);
        return true;

      case 'getUserGroups':
        if (!request.userId) {
          sendResponse({ success: false, error: 'Missing userId' });
          return true;
        }
        handleGetUserGroups(request.userId).then(sendResponse);
        return true;

      case 'getUserDetails':
        if (!request.userId) {
          sendResponse({ success: false, error: 'Missing userId' });
          return true;
        }
        handleGetUserDetails(request.userId).then(sendResponse);
        return true;

      case 'getUserContext':
        if (!request.userId) {
          sendResponse({ success: false, error: 'Missing userId' });
          return true;
        }
        handleGetUserContext(request.userId).then(sendResponse);
        return true;

      case 'getOktaOrigin':
        sendResponse({ success: true, data: window.location.origin });
        return true;

      default:
        log.warn('Unknown action', { action: request.action });
        sendResponse({ success: false, error: 'Unknown action' });
        return true;
    }
  },
);

async function handleMakeApiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: unknown,
): Promise<ApiResponse> {
  log.debug('makeApiRequest called', {
    endpoint: endpoint.split('?')[0],
    method,
    hasBody: !!body,
  });

  try {
    const url = window.location.origin + endpoint;

    const xsrfToken = getXsrfToken();
    log.debug('XSRF token check', { present: xsrfToken.length > 0 });

    const options: RequestInit = {
      method,
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        'X-Requested-With': 'XMLHttpRequest',
        ...(xsrfToken && { 'X-Okta-Xsrftoken': xsrfToken }),
      },
      credentials: 'include',
      cache: 'no-store',
      mode: 'cors',
      redirect: 'follow',
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    log.debug('About to call fetch()');
    const response = await fetch(url, options);
    log.debug('fetch() completed');

    log.debug('Okta API response', {
      endpoint: endpoint.split('?')[0],
      status: response.status,
      ok: response.ok,
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    if (method === 'DELETE' && response.ok) {
      return {
        success: true,
        data: null,
        headers,
        status: response.status,
      };
    }

    let data: unknown = null;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        log.warn('Failed to parse JSON response');
      }
    }

    if (!response.ok) {
      const errorBody = data as { errorSummary?: string; message?: string } | null;
      return {
        success: false,
        error:
          errorBody?.errorSummary ||
          errorBody?.message ||
          `Request failed with status ${response.status}`,
        status: response.status,
        data,
      };
    }

    return {
      success: true,
      data,
      headers,
      status: response.status,
    };
  } catch (error) {
    log.error('makeApiRequest error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function handleGetGroupInfo(): Promise<MessageResponse<GroupInfo>> {
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

async function handleGetUserInfo(): Promise<MessageResponse<UserInfo>> {
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

async function handleGetAppInfo(): Promise<MessageResponse<import('../shared/types').AppInfo>> {
  log.debug('Processing getAppInfo request');

  try {
    const url = window.location.href;
    log.debug('Current page location', { path: window.location.pathname });

    const appId = extractAppIdFromUrl(url);
    log.debug('Extracted appId', { appId });

    if (!appId) {
      return {
        success: false,
        error: 'Not on an app page. Please navigate to a specific app page.',
      };
    }

    let appName = extractAppNameFromPage();
    let appLabel: string | undefined;
    log.debug('Extracted appName from page', { found: Boolean(appName) });

    log.debug('Fetching app details from API');
    try {
      const response = await handleMakeApiRequest(`/api/v1/apps/${appId}`, 'GET');
      if (response.success && response.data) {
        appName = appName || response.data.name || response.data.label || 'Unknown';
        appLabel = response.data.label;
        log.debug('Fetched app details from API', {
          hasName: Boolean(appName),
          hasLabel: Boolean(appLabel),
        });
      }
    } catch (e) {
      log.warn('Failed to fetch app details from API', e);
    }

    const result = {
      appId,
      appName: appName || 'Unknown',
      appLabel,
    };

    log.debug('getAppInfo result', {
      appId: result.appId,
      hasName: result.appName !== 'Unknown',
      hasLabel: Boolean(result.appLabel),
    });
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    log.error('getAppInfo error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function handleExportGroupMembers(request: MessageRequest): Promise<MessageResponse> {
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

async function handleFetchGroupRules(groupId?: string): Promise<MessageResponse> {
  log.debug('Processing fetchGroupRules request', { groupId });

  try {
    let allRules: OktaGroupRule[] = [];
    let nextUrl: string | null = '/api/v1/groups/rules?limit=200';

    while (nextUrl) {
      const response = await handleMakeApiRequest(nextUrl, 'GET');

      if (!response.success) {
        return response;
      }

      allRules = allRules.concat(response.data || []);

      nextUrl = null;
      if (response.headers?.link) {
        const links = response.headers.link.split(',');
        for (const link of links) {
          if (link.includes('rel="next"')) {
            const match = link.match(/<([^>]+)>/);
            if (match) {
              const fullUrl = new URL(match[1]);
              nextUrl = fullUrl.pathname + fullUrl.search;
              log.debug('Fetching next page of rules', { path: fullUrl.pathname });
              break;
            }
          }
        }
      }
    }

    const rules: OktaGroupRule[] = allRules;
    log.debug('Fetched rules (total across all pages)', { count: rules.length });

    const currentGroupId = groupId || extractGroupIdFromUrl(window.location.href);

    const allGroupIds = new Set<string>();
    rules.forEach((rule) => {
      const groupIds = rule.actions?.assignUserToGroups?.groupIds || [];
      groupIds.forEach((id: string) => allGroupIds.add(id));

      const expression = rule.conditions?.expression?.value || '';
      const groupIdPattern = /\b00g[a-zA-Z0-9]{17}\b/g;
      const matches = expression.match(groupIdPattern);
      if (matches) {
        matches.forEach((id: string) => allGroupIds.add(id));
      }
    });

    const groupNameMap = new Map<string, string>();
    log.debug('Fetching group names in parallel', { count: allGroupIds.size });

    const groupFetchPromises = Array.from(allGroupIds).map(async (groupId) => {
      try {
        const cacheKey = `group_name_${groupId}`;
        const cachedName = await getCacheEntry<string>(cacheKey);

        if (cachedName) {
          log.debug('Using cached name for group', { groupId });
          return { groupId, name: cachedName };
        }

        const groupResponse = await handleMakeApiRequest(`/api/v1/groups/${groupId}`, 'GET');
        if (groupResponse.success && groupResponse.data?.profile?.name) {
          const groupName = groupResponse.data.profile.name;

          await setCacheEntry(cacheKey, groupName, { ttl: 5 * 60 * 1000 });

          return { groupId, name: groupName };
        }
      } catch (err) {
        log.warn('Failed to fetch group name for group', { groupId }, err);
      }
      return null;
    });

    const groupResults = await Promise.all(groupFetchPromises);

    groupResults.forEach((result) => {
      if (result) {
        groupNameMap.set(result.groupId, result.name);
      }
    });

    log.debug('Successfully fetched group names (parallel fetch with caching)', {
      count: groupNameMap.size,
    });

    const activeRules = rules.filter((r) => r.status === 'ACTIVE');
    const inactiveRules = rules.filter((r) => r.status === 'INACTIVE');

    let conflictCount = 0;
    const conflicts: RuleConflict[] = [];

    for (let i = 0; i < activeRules.length; i++) {
      for (let j = i + 1; j < activeRules.length; j++) {
        const rule1 = activeRules[i];
        const rule2 = activeRules[j];

        const groups1 = rule1.actions?.assignUserToGroups?.groupIds || [];
        const groups2 = rule2.actions?.assignUserToGroups?.groupIds || [];
        const sharedGroups = groups1.filter((g: string) => groups2.includes(g));

        if (sharedGroups.length > 0) {
          const expr1 = rule1.conditions?.expression?.value || '';
          const expr2 = rule2.conditions?.expression?.value || '';
          const attrs1 = (expr1.match(/user\.(\w+)/g) || []).map((m: string) =>
            m.replace('user.', ''),
          );
          const attrs2 = (expr2.match(/user\.(\w+)/g) || []).map((m: string) =>
            m.replace('user.', ''),
          );
          const commonAttrs = attrs1.filter((a: string) => attrs2.includes(a));

          if (commonAttrs.length > 0) {
            conflictCount++;
            conflicts.push({
              rule1: { id: rule1.id, name: rule1.name },
              rule2: { id: rule2.id, name: rule2.name },
              reason: `Both rules use ${commonAttrs.join(', ')} and assign to ${sharedGroups.length} shared group(s)`,
              severity:
                sharedGroups.length > 2 ? 'high' : sharedGroups.length > 1 ? 'medium' : 'low',
              affectedGroups: sharedGroups,
            });
          }
        }
      }
    }

    const formattedRules = rules.map((rule) => {
      const groupIds = rule.actions?.assignUserToGroups?.groupIds || [];
      const expression = rule.conditions?.expression?.value || 'No condition specified';

      const attrs = (expression.match(/user\.(\w+)/g) || []).map((m: string) =>
        m.replace('user.', ''),
      );

      const simpleCondition = expression
        .replace(/user\./g, '')
        .replace(/isMemberOfAnyGroup/g, 'is member of group')
        .replace(/isMemberOfGroup/g, 'is member of group');

      const affectsCurrentGroup = currentGroupId ? groupIds.includes(currentGroupId) : false;

      const ruleConflicts = conflicts.filter(
        (c) => c.rule1.id === rule.id || c.rule2.id === rule.id,
      );

      const groupNames = groupIds.map((id: string) => groupNameMap.get(id) || id);

      const conditionGroupIds = expression.match(/\b00g[a-zA-Z0-9]{17}\b/g) || [];
      const allGroupIdsInRule = [...new Set([...groupIds, ...conditionGroupIds])];
      const allGroupNamesMap: Record<string, string> = {};
      allGroupIdsInRule.forEach((id) => {
        const name = groupNameMap.get(id);
        if (name) {
          allGroupNamesMap[id] = name;
        }
      });

      return {
        id: rule.id,
        name: rule.name,
        status: rule.status,
        type: rule.type || 'group_rule',
        condition: simpleCondition,
        conditionExpression: expression,
        groupIds,
        groupNames,
        allGroupNamesMap, // New field: map of all group IDs (in condition and targets) to names
        userAttributes: attrs,
        created: rule.created,
        lastUpdated: rule.lastUpdated,
        affectsCurrentGroup,
        conflicts: ruleConflicts,
      };
    });

    const stats = {
      total: rules.length,
      active: activeRules.length,
      inactive: inactiveRules.length,
      conflicts: conflictCount,
    };

    log.debug('Rule stats', stats);

    return {
      success: true,
      rules: formattedRules,
      stats,
      conflicts,
    };
  } catch (error) {
    log.error('fetchGroupRules error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch rules',
    };
  }
}

async function handleActivateRule(ruleId: string): Promise<MessageResponse> {
  log.debug('Activating rule', { ruleId });

  try {
    const response = await handleMakeApiRequest(
      `/api/v1/groups/rules/${ruleId}/lifecycle/activate`,
      'POST',
    );

    if (response.success) {
      log.debug('Rule activated successfully');
      return { success: true };
    } else {
      return response;
    }
  } catch (error) {
    log.error('activateRule error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate rule',
    };
  }
}

async function handleDeactivateRule(ruleId: string): Promise<MessageResponse> {
  log.debug('Deactivating rule', { ruleId });

  try {
    const response = await handleMakeApiRequest(
      `/api/v1/groups/rules/${ruleId}/lifecycle/deactivate`,
      'POST',
    );

    if (response.success) {
      log.debug('Rule deactivated successfully');
      return { success: true };
    } else {
      return response;
    }
  } catch (error) {
    log.error('deactivateRule error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate rule',
    };
  }
}

async function handleSearchUsers(query: string): Promise<MessageResponse> {
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

async function handleSearchGroups(query: string): Promise<MessageResponse> {
  log.debug('Processing searchGroups request', { queryLength: query.length });

  try {
    const trimmedQuery = query.trim();

    const qParam = encodeURIComponent(trimmedQuery);
    const searchUrl = `/api/v1/groups?q=${qParam}&limit=20&expand=stats`;

    log.debug('Searching groups with q parameter');
    const response = await handleMakeApiRequest(searchUrl, 'GET');

    if (response.success && response.data) {
      const groups = response.data;
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

async function handleGetUserGroups(userId: string): Promise<MessageResponse> {
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
async function handleGetUserContext(userId: string): Promise<MessageResponse> {
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

async function handleGetUserDetails(userId: string): Promise<MessageResponse> {
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

function getXsrfToken(): string {
  const xsrfElement = document.getElementById('_xsrfToken');
  return xsrfElement ? xsrfElement.textContent || '' : '';
}

function extractGroupIdFromUrl(url: string): string | null {
  const match1 = url.match(/\/admin\/group\/([a-zA-Z0-9]+)/);
  if (match1) return match1[1];

  const match2 = url.match(/\/groups\/([a-zA-Z0-9]+)/);
  if (match2) return match2[1];

  return null;
}

function extractGroupNameFromPage(): string | null {
  const selectors = [
    'h1[data-se="group-name"]',
    '.group-profile-header h1',
    '[data-se="group-detail-name"]',
    'h1.okta-form-title',
    '.content-container h1',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent?.trim() || null;
    }
  }

  return null;
}

function extractUserIdFromUrl(url: string): string | null {
  log.debug('extractUserIdFromUrl: parsing URL', { path: url.split('?')[0] });

  const patterns: Array<{ regex: RegExp; name: string }> = [
    {
      regex: /\/admin\/user\/profile\/view\/([a-zA-Z0-9]+)/,
      name: '/admin/user/profile/view/{id}',
    },
    { regex: /\/admin\/user\/profile\/([a-zA-Z0-9]+)/, name: '/admin/user/profile/{id}' },

    { regex: /\/admin\/user\/([a-zA-Z0-9]+)(?:\/|$|\?)/, name: '/admin/user/{id}' },
    { regex: /\/admin\/users\/([a-zA-Z0-9]+)(?:\/|$|\?)/, name: '/admin/users/{id}' },

    { regex: /\/admin\/directory\/people\/([a-zA-Z0-9]+)/, name: '/admin/directory/people/{id}' },

    {
      regex: /\/enduser\/settings\/profile\/([a-zA-Z0-9]+)/,
      name: '/enduser/settings/profile/{id}',
    },
    { regex: /\/app\/UserHome\/([a-zA-Z0-9]+)/, name: '/app/UserHome/{id}' },

    { regex: /\/users\/([a-zA-Z0-9]+)(?:\/|$|\?)/, name: '/users/{id}' },

    { regex: /\/reports\/user\/([a-zA-Z0-9]+)/, name: '/reports/user/{id}' },

    { regex: /[?&]userId=([a-zA-Z0-9]+)/, name: '?userId={id}' },
    { regex: /[?&]user=([a-zA-Z0-9]+)/, name: '?user={id}' },
  ];

  for (const { regex, name } of patterns) {
    const match = url.match(regex);
    if (match && match[1]) {
      const potentialId = match[1];
      const nonIdKeywords = [
        'settings',
        'profile',
        'edit',
        'view',
        'new',
        'create',
        'delete',
        'list',
        'search',
      ];
      if (nonIdKeywords.includes(potentialId.toLowerCase())) {
        continue;
      }
      log.debug('extractUserIdFromUrl: matched pattern', { pattern: name, id: potentialId });
      return potentialId;
    }
  }

  log.warn('extractUserIdFromUrl: no pattern matched', { path: url.split('?')[0] });
  return null;
}

function extractUserNameFromPage(): string | null {
  const selectors = [
    '.subheader-fullname',

    '[data-se="user-profile-name"]',
    '[data-se="user-name"]',
    '[data-se="user-detail-name"]',
    '[data-testid="user-name"]',
    '[data-testid="profile-name"]',

    '.user-profile-header h1',
    '.user-header h1',
    '.user-detail-header h1',
    '.profile-header h1',
    '.person-header h1',

    '.directory-person-header h1',
    '.person-profile h1',
    '[class*="ProfileHeader"] h1',
    '[class*="UserHeader"] h1',

    'h1.okta-form-title',
    '.content-container h1',
    'main h1',

    '.page-title',
    '[class*="PageTitle"]',
  ];

  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text && !['User Profile', 'Profile', 'Settings', 'User'].includes(text)) {
          return text;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

function extractAppIdFromUrl(url: string): string | null {
  log.debug('extractAppIdFromUrl: parsing URL', { path: url.split('?')[0] });

  const patterns: Array<{ regex: RegExp; name: string }> = [
    {
      regex: /\/admin\/app\/([a-zA-Z0-9]+)\/instance\/([a-zA-Z0-9]+)/,
      name: '/admin/app/{appId}/instance/{instanceId}',
    },
    { regex: /\/admin\/app\/([a-zA-Z0-9]+)\/settings/, name: '/admin/app/{appId}/settings' },
    { regex: /\/admin\/app\/([a-zA-Z0-9]+)\/assignment/, name: '/admin/app/{appId}/assignment' },
    { regex: /\/admin\/app\/([a-zA-Z0-9]+)/, name: '/admin/app/{appId}' },

    { regex: /\/admin\/apps\/active\/([a-zA-Z0-9]+)/, name: '/admin/apps/active/{appId}' },
    { regex: /\/admin\/apps\/([a-zA-Z0-9]+)/, name: '/admin/apps/{appId}' },

    { regex: /\/api\/v1\/apps\/([a-zA-Z0-9]+)/, name: '/api/v1/apps/{appId}' },

    { regex: /[?&]appId=([a-zA-Z0-9]+)/, name: '?appId={appId}' },
    { regex: /[?&]app=([a-zA-Z0-9]+)/, name: '?app={appId}' },
  ];

  for (const { regex, name } of patterns) {
    const match = url.match(regex);
    if (match && match[1]) {
      const potentialId = match[1];
      const nonIdKeywords = ['settings', 'new', 'create', 'list', 'active', 'inactive', 'catalog'];
      if (nonIdKeywords.includes(potentialId.toLowerCase())) {
        continue;
      }
      if (potentialId.startsWith('0oa') || potentialId.length >= 18) {
        log.debug('extractAppIdFromUrl: matched pattern', { pattern: name, id: potentialId });
        return potentialId;
      }
    }
  }

  log.warn('extractAppIdFromUrl: no pattern matched', { path: url.split('?')[0] });
  return null;
}

function extractAppNameFromPage(): string | null {
  const selectors = [
    '[data-se="app-name"]',
    '[data-se="app-label"]',
    '[data-testid="app-name"]',
    '[data-testid="app-label"]',

    '.app-header h1',
    '.app-detail-header h1',
    '[class*="AppHeader"] h1',
    '[class*="ApplicationHeader"] h1',

    '.app-settings-header h1',
    '.application-settings h1',

    'h1.okta-form-title',
    '.content-container h1',
    'main h1',

    '.page-title',
    '[class*="PageTitle"]',
  ];

  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text && !['Application', 'App', 'Settings', 'Configuration'].includes(text)) {
          return text;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function fetchAllGroupMembers(groupId: string): Promise<OktaUser[]> {
  let allMembers: OktaUser[] = [];
  let nextUrl: string | null = `/api/v1/groups/${groupId}/users?limit=200`;

  while (nextUrl) {
    const response = await handleMakeApiRequest(nextUrl, 'GET');

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch group members');
    }

    allMembers = allMembers.concat(response.data || []);

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

function convertToCSV(users: OktaUser[]): string {
  if (users.length === 0) return '';

  const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Status'];
  const rows = users.map((u) => [
    u.id,
    u.profile.login,
    u.profile.firstName,
    u.profile.lastName,
    u.status,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function injectIndicator(): void {
  const indicator = document.createElement('div');
  indicator.id = 'okta-extension-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #1a1a1a;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    z-index: 999999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  indicator.textContent = 'Okta Unbound Active';

  document.body.appendChild(indicator);
  setTimeout(() => {
    indicator.style.transition = 'opacity 0.3s';
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
  }, 3000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    log.debug('DOMContentLoaded fired');
    injectIndicator();
  });
} else {
  log.debug('DOM already loaded, injecting indicator');
  injectIndicator();
}
