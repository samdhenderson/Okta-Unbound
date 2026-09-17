import { useCallback, useState } from 'react';
import { createLogger } from '../../../../shared/utils/logger';
import type { VerbApi } from '../../../selection/verbs/types';
import type { OperationResultListener } from '../../../hooks/useOperationResultBus';

const log = createLogger('useRemoveDeprovisioned');

export interface UseRemoveDeprovisionedOptions {
  groupId: string;
  api: Pick<VerbApi, 'removeDeprovisioned'>;
  subscribeToResults: (listener: OperationResultListener) => () => void;
  onDone: () => void;
}

export interface UseRemoveDeprovisionedReturn {
  run: () => void;
  isRemoving: boolean;
  error: string | null;
}

export function useRemoveDeprovisioned(
  options: UseRemoveDeprovisionedOptions,
): UseRemoveDeprovisionedReturn {
  const { groupId, subscribeToResults, onDone } = options;
  const { removeDeprovisioned } = options.api;

  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    setError(null);
    setIsRemoving(true);

    const unsubscribe = subscribeToResults(({ message, type }) => {
      if (type === 'error') setError(message);
    });

    void removeDeprovisioned(groupId)
      .catch((err: unknown) => {
        log.error('Bulk deprovisioned-member removal failed:', err);
        setError((current) => current ?? 'Removal failed. See the activity log for detail.');
      })
      .finally(() => {
        unsubscribe();
        setIsRemoving(false);
        onDone();
      });
  }, [removeDeprovisioned, groupId, subscribeToResults, onDone]);

  return { run, isRemoving, error };
}
