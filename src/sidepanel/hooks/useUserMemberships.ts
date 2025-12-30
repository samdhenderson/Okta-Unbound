import { useState, useCallback } from 'react';
import type { OktaUser, GroupMembership, OktaGroup } from '../../shared/types';
import { RulesCache } from '../../shared/rulesCache';

interface UseUserMembershipsOptions {
  targetTabId: number | undefined;
}

interface UseUserMembershipsReturn {
  memberships: GroupMembership[];
  isLoading: boolean;
  error: string | null;
  loadMemberships: (user: OktaUser) => Promise<void>;
  clearMemberships: () => void;
}

function isUserExcludedFromRule(rule: any, userId: string): boolean {
  const excludedUsers = rule.conditions?.people?.users?.exclude || [];
  return excludedUsers.includes(userId);
}

function analyzeMemberships(groups: OktaGroup[], rules: any[], user: OktaUser): GroupMembership[] {
  console.log('[useUserMemberships] Analyzing memberships for user:', user.id);
  console.log(
    '[useUserMemberships] Total rules:',
    rules.length,
    'Active rules:',
    rules.filter((r: any) => r.status === 'ACTIVE').length,
  );
  console.log('[useUserMemberships] Total groups:', groups.length);

  return groups.map((group) => {
    if (group.type === 'APP_GROUP') {
      console.log(
        `[useUserMemberships] Group "${group.profile.name}": APP_GROUP (application managed)`,
      );
      return {
        group: group,
        membershipType: 'RULE_BASED' as const,
        rule: undefined,
      };
    }

    const matchingRules = rules.filter((rule: any) => {
      if (rule.status !== 'ACTIVE') return false;
      const groupIds = rule.groupIds || rule.actions?.assignUserToGroups?.groupIds || [];
      return groupIds.includes(group.id);
    });

    console.log(
      `[useUserMemberships] Group "${group.profile.name}": Found ${matchingRules.length} active rules`,
    );

    if (matchingRules.length === 0) {
      console.log(`[useUserMemberships] Group "${group.profile.name}": DIRECT (no active rules)`);
      return {
        group: group,
        membershipType: 'DIRECT' as const,
        rule: undefined,
      };
    }

    const rulesWithoutExclusion = matchingRules.filter(
      (rule) => !isUserExcludedFromRule(rule, user.id),
    );

    if (rulesWithoutExclusion.length === 0) {
      console.log(
        `[useUserMemberships] Group "${group.profile.name}": DIRECT (user excluded from all ${matchingRules.length} rules)`,
      );
      return {
        group: group,
        membershipType: 'DIRECT' as const,
        rule: undefined,
      };
    }

    if (rulesWithoutExclusion.length < matchingRules.length) {
      const excludedRules = matchingRules.filter((rule) => isUserExcludedFromRule(rule, user.id));
      console.log(
        `[useUserMemberships] Group "${group.profile.name}": User excluded from ${excludedRules.length} rule(s): ${excludedRules.map((r: any) => r.name).join(', ')}`,
      );
    }

    let bestMatchRule = rulesWithoutExclusion[0];
    let confidence = 'low';

    for (const rule of rulesWithoutExclusion) {
      const condition = rule.conditionExpression || rule.conditions?.expression?.value || '';
      const userAttrs = rule.userAttributes || [];

      let attributesMatch = 0;
      let attributesChecked = 0;

      for (const attr of userAttrs) {
        attributesChecked++;
        const userValue = (user.profile as Record<string, unknown>)[attr];

        if (userValue !== undefined && userValue !== null && userValue !== '') {
          const valueStr = String(userValue).toLowerCase();
          const conditionLower = condition.toLowerCase();

          if (conditionLower.includes(valueStr) || conditionLower.includes(`"${valueStr}"`)) {
            attributesMatch++;
          }
        }
      }

      if (attributesChecked > 0 && attributesMatch >= attributesChecked * 0.5) {
        bestMatchRule = rule;
        confidence = attributesMatch === attributesChecked ? 'high' : 'medium';
        break;
      }
    }

    console.log(
      `[useUserMemberships] Group "${group.profile.name}": RULE_BASED (rule: ${bestMatchRule.name}, confidence: ${confidence})`,
    );

    return {
      group: group,
      membershipType: 'RULE_BASED' as const,
      rule: bestMatchRule,
    };
  });
}

export function useUserMemberships({
  targetTabId,
}: UseUserMembershipsOptions): UseUserMembershipsReturn {
  const [memberships, setMemberships] = useState<GroupMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMemberships = useCallback(
    async (user: OktaUser) => {
      if (!targetTabId) {
        setError('No Okta tab connected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('[useUserMemberships] Loading memberships for user:', user.id);

        const groupsResponse = await chrome.tabs.sendMessage(targetTabId, {
          action: 'getUserGroups',
          userId: user.id,
        });

        if (!groupsResponse.success) {
          throw new Error(groupsResponse.error || 'Failed to fetch user groups');
        }

        let rules: any[] = [];
        const cachedRules = await RulesCache.get();

        if (cachedRules) {
          console.log('[useUserMemberships] Using cached rules from global cache');
          rules = cachedRules.rules;
        } else {
          console.log('[useUserMemberships] Cache miss - fetching rules');
          const rulesResponse = await chrome.tabs.sendMessage(targetTabId, {
            action: 'fetchGroupRules',
          });

          if (!rulesResponse.success) {
            console.warn(
              '[useUserMemberships] Could not fetch rules for analysis:',
              rulesResponse.error,
            );
          } else {
            rules = rulesResponse.rules || [];
            await RulesCache.set(
              rules,
              [],
              rulesResponse.stats || { total: 0, active: 0, inactive: 0, conflicts: 0 },
              rulesResponse.conflicts || [],
            );
          }
        }

        const membershipData = groupsResponse.data || [];
        const rawGroups = membershipData.map((m: any) => m.group || m);
        const analyzedMemberships = analyzeMemberships(rawGroups, rules, user);

        setMemberships(analyzedMemberships);

        console.log('[useUserMemberships] Loaded memberships:', {
          count: analyzedMemberships.length,
          usedCache: cachedRules !== null,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load user memberships');
        setMemberships([]);
        console.error('[useUserMemberships] Membership loading error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [targetTabId],
  );

  const clearMemberships = useCallback(() => {
    setMemberships([]);
    setError(null);
  }, []);

  return {
    memberships,
    isLoading,
    error,
    loadMemberships,
    clearMemberships,
  };
}
