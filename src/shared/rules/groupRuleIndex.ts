import type { GroupSummary } from '../types';

export interface RuleTarget {
  groupIds: string[];
}

export function countRulesByGroup(rules: readonly RuleTarget[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const rule of rules) {
    const seen = new Set<string>();
    for (const groupId of rule.groupIds ?? []) {
      if (seen.has(groupId)) continue;
      seen.add(groupId);
      counts.set(groupId, (counts.get(groupId) ?? 0) + 1);
    }
  }
  return counts;
}

export function annotateGroupsWithRuleCounts(
  groups: readonly GroupSummary[],
  rules: readonly RuleTarget[],
): GroupSummary[] {
  const counts = countRulesByGroup(rules);
  return groups.map((group) => {
    const ruleCount = counts.get(group.id) ?? 0;
    return { ...group, hasRules: ruleCount > 0, ruleCount };
  });
}
