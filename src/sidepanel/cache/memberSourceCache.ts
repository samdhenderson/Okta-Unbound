import { peek, registerDerived, setEntry, subscribe, type EntityKey } from './entityCache';
import { cacheKeys, TTL_LONG } from './keys';
import type { MemberSourceBreakdown } from '../../shared/membership/groupSource';

registerDerived('memberSource', 'groupMembers');

export const MEMBER_SOURCE_TTL = TTL_LONG;

export function memberSourceKey(groupId: string): EntityKey {
  return cacheKeys.memberSource(groupId);
}

export function readMemberSource(groupId: string): MemberSourceBreakdown | null {
  return peek<MemberSourceBreakdown>(memberSourceKey(groupId));
}

export function writeMemberSource(groupId: string, breakdown: MemberSourceBreakdown): void {
  setEntry(memberSourceKey(groupId), breakdown, { ttl: MEMBER_SOURCE_TTL });
}

export function subscribeMemberSource(groupId: string, callback: () => void): () => void {
  return subscribe(memberSourceKey(groupId), callback);
}
