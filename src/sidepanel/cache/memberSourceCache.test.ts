import { describe, it, expect, beforeEach } from 'vitest';
import { readMemberSource, writeMemberSource } from './memberSourceCache';
import { invalidate, resetEntityCache } from './entityCache';
import { cacheKeys } from './keys';
import type { MemberSourceBreakdown } from '../../shared/membership/groupSource';

const breakdown: MemberSourceBreakdown = {
  total: 10,
  direct: 4,
  ruleBased: 6,
  unattributed: 0,
  byRule: [],
};

describe('memberSourceCache derivation', () => {
  beforeEach(() => {
    resetEntityCache();
  });

  it('serves a written breakdown back', () => {
    writeMemberSource('00gFAKE1', breakdown);

    expect(readMemberSource('00gFAKE1')).toEqual(breakdown);
  });

  it('drops the breakdown when its source member list is invalidated', () => {
    writeMemberSource('00gFAKE1', breakdown);

    invalidate(cacheKeys.groupMembers('00gFAKE1'));

    expect(readMemberSource('00gFAKE1')).toBeNull();
  });

  it('leaves another group’s breakdown alone', () => {
    writeMemberSource('00gFAKE1', breakdown);
    writeMemberSource('00gFAKE2', breakdown);

    invalidate(cacheKeys.groupMembers('00gFAKE1'));

    expect(readMemberSource('00gFAKE1')).toBeNull();
    expect(readMemberSource('00gFAKE2')).toEqual(breakdown);
  });

  it('drops the breakdown even when the member list itself was never cached', () => {
    writeMemberSource('00gFAKE1', breakdown);

    invalidate(cacheKeys.groupMembers('00gFAKE1'));

    expect(readMemberSource('00gFAKE1')).toBeNull();
  });
});
