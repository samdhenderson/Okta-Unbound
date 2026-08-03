import type { OktaGroupRule, FormattedRule, RuleConflict, RuleStats } from '../../shared/types';
import type { CoreApi } from './useOktaApi/core';
import { detectConflicts, formatRuleForDisplay } from '../../shared/ruleUtils';
import { nextPageUrl } from './useOktaApi/utilities';
import { GROUPS_CACHE_KEY, parseGroupsCache } from '../components/groups/groupsCache';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('fetchGroupRulesRequest');

type MakeApiRequest = CoreApi['makeApiRequest'];

export interface FetchGroupRulesResult {
  success: boolean;
  rules?: FormattedRule[];
  rawRules?: OktaGroupRule[];
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

async function loadCachedGroupNames(): Promise<Map<string, string>> {
  const nameById = new Map<string, string>();
  try {
    const stored = await chrome.storage.local.get(GROUPS_CACHE_KEY);
    const raw = stored?.[GROUPS_CACHE_KEY];
    if (typeof raw !== 'string') return nameById;
    const groups = parseGroupsCache(raw, Date.now());
    groups?.forEach((group) => {
      if (group.id && group.name) nameById.set(group.id, group.name);
    });
  } catch (err) {
    log.warn('Failed to read cached group names', err);
  }
  return nameById;
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

    const groupNameMap = resolveGroupNames
      ? await loadCachedGroupNames()
      : new Map<string, string>();

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
    return { success: true, rules: formattedRules, rawRules: rules, stats, conflicts };
  } catch (error) {
    log.error('fetchGroupRules error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch rules',
    };
  }
}
