import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { OktaUser } from '../../shared/types';

const expirePasswordWithTempPassword = vi.fn();

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => ({
    suspendUser: vi.fn(),
    unsuspendUser: vi.fn(),
    resetPassword: vi.fn(),
    setUserPassword: vi.fn(),
    expirePassword: vi.fn(),
    expirePasswordWithTempPassword,
    getUserById: vi.fn(async () => null),
  }),
}));

vi.mock('../../shared/undoManager', () => ({ logPasswordChangeAction: vi.fn() }));

const { useUserLifecycleActions } = await import('./useUserLifecycleActions');

const user = (id: string): OktaUser =>
  ({
    id,
    status: 'ACTIVE',
    profile: { login: `${id}@example.com`, firstName: 'Ada', lastName: 'Lovelace' },
  }) as OktaUser;

const renderForUser = (selectedUser: OktaUser | null) =>
  renderHook(
    ({ selected }: { selected: OktaUser | null }) =>
      useUserLifecycleActions({
        targetTabId: 1,
        selectedUser: selected,
        onResult: vi.fn(),
        onUserStatusRefresh: vi.fn(),
      }),
    { initialProps: { selected: selectedUser } },
  );

beforeEach(() => {
  expirePasswordWithTempPassword.mockReset();
  expirePasswordWithTempPassword.mockResolvedValue({
    kind: 'saved-with-temp',
    tempPassword: 'FAKE-TEMP-VALUE',
  });
});

describe('useUserLifecycleActions', () => {
  it('drops a generated temp password when the selected user changes', async () => {
    const { result, rerender } = renderForUser(user('00uFAKE000000000001'));

    act(() => result.current.setPendingLifecycleAction('resetPassword'));
    await act(async () => {
      await result.current.confirmLifecycleAction({ mode: 'temp' });
    });
    expect(result.current.tempPassword).toBe('FAKE-TEMP-VALUE');

    rerender({ selected: user('00uFAKE000000000002') });

    expect(result.current.tempPassword).toBeNull();
  });

  it('disarms a confirm that was armed against a different user', () => {
    const { result, rerender } = renderForUser(user('00uFAKE000000000001'));

    act(() => result.current.setPendingLifecycleAction('suspend'));
    expect(result.current.pendingLifecycleAction).toBe('suspend');

    rerender({ selected: user('00uFAKE000000000002') });

    expect(result.current.pendingLifecycleAction).toBeNull();
  });

  it('keeps both when the same user object is merely re-rendered', async () => {
    const selected = user('00uFAKE000000000001');
    const { result, rerender } = renderForUser(selected);

    act(() => result.current.setPendingLifecycleAction('resetPassword'));
    await act(async () => {
      await result.current.confirmLifecycleAction({ mode: 'temp' });
    });

    rerender({ selected: { ...selected, status: 'PASSWORD_EXPIRED' } as OktaUser });

    expect(result.current.tempPassword).toBe('FAKE-TEMP-VALUE');
  });
});
