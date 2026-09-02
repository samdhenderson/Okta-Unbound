import { useMemo } from 'react';
import type { GroupInfo } from '../../shared/types';
import type { OktaPageContext } from './useOktaPageContext';
import type { ConnectionStatus } from './useOktaTabContext';

interface UseGroupContextReturn {
  groupInfo: GroupInfo | null;
  connectionStatus: ConnectionStatus;
  targetTabId: number | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  oktaOrigin: string | null;
}

export function useGroupContext(page: OktaPageContext): UseGroupContextReturn {
  const {
    pageType,
    groupInfo,
    connectionStatus,
    targetTabId,
    error,
    isLoading,
    refetch,
    oktaOrigin,
  } = page;

  return useMemo(
    () => ({
      groupInfo: pageType === 'group' ? groupInfo : null,
      connectionStatus,
      targetTabId,
      error,
      isLoading,
      refetch,
      oktaOrigin,
    }),
    [pageType, groupInfo, connectionStatus, targetTabId, error, isLoading, refetch, oktaOrigin],
  );
}
