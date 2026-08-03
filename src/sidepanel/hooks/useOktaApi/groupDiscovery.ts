import type { CoreApi } from './core';
import type { OktaGroup, OktaGroupRule, FormattedRule } from '../../../shared/types';
import { RulesCache } from '../../../shared/rulesCache';
import { detectConflicts, formatRuleForDisplay } from '../../../shared/ruleUtils';
import { fetchAllPages, OKTA_PAGE_SIZE } from '@/shared/utils/oktaPagination';
import { createLogger } from '../../../shared/utils/logger';

const log = createLogger('useOktaApi');

export function createGroupDiscoveryOperations(coreApi: CoreApi) {
  const getAllGroups = async (
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<OktaGroup[]> =>
    fetchAllPages<OktaGroup>(
      (url) => coreApi.makeApiRequest(url),
      `/api/v1/groups?limit=${OKTA_PAGE_SIZE}&expand=stats`,
      {
        errorMessage: 'Failed to fetch groups',
        onPage: (_pageGroups, totalSoFar) => onProgress?.(totalSoFar, totalSoFar),
      },
    );

  const getGroupMemberCount = async (groupId: string): Promise<number> => {
    try {
      const usersResponse = await coreApi.makeApiRequest(
        `/api/v1/groups/${groupId}/users?limit=${OKTA_PAGE_SIZE}`,
      );
      if (usersResponse.success && usersResponse.data) {
        return usersResponse.data.length;
      }

      return 0;
    } catch (error) {
      log.error(`Failed to get member count for group ${groupId}:`, error);
      return 0;
    }
  };

  const getGroupRulesForGroup = async (
    groupId: string,
  ): Promise<FormattedRule[] | OktaGroupRule[]> => {
    try {
      const cachedRules = await RulesCache.getRulesForGroup(groupId);
      if (cachedRules.length > 0 || (await RulesCache.isFresh())) {
        log.debug(`Using cached rules for group ${groupId}:`, cachedRules.length);
        return cachedRules;
      }

      log.debug(`Cache miss - fetching all rules for group ${groupId}`);
      const allRules = await fetchAllPages<OktaGroupRule>(
        (url) => coreApi.makeApiRequest(url),
        `/api/v1/groups/rules?limit=${OKTA_PAGE_SIZE}`,
      );

      const conflicts = detectConflicts(allRules);
      const formattedRules = allRules.map((rule) =>
        formatRuleForDisplay(rule, undefined, conflicts),
      );
      await RulesCache.set(
        formattedRules,
        allRules,
        {
          total: allRules.length,
          active: allRules.filter((r) => r.status === 'ACTIVE').length,
          inactive: allRules.filter((r) => r.status === 'INACTIVE').length,
          conflicts: conflicts.length,
        },
        conflicts,
      );

      const groupRules = allRules.filter((rule) => {
        const targetGroupIds = rule.actions?.assignUserToGroups?.groupIds || [];
        return targetGroupIds.includes(groupId);
      });

      return groupRules;
    } catch (error) {
      log.error(`Failed to get rules for group ${groupId}:`, error);
      return [];
    }
  };

  const searchGroups = async (
    query: string,
  ): Promise<Array<{ id: string; name: string; description: string; type: string }>> => {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const response = await coreApi.makeApiRequest(
        `/api/v1/groups?q=${encodeURIComponent(query)}&limit=20`,
      );

      if (response.success && response.data) {
        return response.data.map((group: OktaGroup) => ({
          id: group.id,
          name: group.profile?.name || group.id,
          description: group.profile?.description || '',
          type: group.type || 'OKTA_GROUP',
        }));
      }
      return [];
    } catch (error) {
      log.error('searchGroups error:', error);
      return [];
    }
  };

  const getGroupById = async (
    groupId: string,
  ): Promise<{ id: string; name: string; description: string; type: string } | null> => {
    try {
      const response = await coreApi.makeApiRequest(`/api/v1/groups/${groupId}`);
      if (response.success && response.data) {
        const group = response.data;
        return {
          id: group.id,
          name: group.profile?.name || group.id,
          description: group.profile?.description || '',
          type: group.type || 'OKTA_GROUP',
        };
      }
      return null;
    } catch (error) {
      log.error('getGroupById error:', error);
      return null;
    }
  };

  return {
    getAllGroups,
    getGroupMemberCount,
    getGroupRulesForGroup,
    searchGroups,
    getGroupById,
  };
}
