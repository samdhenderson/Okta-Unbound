import { useEffect, useState } from 'react';
import { readMemberSource, subscribeMemberSource } from '../cache/memberSourceCache';
import type { MemberSourceBreakdown } from '../../shared/membership/groupSource';

export function useCachedMemberSource(groupId: string): MemberSourceBreakdown | null {
  const [breakdown, setBreakdown] = useState<MemberSourceBreakdown | null>(() =>
    readMemberSource(groupId),
  );

  useEffect(() => {
    setBreakdown(readMemberSource(groupId));
    return subscribeMemberSource(groupId, () => setBreakdown(readMemberSource(groupId)));
  }, [groupId]);

  return breakdown;
}
