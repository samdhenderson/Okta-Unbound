import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { OktaUser } from '../../shared/types';
import type { RuleInventoryState } from '../../shared/membership/blastRadiusTypes';

vi.mock('./fetchGroupRulesRequest', () => ({
  loadCachedGroupNames: vi.fn(async () => new Map<string, string>()),
}));

import { useBlastRadius } from './useBlastRadius';

const ada = {
  id: '00uFAKE0001',
  status: 'ACTIVE',
  profile: { login: 'ada@example.com', email: 'ada@example.com', department: 'Sales' },
} as OktaUser;

const grace = { ...ada, id: '00uFAKE0002' } as OktaUser;

const memberships = [
  {
    group: { id: '00gFAKE0001', profile: { name: 'Sales EMEA' } },
    attribution: 'exact',
    rules: [],
  },
] as never;

const rules: RuleInventoryState = { status: 'available', rules: [] };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useBlastRadius group context (D-E)', () => {
  it('withholds the context before anything has been analysed', () => {
    const { result } = renderHook(() =>
      useBlastRadius({ user: ada, memberships, rules, oktaOrigin: 'https://x.okta.com' }),
    );

    expect(result.current.groupContext).toBeUndefined();
    expect(result.current.drafted).toBeNull();
    expect(result.current.report.status).toBe('not-computed');
  });

  it('commits the real list alongside the report', async () => {
    const { result } = renderHook(() =>
      useBlastRadius({ user: ada, memberships, rules, oktaOrigin: 'https://x.okta.com' }),
    );

    act(() => result.current.analyze({ department: 'Marketing' }));

    await waitFor(() => expect(result.current.groupContext).toBeDefined());
    expect(result.current.groupContext).toHaveLength(1);
    expect(result.current.drafted).not.toBeNull();
  });

  it('withholds it again after reset, rather than dropping to an empty list', async () => {
    const { result } = renderHook(() =>
      useBlastRadius({ user: ada, memberships, rules, oktaOrigin: 'https://x.okta.com' }),
    );

    act(() => result.current.analyze({ department: 'Marketing' }));
    await waitFor(() => expect(result.current.groupContext).toBeDefined());

    act(() => result.current.reset());

    expect(result.current.groupContext).toBeUndefined();
    expect(result.current.drafted).toBeNull();
  });

  it('withholds it when the subject user changes, in the same render as the report', async () => {
    const { result, rerender } = renderHook(
      ({ user }: { user: OktaUser }) =>
        useBlastRadius({ user, memberships, rules, oktaOrigin: 'https://x.okta.com' }),
      { initialProps: { user: ada } },
    );

    act(() => result.current.analyze({ department: 'Marketing' }));
    await waitFor(() => expect(result.current.groupContext).toBeDefined());

    rerender({ user: grace });

    expect(result.current.report.status).toBe('not-computed');
    expect(result.current.groupContext).toBeUndefined();
    expect(result.current.drafted).toBeNull();
  });

  it('withholds it when there is no user at all', () => {
    const { result } = renderHook(() =>
      useBlastRadius({ user: null, memberships, rules, oktaOrigin: 'https://x.okta.com' }),
    );

    expect(result.current.groupContext).toBeUndefined();
  });

  it('still commits [] for a user Okta says is in no groups', async () => {
    const { result } = renderHook(() =>
      useBlastRadius({ user: ada, memberships: [], rules, oktaOrigin: 'https://x.okta.com' }),
    );

    act(() => result.current.analyze({ department: 'Marketing' }));

    await waitFor(() => expect(result.current.groupContext).toEqual([]));
    expect(result.current.groupContext).not.toBeUndefined();
  });
});
