import { useCallback, useRef } from 'react';
import type { OktaUser } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';
import { useOktaApi } from './useOktaApi';

const log = createLogger('useDetectedUser');

interface UseDetectedUserOptions {
  targetTabId: number | undefined;
  loadMemberships: (user: OktaUser) => Promise<void>;
  onSelectUser: (user: OktaUser | null) => void;
  onError: (message: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
  onResetSearch: () => void;
}

interface UseDetectedUserReturn {
  loadUserById: (userId: string) => Promise<void>;
}

export function useDetectedUser({
  targetTabId,
  loadMemberships,
  onSelectUser,
  onError,
  onLoadingChange,
  onResetSearch,
}: UseDetectedUserOptions): UseDetectedUserReturn {
  const { makeApiRequest } = useOktaApi({ targetTabId: targetTabId ?? null });

  const depsRef = useRef({
    loadMemberships,
    onSelectUser,
    onError,
    onLoadingChange,
    onResetSearch,
    makeApiRequest,
  });
  depsRef.current = {
    loadMemberships,
    onSelectUser,
    onError,
    onLoadingChange,
    onResetSearch,
    makeApiRequest,
  };

  const loadUserById = useCallback(
    async (userId: string) => {
      if (!targetTabId || !userId) return;

      const {
        loadMemberships,
        onSelectUser,
        onError,
        onLoadingChange,
        onResetSearch,
        makeApiRequest,
      } = depsRef.current;

      log.debug('Loading user on request:', userId);
      onLoadingChange(true);
      onError(null);
      onResetSearch(); // Clear search results + query when loading a specific user.

      try {
        const userResponse = await makeApiRequest(`/api/v1/users/${userId}`, {
          reason: 'Detect current Okta user',
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

  return { loadUserById };
}
