import type { MembershipRule } from '../types';

export function conditionExpressionOf(rule: MembershipRule): string {
  return rule.conditionExpression || rule.conditions?.expression?.value || '';
}
