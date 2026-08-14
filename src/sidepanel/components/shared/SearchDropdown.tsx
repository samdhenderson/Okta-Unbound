import React, { useRef } from 'react';
import Input from './Input';
import IconButton from './IconButton';
import LoadingSpinner from './LoadingSpinner';
import Icon from '../overview/shared/Icon';

interface SearchDropdownProps<T> {
  placeholder?: string;
  query: string;
  onQueryChange: (q: string) => void;
  isSearching: boolean;
  results: T[];
  showDropdown: boolean;
  onSelect: (item: T) => void;
  renderResult: (item: T) => React.ReactNode;
  selectedItem?: T | null;
  renderSelected?: (item: T) => React.ReactNode;
  onClear?: () => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

function SearchDropdown<T>({
  placeholder = 'Search...',
  query,
  onQueryChange,
  isSearching,
  results,
  showDropdown,
  onSelect,
  renderResult,
  selectedItem,
  renderSelected,
  onClear,
  disabled = false,
  label,
  hint,
}: SearchDropdownProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (selectedItem && renderSelected) {
    return (
      <div className="space-y-1">
        {label && <label className="block text-sm font-medium text-neutral-700">{label}</label>}
        <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-md">
          <div className="flex-1 min-w-0">{renderSelected(selectedItem)}</div>
          {onClear && (
            <IconButton
              label="Clear selection"
              onClick={onClear}
              variant="ghost"
              size="sm"
              className="ml-2 rounded-full hover:bg-neutral-200"
            >
              <Icon type="close" size="md" />
            </IconButton>
          )}
        </div>
        {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-neutral-700">{label}</label>}
      <div className="relative">
        <Input
          inputRef={inputRef}
          type="text"
          value={query}
          onChange={onQueryChange}
          placeholder={placeholder}
          disabled={disabled}
          size="md"
          icon={<Icon type="search" size="md" className="text-neutral-400" />}
          trailing={
            <>
              {isSearching && <LoadingSpinner size="sm" />}
              {!isSearching && query && onClear && (
                <IconButton label="Clear search" onClick={onClear} variant="ghost" size="sm">
                  <Icon type="close" size="md" />
                </IconButton>
              )}
            </>
          }
          trailingInteractive={!isSearching && !!query && !!onClear}
        />

        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {results.map((item, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors"
                onClick={() => onSelect(item)}
              >
                {renderResult(item)}
              </button>
            ))}
          </div>
        )}
      </div>
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

export default SearchDropdown;
