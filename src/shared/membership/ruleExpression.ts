import type { MembershipRule } from '../types';

export function conditionExpressionOf(rule: MembershipRule): string {
  return rule.conditionExpression || rule.conditions?.expression?.value || '';
}

export function targetGroupIdsOf(rule: MembershipRule): readonly string[] {
  return rule.groupIds ?? rule.actions?.assignUserToGroups?.groupIds ?? [];
}
