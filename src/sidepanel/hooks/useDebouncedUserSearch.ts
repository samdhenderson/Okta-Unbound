import { useState, useCallback, useRef, useEffect } from 'react';
import type { OktaUser } from '../../shared/types';
import type { Logger } from '../../shared/utils/logger';
import { useOktaApi } from './useOktaApi';
import { searchUsersRequest } from './searchUsersRequest';

export interface UseDebouncedUserSearchOptions {
  targetTabId: number | undefined;
  onError: (message: string | null) => void;
  onSearchStart?: () => void;
  debounceMs: number;
  minQueryLength: number;
  log: Logger;
  enabled?: boolean;
}

export interface UseDebouncedUserSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: OktaUser[];
  setSearchResults: (users: OktaUser[]) => void;
  isSearching: boolean;
  resultsTruncated: boolean;
}

export function useDebouncedUserSearch({
  targetTabId,
  onError,
  onSearchStart,
  debounceMs,
  minQueryLength,
  log,
  enabled = true,
}: UseDebouncedUserSearchOptions): UseDebouncedUserSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResultsState] = useState<OktaUser[]>([]);
  const [resultsTruncated, setResultsTruncated] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const setSearchResults = useCallback((users: OktaUser[]) => {
    setSearchResultsState(users);
    setResultsTruncated(false);
  }, []);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { makeApiRequest } = useOktaApi({ targetTabId: targetTabId ?? null });

  const performSearch = useCallback(
    async (query: string) => {
      if (!targetTabId) {
        onError('No Okta tab connected');
        return;
      }

      if (!query.trim()) {
        onError('Please enter a search query');
        return;
      }

      setIsSearching(true);
      onError(null);
      onSearchStart?.();

      try {
        log.debug('Searching for users', { queryLength: query.trim().length });

        const response = await searchUsersRequest(makeApiRequest, query.trim());

        if (response.success) {
          setSearchResultsState(response.data || []);
          setResultsTruncated(response.truncated);
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
    },
    [targetTabId, onError, onSearchStart, makeApiRequest, log, setSearchResults],
  );

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!enabled) return;

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      onError(null);
      return;
    }

    if (searchQuery.trim().length < minQueryLength) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, searchQuery, debounceMs, minQueryLength, performSearch, onError, setSearchResults]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    resultsTruncated,
  };
}
