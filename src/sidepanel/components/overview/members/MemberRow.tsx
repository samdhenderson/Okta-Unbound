import React from 'react';
import type { OktaUser, MemberMfaResult } from '../../../../shared/types';
import { userStatusVariant, type UserStatusVariant } from '../../shared';
import { oktaAdminEntityUrl } from '../../../../shared/utils/oktaUrl';

interface MemberRowProps {
  user: OktaUser;
  mfa?: MemberMfaResult;
  mfaScanned?: boolean;
  oktaOrigin?: string | null;
}

const VARIANT_CLASSES: Record<UserStatusVariant, string> = {
  success: 'bg-success-light text-success-text',
  info: 'bg-primary-light text-primary-text',
  warning: 'bg-warning-light text-warning-text',
  danger: 'bg-danger-light text-danger-text',
  neutral: 'bg-neutral-100 text-neutral-700',
};

const MemberRow: React.FC<MemberRowProps> = ({ user, mfa, mfaScanned, oktaOrigin }) => {
  const badgeClass = VARIANT_CLASSES[userStatusVariant(user.status)];
  const fullName =
    `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || user.profile.login;

  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-neutral-900 truncate">{fullName}</div>
        <div className="text-xs text-neutral-600 truncate">{user.profile.email}</div>
        <div className="text-[11px] text-neutral-500 font-mono truncate">{user.profile.login}</div>
        {mfaScanned && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {mfa && mfa.factorLabels.length > 0 ? (
              mfa.factorLabels.map((label) => (
                <span
                  key={label}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-light text-primary-text"
                >
                  {label}
                </span>
              ))
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-danger-light text-danger-text">
                No MFA
              </span>
            )}
          </div>
        )}
      </div>
      <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold ${badgeClass}`}>
        {user.status}
      </span>
    </div>
  );

  const baseClass =
    'block bg-white rounded-md border border-neutral-200 p-3 transition-colors duration-100 hover:border-neutral-500';

  const adminUrl = oktaAdminEntityUrl(oktaOrigin, 'user', user.id);
  if (adminUrl) {
    return (
      <a
        href={adminUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
        title="Open user in Okta Admin Console"
      >
        {content}
      </a>
    );
  }

  return <div className={baseClass}>{content}</div>;
};

export default React.memo(MemberRow);
