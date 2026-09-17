import React from 'react';
import { EmptyState } from '../shared';
import UserSearchBar from './UserSearchBar';
import UserSearchResults from './UserSearchResults';
import { useRungSelection } from '../../selection/useRungSelection';
import { userDisplayName } from '../../../shared/utils/userDisplay';
import type { OktaUser } from '../../../shared/types';

export interface UserSearchPanelProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onClearSearch: () => void;
  isSearching: boolean;
  searchResults: OktaUser[];
  resultsTruncated: boolean;
  onSelectUser: (user: OktaUser) => void;
  hasSelectedUser: boolean;
  hasError: boolean;
  alerts?: React.ReactNode;
}

const UserSearchPanel: React.FC<UserSearchPanelProps> = ({
  searchQuery,
  onSearchQueryChange,
  onClearSearch,
  isSearching,
  searchResults,
  resultsTruncated,
  onSelectUser,
  hasSelectedUser,
  hasError,
  alerts,
}) => {
  const selection = useRungSelection('user', searchResults, userDisplayName);
  const selectedCount = selection.selectedIds.size;

  return (
    <>
      <div className="space-y-(--sp-rung)">
        <UserSearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchQueryChange}
          onClear={onClearSearch}
          isSearching={isSearching}
          showClearButton={Boolean(searchQuery || hasSelectedUser)}
        />
      </div>

      {alerts}

      {!hasSelectedUser && (
        <div className="space-y-(--sp-field)">
          {selectedCount > 0 && (
            <p className="text-xs text-neutral-600">
              <span className="font-semibold tabular-nums text-primary-text">
                {selectedCount.toLocaleString()} {selectedCount === 1 ? 'user' : 'users'} selected
              </span>
              {' — they stay selected while you search again.'}
            </p>
          )}
          <UserSearchResults
            results={searchResults}
            truncated={resultsTruncated}
            onSelectUser={onSelectUser}
            selectedIds={selection.selectedIds}
            onToggleSelect={selection.toggleSelect}
          />
        </div>
      )}

      {!isSearching &&
        searchResults.length === 0 &&
        !hasError &&
        !hasSelectedUser &&
        !searchQuery && (
          <EmptyState
            icon="user"
            title="User Membership Tracing"
            description="Search for users to analyze their group memberships and understand why they're in specific groups"
          />
        )}
    </>
  );
};

export default UserSearchPanel;
