import React, { useRef } from 'react';

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
            <button
              type="button"
              onClick={onClear}
              className="ml-2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-200"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-neutral-200 rounded-md text-sm placeholder-neutral-400 focus:outline-2 focus:outline-offset-2 focus:outline-primary focus:border-primary transition-all duration-100 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          disabled={disabled}
        />

        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="w-4 h-4 border-2 border-neutral-200 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!isSearching && query && onClear && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
            onClick={onClear}
            title="Clear search"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

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
