import type { GroupMembership, MembershipProvenance } from '../types';
import type { MemberRuleAttribution } from './memberRuleAttribution';

export function membershipProvenanceOf(
  answer: MemberRuleAttribution,
): MembershipProvenance | undefined {
  if (answer.state === 'unknown') return undefined;
  return {
    source: 'okta',
    rules: answer.state === 'rules' ? answer.rules.map(({ id, name }) => ({ id, name })) : [],
  };
}

export function withMembershipProvenance(
  membership: GroupMembership,
  answer: MemberRuleAttribution,
): GroupMembership {
  const provenance = membershipProvenanceOf(answer);
  return provenance ? { ...membership, provenance } : membership;
}
