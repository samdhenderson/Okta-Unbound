import React from 'react';
import Icon from '../../shared/Icon';
import Input from '../../shared/Input';
import LoadingSpinner from '../../shared/LoadingSpinner';
import UserSearchResults from '../UserSearchResults';
import type { OktaUser } from '../../../../shared/types';

interface ComparisonSearchPhaseProps {
  contextUser: OktaUser;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isSearching: boolean;
  searchResults: OktaUser[];
  onSelectUser: (u: OktaUser) => void;
}

const ComparisonSearchPhase: React.FC<ComparisonSearchPhaseProps> = ({
  contextUser,
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
  onSelectUser,
}) => {
  const filtered = searchResults.filter((u) => u.id !== contextUser.id);

  return (
    <div className="space-y-(--sp-rung)">
      <Input
        size="lg"
        type="text"
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search users..."
        icon={<Icon type="search" size="sm" />}
      />

      {isSearching && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-neutral-500">
          <LoadingSpinner size="sm" />
          Searching directory…
        </div>
      )}

      <UserSearchResults results={filtered} onSelectUser={onSelectUser} />
    </div>
  );
};

export default ComparisonSearchPhase;
