import { extractReferencedGroupIds } from './groupRuleIndex';
import type { FormattedRule } from '../types';

export const splitCurrentGroupRuleRelations = (
  rules: FormattedRule[],
  currentGroupId?: string,
): { assigning: FormattedRule[]; referencing: FormattedRule[] } => {
  const assigning: FormattedRule[] = [];
  const referencing: FormattedRule[] = [];
  if (!currentGroupId) return { assigning, referencing };
  for (const rule of rules) {
    if (rule.groupIds?.includes(currentGroupId)) assigning.push(rule);
    if (extractReferencedGroupIds(rule.conditionExpression).includes(currentGroupId)) {
      referencing.push(rule);
    }
  }
  return { assigning, referencing };
};

export const countCurrentGroupRuleRelations = (
  rules: FormattedRule[],
  currentGroupId?: string,
): number => {
  const { assigning, referencing } = splitCurrentGroupRuleRelations(rules, currentGroupId);
  return new Set([...assigning, ...referencing].map((r) => r.id)).size;
};
