import { useState, useCallback } from 'react';
import type { OktaUser } from '../../shared/types';
import { useOktaApi } from './useOktaApi';

export type LifecycleAction = 'suspend' | 'unsuspend' | 'resetPassword';

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
  confirmLifecycleAction: () => Promise<void>;
}

const SUCCESS_MESSAGES: Record<LifecycleAction, string> = {
  suspend: 'User suspended successfully. They can no longer sign in.',
  unsuspend: 'User unsuspended successfully. They can now sign in.',
  resetPassword: 'Password reset email sent successfully.',
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

  const { suspendUser, unsuspendUser, resetPassword, getUserById } = useOktaApi({
    targetTabId: targetTabId ?? null,
  });

  const confirmLifecycleAction = useCallback(async () => {
    if (!selectedUser || !pendingLifecycleAction) return;

    const action = pendingLifecycleAction;
    setIsLifecycleLoading(true);
    setPendingLifecycleAction(null);

    try {
      let result: { success: boolean; error?: string };

      if (action === 'suspend') {
        result = await suspendUser(selectedUser.id);
      } else if (action === 'unsuspend') {
        result = await unsuspendUser(selectedUser.id);
      } else {
        result = await resetPassword(selectedUser.id);
      }

      if (result.success) {
        onResult({ text: SUCCESS_MESSAGES[action], type: 'success' });

        if (action !== 'resetPassword') {
          const refreshed = await getUserById(selectedUser.id);
          if (refreshed) {
            onUserStatusRefresh(refreshed.status as OktaUser['status']);
          }
        }
      } else {
        onResult({
          text: result.error || 'The operation failed. Please try again.',
          type: 'danger',
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      onResult({ text: message, type: 'danger' });
    } finally {
      setIsLifecycleLoading(false);
    }
  }, [
    selectedUser,
    pendingLifecycleAction,
    suspendUser,
    unsuspendUser,
    resetPassword,
    getUserById,
    onResult,
    onUserStatusRefresh,
  ]);

  return {
    pendingLifecycleAction,
    setPendingLifecycleAction,
    isLifecycleLoading,
    confirmLifecycleAction,
  };
}
