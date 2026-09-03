import { invalidate } from './entityCache';
import { cacheKeys } from './keys';

export function invalidateGroupDetail(groupId: string): void {
  invalidate(cacheKeys.groupMembers(groupId));
  invalidate(cacheKeys.mfaScan(groupId));
}
