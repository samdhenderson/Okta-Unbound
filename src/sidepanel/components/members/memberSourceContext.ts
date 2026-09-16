import type { MemberSourceIndex } from '../../../shared/membership/memberSourceIndex';
import type { MemberSourceBreakdown } from '../../../shared/membership/groupSource';
import { toMemberSourceSegments, type MemberSourceBucket } from '../groups/memberSourceBuckets';

export interface MemberSourceContext {
  index: MemberSourceIndex;
  segments: MemberSourceBucket[];
}

export function toMemberSourceContext(
  breakdown: MemberSourceBreakdown | null,
  index: MemberSourceIndex | null,
): MemberSourceContext | undefined {
  if (!breakdown || !index) return undefined;
  return { index, segments: toMemberSourceSegments(breakdown) };
}
