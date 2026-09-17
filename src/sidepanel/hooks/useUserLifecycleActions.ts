import { useState, useCallback, useEffect } from 'react';
import type { OktaUser } from '../../shared/types';
import type { PasswordChangeMode } from '../../shared/undoTypes';
import { logPasswordChangeAction } from '../../shared/undoManager';
import { createLogger } from '../../shared/utils/logger';
import { useOktaApi } from './useOktaApi';

const log = createLogger('useUserLifecycleActions');

async function record(...args: Parameters<typeof logPasswordChangeAction>): Promise<void> {
  try {
    await logPasswordChangeAction(...args);
  } catch {
    log.error('Password change happened but could not be recorded', { userId: args[0] });
  }
}

export type { PasswordChangeMode };

export type LifecycleAction = 'suspend' | 'unsuspend' | 'resetPassword';

export interface PasswordConfirmInput {
  mode: PasswordChangeMode;
  password?: string;
}

export interface LifecycleResult {
  text: string;
  type: 'success' | 'danger';
}

interface UseUserLifecycleActionsOptions {
  targetTabId: number | undefined;
  selectedUser: OktaUser | null;
  onResult: (result: LifecycleResult) => void;
  onUserStatusRefresh: (status: OktaUser['status']) => void;
}

interface UseUserLifecycleActionsReturn {
  pendingLifecycleAction: LifecycleAction | null;
  setPendingLifecycleAction: (action: LifecycleAction | null) => void;
  isLifecycleLoading: boolean;
  confirmLifecycleAction: (input?: PasswordConfirmInput) => Promise<void>;
  tempPassword: string | null;
  clearTempPassword: () => void;
}

const SUCCESS_MESSAGES: Record<LifecycleAction, string> = {
  suspend: 'User suspended successfully. They can no longer sign in.',
  unsuspend: 'User unsuspended successfully. They can now sign in.',
  resetPassword: 'Password reset email sent successfully.',
};

const PASSWORD_SUCCESS: Record<PasswordChangeMode, string> = {
  'email-reset': 'Password reset email sent. The link is one-time and expires.',
  set: 'Password set. It is in force now — this cannot be undone.',
  'set-and-expire': 'Password set, and the user must change it at next sign-in.',
  temp: 'Temporary password generated. It is shown once and the user must change it.',
};

export function useUserLifecycleActions({
  targetTabId,
  selectedUser,
  onResult,
  onUserStatusRefresh,
}: UseUserLifecycleActionsOptions): UseUserLifecycleActionsReturn {
  const [pendingLifecycleAction, setPendingLifecycleAction] = useState<LifecycleAction | null>(
    null,
  );
  const [isLifecycleLoading, setIsLifecycleLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const {
    suspendUser,
    unsuspendUser,
    resetPassword,
    setUserPassword,
    expirePassword,
    expirePasswordWithTempPassword,
    getUserById,
  } = useOktaApi({ targetTabId: targetTabId ?? null });

  const clearTempPassword = useCallback(() => setTempPassword(null), []);

  const selectedUserId = selectedUser?.id ?? null;
  useEffect(() => {
    setPendingLifecycleAction(null);
    setTempPassword(null);
  }, [selectedUserId]);

  const confirmLifecycleAction = useCallback(
    async (input?: PasswordConfirmInput) => {
      if (!selectedUser || !pendingLifecycleAction) return;

      const action = pendingLifecycleAction;
      setIsLifecycleLoading(true);
      setPendingLifecycleAction(null);
      setTempPassword(null);

      try {
        if (action !== 'resetPassword') {
          const result =
            action === 'suspend'
              ? await suspendUser(selectedUser.id)
              : await unsuspendUser(selectedUser.id);

          if (!result.success) {
            onResult({
              text: result.error || 'The operation failed. Please try again.',
              type: 'danger',
            });
            return;
          }

          onResult({ text: SUCCESS_MESSAGES[action], type: 'success' });
          const refreshed = await getUserById(selectedUser.id);
          if (refreshed) onUserStatusRefresh(refreshed.status as OktaUser['status']);
          return;
        }

        const mode = input?.mode ?? 'email-reset';
        const login = selectedUser.profile?.login ?? '';
        const name =
          `${selectedUser.profile?.firstName ?? ''} ${selectedUser.profile?.lastName ?? ''}`.trim();

        if (mode === 'email-reset') {
          const result = await resetPassword(selectedUser.id);
          if (!result.success) {
            onResult({
              text: result.error || 'The operation failed. Please try again.',
              type: 'danger',
            });
            return;
          }
          await record(selectedUser.id, login, name, mode);
          onResult({ text: PASSWORD_SUCCESS[mode], type: 'success' });
          return;
        }

        const write =
          mode === 'temp'
            ? await expirePasswordWithTempPassword(selectedUser.id)
            : await setUserPassword(selectedUser.id, input?.password ?? '');

        if (write.kind === 'failed') {
          onResult({ text: write.error, type: 'danger' });
          return;
        }

        if (write.kind === 'unknown') {
          await record(selectedUser.id, login, name, mode, { status: 'partial' });
          onResult({ text: write.error, type: 'danger' });
          return;
        }

        if (write.kind === 'saved-with-temp') {
          setTempPassword(write.tempPassword);
        }

        let expired: boolean | undefined;
        if (mode === 'set-and-expire') {
          const expiry = await expirePassword(selectedUser.id);
          expired = expiry.kind === 'saved' || expiry.kind === 'saved-with-temp';
        }

        await record(selectedUser.id, login, name, mode, { expired });

        if (expired === false) {
          onResult({
            text: 'Password set, but the forced change at next sign-in was not applied. The password works as a permanent one.',
            type: 'danger',
          });
        } else {
          onResult({ text: PASSWORD_SUCCESS[mode], type: 'success' });
        }

        const refreshed = await getUserById(selectedUser.id);
        if (refreshed) onUserStatusRefresh(refreshed.status as OktaUser['status']);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        onResult({ text: message, type: 'danger' });
      } finally {
        setIsLifecycleLoading(false);
      }
    },
    [
      selectedUser,
      pendingLifecycleAction,
      suspendUser,
      unsuspendUser,
      resetPassword,
      setUserPassword,
      expirePassword,
      expirePasswordWithTempPassword,
      getUserById,
      onResult,
      onUserStatusRefresh,
    ],
  );

  return {
    pendingLifecycleAction,
    setPendingLifecycleAction,
    isLifecycleLoading,
    confirmLifecycleAction,
    tempPassword,
    clearTempPassword,
  };
}
