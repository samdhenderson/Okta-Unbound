import { useState, useRef, useEffect, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GroupSummary } from '../../shared/types';
import { liveSearchToGroupSummary } from '../components/groups/groupSummary';

interface UseGroupLiveSearchOptions {
  targetTabId: number | null;
  searchMode: 'live' | 'cached';
  setError: Dispatch<SetStateAction<string | null>>;
}

export function useGroupLiveSearch({
  targetTabId,
  searchMode,
  setError,
}: UseGroupLiveSearchOptions) {
  const [liveSearchQuery, setLiveSearchQuery] = useState('');
  const [liveSearchResults, setLiveSearchResults] = useState<GroupSummary[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLiveSearch = useCallback(
    async (query: string) => {
      if (!targetTabId) {
        setError('No Okta tab connected');
        return;
      }

      if (!query.trim()) {
        setLiveSearchResults([]);
        return;
      }

      setIsLiveSearching(true);
      setError(null);

      try {
        const response = await chrome.tabs.sendMessage(targetTabId, {
          action: 'searchGroups',
          query: query.trim(),
        });

        if (response.success) {
          const results = (response.data || []).map(liveSearchToGroupSummary);
          setLiveSearchResults(results);
        } else {
          setError(response.error || 'Failed to search groups');
          setLiveSearchResults([]);
        }
      } catch (err) {
        setError((err as Error).message || 'Failed to communicate with Okta tab');
        setLiveSearchResults([]);
      } finally {
        setIsLiveSearching(false);
      }
    },
    [targetTabId, setError],
  );

  useEffect(() => {
    if (searchMode === 'live') {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        handleLiveSearch(liveSearchQuery);
      }, 300);
      return () => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      };
    }
  }, [liveSearchQuery, searchMode, handleLiveSearch]);

  const resetLiveSearch = useCallback(() => {
    setLiveSearchQuery('');
    setLiveSearchResults([]);
  }, []);

  return {
    liveSearchQuery,
    setLiveSearchQuery,
    liveSearchResults,
    isLiveSearching,
    resetLiveSearch,
  };
}
