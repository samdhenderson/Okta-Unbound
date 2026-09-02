import type { OktaGroupRule, OktaUser, GroupType, GroupRuleStatus } from '../types';

export interface ImpactRule {
  id: string;
  status: GroupRuleStatus;
  targetGroupIds: string[];
  excludedUserIds: string[];
}

export function toImpactRule(rule: OktaGroupRule): ImpactRule {
  return {
    id: rule.id,
    status: rule.status,
    targetGroupIds: rule.actions?.assignUserToGroups?.groupIds ?? [],
    excludedUserIds: rule.conditions?.people?.users?.exclude ?? [],
  };
}

export interface TargetGroupMembers {
  groupId: string;
  groupName: string;
  groupType?: GroupType;
  members: OktaUser[];
}

export function classifyGroupImpact(
  ruleId: string,
  target: TargetGroupMembers,
  rules: ImpactRule[],
): { heldSolelyByRule: OktaUser[]; unaffected: OktaUser[] } {
  if (target.groupType === 'APP_GROUP') {
    return { heldSolelyByRule: [], unaffected: [...target.members] };
  }

  const activeRulesForGroup = rules.filter(
    (r) => r.status === 'ACTIVE' && r.targetGroupIds.includes(target.groupId),
  );

  const heldSolelyByRule: OktaUser[] = [];
  const unaffected: OktaUser[] = [];

  for (const member of target.members) {
    const nonExcluding = activeRulesForGroup.filter((r) => !r.excludedUserIds.includes(member.id));
    const managedByThisRule = nonExcluding.some((r) => r.id === ruleId);

    if (!managedByThisRule) {
      unaffected.push(member);
      continue;
    }

    const otherActiveRules = nonExcluding.filter((r) => r.id !== ruleId);
    if (otherActiveRules.length === 0) {
      heldSolelyByRule.push(member);
    } else {
      unaffected.push(member);
    }
  }

  return { heldSolelyByRule, unaffected };
}

export interface TargetGroupImpact {
  groupId: string;
  groupName: string;
  memberCount: number;
  heldSolelyCount: number;
  heldSolelyByRule: OktaUser[];
}

export interface RuleImpactSummary {
  ruleId: string;
  ruleName: string;
  targetGroups: TargetGroupImpact[];
  distinctMemberCount: number;
  totalHeldSolely: number;
  emptyRuleInventory?: boolean;
}

export function summarizeRuleImpact(
  ruleId: string,
  ruleName: string,
  targets: TargetGroupMembers[],
  rules: ImpactRule[],
): RuleImpactSummary {
  const targetGroups: TargetGroupImpact[] = [];
  const distinctMembers = new Set<string>();
  const distinctHeldSolely = new Set<string>();

  for (const target of targets) {
    const { heldSolelyByRule } = classifyGroupImpact(ruleId, target, rules);
    for (const m of target.members) distinctMembers.add(m.id);
    for (const u of heldSolelyByRule) distinctHeldSolely.add(u.id);

    targetGroups.push({
      groupId: target.groupId,
      groupName: target.groupName,
      memberCount: target.members.length,
      heldSolelyCount: heldSolelyByRule.length,
      heldSolelyByRule,
    });
  }

  return {
    ruleId,
    ruleName,
    targetGroups,
    distinctMemberCount: distinctMembers.size,
    totalHeldSolely: distinctHeldSolely.size,
    emptyRuleInventory: rules.length === 0,
  };
}
