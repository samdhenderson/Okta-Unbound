import { useCallback, useState } from 'react';
import { useGroupLiveSearch } from './useGroupLiveSearch';
import type { GroupSummary, OktaUser } from '../../shared/types';

export interface UseGroupComparisonOptions {
  group: GroupSummary;
  targetTabId: number | null;
  enabled?: boolean;
}

export interface UseGroupComparisonReturn {
  isPicking: boolean;
  openPicker: () => void;
  closePicker: () => void;

  query: string;
  setQuery: (value: string) => void;
  results: GroupSummary[];
  isSearching: boolean;
  searchError: string | null;

  selected: GroupSummary | null;
  select: (hit: GroupSummary) => void;
  clearSelected: () => void;
  confirm: () => void;

  comparedWith: GroupSummary | null;
  closeComparison: () => void;
  memberCache: Map<string, OktaUser[]>;
}

export function useGroupComparison({
  group,
  targetTabId,
  enabled = true,
}: UseGroupComparisonOptions): UseGroupComparisonReturn {
  const [isPicking, setIsPicking] = useState(false);
  const [selected, setSelected] = useState<GroupSummary | null>(null);
  const [comparedWith, setComparedWith] = useState<GroupSummary | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [memberCache] = useState(() => new Map<string, OktaUser[]>());

  const { liveSearchQuery, setLiveSearchQuery, liveSearchResults, isLiveSearching } =
    useGroupLiveSearch({
      targetTabId,
      searchMode: 'live',
      setError: setSearchError,
      enabled: enabled && isPicking,
    });

  const reset = useCallback(() => {
    setSelected(null);
    setSearchError(null);
    setLiveSearchQuery('');
  }, [setLiveSearchQuery]);

  const openPicker = useCallback(() => {
    reset();
    setIsPicking(true);
  }, [reset]);

  const closePicker = useCallback(() => {
    setIsPicking(false);
    reset();
  }, [reset]);

  const select = useCallback(
    (hit: GroupSummary) => {
      setSelected(hit);
      setLiveSearchQuery('');
    },
    [setLiveSearchQuery],
  );

  const clearSelected = useCallback(() => {
    setSelected(null);
    setLiveSearchQuery('');
  }, [setLiveSearchQuery]);

  const confirm = useCallback(() => {
    if (!selected) return;
    setIsPicking(false);
    setComparedWith(selected);
  }, [selected]);

  const closeComparison = useCallback(() => setComparedWith(null), []);

  const results = liveSearchResults.filter((hit) => hit.id !== group.id);

  return {
    isPicking,
    openPicker,
    closePicker,
    query: liveSearchQuery,
    setQuery: setLiveSearchQuery,
    results,
    isSearching: isLiveSearching,
    searchError,
    selected,
    select,
    clearSelected,
    confirm,
    comparedWith,
    closeComparison,
    memberCache,
  };
}
