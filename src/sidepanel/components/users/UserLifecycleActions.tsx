import React from 'react';
import { Button, Eyebrow, Modal } from '../shared';
import type { OktaUser } from '../../../shared/types';
import type { LifecycleAction } from '../../hooks/useUserLifecycleActions';

export interface UserLifecycleActionsProps {
  user: OktaUser;
  isLifecycleLoading: boolean;
  pendingLifecycleAction: LifecycleAction | null;
  onRequestAction: (action: LifecycleAction) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const RESET_PASSWORD_STATUSES: ReadonlySet<OktaUser['status']> = new Set([
  'ACTIVE',
  'RECOVERY',
  'LOCKED_OUT',
  'PASSWORD_EXPIRED',
]);

const UserLifecycleActions: React.FC<UserLifecycleActionsProps> = ({
  user,
  isLifecycleLoading,
  pendingLifecycleAction,
  onRequestAction,
  onCancel,
  onConfirm,
}) => {
  const canResetPassword = RESET_PASSWORD_STATUSES.has(user.status);
  const isSuspended = user.status === 'SUSPENDED';
  const hasDestructive = user.status === 'ACTIVE' || isSuspended;

  return (
    <>
      {user.status !== 'DEPROVISIONED' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Eyebrow>Account state</Eyebrow>
            <span className="text-xs text-neutral-600">Each asks to confirm</span>
          </div>

          {canResetPassword && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon="refresh"
                disabled={isLifecycleLoading}
                onClick={() => onRequestAction('resetPassword')}
              >
                Reset password
              </Button>
            </div>
          )}

          {canResetPassword && hasDestructive && <div className="h-px bg-neutral-200" />}

          {hasDestructive && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-danger-text">
                {isSuspended ? 'Restores sign-in immediately' : 'Blocks sign-in until reversed'}
              </span>
              {isSuspended ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon="refresh"
                  disabled={isLifecycleLoading}
                  onClick={() => onRequestAction('unsuspend')}
                >
                  Unsuspend user
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  icon="pause"
                  disabled={isLifecycleLoading}
                  onClick={() => onRequestAction('suspend')}
                >
                  Suspend user
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-neutral-500">
          No lifecycle actions are available for deprovisioned users.
        </p>
      )}

      <Modal
        isOpen={pendingLifecycleAction !== null}
        onClose={onCancel}
        title={
          pendingLifecycleAction === 'suspend'
            ? 'Suspend User'
            : pendingLifecycleAction === 'unsuspend'
              ? 'Unsuspend User'
              : 'Reset Password'
        }
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant={pendingLifecycleAction === 'suspend' ? 'danger' : 'primary'}
              size="sm"
              onClick={onConfirm}
            >
              {pendingLifecycleAction === 'suspend'
                ? 'Suspend'
                : pendingLifecycleAction === 'unsuspend'
                  ? 'Unsuspend'
                  : 'Send Reset Email'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-700">
          {pendingLifecycleAction === 'suspend' && (
            <>
              Are you sure you want to suspend{' '}
              <strong className="text-neutral-900">
                {user.profile.firstName} {user.profile.lastName}
              </strong>
              ? They will be unable to sign in until unsuspended.
            </>
          )}
          {pendingLifecycleAction === 'unsuspend' && (
            <>
              Unsuspend{' '}
              <strong className="text-neutral-900">
                {user.profile.firstName} {user.profile.lastName}
              </strong>
              ? They will regain the ability to sign in.
            </>
          )}
          {pendingLifecycleAction === 'resetPassword' && (
            <>
              Send a password reset email to{' '}
              <strong className="text-neutral-900">{user.profile.email}</strong>?
            </>
          )}
        </p>
      </Modal>
    </>
  );
};

export default UserLifecycleActions;
