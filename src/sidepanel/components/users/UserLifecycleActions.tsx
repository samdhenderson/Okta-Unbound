import React from 'react';
import { Button, Modal } from '../shared';
import type { OktaUser } from '../../../shared/types';
import type { LifecycleAction } from '../../hooks/useUserLifecycleActions';

interface UserLifecycleActionsProps {
  user: OktaUser;
  isLifecycleLoading: boolean;
  pendingLifecycleAction: LifecycleAction | null;
  onRequestAction: (action: LifecycleAction) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const UserLifecycleActions: React.FC<UserLifecycleActionsProps> = ({
  user,
  isLifecycleLoading,
  pendingLifecycleAction,
  onRequestAction,
  onCancel,
  onConfirm,
}) => {
  return (
    <>
      {user.status !== 'DEPROVISIONED' ? (
        <div className="bg-white rounded-md border border-neutral-200 px-5 py-4">
          <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-3">
            Lifecycle Actions
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.status === 'ACTIVE' && (
              <Button
                variant="danger"
                size="sm"
                disabled={isLifecycleLoading}
                onClick={() => onRequestAction('suspend')}
              >
                Suspend User
              </Button>
            )}
            {user.status === 'SUSPENDED' && (
              <Button
                variant="primary"
                size="sm"
                disabled={isLifecycleLoading}
                onClick={() => onRequestAction('unsuspend')}
              >
                Unsuspend User
              </Button>
            )}
            {(user.status === 'ACTIVE' ||
              user.status === 'RECOVERY' ||
              user.status === 'LOCKED_OUT' ||
              user.status === 'PASSWORD_EXPIRED') && (
              <Button
                variant="secondary"
                size="sm"
                disabled={isLifecycleLoading}
                onClick={() => onRequestAction('resetPassword')}
              >
                Reset Password
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="px-5 py-3 bg-neutral-50 rounded-md border border-neutral-200">
          <p className="text-xs text-neutral-500">
            No lifecycle actions are available for deprovisioned users.
          </p>
        </div>
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
