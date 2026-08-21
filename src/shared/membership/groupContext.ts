import type { RuleGroupContext } from '../ruleEvaluator';
import type { GroupMembership } from '../types';

export function groupContextOf(memberships: readonly GroupMembership[]): RuleGroupContext {
  return memberships.map((membership) => ({
    id: membership.group.id,
    name: membership.group.profile.name,
  }));
}
