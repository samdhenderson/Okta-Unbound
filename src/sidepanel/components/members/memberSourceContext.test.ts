import { describe, it, expect } from 'vitest';
import { toMemberSourceContext } from './memberSourceContext';
import type { MemberSourceIndex } from '../../../shared/membership/memberSourceIndex';
import type { MemberSourceBreakdown } from '../../../shared/membership/groupSource';

const breakdown: MemberSourceBreakdown = {
  total: 3,
  direct: 1,
  ruleBased: 2,
  unattributed: 0,
  byRule: [],
};

const index: MemberSourceIndex = {
  byUserId: new Map(),
  userIdsByBucket: new Map(),
};

describe('toMemberSourceContext', () => {
  it('bundles the index with the segments drawn from the breakdown', () => {
    const context = toMemberSourceContext(breakdown, index);

    expect(context?.index).toBe(index);
    expect(context?.segments.map((segment) => segment.key)).toEqual([
      'ruleBased',
      'direct',
      'unattributed',
    ]);
  });

  it('withholds the bundle when the breakdown has not arrived', () => {
    expect(toMemberSourceContext(null, index)).toBeUndefined();
  });

  it('withholds the bundle when the index has not arrived', () => {
    expect(toMemberSourceContext(breakdown, null)).toBeUndefined();
  });
});
