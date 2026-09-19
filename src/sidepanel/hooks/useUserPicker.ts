import { useCallback, useState } from 'react';
import type { OktaUser } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';
import { useDebouncedUserSearch } from './useDebouncedUserSearch';

const log = createLogger('useUserPicker');

export interface UseUserPickerOptions {
  targetTabId: number | null;
  onPick: (user: OktaUser) => void;
  enabled?: boolean;
}

export interface UseUserPickerReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  query: string;
  setQuery: (query: string) => void;
  results: OktaUser[];
  isSearching: boolean;
  searchError: string | null;
  pick: (user: OktaUser) => void;
}

export function useUserPicker({
  targetTabId,
  onPick,
  enabled = true,
}: UseUserPickerOptions): UseUserPickerReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const {
    searchQuery: query,
    setSearchQuery: setQuery,
    searchResults: results,
    setSearchResults,
    isSearching,
  } = useDebouncedUserSearch({
    targetTabId: targetTabId ?? undefined,
    onError: setSearchError,
    debounceMs: 400,
    minQueryLength: 2,
    log,
    enabled: enabled && isOpen,
  });

  const reset = useCallback(() => {
    setQuery('');
    setSearchResults([]);
    setSearchError(null);
  }, [setQuery, setSearchResults]);

  const open = useCallback(() => {
    reset();
    setIsOpen(true);
  }, [reset]);

  const close = useCallback(() => {
    setIsOpen(false);
    reset();
  }, [reset]);

  const pick = useCallback(
    (user: OktaUser) => {
      log.debug('User picked', { userId: user.id });
      setIsOpen(false);
      reset();
      onPick(user);
    },
    [onPick, reset],
  );

  return { isOpen, open, close, query, setQuery, results, isSearching, searchError, pick };
}
