import React from 'react';
import { EmptyState } from '../shared';
import DetectedUserBanner from './DetectedUserBanner';
import UserSearchBar from './UserSearchBar';
import UserSearchResults from './UserSearchResults';
import type { OktaUser, UserInfo } from '../../../shared/types';

export interface UserSearchPanelProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onClearSearch: () => void;
  isSearching: boolean;
  searchResults: OktaUser[];
  onSelectUser: (user: OktaUser) => void;
  detectedUser: UserInfo | null;
  isDetectedUserLoading: boolean;
  onLoadDetectedUser: () => void;
  onDismissDetectedUser: () => void;
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
  onSelectUser,
  detectedUser,
  isDetectedUserLoading,
  onLoadDetectedUser,
  onDismissDetectedUser,
  hasSelectedUser,
  hasError,
  alerts,
}) => {
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

        {detectedUser && (
          <DetectedUserBanner
            userInfo={detectedUser}
            isLoading={isDetectedUserLoading}
            onLoad={onLoadDetectedUser}
            onDismiss={onDismissDetectedUser}
          />
        )}
      </div>

      {alerts}

      {!hasSelectedUser && (
        <UserSearchResults results={searchResults} onSelectUser={onSelectUser} />
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
