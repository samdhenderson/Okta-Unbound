import { useCallback, useRef } from 'react';
import type { OktaUser } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useDetectedUser');

interface UseDetectedUserOptions {
  targetTabId: number | undefined;
  detectedUserId: string | undefined;
  loadMemberships: (user: OktaUser) => Promise<void>;
  onSelectUser: (user: OktaUser | null) => void;
  onError: (message: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
  onResetSearch: () => void;
}

interface UseDetectedUserReturn {
  loadDetectedUser: () => Promise<void>;
  loadUserById: (userId: string) => Promise<void>;
}

export function useDetectedUser({
  targetTabId,
  detectedUserId,
  loadMemberships,
  onSelectUser,
  onError,
  onLoadingChange,
  onResetSearch,
}: UseDetectedUserOptions): UseDetectedUserReturn {
  const depsRef = useRef({
    loadMemberships,
    onSelectUser,
    onError,
    onLoadingChange,
    onResetSearch,
  });
  depsRef.current = { loadMemberships, onSelectUser, onError, onLoadingChange, onResetSearch };

  const loadUserById = useCallback(
    async (userId: string) => {
      if (!targetTabId || !userId) return;

      const { loadMemberships, onSelectUser, onError, onLoadingChange, onResetSearch } =
        depsRef.current;

      log.debug('Loading user on request:', userId);
      onLoadingChange(true);
      onError(null);
      onResetSearch(); // Clear search results + query when loading a specific user.

      try {
        const userResponse = await chrome.tabs.sendMessage(targetTabId, {
          action: 'getUserDetails',
          userId,
        });

        if (!userResponse.success) {
          throw new Error(userResponse.error || 'Failed to fetch user details');
        }

        const user: OktaUser = userResponse.data;
        onSelectUser(user);

        await loadMemberships(user);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load user';
        onSelectUser(null);
        onError(message);
        onLoadingChange(false);
      }
    },
    [targetTabId],
  );

  const loadDetectedUser = useCallback(async () => {
    if (!detectedUserId) return;
    await loadUserById(detectedUserId);
  }, [detectedUserId, loadUserById]);

  return { loadDetectedUser, loadUserById };
}
