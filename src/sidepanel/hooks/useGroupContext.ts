import { useCallback } from 'react';
import type { GroupInfo } from '../../shared/types';
import {
  useOktaTabContext,
  type ConnectionStatus,
  type EntityLoadContext,
} from './useOktaTabContext';

interface UseGroupContextReturn {
  groupInfo: GroupInfo | null;
  connectionStatus: ConnectionStatus;
  targetTabId: number | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  oktaOrigin: string | null;
}

export function useGroupContext(enabled = true): UseGroupContextReturn {
  const loadEntity = useCallback(
    async ({ sendToTab }: EntityLoadContext): Promise<GroupInfo | null> => {
      const response = await sendToTab<GroupInfo>('getGroupInfo');
      return response.success && response.data ? response.data : null;
    },
    [],
  );

  const { data, ...rest } = useOktaTabContext<GroupInfo | null>({
    scope: 'useGroupContext',
    initialData: null,
    commsFailedData: null,
    loadEntity,
    enabled,
  });

  return { groupInfo: data, ...rest };
}
