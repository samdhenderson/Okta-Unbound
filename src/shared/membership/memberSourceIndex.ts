import type { GroupMembership, GroupType, MembershipRule, OktaGroup, OktaUser } from '../types';
import type { MemberSourceBucketKey } from '../../sidepanel/components/groups/memberSourceBuckets';
import { analyzeMemberships } from '../utils/membershipAnalysis';
import { readEmbeddedGroupRules } from './memberRuleAttribution';
import { withMembershipProvenance } from './provenance';
import { memberSourceVerdict, type GroupIdentity, type MemberSourceVerdict } from './groupSource';

export interface MemberSourceClassification {
  userId: string;
  membership: GroupMembership;
  verdict: MemberSourceVerdict;
  bucket: MemberSourceBucketKey;
}

export interface MemberSourceIndex {
  byUserId: ReadonlyMap<string, MemberSourceClassification>;
  userIdsByBucket: ReadonlyMap<MemberSourceBucketKey, ReadonlySet<string>>;
}

function bucketOf(verdict: MemberSourceVerdict): MemberSourceBucketKey {
  if (verdict.kind === 'direct') return 'direct';
  if (verdict.soleRuleId !== null) return `rule:${verdict.soleRuleId}`;
  if (verdict.multiRule) return 'multiRule';
  if (verdict.deduced) return 'unattributed';
  return 'ruleBased';
}

export function classifyMemberSource(
  group: GroupIdentity,
  member: OktaUser,
  rules: MembershipRule[],
): MemberSourceClassification {
  const oktaGroup: OktaGroup = {
    id: group.id,
    type: group.type,
    profile: { name: group.name },
  };

  const answer = readEmbeddedGroupRules(member);
  const heuristic = analyzeMemberships([oktaGroup], rules, member)[0];
  const verdict = memberSourceVerdict(answer, heuristic, group.type as GroupType | undefined);

  return {
    userId: member.id,
    membership: withMembershipProvenance(heuristic, answer),
    verdict,
    bucket: bucketOf(verdict),
  };
}

export function buildMemberSourceIndex(
  group: GroupIdentity,
  members: OktaUser[],
  rules: MembershipRule[],
): MemberSourceIndex {
  const byUserId = new Map<string, MemberSourceClassification>();
  const userIdsByBucket = new Map<MemberSourceBucketKey, Set<string>>();

  for (const member of members) {
    const classification = classifyMemberSource(group, member, rules);
    byUserId.set(member.id, classification);

    let bucket = userIdsByBucket.get(classification.bucket);
    if (!bucket) {
      bucket = new Set<string>();
      userIdsByBucket.set(classification.bucket, bucket);
    }
    bucket.add(member.id);
  }

  return { byUserId, userIdsByBucket };
}
