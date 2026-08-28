import React, { useRef } from 'react';
import { IconButton, Input, LoadingSpinner } from '../shared';
import Icon from '../shared/Icon';

interface UserSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
  isSearching: boolean;
  showClearButton: boolean;
  placeholder?: string;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onClear,
  isSearching,
  showClearButton,
  placeholder = 'Search by email, name, or login...',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Input
        inputRef={inputRef}
        type="text"
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={placeholder}
        size="lg"
        icon={<Icon type="search" size="md" />}
        trailing={
          <div className="flex items-center gap-1">
            {isSearching && <LoadingSpinner size="sm" />}
            {showClearButton && (
              <IconButton label="Clear search" onClick={handleClear} variant="ghost" size="sm">
                <Icon type="close" size="md" />
              </IconButton>
            )}
          </div>
        }
        trailingInteractive={showClearButton}
      />
    </div>
  );
};

export default UserSearchBar;
