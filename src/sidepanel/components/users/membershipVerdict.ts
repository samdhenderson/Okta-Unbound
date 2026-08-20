import type { BadgeVariant } from '../shared';
import { membershipSourceLine, sourceLineLabel } from '../../../shared/membership/sourceLine';
import { isDeducedAttribution } from '../../../shared/utils/membershipAnalysis';
import type { GroupMembership } from '../../../shared/types';

export type MembershipBucket = 'rule' | 'direct' | 'app' | 'unresolved';

export type MembershipBucketFilter = 'all' | MembershipBucket;

export interface MembershipVerdict {
  label: string;
  variant: BadgeVariant;
  title: string;
}

interface ClassifiedMembership extends MembershipVerdict {
  bucket: MembershipBucket;
}

function classify(membership: GroupMembership): ClassifiedMembership {
  const { membershipType, rules, attribution, group, provenance } = membership;
  const title = membershipSourceLine(membership).description;

  if (provenance) {
    return provenance.rules.length > 0
      ? { label: 'Rule', variant: 'primary', bucket: 'rule', title }
      : { label: 'Direct', variant: 'success', bucket: 'direct', title };
  }

  if (membershipType === 'UNKNOWN') {
    return { label: 'Unresolved', variant: 'warning', bucket: 'unresolved', title };
  }

  if (membershipType === 'DIRECT') {
    return isDeducedAttribution(attribution)
      ? { label: 'Direct?', variant: 'warning', bucket: 'direct', title }
      : { label: 'Direct', variant: 'success', bucket: 'direct', title };
  }

  if (rules.length === 0) {
    if (group.type === 'APP_GROUP') {
      return { label: 'App', variant: 'neutral', bucket: 'app', title };
    }
    return { label: 'Unresolved', variant: 'warning', bucket: 'unresolved', title };
  }

  switch (attribution) {
    case 'exact':
      return { label: 'Rule', variant: 'primary', bucket: 'rule', title };
    case 'inferred':
      return { label: 'Rule?', variant: 'warning', bucket: 'rule', title };
    case 'ambiguous':
      return { label: `Rule · ${rules.length}?`, variant: 'warning', bucket: 'rule', title };
  }
}

export function membershipVerdict(membership: GroupMembership): MembershipVerdict {
  return classify(membership);
}

export function membershipBucket(membership: GroupMembership): MembershipBucket {
  return classify(membership).bucket;
}

const BUCKET_TERMS: readonly (readonly [MembershipBucket, string])[] = [
  ['rule', 'by rule'],
  ['direct', 'direct'],
  ['app', 'app-mastered'],
  ['unresolved', 'unresolved'],
];

export const BUCKET_PILL_LABELS: Record<MembershipBucket, string> = {
  rule: 'Rule',
  direct: 'Direct',
  app: 'App',
  unresolved: 'Unresolved',
};

export function membershipBucketCounts(
  memberships: readonly GroupMembership[],
): Record<MembershipBucket, number> {
  const counts: Record<MembershipBucket, number> = {
    rule: 0,
    direct: 0,
    app: 0,
    unresolved: 0,
  };
  for (const membership of memberships) counts[membershipBucket(membership)] += 1;
  return counts;
}

export function membershipSummaryLine(memberships: readonly GroupMembership[]): string {
  const counts = membershipBucketCounts(memberships);
  return BUCKET_TERMS.filter(([bucket]) => counts[bucket] > 0)
    .map(([bucket, term]) => `${counts[bucket]} ${term}`)
    .join(' · ');
}

function searchableText(membership: GroupMembership): string {
  const line = membershipSourceLine(membership);
  return `${membership.group.profile.name} ${sourceLineLabel(line)}`.toLowerCase();
}

export function filterMemberships(
  memberships: readonly GroupMembership[],
  query: string,
  bucket: MembershipBucketFilter,
): GroupMembership[] {
  const needle = query.trim().toLowerCase();
  return memberships.filter((membership) => {
    if (bucket !== 'all' && membershipBucket(membership) !== bucket) return false;
    return needle === '' || searchableText(membership).includes(needle);
  });
}
