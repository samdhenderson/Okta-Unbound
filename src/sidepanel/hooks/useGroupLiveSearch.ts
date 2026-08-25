import { useState, useEffect, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { GroupSummary } from '../../shared/types';
import { liveSearchToGroupSummary } from '../components/groups/groupSummary';
import { useDebouncedValue } from './useDebouncedValue';
import { useOktaApi } from './useOktaApi';

interface UseGroupLiveSearchOptions {
  targetTabId: number | null;
  searchMode: 'live' | 'cached';
  setError: Dispatch<SetStateAction<string | null>>;
  enabled?: boolean;
}

export function useGroupLiveSearch({
  targetTabId,
  searchMode,
  setError,
  enabled = true,
}: UseGroupLiveSearchOptions) {
  const [liveSearchQuery, setLiveSearchQuery] = useState('');
  const [liveSearchResults, setLiveSearchResults] = useState<GroupSummary[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const debouncedQuery = useDebouncedValue(liveSearchQuery, 300);

  const { makeApiRequest } = useOktaApi({ targetTabId });

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
        const q = encodeURIComponent(query.trim());
        const response = await makeApiRequest(`/api/v1/groups?q=${q}&limit=20&expand=stats`, {
          method: 'GET',
          priority: 'interactive',
          reason: 'Live group search',
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
    [targetTabId, setError, makeApiRequest],
  );

  useEffect(() => {
    if (enabled && searchMode === 'live') {
      handleLiveSearch(debouncedQuery);
    }
  }, [debouncedQuery, searchMode, handleLiveSearch, enabled]);

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
