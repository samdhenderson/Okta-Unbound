import type { MemberSourceIndex } from '../../../shared/membership/memberSourceIndex';
import type { MemberSourceBucket } from '../groups/memberSourceBuckets';

export interface MemberSourceContext {
  index: MemberSourceIndex;
  segments: MemberSourceBucket[];
}
