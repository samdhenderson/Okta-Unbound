import type { OktaGroup, OktaUser, MembershipRule, GroupType, GroupMembership } from '../types';
import {
  analyzeMemberships,
  attributionNamesRules,
  isDeducedAttribution,
} from '../utils/membershipAnalysis';
import { readEmbeddedGroupRules, type MemberRuleAttribution } from './memberRuleAttribution';

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

export interface MemberSourceVerdict {
  kind: 'ruleBased' | 'direct';
  credited: readonly { id: string; name: string }[];
  creditedBy: 'okta' | 'client';
  deduced: boolean;
  soleRuleId: string | null;
  multiRule: boolean;
}

const DIRECT_VERDICT: MemberSourceVerdict = {
  kind: 'direct',
  credited: [],
  creditedBy: 'client',
  deduced: false,
  soleRuleId: null,
  multiRule: false,
};

export function memberSourceVerdict(
  answer: MemberRuleAttribution,
  heuristic: GroupMembership | null,
  groupType: GroupType | undefined,
): MemberSourceVerdict {
  if (answer.state === 'rules') {
    const sole = answer.rules.length === 1 ? answer.rules[0].id : null;
    return {
      kind: 'ruleBased',
      credited: answer.rules,
      creditedBy: 'okta',
      deduced: false,
      soleRuleId: sole,
      multiRule: sole === null,
    };
  }

  if (answer.state === 'no-rules' && groupType !== 'APP_GROUP') return DIRECT_VERDICT;

  if (!heuristic || heuristic.membershipType !== 'RULE_BASED') return DIRECT_VERDICT;

  const deduced = isDeducedAttribution(heuristic.attribution);

  if (!attributionNamesRules(heuristic.attribution)) {
    return { ...DIRECT_VERDICT, kind: 'ruleBased', deduced };
  }

  const sole = !deduced && heuristic.rules.length === 1 ? heuristic.rules[0].id : null;
  return {
    kind: 'ruleBased',
    credited: heuristic.rules.map(({ id, name }) => ({ id, name })),
    creditedBy: 'client',
    deduced,
    soleRuleId: sole,
    multiRule: !deduced && heuristic.rules.length > 1,
  };
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
    const answer = readEmbeddedGroupRules(member);

    const needsHeuristic =
      answer.state === 'unknown' || (answer.state === 'no-rules' && group.type === 'APP_GROUP');
    const heuristic = needsHeuristic ? analyzeMemberships([oktaGroup], rules, member)[0] : null;

    const verdict = memberSourceVerdict(answer, heuristic, group.type);

    if (verdict.kind === 'direct') {
      direct++;
      continue;
    }

    ruleBased++;
    if (verdict.deduced) unattributed++;

    for (const rule of verdict.credited) {
      credit(rule.id, rule.name);
      const counts = memberCounts(rule.id, rule.name);
      if (verdict.creditedBy === 'okta') counts.oktaAttributedCount++;
      else counts.clientAttributedCount++;
    }

    if (verdict.soleRuleId !== null) {
      const sole = verdict.credited.find((rule) => rule.id === verdict.soleRuleId);
      if (sole) memberCounts(sole.id, sole.name).soleCount++;
    } else if (verdict.multiRule) {
      multiRuleMembers++;
    }
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
