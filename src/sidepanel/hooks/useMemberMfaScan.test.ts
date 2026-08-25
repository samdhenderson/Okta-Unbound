import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { OktaUser, MemberMfaResult } from '../../shared/types';
import { MFA_AUTO_THRESHOLD, mfaScanNeedsConfirm, useMemberMfaScan } from './useMemberMfaScan';
import { resetEntityCache, peek, setEntry } from '../cache/entityCache';
import { cacheKeys } from '../cache/keys';

const api = vi.hoisted(() => ({
  scanGroupMfa: vi.fn(async () => new Map<string, unknown>()),
}));

vi.mock('./useOktaApi', () => ({ useOktaApi: () => api }));

const makeMember = (id: string): OktaUser => ({
  id,
  status: 'ACTIVE',
  profile: { login: `${id}@example.com`, email: `${id}@example.com`, firstName: id, lastName: id },
});

const makeResult = (userId: string, enrolled: boolean): MemberMfaResult => ({
  userId,
  factors: [],
  enrolled,
  factorCount: enrolled ? 1 : 0,
  factorLabels: enrolled ? ['SMS'] : [],
});

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
});

describe('mfaScanNeedsConfirm', () => {
  it('is false at and below the threshold, true above it', () => {
    expect(mfaScanNeedsConfirm(0)).toBe(false);
    expect(mfaScanNeedsConfirm(MFA_AUTO_THRESHOLD - 1)).toBe(false);
    expect(mfaScanNeedsConfirm(MFA_AUTO_THRESHOLD)).toBe(false);
    expect(mfaScanNeedsConfirm(MFA_AUTO_THRESHOLD + 1)).toBe(true);
  });
});

describe('useMemberMfaScan', () => {
  it('starts idle with no results when nothing is cached for the group', () => {
    const { result } = renderHook(() =>
      useMemberMfaScan({ groupId: 'g1', members: [makeMember('u1')], targetTabId: 1 }),
    );

    expect(result.current.scanStatus).toBe('idle');
    expect(result.current.mfaResults).toBeNull();
    expect(api.scanGroupMfa).not.toHaveBeenCalled();
  });

  it('restores a previously cached scan for the group on mount, without rescanning', () => {
    const cached = new Map([['u1', makeResult('u1', true)]]);
    setEntry(cacheKeys.mfaScan('g1'), cached);

    const { result } = renderHook(() =>
      useMemberMfaScan({ groupId: 'g1', members: [makeMember('u1')], targetTabId: 1 }),
    );

    expect(result.current.scanStatus).toBe('complete');
    expect(result.current.mfaResults).toBe(cached);
    expect(api.scanGroupMfa).not.toHaveBeenCalled();
  });

  it('requestConfirm/cancelConfirm move between the confirming and idle gates', () => {
    const { result } = renderHook(() =>
      useMemberMfaScan({ groupId: 'g1', members: [makeMember('u1')], targetTabId: 1 }),
    );

    act(() => result.current.requestConfirm());
    expect(result.current.scanStatus).toBe('confirming');

    act(() => result.current.cancelConfirm());
    expect(result.current.scanStatus).toBe('idle');
  });

  it('runScan scans every current member id, then caches the result under the group', async () => {
    const scanned = new Map([
      ['u1', makeResult('u1', true)],
      ['u2', makeResult('u2', false)],
    ]);
    api.scanGroupMfa.mockResolvedValueOnce(scanned);

    const { result } = renderHook(() =>
      useMemberMfaScan({
        groupId: 'g1',
        members: [makeMember('u1'), makeMember('u2')],
        targetTabId: 1,
      }),
    );

    act(() => {
      void result.current.runScan();
    });
    expect(result.current.scanStatus).toBe('scanning');

    await waitFor(() => expect(result.current.scanStatus).toBe('complete'));

    expect(api.scanGroupMfa).toHaveBeenCalledWith(['u1', 'u2']);
    expect(result.current.mfaResults).toBe(scanned);
    expect(peek(cacheKeys.mfaScan('g1'))).toBe(scanned);
  });

  it('runScan surfaces a failure as scanStatus "error", without caching anything', async () => {
    api.scanGroupMfa.mockRejectedValueOnce(new Error('factors down'));

    const { result } = renderHook(() =>
      useMemberMfaScan({ groupId: 'g1', members: [makeMember('u1')], targetTabId: 1 }),
    );

    await act(async () => {
      await result.current.runScan();
    });

    expect(result.current.scanStatus).toBe('error');
    expect(peek(cacheKeys.mfaScan('g1'))).toBeNull();
  });

  it('re-restores from the cache when groupId changes', () => {
    setEntry(cacheKeys.mfaScan('g2'), new Map([['u9', makeResult('u9', true)]]));

    const { result, rerender } = renderHook(
      ({ groupId }) => useMemberMfaScan({ groupId, members: [makeMember('u1')], targetTabId: 1 }),
      { initialProps: { groupId: 'g1' } },
    );
    expect(result.current.scanStatus).toBe('idle');

    rerender({ groupId: 'g2' });
    expect(result.current.scanStatus).toBe('complete');
    expect(result.current.mfaResults?.get('u9')?.enrolled).toBe(true);
  });
});
