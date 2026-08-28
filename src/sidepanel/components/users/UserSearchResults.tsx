import React from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import type { OktaUser } from '../../../shared/types';
import { Badge, Eyebrow, ListRow, userStatusVariant } from '../shared';

interface UserSearchResultsProps {
  results: OktaUser[];
  onSelectUser: (user: OktaUser) => void;
}

const UserSearchResults: React.FC<UserSearchResultsProps> = ({ results, onSelectUser }) => {
  const setStaggerRef = useStaggerReveal();

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 animate-rise-in">
      <Eyebrow as="div">
        {results.length} {results.length === 1 ? 'match' : 'matches'}
      </Eyebrow>
      <div ref={setStaggerRef} className="space-y-(--sp-rung) rise-in-stagger">
        {results.map((user) => (
          <ListRow
            key={user.id}
            as="button"
            density="compact"
            onClick={() => onSelectUser(user)}
            className="group"
          >
            <div className="flex items-center justify-between gap-(--sp-inline)">
              <div className="flex-1 min-w-0 text-left">
                <h4 className="truncate text-sm font-semibold text-neutral-900 group-hover:text-primary-text transition-colors duration-(--dur-instant)">
                  {user.profile.firstName} {user.profile.lastName}
                </h4>
                <div className="truncate text-xs text-neutral-600">{user.profile.email}</div>
              </div>
              <Badge variant={userStatusVariant(user.status)} className="shrink-0">
                {user.status}
              </Badge>
            </div>
          </ListRow>
        ))}
      </div>
    </div>
  );
};

export default UserSearchResults;
