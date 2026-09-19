import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { OktaGroup, OktaUser } from '../../shared/types';
import type { QualificationSubjectResult } from './useOktaApi/qualificationSubject';

const loadQualificationSubject = vi.fn<(userId: string) => Promise<QualificationSubjectResult>>();
vi.mock('./useOktaApi', () => ({ useOktaApi: () => ({ loadQualificationSubject }) }));

import { useQualificationSubject } from './useQualificationSubject';

const USER_ID = '00uFAKESUBJECT';
const user: OktaUser = {
  id: USER_ID,
  status: 'ACTIVE',
  profile: {
    login: 'subject@example.com',
    email: 'subject@example.com',
    firstName: 'Sub',
    lastName: 'Ject',
  },
};
const group = (id: string): OktaGroup => ({
  id,
  type: 'OKTA_GROUP',
  profile: { name: `Group ${id}` },
});

function deferred() {
  let resolve!: (value: QualificationSubjectResult) => void;
  const promise = new Promise<QualificationSubjectResult>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

beforeEach(() => {
  loadQualificationSubject.mockReset();
});

describe('useQualificationSubject', () => {
  it('goes idle → loading → loaded, with the group context built from the groups', async () => {
    loadQualificationSubject.mockResolvedValue({ ok: true, user, groups: [group('g1')] });
    const { result } = renderHook(() =>
      useQualificationSubject({ targetTabId: 1, scopeKey: 'rule-1' }),
    );
    expect(result.current.state.status).toBe('idle');

    act(() => result.current.load(USER_ID));
    expect(result.current.state).toEqual({ status: 'loading', userId: USER_ID });

    await waitFor(() => expect(result.current.state.status).toBe('loaded'));
    expect(result.current.state).toMatchObject({
      user,
      groupContext: [{ id: 'g1', name: 'Group g1' }],
    });
  });

  it('forwards the failure reason and holds no user', async () => {
    loadQualificationSubject.mockResolvedValue({ ok: false, reason: 'groups-failed' });
    const { result } = renderHook(() =>
      useQualificationSubject({ targetTabId: 1, scopeKey: 'rule-1' }),
    );
    act(() => result.current.load(USER_ID));
    await waitFor(() => expect(result.current.state.status).toBe('failed'));
    expect(result.current.state).toEqual({
      status: 'failed',
      userId: USER_ID,
      reason: 'groups-failed',
    });
  });

  it('fails with no-tab without calling the api', () => {
    const { result } = renderHook(() =>
      useQualificationSubject({ targetTabId: null, scopeKey: 'rule-1' }),
    );
    act(() => result.current.load(USER_ID));
    expect(result.current.state).toEqual({ status: 'failed', userId: USER_ID, reason: 'no-tab' });
    expect(loadQualificationSubject).not.toHaveBeenCalled();
  });

  it('a second load supersedes the first — the first never commits', async () => {
    const first = deferred();
    loadQualificationSubject
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce({ ok: true, user: { ...user, id: '00uFAKESECOND' }, groups: [] });
    const { result } = renderHook(() =>
      useQualificationSubject({ targetTabId: 1, scopeKey: 'rule-1' }),
    );

    act(() => result.current.load(USER_ID));
    act(() => result.current.load('00uFAKESECOND'));
    await waitFor(() => expect(result.current.state.status).toBe('loaded'));
    expect(result.current.state).toMatchObject({ userId: '00uFAKESECOND' });

    await act(async () => {
      first.resolve({ ok: true, user, groups: [group('late')] });
    });
    expect(result.current.state).toMatchObject({ userId: '00uFAKESECOND' });
  });

  it('retracts to idle when the scope changes, without a call', async () => {
    loadQualificationSubject.mockResolvedValue({ ok: true, user, groups: [] });
    const { result, rerender } = renderHook(
      ({ scopeKey }) => useQualificationSubject({ targetTabId: 1, scopeKey }),
      { initialProps: { scopeKey: 'rule-1' } },
    );
    act(() => result.current.load(USER_ID));
    await waitFor(() => expect(result.current.state.status).toBe('loaded'));

    rerender({ scopeKey: 'rule-2' });
    expect(result.current.state.status).toBe('idle');
    expect(loadQualificationSubject).toHaveBeenCalledTimes(1);
  });

  it('clear returns to idle and discards a load in flight', async () => {
    const pending = deferred();
    loadQualificationSubject.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() =>
      useQualificationSubject({ targetTabId: 1, scopeKey: 'rule-1' }),
    );
    act(() => result.current.load(USER_ID));
    act(() => result.current.clear());
    expect(result.current.state.status).toBe('idle');
    await act(async () => {
      pending.resolve({ ok: true, user, groups: [] });
    });
    expect(result.current.state.status).toBe('idle');
  });
});
