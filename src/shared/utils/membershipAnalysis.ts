import type { OktaGroup, OktaUser, MembershipRule, GroupMembership } from '../types';
import { tryEvaluateRuleExpression, type RuleMatchOutcome } from '../ruleEvaluator';
import { createLogger } from './logger';

const log = createLogger('membershipAnalysis');

function isUserExcludedFromRule(rule: MembershipRule, userId: string): boolean {
  const excludedUsers = rule.conditions?.people?.users?.exclude || [];
  return excludedUsers.includes(userId);
}

function conditionExpressionOf(rule: MembershipRule): string {
  return rule.conditionExpression || rule.conditions?.expression?.value || '';
}

function inferBestMatchRule(rules: MembershipRule[], user: OktaUser): MembershipRule {
  for (const rule of rules) {
    const condition = conditionExpressionOf(rule);
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
      return rule;
    }
  }

  return rules[0];
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
        attribution: 'exact' as const,
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
        attribution: 'exact' as const,
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
        attribution: 'exact' as const,
      };
    }

    if (rulesWithoutExclusion.length < matchingRules.length) {
      const excludedRules = matchingRules.filter((rule) => isUserExcludedFromRule(rule, user.id));
      log.debug(`Group ${group.id}: User excluded from ${excludedRules.length} rule(s)`);
    }

    const outcomes = rulesWithoutExclusion.map((rule): [MembershipRule, RuleMatchOutcome] => [
      rule,
      tryEvaluateRuleExpression(conditionExpressionOf(rule), user),
    ]);

    const matched = outcomes.find(([, outcome]) => outcome === 'match');
    if (matched) {
      const [rule] = matched;
      log.debug(`Group ${group.id}: RULE_BASED (rule: ${rule.id}, attribution: exact)`);
      return {
        group: group,
        membershipType: 'RULE_BASED' as const,
        rule,
        attribution: 'exact' as const,
      };
    }

    const anyUnevaluable = outcomes.some(([, outcome]) => outcome === 'unevaluable');
    if (!anyUnevaluable) {
      log.debug(`Group ${group.id}: DIRECT (no rule condition matches; attribution: exact)`);
      return {
        group: group,
        membershipType: 'DIRECT' as const,
        rule: undefined,
        attribution: 'exact' as const,
      };
    }

    const bestMatchRule = inferBestMatchRule(rulesWithoutExclusion, user);
    log.debug(`Group ${group.id}: RULE_BASED (rule: ${bestMatchRule.id}, attribution: inferred)`);

    return {
      group: group,
      membershipType: 'RULE_BASED' as const,
      rule: bestMatchRule,
      attribution: 'inferred' as const,
    };
  });
}
