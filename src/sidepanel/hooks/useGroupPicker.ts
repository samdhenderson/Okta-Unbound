import { useCallback, useEffect, useState } from 'react';
import { createLogger } from '../../shared/utils/logger';
import { useDebouncedValue } from './useDebouncedValue';
import { useOktaApi } from './useOktaApi';
import type { GroupSearchResult } from './useAddToGroup';

const log = createLogger('useGroupPicker');

export interface UseGroupPickerOptions {
  targetTabId: number | null;
  onPick: (group: GroupSearchResult) => void;
  enabled?: boolean;
}

export interface UseGroupPickerReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  query: string;
  setQuery: (query: string) => void;
  results: GroupSearchResult[];
  isSearching: boolean;
  searchError: string | null;
  pick: (group: GroupSearchResult) => void;
}

const MIN_QUERY_LENGTH = 2;

export function useGroupPicker({
  targetTabId,
  onPick,
  enabled = true,
}: UseGroupPickerOptions): UseGroupPickerReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 300);
  const { searchGroups } = useOktaApi({ targetTabId });

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) setResults([]);
  }, [query]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!enabled || !isOpen || trimmed.length < MIN_QUERY_LENGTH) return;
    let cancelled = false;
    void (async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const found = await searchGroups(trimmed);
        if (!cancelled) setResults(found);
      } catch (error) {
        log.warn('Group search failed', { error: error instanceof Error ? error.name : 'unknown' });
        if (!cancelled) {
          setResults([]);
          setSearchError('Group search failed.');
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, isOpen, debouncedQuery, searchGroups]);

  const reset = useCallback(() => {
    setQuery('');
    setResults([]);
    setSearchError(null);
  }, []);

  const open = useCallback(() => {
    reset();
    setIsOpen(true);
  }, [reset]);

  const close = useCallback(() => {
    setIsOpen(false);
    reset();
  }, [reset]);

  const pick = useCallback(
    (group: GroupSearchResult) => {
      log.debug('Group picked', { groupId: group.id });
      setIsOpen(false);
      reset();
      onPick(group);
    },
    [onPick, reset],
  );

  return { isOpen, open, close, query, setQuery, results, isSearching, searchError, pick };
}
