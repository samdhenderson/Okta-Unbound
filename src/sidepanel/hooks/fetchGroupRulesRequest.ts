import type { OktaGroupRule, FormattedRule, RuleConflict, RuleStats } from '../../shared/types';
import type { CoreApi } from './useOktaApi/core';
import { detectConflicts, formatRuleForDisplay } from '../../shared/ruleUtils';
import { nextPageUrl } from './useOktaApi/utilities';
import { orgSnapshotStore } from '../../shared/snapshot/orgSnapshotStore';
import type { RawOktaGroup } from '../components/groups/groupSummary';
import { createLogger } from '../../shared/utils/logger';
import { oktaGroupRuleSchema, parseOktaList } from '../../shared/schemas/okta';

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

export async function loadCachedGroupNames(
  origin: string | null | undefined,
): Promise<Map<string, string>> {
  const nameById = new Map<string, string>();
  if (!origin) return nameById;
  const groups = await orgSnapshotStore.getCollection<RawOktaGroup>('groups', origin);
  for (const group of groups) {
    const name = group.profile?.name;
    if (group.id && name) nameById.set(group.id, name);
  }
  return nameById;
}

export async function fetchGroupRulesRequest(
  makeApiRequest: MakeApiRequest,
  currentGroupId?: string,
  options: { resolveGroupNames?: boolean; origin?: string | null } = {},
): Promise<FetchGroupRulesResult> {
  const { resolveGroupNames = true, origin } = options;
  try {
    let rules: OktaGroupRule[] = [];
    let nextUrl: string | null = '/api/v1/groups/rules?limit=200';

    while (nextUrl) {
      const response = await makeApiRequest(nextUrl, { reason: 'Load group rules' });
      if (!response.success) {
        return response;
      }
      const page = parseOktaList(oktaGroupRuleSchema, response.data, 'GET /api/v1/groups/rules');
      rules = rules.concat(page as unknown as OktaGroupRule[]);
      const rowsReturned = Array.isArray(response.data) ? response.data.length : 0;
      nextUrl = nextPageUrl(nextUrl, response.headers?.link, rowsReturned);
    }

    log.debug('Fetched rules (total across all pages)', { count: rules.length });

    const groupNameMap = resolveGroupNames
      ? await loadCachedGroupNames(origin)
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
