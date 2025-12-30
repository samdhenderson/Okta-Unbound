import { useState, useCallback, useMemo } from 'react';
import { useSearchWithDropdown } from './useSearchWithDropdown';

interface UseBulkSelectionOptions<T> {
  searchFn: (query: string) => Promise<T[]>;
  getItemId: (item: T) => string;
  debounceMs?: number;
  minQueryLength?: number;
}

interface UseBulkSelectionReturn<T> {
  selectedItems: T[];
  addItem: (item: T) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  hasItem: (id: string) => boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: T[];
  isSearching: boolean;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}

export function useBulkSelection<T>({
  searchFn,
  getItemId,
  debounceMs = 300,
  minQueryLength = 2,
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn<T> {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const selectedIds = useMemo(
    () => new Set(selectedItems.map(getItemId)),
    [selectedItems, getItemId],
  );

  const filterFn = useCallback(
    (results: T[]) => results.filter((item) => !selectedIds.has(getItemId(item))),
    [selectedIds, getItemId],
  );

  const search = useSearchWithDropdown<T>({
    searchFn,
    debounceMs,
    minQueryLength,
    filterFn,
    onSelect: (item) => {
      setSelectedItems((prev) => [...prev, item]);
    },
  });

  const addItem = useCallback(
    (item: T) => {
      const itemId = getItemId(item);
      if (!selectedIds.has(itemId)) {
        setSelectedItems((prev) => [...prev, item]);
      }
      search.clearSearch();
    },
    [getItemId, selectedIds, search],
  );

  const removeItem = useCallback(
    (id: string) => {
      setSelectedItems((prev) => prev.filter((item) => getItemId(item) !== id));
    },
    [getItemId],
  );

  const clearAll = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const hasItem = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  return {
    selectedItems,
    addItem,
    removeItem,
    clearAll,
    hasItem,
    searchQuery: search.query,
    setSearchQuery: search.setQuery,
    searchResults: search.results,
    isSearching: search.isSearching,
    showDropdown: search.showDropdown,
    setShowDropdown: search.setShowDropdown,
  };
}

export default useBulkSelection;
