import type { RuleGroupContext } from '../ruleEvaluator';
import type { GroupMembership, OktaGroup } from '../types';

export function groupContextOf(memberships: readonly GroupMembership[]): RuleGroupContext {
  return memberships.map((membership) => ({
    id: membership.group.id,
    name: membership.group.profile.name,
  }));
}

export function groupContextOfGroups(groups: readonly OktaGroup[]): RuleGroupContext {
  return groups.map((group) => ({ id: group.id, name: group.profile.name }));
}
