import { useCallback, useRef } from 'react';
import type { OperationResult } from './useOktaApi/types';

export type OperationResultListener = (result: OperationResult) => void;

export interface OperationResultBus {
  onResult: OperationResultListener;
  subscribe: (listener: OperationResultListener) => () => void;
}

export function useOperationResultBus(): OperationResultBus {
  const listeners = useRef(new Set<OperationResultListener>());

  const onResult = useCallback((result: OperationResult) => {
    for (const listener of [...listeners.current]) listener(result);
  }, []);

  const subscribe = useCallback((listener: OperationResultListener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  return { onResult, subscribe };
}
