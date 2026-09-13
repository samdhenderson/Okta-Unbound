import React from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import type { OktaUser } from '../../../shared/types';
import { userDisplayName } from '../../../shared/utils/userDisplay';
import {
  Badge,
  Checkbox,
  Eyebrow,
  ListRow,
  REVEAL_ON_HOVER,
  StretchedButton,
  userStatusVariant,
} from '../shared';

interface UserSearchResultsProps {
  results: OktaUser[];
  onSelectUser: (user: OktaUser) => void;
  selectedIds?: ReadonlySet<string>;
  onToggleSelect?: (userId: string) => void;
  actionLabel?: string;
}

const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  results,
  onSelectUser,
  selectedIds,
  onToggleSelect,
  actionLabel = 'View user details',
}) => {
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
        {results.map((user) => {
          const name = userDisplayName(user);
          const selected = selectedIds?.has(user.id) ?? false;
          const nameId = `user-result-name-${user.id}`;

          return (
            <ListRow
              key={user.id}
              density="compact"
              state={selected ? 'selected' : 'default'}
              className="group/row relative"
            >
              <StretchedButton
                label={actionLabel}
                describedBy={nameId}
                onClick={() => onSelectUser(user)}
              />

              <div className="flex items-center gap-(--sp-inline)">
                {onToggleSelect && (
                  <div
                    className={`relative z-10 flex items-center ${selected ? '' : REVEAL_ON_HOVER}`}
                  >
                    <Checkbox
                      checked={selected}
                      onChange={() => onToggleSelect(user.id)}
                      aria-label={`Select ${name}`}
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0 text-left">
                  <h4
                    id={nameId}
                    className="truncate text-sm font-semibold text-neutral-900 group-hover/row:text-primary-text transition-colors duration-(--dur-instant)"
                  >
                    {name}
                  </h4>
                  <div className="truncate text-xs text-neutral-600">{user.profile.email}</div>
                </div>

                <Badge variant={userStatusVariant(user.status)} className="shrink-0">
                  {user.status}
                </Badge>
              </div>
            </ListRow>
          );
        })}
      </div>
    </div>
  );
};

export default UserSearchResults;
