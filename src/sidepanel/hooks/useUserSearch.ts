import { useState, useCallback } from 'react';
import type { OktaUser } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';
import { useDebouncedUserSearch } from './useDebouncedUserSearch';

const log = createLogger('useUserSearch');

interface UseUserSearchOptions {
  targetTabId: number | undefined;
  debounceMs?: number;
  minQueryLength?: number;
}

interface UseUserSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: OktaUser[];
  isSearching: boolean;
  error: string | null;
  clearSearch: () => void;
}

export function useUserSearch({
  targetTabId,
  debounceMs = 600,
  minQueryLength = 2,
}: UseUserSearchOptions): UseUserSearchReturn {
  const [error, setError] = useState<string | null>(null);

  const { searchQuery, setSearchQuery, searchResults, setSearchResults, isSearching } =
    useDebouncedUserSearch({
      targetTabId,
      onError: setError,
      debounceMs,
      minQueryLength,
      log,
    });

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  }, [setSearchQuery, setSearchResults]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    error,
    clearSearch,
  };
}
