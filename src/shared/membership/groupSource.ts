import type { OktaGroup, OktaUser, MembershipRule, GroupType } from '../types';
import {
  analyzeMemberships,
  attributionNamesRules,
  isDeducedAttribution,
} from '../utils/membershipAnalysis';
import { readEmbeddedGroupRules } from './memberRuleAttribution';

export interface RuleContribution {
  ruleId: string;
  ruleName: string;
  count: number;
}

export interface RuleMemberCounts {
  ruleId: string;
  ruleName: string;
  soleCount: number;
  oktaAttributedCount: number;
  clientAttributedCount: number;
}

export interface MemberSourceBreakdown {
  total: number;
  direct: number;
  ruleBased: number;
  unattributed: number;
  byRule: RuleContribution[];
  byRuleMembers?: RuleMemberCounts[];
  multiRuleMembers?: number;
}

export interface GroupIdentity {
  id: string;
  name: string;
  type: GroupType;
}

export function summarizeMemberSources(
  group: GroupIdentity,
  members: OktaUser[],
  rules: MembershipRule[],
): MemberSourceBreakdown {
  const oktaGroup: OktaGroup = {
    id: group.id,
    type: group.type,
    profile: { name: group.name },
  };

  let direct = 0;
  let ruleBased = 0;
  let unattributed = 0;
  let multiRuleMembers = 0;
  const ruleCounts = new Map<string, RuleContribution>();
  const ruleMembers = new Map<string, RuleMemberCounts>();

  const credit = (ruleId: string, ruleName: string) => {
    const existing = ruleCounts.get(ruleId);
    if (existing) existing.count++;
    else ruleCounts.set(ruleId, { ruleId, ruleName, count: 1 });
  };

  const memberCounts = (ruleId: string, ruleName: string): RuleMemberCounts => {
    const existing = ruleMembers.get(ruleId);
    if (existing) return existing;
    const created: RuleMemberCounts = {
      ruleId,
      ruleName,
      soleCount: 0,
      oktaAttributedCount: 0,
      clientAttributedCount: 0,
    };
    ruleMembers.set(ruleId, created);
    return created;
  };

  for (const member of members) {
    const attribution = readEmbeddedGroupRules(member);

    if (attribution.state === 'rules') {
      ruleBased++;
      for (const rule of attribution.rules) {
        credit(rule.id, rule.name);
        memberCounts(rule.id, rule.name).oktaAttributedCount++;
      }
      const [only] = attribution.rules;
      if (attribution.rules.length === 1) memberCounts(only.id, only.name).soleCount++;
      else multiRuleMembers++;
      continue;
    }

    if (attribution.state === 'no-rules' && group.type !== 'APP_GROUP') {
      direct++;
      continue;
    }

    const [membership] = analyzeMemberships([oktaGroup], rules, member);
    if (membership.membershipType !== 'RULE_BASED') {
      direct++;
      continue;
    }

    ruleBased++;
    const deduced = isDeducedAttribution(membership.attribution);
    if (deduced) unattributed++;

    if (!attributionNamesRules(membership.attribution)) continue;

    for (const rule of membership.rules) {
      credit(rule.id, rule.name);
      memberCounts(rule.id, rule.name).clientAttributedCount++;
    }

    if (deduced) continue;
    const [only] = membership.rules;
    if (membership.rules.length === 1) memberCounts(only.id, only.name).soleCount++;
    else if (membership.rules.length > 1) multiRuleMembers++;
  }

  const byRule = Array.from(ruleCounts.values()).sort((a, b) => b.count - a.count);
  const byRuleMembers = Array.from(ruleMembers.values()).sort(
    (a, b) =>
      b.soleCount - a.soleCount ||
      b.oktaAttributedCount +
        b.clientAttributedCount -
        (a.oktaAttributedCount + a.clientAttributedCount) ||
      a.ruleName.localeCompare(b.ruleName),
  );

  return {
    total: members.length,
    direct,
    ruleBased,
    unattributed,
    byRule,
    byRuleMembers,
    multiRuleMembers,
  };
}
