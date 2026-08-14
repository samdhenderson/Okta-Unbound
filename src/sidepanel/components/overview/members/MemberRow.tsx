import React from 'react';
import type { OktaUser, MemberMfaResult } from '../../../../shared/types';
import { ListRow, userStatusVariant, type UserStatusVariant } from '../../shared';
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

  const adminUrl = oktaAdminEntityUrl(oktaOrigin, 'user', user.id);

  return (
    <ListRow
      as={adminUrl ? 'a' : 'div'}
      href={adminUrl ?? undefined}
      target={adminUrl ? '_blank' : undefined}
      density="compact"
      title={adminUrl ? 'Open user in Okta Admin Console' : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-semibold text-neutral-900">{fullName}</div>
          <div className="truncate text-xs text-neutral-600">{user.profile.email}</div>
          <div className="truncate font-mono text-xs text-neutral-500">{user.profile.login}</div>
          {mfaScanned && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {mfa && mfa.factorLabels.length > 0 ? (
                mfa.factorLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-md bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-text"
                  >
                    {label}
                  </span>
                ))
              ) : (
                <span className="rounded-md bg-danger-light px-2 py-0.5 text-xs font-medium text-danger-text">
                  No MFA
                </span>
              )}
            </div>
          )}
        </div>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
          {user.status}
        </span>
      </div>
    </ListRow>
  );
};

export default React.memo(MemberRow);
