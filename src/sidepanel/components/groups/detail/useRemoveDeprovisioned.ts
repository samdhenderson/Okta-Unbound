import { useCallback, useState } from 'react';
import { useOktaApi } from '../../../hooks/useOktaApi';
import { createLogger } from '../../../../shared/utils/logger';
import type { OperationResult } from '../../../hooks/useOktaApi/types';

const log = createLogger('useRemoveDeprovisioned');

export interface UseRemoveDeprovisionedReturn {
  run: () => void;
  isRemoving: boolean;
  error: string | null;
}

export function useRemoveDeprovisioned(
  groupId: string,
  targetTabId: number | null,
  onDone: () => void,
): UseRemoveDeprovisionedReturn {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onResult = useCallback(({ message, type }: OperationResult) => {
    if (type === 'error') setError(message);
  }, []);

  const { removeDeprovisioned } = useOktaApi({ targetTabId, onResult });

  const run = useCallback(() => {
    setError(null);
    setIsRemoving(true);
    void removeDeprovisioned(groupId)
      .catch((err: unknown) => {
        log.error('Bulk deprovisioned-member removal failed:', err);
        setError((current) => current ?? 'Removal failed. See the activity log for detail.');
      })
      .finally(() => {
        setIsRemoving(false);
        onDone();
      });
  }, [removeDeprovisioned, groupId, onDone]);

  return { run, isRemoving, error };
}
