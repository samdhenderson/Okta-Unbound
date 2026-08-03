import React from 'react';
import type { OktaUser } from '../../../shared/types';
import { IconButton, OpenInOktaLink, userStatusVariant, type UserStatusVariant } from '../shared';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import Icon from '../overview/shared/Icon';

interface UserIdentityProps {
  user: OktaUser;
  oktaOrigin?: string | null;
  showOktaLink?: boolean;
  showId?: boolean;
}

const VARIANT_CLASSES: Record<UserStatusVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-300',
};

const getStatusBadgeClass = (status: string): string => {
  const base = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold';
  return `${base} ${VARIANT_CLASSES[userStatusVariant(status)]}`;
};

const UserIdentity: React.FC<UserIdentityProps> = ({
  user,
  oktaOrigin,
  showOktaLink = true,
  showId = true,
}) => {
  const { copied: idCopied, copy: copyId } = useCopyToClipboard();

  const handleCopyId = () => {
    copyId(user.id);
  };

  const initials =
    `${user.profile.firstName?.[0] ?? '?'}${user.profile.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="bg-white rounded-md border border-neutral-200 p-4">
      <div className="flex items-start gap-3.5">
        <div className="shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-base font-bold shadow-sm ring-4 ring-primary-highlight">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-neutral-900 truncate">
              {user.profile.firstName} {user.profile.lastName}
            </h2>
            <span className={getStatusBadgeClass(user.status)}>{user.status}</span>
          </div>

          {(user.profile.title || user.profile.department) && (
            <div className="text-xs text-neutral-600 mt-0.5 flex items-center gap-1.5 truncate">
              {user.profile.title && <span>{user.profile.title}</span>}
              {user.profile.title && user.profile.department && (
                <span className="text-neutral-400">·</span>
              )}
              {user.profile.department && <span>{user.profile.department}</span>}
            </div>
          )}

          <div className="text-xs text-neutral-700 mt-0.5 truncate">{user.profile.email}</div>

          {showId && (
            <div className="flex items-center gap-1 mt-1">
              <code className="text-[11px] font-mono text-neutral-500 truncate">{user.id}</code>
              <IconButton
                label={idCopied ? 'Copied!' : 'Copy user id'}
                onClick={handleCopyId}
                variant="ghost"
                size="sm"
                className="shrink-0"
              >
                <Icon
                  type={idCopied ? 'clipboard-check' : 'clipboard'}
                  size="sm"
                  className={`w-3.5 h-3.5 ${idCopied ? 'text-success-text' : ''}`}
                />
              </IconButton>
            </div>
          )}

          {user.profile.genderPronouns && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-[11px] font-medium rounded-md border border-purple-200 mt-1.5">
              {user.profile.genderPronouns}
            </div>
          )}
        </div>

        {showOktaLink && (
          <div className="shrink-0">
            <OpenInOktaLink oktaOrigin={oktaOrigin} entityType="user" entityId={user.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserIdentity;
