import type { OktaUser } from '../types';

export interface MergeGroupRef {
  id: string;
  name: string;
}

export interface MergeFeedingRule {
  name: string;
  status: string;
}

export interface MergeSourcePlan {
  id: string;
  name: string;
  membersToRemove: OktaUser[];
  hasActiveFeedingRule: boolean;
  feedingRuleNames: string[];
}

export interface MergePlan {
  survivor: MergeGroupRef;
  toCopy: OktaUser[];
  sources: MergeSourcePlan[];
  totalCopies: number;
  totalRemovals: number;
  blocked: boolean;
}

export function planGroupMerge(
  survivor: MergeGroupRef,
  sources: MergeGroupRef[],
  membersByGroup: Map<string, OktaUser[]>,
  feedingRulesByGroup: Map<string, MergeFeedingRule[]>,
): MergePlan {
  const survivorIds = new Set((membersByGroup.get(survivor.id) ?? []).map((m) => m.id));

  const toCopy: OktaUser[] = [];
  const copySeen = new Set<string>();
  const sourcePlans: MergeSourcePlan[] = [];
  let totalRemovals = 0;

  for (const source of sources) {
    const members = membersByGroup.get(source.id) ?? [];
    totalRemovals += members.length;

    for (const member of members) {
      if (!survivorIds.has(member.id) && !copySeen.has(member.id)) {
        copySeen.add(member.id);
        toCopy.push(member);
      }
    }

    const activeRules = (feedingRulesByGroup.get(source.id) ?? []).filter(
      (r) => r.status === 'ACTIVE',
    );

    sourcePlans.push({
      id: source.id,
      name: source.name,
      membersToRemove: members,
      hasActiveFeedingRule: activeRules.length > 0,
      feedingRuleNames: activeRules.map((r) => r.name),
    });
  }

  return {
    survivor,
    toCopy,
    sources: sourcePlans,
    totalCopies: toCopy.length,
    totalRemovals,
    blocked: sourcePlans.some((s) => s.hasActiveFeedingRule),
  };
}
