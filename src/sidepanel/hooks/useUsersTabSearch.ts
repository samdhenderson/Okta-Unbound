import { useState, useCallback, useRef, useEffect } from 'react';
import type { OktaUser } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';
import { useOktaApi } from './useOktaApi';
import { searchUsersRequest } from './searchUsersRequest';

const log = createLogger('useUsersTabSearch');

interface UseUsersTabSearchOptions {
  targetTabId: number | undefined;
  onError: (message: string | null) => void;
  onSearchStart: () => void;
  debounceMs?: number;
  minQueryLength?: number;
}

interface UseUsersTabSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: OktaUser[];
  setSearchResults: (users: OktaUser[]) => void;
  isSearching: boolean;
}

export function useUsersTabSearch({
  targetTabId,
  onError,
  onSearchStart,
  debounceMs = 600,
  minQueryLength = 2,
}: UseUsersTabSearchOptions): UseUsersTabSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OktaUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { makeApiRequest } = useOktaApi({ targetTabId: targetTabId ?? null });

  const handleSearch = useCallback(async () => {
    if (!targetTabId) {
      onError('No Okta tab connected');
      return;
    }

    if (!searchQuery.trim()) {
      onError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    onError(null);
    onSearchStart();

    try {
      log.debug('Searching for users', { queryLength: searchQuery.trim().length });

      const response = await searchUsersRequest(makeApiRequest, searchQuery.trim());

      if (response.success) {
        setSearchResults(response.data || []);
        log.debug('Found users:', response.data?.length);
      } else {
        onError(response.error || 'Failed to search users');
        setSearchResults([]);
      }
    } catch (err: unknown) {
      const error = err as Error;
      onError(error.message || 'Failed to communicate with Okta tab');
      setSearchResults([]);
      log.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [targetTabId, searchQuery, onError, onSearchStart, makeApiRequest]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      onError(null);
      return;
    }

    if (searchQuery.trim().length < minQueryLength) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      handleSearch();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, targetTabId, handleSearch, debounceMs, minQueryLength, onError]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
  };
}
