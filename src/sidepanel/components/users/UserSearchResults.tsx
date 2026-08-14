import React from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import type { OktaUser } from '../../../shared/types';
import { ListRow, userStatusVariant, type UserStatusVariant } from '../shared';

interface UserSearchResultsProps {
  results: OktaUser[];
  onSelectUser: (user: OktaUser) => void;
}

const VARIANT_CLASSES: Record<UserStatusVariant, string> = {
  success: 'bg-success-light text-success-text',
  info: 'bg-primary-light text-primary-text',
  warning: 'bg-warning-light text-warning-text',
  danger: 'bg-danger-light text-danger-text',
  neutral: 'bg-neutral-100 text-neutral-700',
};

const getStatusBadgeClass = (status: string) =>
  `px-2 py-0.5 rounded-md text-xs font-medium ${VARIANT_CLASSES[userStatusVariant(status)]}`;

const UserSearchResults: React.FC<UserSearchResultsProps> = ({ results, onSelectUser }) => {
  const setStaggerRef = useStaggerReveal();

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 animate-rise-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Search Results</h3>
        <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-md">
          {results.length} {results.length === 1 ? 'user' : 'users'}
        </span>
      </div>
      <div ref={setStaggerRef} className="space-y-3 rise-in-stagger">
        {results.map((user) => (
          <ListRow
            key={user.id}
            as="button"
            density="comfortable"
            onClick={() => onSelectUser(user)}
            className="group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="mb-1 text-sm font-semibold text-neutral-900 group-hover:text-primary-text transition-colors duration-(--dur-instant)">
                  {user.profile.firstName} {user.profile.lastName}
                </h4>
                <div className="mb-1 text-xs text-neutral-600">{user.profile.email}</div>
                <div className="font-mono text-xs text-neutral-500">
                  Login: {user.profile.login}
                </div>
              </div>
              <span className={getStatusBadgeClass(user.status)}>{user.status}</span>
            </div>
          </ListRow>
        ))}
      </div>
    </div>
  );
};

export default UserSearchResults;
