import type { OktaGroupRule, FormattedRule, RuleConflict, RuleStats } from '../../shared/types';
import type { CoreApi } from './useOktaApi/core';
import { getCacheEntry, setCacheEntry } from '../../shared/cache';
import { detectConflicts, formatRuleForDisplay } from '../../shared/ruleUtils';
import { nextPageUrl } from './useOktaApi/utilities';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('fetchGroupRulesRequest');

type MakeApiRequest = CoreApi['makeApiRequest'];

export interface FetchGroupRulesResult {
  success: boolean;
  rules?: FormattedRule[];
  stats?: RuleStats;
  conflicts?: RuleConflict[];
  error?: string;
}

const GROUP_ID_IN_EXPRESSION = /\b00g[a-zA-Z0-9]{17}\b/g;

function groupIdsReferencedBy(rule: OktaGroupRule): string[] {
  const ids = rule.actions?.assignUserToGroups?.groupIds || [];
  const expression = rule.conditions?.expression?.value || '';
  const inExpression = expression.match(GROUP_ID_IN_EXPRESSION) || [];
  return [...ids, ...inExpression];
}

async function resolveGroupName(
  makeApiRequest: MakeApiRequest,
  groupId: string,
): Promise<{ groupId: string; name: string } | null> {
  try {
    const cacheKey = `group_name_${groupId}`;
    const cachedName = await getCacheEntry<string>(cacheKey);
    if (cachedName) {
      return { groupId, name: cachedName };
    }

    const groupResponse = await makeApiRequest(`/api/v1/groups/${groupId}`);
    if (groupResponse.success && groupResponse.data?.profile?.name) {
      const groupName = groupResponse.data.profile.name;
      await setCacheEntry(cacheKey, groupName, { ttl: 5 * 60 * 1000 });
      return { groupId, name: groupName };
    }
  } catch (err) {
    log.warn('Failed to fetch group name for group', { groupId }, err);
  }
  return null;
}

export async function fetchGroupRulesRequest(
  makeApiRequest: MakeApiRequest,
  currentGroupId?: string,
  options: { resolveGroupNames?: boolean } = {},
): Promise<FetchGroupRulesResult> {
  const { resolveGroupNames = true } = options;
  try {
    let rules: OktaGroupRule[] = [];
    let nextUrl: string | null = '/api/v1/groups/rules?limit=200';

    while (nextUrl) {
      const response = await makeApiRequest(nextUrl);
      if (!response.success) {
        return response;
      }
      const page: OktaGroupRule[] = response.data || [];
      rules = rules.concat(page);
      nextUrl = nextPageUrl(nextUrl, response.headers?.link, page.length);
    }

    log.debug('Fetched rules (total across all pages)', { count: rules.length });

    const groupNameMap = new Map<string, string>();
    if (resolveGroupNames) {
      const allGroupIds = new Set<string>();
      rules.forEach((rule) => groupIdsReferencedBy(rule).forEach((id) => allGroupIds.add(id)));

      const resolved = await Promise.all(
        Array.from(allGroupIds).map((groupId) => resolveGroupName(makeApiRequest, groupId)),
      );
      resolved.forEach((result) => {
        if (result) groupNameMap.set(result.groupId, result.name);
      });
    }

    const conflicts = detectConflicts(rules);

    const formattedRules: FormattedRule[] = rules.map((rule) => {
      const base = formatRuleForDisplay(rule, currentGroupId, conflicts);
      const groupNames = base.groupIds.map((id) => groupNameMap.get(id) || id);

      const allGroupNamesMap: Record<string, string> = {};
      new Set(groupIdsReferencedBy(rule)).forEach((id) => {
        const name = groupNameMap.get(id);
        if (name) allGroupNamesMap[id] = name;
      });

      return { ...base, groupNames, allGroupNamesMap };
    });

    const activeCount = rules.filter((r) => r.status === 'ACTIVE').length;
    const stats: RuleStats = {
      total: rules.length,
      active: activeCount,
      inactive: rules.filter((r) => r.status === 'INACTIVE').length,
      conflicts: conflicts.length,
    };

    log.debug('Rule stats', stats);
    return { success: true, rules: formattedRules, stats, conflicts };
  } catch (error) {
    log.error('fetchGroupRules error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch rules',
    };
  }
}
