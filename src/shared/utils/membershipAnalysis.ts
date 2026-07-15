import type { OktaGroup, OktaUser, MembershipRule, GroupMembership } from '../types';
import { createLogger } from './logger';

const log = createLogger('membershipAnalysis');

function isUserExcludedFromRule(rule: MembershipRule, userId: string): boolean {
  const excludedUsers = rule.conditions?.people?.users?.exclude || [];
  return excludedUsers.includes(userId);
}

export function analyzeMemberships(
  groups: OktaGroup[],
  rules: MembershipRule[],
  user: OktaUser,
): GroupMembership[] {
  log.debug('Analyzing memberships for user:', user.id);
  log.debug(
    'Total rules:',
    rules.length,
    'Active rules:',
    rules.filter((r) => r.status === 'ACTIVE').length,
  );
  log.debug('Total groups:', groups.length);

  return groups.map((group) => {
    if (group.type === 'APP_GROUP') {
      log.debug(`Group ${group.id}: APP_GROUP (application managed)`);
      return {
        group: group,
        membershipType: 'RULE_BASED' as const,
        rule: undefined,
      };
    }

    const matchingRules = rules.filter((rule) => {
      if (rule.status !== 'ACTIVE') return false;
      const groupIds = rule.groupIds || rule.actions?.assignUserToGroups?.groupIds || [];
      return groupIds.includes(group.id);
    });

    log.debug(`Group ${group.id}: Found ${matchingRules.length} active rules`);

    if (matchingRules.length === 0) {
      log.debug(`Group ${group.id}: DIRECT (no active rules)`);
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
      log.debug(`Group ${group.id}: DIRECT (user excluded from all ${matchingRules.length} rules)`);
      return {
        group: group,
        membershipType: 'DIRECT' as const,
        rule: undefined,
      };
    }

    if (rulesWithoutExclusion.length < matchingRules.length) {
      const excludedRules = matchingRules.filter((rule) => isUserExcludedFromRule(rule, user.id));
      log.debug(`Group ${group.id}: User excluded from ${excludedRules.length} rule(s)`);
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

    log.debug(
      `Group ${group.id}: RULE_BASED (rule: ${bestMatchRule.id}, confidence: ${confidence})`,
    );

    return {
      group: group,
      membershipType: 'RULE_BASED' as const,
      rule: bestMatchRule,
    };
  });
}
