import { useCallback } from 'react';
import type { UserInfo } from '../../shared/types';
import {
  useOktaTabContext,
  type ConnectionStatus,
  type EntityLoadContext,
} from './useOktaTabContext';

interface UseUserContextReturn {
  userInfo: UserInfo | null;
  connectionStatus: ConnectionStatus;
  targetTabId: number | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  oktaOrigin: string | null;
}

export function useUserContext(enabled = true): UseUserContextReturn {
  const loadEntity = useCallback(
    async ({ sendToTab }: EntityLoadContext): Promise<UserInfo | null> => {
      const response = await sendToTab<UserInfo>('getUserInfo');
      return response.success && response.data ? response.data : null;
    },
    [],
  );

  const { data, ...rest } = useOktaTabContext<UserInfo | null>({
    scope: 'useUserContext',
    initialData: null,
    commsFailedData: null,
    loadEntity,
    enabled,
  });

  return { userInfo: data, ...rest };
}
