import type {
  OktaGroup,
  OktaUser,
  MembershipRule,
  GroupMembership,
  MembershipAttribution,
} from '../types';
import { tryEvaluateRuleExpression, type RuleMatchOutcome } from '../ruleEvaluator';
import { createLogger } from './logger';

const log = createLogger('membershipAnalysis');

export interface AttributionSemantics {
  evidence: 'fact' | 'deduction';
  namesRules: boolean;
}

const ATTRIBUTION_SEMANTICS: Record<MembershipAttribution, AttributionSemantics> = {
  exact: { evidence: 'fact', namesRules: true },
  inferred: { evidence: 'deduction', namesRules: true },
  ambiguous: { evidence: 'deduction', namesRules: false },
};

export function attributionSemantics(attribution: MembershipAttribution): AttributionSemantics {
  return ATTRIBUTION_SEMANTICS[attribution];
}

export function isDeducedAttribution(attribution: MembershipAttribution): boolean {
  return ATTRIBUTION_SEMANTICS[attribution].evidence === 'deduction';
}

export function attributionNamesRules(attribution: MembershipAttribution): boolean {
  return ATTRIBUTION_SEMANTICS[attribution].namesRules;
}

function isUserExcludedFromRule(rule: MembershipRule, userId: string): boolean {
  return (
    (rule.excludedUserIds?.includes(userId) ?? false) ||
    (rule.conditions?.people?.users?.exclude?.includes(userId) ?? false)
  );
}

function conditionExpressionOf(rule: MembershipRule): string {
  return rule.conditionExpression || rule.conditions?.expression?.value || '';
}

function scoreCandidateRules(rules: MembershipRule[], user: OktaUser): MembershipRule[] {
  return rules.filter((rule) => {
    const condition = conditionExpressionOf(rule).toLowerCase();
    const userAttrs = rule.userAttributes || [];

    let attributesMatch = 0;
    let attributesChecked = 0;

    for (const attr of userAttrs) {
      attributesChecked++;
      const userValue = (user.profile as Record<string, unknown>)[attr];

      if (userValue !== undefined && userValue !== null && userValue !== '') {
        const valueStr = String(userValue).toLowerCase();
        if (condition.includes(valueStr) || condition.includes(`"${valueStr}"`)) {
          attributesMatch++;
        }
      }
    }

    return attributesChecked > 0 && attributesMatch >= attributesChecked * 0.5;
  });
}

type Classification = Pick<GroupMembership, 'membershipType' | 'rules' | 'attribution'>;

const direct = (): Classification => ({
  membershipType: 'DIRECT',
  rules: [],
  attribution: 'exact',
});

export function unclassifiedMemberships(groups: OktaGroup[]): GroupMembership[] {
  return groups.map((group) => ({
    group,
    membershipType: 'UNKNOWN' as const,
    rules: [],
    attribution: 'ambiguous' as const,
  }));
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

  return groups.map((group) => ({ group, ...classify(group, rules, user) }));
}

function classify(group: OktaGroup, rules: MembershipRule[], user: OktaUser): Classification {
  if (group.type === 'APP_GROUP') {
    log.debug(`Group ${group.id}: APP_GROUP (application managed)`);
    return { membershipType: 'RULE_BASED', rules: [], attribution: 'exact' };
  }

  const targetingRules = rules.filter((rule) => {
    if (rule.status !== 'ACTIVE') return false;
    const groupIds = rule.groupIds || rule.actions?.assignUserToGroups?.groupIds || [];
    return groupIds.includes(group.id);
  });

  log.debug(`Group ${group.id}: Found ${targetingRules.length} active rules`);

  if (targetingRules.length === 0) {
    log.debug(`Group ${group.id}: DIRECT (no active rules)`);
    return direct();
  }

  const candidates = targetingRules.filter((rule) => !isUserExcludedFromRule(rule, user.id));

  if (candidates.length === 0) {
    log.debug(`Group ${group.id}: DIRECT (user excluded from all ${targetingRules.length} rules)`);
    return direct();
  }

  if (candidates.length < targetingRules.length) {
    log.debug(
      `Group ${group.id}: user excluded from ${targetingRules.length - candidates.length} rule(s)`,
    );
  }

  const outcomes = candidates.map((rule): [MembershipRule, RuleMatchOutcome] => [
    rule,
    tryEvaluateRuleExpression(conditionExpressionOf(rule), user),
  ]);

  const matched = outcomes.filter(([, outcome]) => outcome === 'match').map(([rule]) => rule);
  if (matched.length > 0) {
    log.debug(
      `Group ${group.id}: RULE_BASED (${matched.length} matched rule(s), evidence: proven)`,
    );
    return { membershipType: 'RULE_BASED', rules: matched, attribution: 'exact' };
  }

  const unevaluated = outcomes
    .filter(([, outcome]) => outcome === 'unevaluable')
    .map(([rule]) => rule);
  if (unevaluated.length === 0) {
    log.debug(`Group ${group.id}: DIRECT (no rule condition matches; evidence: proven)`);
    return direct();
  }

  const scored = scoreCandidateRules(unevaluated, user);
  if (scored.length > 0) {
    log.debug(
      `Group ${group.id}: RULE_BASED (${scored.length} scored rule(s), evidence: attribute-in-condition)`,
    );
    return { membershipType: 'RULE_BASED', rules: scored, attribution: 'inferred' };
  }

  const attribution: MembershipAttribution = unevaluated.length === 1 ? 'inferred' : 'ambiguous';
  log.debug(
    `Group ${group.id}: RULE_BASED (${unevaluated.length} unevaluable candidate(s), evidence: ${attribution === 'inferred' ? 'sole-candidate' : 'none'})`,
  );
  return { membershipType: 'RULE_BASED', rules: unevaluated, attribution };
}
