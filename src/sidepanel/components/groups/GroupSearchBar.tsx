import React from 'react';
import { Input, LoadingSpinner } from '../shared';
import Icon from '../overview/shared/Icon';

interface GroupSearchBarProps {
  searchMode: 'live' | 'cached';
  liveSearchQuery: string;
  onLiveSearchQueryChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  isLiveSearching: boolean;
}

const GroupSearchBar: React.FC<GroupSearchBarProps> = ({
  searchMode,
  liveSearchQuery,
  onLiveSearchQueryChange,
  searchQuery,
  onSearchQueryChange,
  isLiveSearching,
}) => (
  <div className="relative flex-1">
    {searchMode === 'live' ? (
      <Input
        type="text"
        placeholder="Search groups by name..."
        value={liveSearchQuery}
        onChange={onLiveSearchQueryChange}
        size="lg"
        icon={<Icon type="search" size="md" />}
      />
    ) : (
      <Input
        type="text"
        placeholder="Search by name, description, ID — or /regex/"
        value={searchQuery}
        onChange={onSearchQueryChange}
        size="lg"
        icon={<Icon type="search" size="md" />}
      />
    )}
    {isLiveSearching && (
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
        <LoadingSpinner size="md" />
      </div>
    )}
  </div>
);

export default GroupSearchBar;
