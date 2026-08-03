import type { MemberSourceBreakdown } from '../../../shared/membership/groupSource';

export type MemberSourceBucketKey = 'ruleBased' | 'direct' | 'unattributed';

export interface MemberSourceBucket {
  key: MemberSourceBucketKey;
  label: string;
  description: string;
  count: number;
  percent: number;
  barClass: string;
  dotClass: string;
}

const BUCKET_META: Record<
  MemberSourceBucketKey,
  { label: string; description: string; barClass: string; dotClass: string }
> = {
  ruleBased: {
    label: 'Rule-managed',
    description: "Matched a targeting rule's condition, so that rule accounts for this membership.",
    barClass: 'bg-primary',
    dotClass: 'bg-primary',
  },
  direct: {
    label: 'Manual',
    description: 'Added directly — no rule accounts for this membership.',
    barClass: 'bg-neutral-400',
    dotClass: 'bg-neutral-400',
  },
  unattributed: {
    label: 'Indeterminate',
    description: 'A targeting rule could not be evaluated here, so the source is unconfirmed.',
    barClass: 'bg-warning',
    dotClass: 'bg-warning',
  },
};

const BUCKET_ORDER: MemberSourceBucketKey[] = ['ruleBased', 'direct', 'unattributed'];

export function toMemberSourceBuckets(breakdown: MemberSourceBreakdown): MemberSourceBucket[] {
  const indeterminate = Math.max(0, Math.min(breakdown.unattributed, breakdown.ruleBased));

  const counts: Record<MemberSourceBucketKey, number> = {
    ruleBased: breakdown.ruleBased - indeterminate,
    direct: breakdown.direct,
    unattributed: indeterminate,
  };

  const analyzed = BUCKET_ORDER.reduce((sum, key) => sum + counts[key], 0);

  return BUCKET_ORDER.map((key) => ({
    key,
    ...BUCKET_META[key],
    count: counts[key],
    percent: analyzed === 0 ? 0 : (counts[key] / analyzed) * 100,
  }));
}
