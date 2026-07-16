import type { OktaGroupRule, OktaUser, GroupType } from '../types';

export interface ImpactRule {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
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
): { losing: OktaUser[]; retaining: OktaUser[] } {
  if (target.groupType === 'APP_GROUP') {
    return { losing: [], retaining: [...target.members] };
  }

  const activeRulesForGroup = rules.filter(
    (r) => r.status === 'ACTIVE' && r.targetGroupIds.includes(target.groupId),
  );

  const losing: OktaUser[] = [];
  const retaining: OktaUser[] = [];

  for (const member of target.members) {
    const nonExcluding = activeRulesForGroup.filter((r) => !r.excludedUserIds.includes(member.id));
    const managedByThisRule = nonExcluding.some((r) => r.id === ruleId);

    if (!managedByThisRule) {
      retaining.push(member);
      continue;
    }

    const otherActiveRules = nonExcluding.filter((r) => r.id !== ruleId);
    if (otherActiveRules.length === 0) {
      losing.push(member);
    } else {
      retaining.push(member);
    }
  }

  return { losing, retaining };
}

export interface TargetGroupImpact {
  groupId: string;
  groupName: string;
  memberCount: number;
  losingCount: number;
  losing: OktaUser[];
}

export interface RuleImpactSummary {
  ruleId: string;
  ruleName: string;
  targetGroups: TargetGroupImpact[];
  distinctMemberCount: number;
  totalLosing: number;
}

export function summarizeRuleImpact(
  ruleId: string,
  ruleName: string,
  targets: TargetGroupMembers[],
  rules: ImpactRule[],
): RuleImpactSummary {
  const targetGroups: TargetGroupImpact[] = [];
  const distinctMembers = new Set<string>();
  const distinctLosers = new Set<string>();

  for (const target of targets) {
    const { losing } = classifyGroupImpact(ruleId, target, rules);
    for (const m of target.members) distinctMembers.add(m.id);
    for (const u of losing) distinctLosers.add(u.id);

    targetGroups.push({
      groupId: target.groupId,
      groupName: target.groupName,
      memberCount: target.members.length,
      losingCount: losing.length,
      losing,
    });
  }

  return {
    ruleId,
    ruleName,
    targetGroups,
    distinctMemberCount: distinctMembers.size,
    totalLosing: distinctLosers.size,
  };
}
