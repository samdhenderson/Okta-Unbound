import React from 'react';
import { ActionBar, type ActionDescriptor } from '../shared';
import UserLifecycleActions from './UserLifecycleActions';
import { userDisplayName } from '../../../shared/utils/userDisplay';
import type { OktaUser } from '../../../shared/types';
import type { LifecycleAction, PasswordConfirmInput } from '../../hooks/useUserLifecycleActions';

export interface UserActionBarProps {
  user: OktaUser;
  onCompare: () => void;
  onAddToGroup: () => void;
  isLoadingMemberships: boolean;
  tierOpen: boolean;
  onTierOpenChange: (open: boolean) => void;
  isLifecycleLoading: boolean;
  pendingLifecycleAction: LifecycleAction | null;
  onRequestLifecycleAction: (action: LifecycleAction) => void;
  onCancelLifecycleAction: () => void;
  onConfirmLifecycleAction: (input?: PasswordConfirmInput) => void;
  tempPassword?: string | null;
  onDismissTempPassword?: () => void;
  sticky?: boolean;
}

const UserActionBar: React.FC<UserActionBarProps> = ({
  user,
  onCompare,
  onAddToGroup,
  isLoadingMemberships,
  tierOpen,
  onTierOpenChange,
  isLifecycleLoading,
  pendingLifecycleAction,
  onRequestLifecycleAction,
  onCancelLifecycleAction,
  onConfirmLifecycleAction,
  tempPassword = null,
  onDismissTempPassword,
  sticky = true,
}) => {
  const actions: ActionDescriptor[] = [
    {
      id: 'add-to-group',
      label: 'Add group',
      icon: 'plus',
      variant: 'primary',
      onClick: onAddToGroup,
      disabled: isLoadingMemberships,
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: 'users',
      onClick: onCompare,
      disabled: isLoadingMemberships,
      title: 'Compare group & app access with another user',
    },
  ];

  return (
    <ActionBar
      ariaLabel={`Actions for ${userDisplayName(user)}`}
      sticky={sticky}
      actions={actions}
      tierOpen={tierOpen}
      onTierOpenChange={onTierOpenChange}
      expansion={
        <UserLifecycleActions
          user={user}
          isLifecycleLoading={isLifecycleLoading}
          pendingLifecycleAction={pendingLifecycleAction}
          onRequestAction={onRequestLifecycleAction}
          onCancel={onCancelLifecycleAction}
          onConfirm={onConfirmLifecycleAction}
          tempPassword={tempPassword}
          onDismissTempPassword={onDismissTempPassword}
        />
      }
    />
  );
};

export default UserActionBar;
