import { peek, setEntry, subscribe, type EntityKey } from './entityCache';
import type { MemberSourceBreakdown } from '../../shared/membership/groupSource';

export const MEMBER_SOURCE_TTL = 30 * 60 * 1000;

export function memberSourceKey(groupId: string): EntityKey {
  return ['memberSource', groupId];
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
