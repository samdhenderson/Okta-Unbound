import React from 'react';
import { AlertMessage, Button, CopyButton, Eyebrow, Modal } from '../shared';
import type { OktaUser } from '../../../shared/types';
import type {
  LifecycleAction,
  PasswordChangeMode,
  PasswordConfirmInput,
} from '../../hooks/useUserLifecycleActions';
import PasswordChangeFields from './PasswordChangeFields';
import { CONFIRM_LABEL, canRunPasswordChange } from './passwordModes';

export interface UserLifecycleActionsProps {
  user: OktaUser;
  isLifecycleLoading: boolean;
  pendingLifecycleAction: LifecycleAction | null;
  onRequestAction: (action: LifecycleAction) => void;
  onCancel: () => void;
  onConfirm: (input?: PasswordConfirmInput) => void;
  tempPassword?: string | null;
  onDismissTempPassword?: () => void;
}

const RESET_PASSWORD_STATUSES: ReadonlySet<OktaUser['status']> = new Set([
  'ACTIVE',
  'RECOVERY',
  'LOCKED_OUT',
  'PASSWORD_EXPIRED',
]);

const MODAL_TITLE: Record<LifecycleAction, string> = {
  suspend: 'Suspend User',
  unsuspend: 'Unsuspend User',
  resetPassword: 'Reset Password',
};

const UserLifecycleActions: React.FC<UserLifecycleActionsProps> = ({
  user,
  isLifecycleLoading,
  pendingLifecycleAction,
  onRequestAction,
  onCancel,
  onConfirm,
  tempPassword = null,
  onDismissTempPassword,
}) => {
  const canResetPassword = RESET_PASSWORD_STATUSES.has(user.status);
  const isSuspended = user.status === 'SUSPENDED';
  const hasDestructive = user.status === 'ACTIVE' || isSuspended;

  const [passwordMode, setPasswordMode] = React.useState<PasswordChangeMode>('email-reset');
  const [password, setPassword] = React.useState('');

  const forgetPassword = React.useCallback(() => {
    setPassword('');
    setPasswordMode('email-reset');
  }, []);

  const handleCancel = () => {
    forgetPassword();
    onCancel();
  };

  const handleConfirm = () => {
    if (pendingLifecycleAction === 'resetPassword') {
      onConfirm({ mode: passwordMode, password });
    } else {
      onConfirm();
    }
    forgetPassword();
  };

  const isPassword = pendingLifecycleAction === 'resetPassword';
  const confirmLabel = isPassword
    ? CONFIRM_LABEL[passwordMode]
    : pendingLifecycleAction === 'suspend'
      ? 'Suspend'
      : 'Unsuspend';
  const confirmDisabled = isPassword && !canRunPasswordChange(passwordMode, password);

  return (
    <>
      {user.status !== 'DEPROVISIONED' ? (
        <div className="space-y-(--sp-field)">
          <div className="flex items-center justify-between gap-2">
            <Eyebrow>Account state</Eyebrow>
            <span className="text-xs text-neutral-600">Each asks to confirm</span>
          </div>

          {canResetPassword && (
            <div className="flex flex-wrap gap-(--sp-field)">
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
            <div className="flex flex-wrap items-center justify-between gap-(--sp-field)">
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
        onClose={handleCancel}
        title={pendingLifecycleAction ? MODAL_TITLE[pendingLifecycleAction] : ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant={pendingLifecycleAction === 'suspend' ? 'danger' : 'primary'}
              size="sm"
              disabled={confirmDisabled}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </>
        }
      >
        {isPassword ? (
          <PasswordChangeFields
            email={user.profile.email}
            mode={passwordMode}
            onModeChange={setPasswordMode}
            password={password}
            onPasswordChange={setPassword}
            disabled={isLifecycleLoading}
          />
        ) : (
          <p className="text-sm text-neutral-700">
            {pendingLifecycleAction === 'suspend' ? (
              <>
                Are you sure you want to suspend{' '}
                <strong className="text-neutral-900">
                  {user.profile.firstName} {user.profile.lastName}
                </strong>
                ? They will be unable to sign in until unsuspended.
              </>
            ) : (
              <>
                Unsuspend{' '}
                <strong className="text-neutral-900">
                  {user.profile.firstName} {user.profile.lastName}
                </strong>
                ? They will regain the ability to sign in.
              </>
            )}
          </p>
        )}
      </Modal>

      <Modal
        isOpen={tempPassword !== null}
        onClose={() => onDismissTempPassword?.()}
        title="Temporary password"
        size="sm"
        footer={
          <Button variant="primary" size="sm" onClick={() => onDismissTempPassword?.()}>
            Done
          </Button>
        }
      >
        <div className="space-y-(--sp-field)">
          <AlertMessage
            message={{
              text: 'Okta showed this once. Closing this dialog is the last you will see of it.',
              type: 'warning',
            }}
          />
          <div className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
            <code className="font-mono text-sm break-all text-neutral-900">{tempPassword}</code>
            <CopyButton getText={() => tempPassword ?? ''} label="Copy" />
          </div>
          <p className="text-sm text-neutral-700">
            <strong className="text-neutral-900">
              {user.profile.firstName} {user.profile.lastName}
            </strong>{' '}
            must replace it at their next sign-in.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default UserLifecycleActions;
