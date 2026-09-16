import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useMemberCohort } from './useMemberCohort';
import type { MemberSourceContext } from './memberSourceContext';
import type { OktaUser, UserStatus } from '../../../shared/types';

function member(n: number, status: UserStatus, department: string): OktaUser {
  return {
    id: `00uFAKE0000000000${n}`,
    status,
    profile: {
      firstName: 'Ada',
      lastName: `Lovelace ${n}`,
      email: `member${n}@example.com`,
      login: `member${n}@example.com`,
      department,
    },
  };
}

const members: OktaUser[] = [
  member(1, 'ACTIVE', 'Engineering'),
  member(2, 'ACTIVE', 'Support'),
  member(3, 'SUSPENDED', 'Engineering'),
  member(4, 'SUSPENDED', 'Support'),
];

const base = { members, mfaResults: null } as const;

const ids = (users: OktaUser[]): string[] => users.map((user) => user.id);

describe('useMemberCohort', () => {
  it('starts with the whole roster, in name order', () => {
    const { result } = renderHook(() => useMemberCohort(base));

    expect(result.current.sorted).toHaveLength(4);
    expect(result.current.query).toBe('');
    expect(result.current.filters.activeCount).toBe(0);
  });

  it('renders an unloaded roster as empty rather than throwing', () => {
    const { result } = renderHook(() => useMemberCohort({ members: null, mfaResults: null }));

    expect(result.current.sorted).toEqual([]);
    expect(result.current.filtered).toEqual([]);
  });

  describe('search', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('does not narrow until the debounce elapses', () => {
      const { result } = renderHook(() => useMemberCohort(base));

      act(() => {
        result.current.setQuery('member2');
      });

      expect(result.current.query).toBe('member2');
      expect(result.current.sorted).toHaveLength(4);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(ids(result.current.sorted)).toEqual(['00uFAKE00000000002']);
    });
  });

  it('narrows further as facets are added, intersecting across dimensions', () => {
    const { result } = renderHook(() => useMemberCohort(base));

    act(() => {
      result.current.filters.toggle('department', 'Engineering', 'Department: Engineering');
    });
    expect(ids(result.current.sorted)).toEqual(['00uFAKE00000000001', '00uFAKE00000000003']);

    act(() => {
      result.current.filters.toggle('status', 'ACTIVE', 'Status: ACTIVE');
    });
    expect(ids(result.current.sorted)).toEqual(['00uFAKE00000000001']);
  });

  it('applies a pending filter request from a neighbouring pane', () => {
    const request = {
      dimension: 'department',
      value: 'Support',
      label: 'Department: Support',
    };
    const { result } = renderHook(() => useMemberCohort({ ...base, pendingFilter: request }));

    expect(ids(result.current.sorted)).toEqual(['00uFAKE00000000002', '00uFAKE00000000004']);
  });

  describe('sort', () => {
    it('flips direction when the same field is toggled again', () => {
      const { result } = renderHook(() => useMemberCohort(base));

      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortDesc).toBe(false);
      const ascending = ids(result.current.sorted);

      act(() => {
        result.current.toggleSort('name');
      });

      expect(result.current.sortDesc).toBe(true);
      expect(ids(result.current.sorted)).toEqual([...ascending].reverse());
    });

    it('resets direction when a different field is chosen', () => {
      const { result } = renderHook(() => useMemberCohort(base));

      act(() => {
        result.current.toggleSort('name');
      });
      expect(result.current.sortDesc).toBe(true);

      act(() => {
        result.current.toggleSort('status');
      });

      expect(result.current.sortBy).toBe('status');
      expect(result.current.sortDesc).toBe(false);
    });
  });

  it('cannot evaluate a source filter without a source context, so it matches nobody', () => {
    const { result } = renderHook(() => useMemberCohort(base));

    act(() => {
      result.current.filters.toggleSource('direct', 'Source: Manual');
    });

    expect(result.current.sorted).toEqual([]);
  });

  it('evaluates a source filter when the context is supplied', () => {
    const memberSource: MemberSourceContext = {
      index: {
        byUserId: new Map(),
        userIdsByBucket: new Map([['direct', new Set(['00uFAKE00000000002'])]]),
      },
      segments: [],
    };

    const { result } = renderHook(() => useMemberCohort({ ...base, memberSource }));

    act(() => {
      result.current.filters.toggleSource('direct', 'Source: Manual');
    });

    expect(ids(result.current.sorted)).toEqual(['00uFAKE00000000002']);
  });

  describe('the inert half of a controlled pair', () => {
    it('derives nothing at all when disabled', () => {
      const { result } = renderHook(() => useMemberCohort({ ...base, enabled: false }));

      expect(result.current.sorted).toEqual([]);
      expect(result.current.filtered).toEqual([]);
    });

    it('returns a referentially stable empty array across renders', () => {
      const { result, rerender } = renderHook(() => useMemberCohort({ ...base, enabled: false }));
      const first = result.current.sorted;

      rerender();

      expect(result.current.sorted).toBe(first);
    });
  });

  describe('resetKey', () => {
    it('changes when the sort changes', () => {
      const { result } = renderHook(() => useMemberCohort(base));
      const before = result.current.resetKey;

      act(() => {
        result.current.toggleSort('status');
      });

      expect(result.current.resetKey).not.toBe(before);
    });

    it('changes when a facet is applied', () => {
      const { result } = renderHook(() => useMemberCohort(base));
      const before = result.current.resetKey;

      act(() => {
        result.current.filters.toggle('department', 'Support', 'Department: Support');
      });

      expect(result.current.resetKey).not.toBe(before);
    });

    it('holds still across a re-render that changes nothing', () => {
      const { result, rerender } = renderHook(() => useMemberCohort(base));
      const before = result.current.resetKey;

      rerender();

      expect(result.current.resetKey).toBe(before);
    });
  });
});
