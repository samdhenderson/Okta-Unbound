import type { MessageResponse, OktaGroupRule, RuleConflict } from '../shared/types';
import { getCacheEntry, setCacheEntry } from '../shared/cache';
import { createLogger } from '../shared/utils/logger';
import { extractGroupIdFromUrl } from './pageContext';
import { handleMakeApiRequest } from './apiRequest';

const log = createLogger('Content');

export async function handleFetchGroupRules(groupId?: string): Promise<MessageResponse> {
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

export async function handleActivateRule(ruleId: string): Promise<MessageResponse> {
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

export async function handleDeactivateRule(ruleId: string): Promise<MessageResponse> {
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
