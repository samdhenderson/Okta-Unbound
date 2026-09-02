import type { OktaGroupRule } from '../types';

export interface CreateRulePayload {
  type: string;
  name: string;
  conditions: OktaGroupRule['conditions'];
  actions: { assignUserToGroups: { groupIds: string[] } };
}

export const CONSOLIDATED_SUFFIX = ' (consolidated)';

export const MAX_RULE_NAME_LENGTH = 50;

export function consolidatedRuleName(baseName: string): string {
  const room = MAX_RULE_NAME_LENGTH - CONSOLIDATED_SUFFIX.length;
  const base = baseName.length > room ? baseName.slice(0, room) : baseName;
  return `${base}${CONSOLIDATED_SUFFIX}`;
}

export function unionTargetGroups(rule: OktaGroupRule, addGroupIds: string[]): string[] {
  const current = rule.actions?.assignUserToGroups?.groupIds ?? [];
  const seen = new Set(current);
  const result = [...current];
  for (const id of addGroupIds) {
    if (!seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }
  return result;
}

export function buildConsolidatedRulePayload(
  rule: OktaGroupRule,
  addGroupIds: string[],
): CreateRulePayload {
  return {
    type: rule.type || 'group_rule',
    name: consolidatedRuleName(rule.name),
    conditions: rule.conditions,
    actions: { assignUserToGroups: { groupIds: unionTargetGroups(rule, addGroupIds) } },
  };
}

export function normalizeExpression(rule: OktaGroupRule): string {
  return (rule.conditions?.expression?.value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

export interface MergeableRuleGroup {
  expression: string;
  rules: OktaGroupRule[];
  unionGroupIds: string[];
}

export function findMergeableRuleGroups(rules: OktaGroupRule[]): MergeableRuleGroup[] {
  const byExpression = new Map<string, OktaGroupRule[]>();
  for (const rule of rules) {
    const key = normalizeExpression(rule);
    if (!key) continue;
    const bucket = byExpression.get(key);
    if (bucket) bucket.push(rule);
    else byExpression.set(key, [rule]);
  }

  const groups: MergeableRuleGroup[] = [];
  for (const [expression, clusterRules] of byExpression) {
    if (clusterRules.length < 2) continue;
    const seen = new Set<string>();
    const unionGroupIds: string[] = [];
    for (const rule of clusterRules) {
      for (const id of rule.actions?.assignUserToGroups?.groupIds ?? []) {
        if (!seen.has(id)) {
          seen.add(id);
          unionGroupIds.push(id);
        }
      }
    }
    groups.push({ expression, rules: clusterRules, unionGroupIds });
  }

  return groups;
}
