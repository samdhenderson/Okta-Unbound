import type { OktaGroup, OktaUser, MembershipRule, GroupType } from '../types';
import { analyzeMemberships } from '../utils/membershipAnalysis';

export interface RuleContribution {
  ruleId: string;
  ruleName: string;
  count: number;
}

export interface MemberSourceBreakdown {
  total: number;
  direct: number;
  ruleBased: number;
  byRule: RuleContribution[];
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
  const ruleCounts = new Map<string, RuleContribution>();

  for (const member of members) {
    const [membership] = analyzeMemberships([oktaGroup], rules, member);
    if (membership.membershipType === 'RULE_BASED') {
      ruleBased++;
      const rule = membership.rule;
      if (rule) {
        const existing = ruleCounts.get(rule.id);
        if (existing) existing.count++;
        else ruleCounts.set(rule.id, { ruleId: rule.id, ruleName: rule.name, count: 1 });
      }
    } else {
      direct++;
    }
  }

  const byRule = Array.from(ruleCounts.values()).sort((a, b) => b.count - a.count);

  return { total: members.length, direct, ruleBased, byRule };
}
