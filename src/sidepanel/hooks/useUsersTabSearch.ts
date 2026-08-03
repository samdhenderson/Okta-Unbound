import type { OktaUser } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';
import { useDebouncedUserSearch } from './useDebouncedUserSearch';

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
  return useDebouncedUserSearch({
    targetTabId,
    onError,
    onSearchStart,
    debounceMs,
    minQueryLength,
    log,
  });
}
