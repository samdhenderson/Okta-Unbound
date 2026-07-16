import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { createCancellation } from '../../shared/scheduler/cancellation';
import type { BatchProgress } from '../../shared/scheduler/runBatch';

export interface ProgressState {
  isLoading: boolean;
  current: number;
  total: number;
  message: string;
  operationName?: string;
  apiCalls?: number;
  startTime?: number;
  canCancel?: boolean;
  isCancelling?: boolean;
  completed?: number;
  active?: number;
  failed?: number;
}

interface ProgressContextType {
  progress: ProgressState;
  startProgress: (
    operationName: string,
    message: string,
    total?: number,
    canCancel?: boolean,
  ) => void;
  updateProgress: (current: number, total?: number, message?: string, apiCalls?: number) => void;
  updateBatch: (progress: BatchProgress, message?: string) => void;
  incrementApiCalls: () => void;
  completeProgress: () => void;
  cancel: () => void;
  throwIfCancelled: () => void;
  resetCancellation: () => void;
  isCancelled: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<ProgressState>({
    isLoading: false,
    current: 0,
    total: 100,
    message: '',
  });

  const cancellationRef = useRef(createCancellation());
  const [isCancelled, setIsCancelled] = useState(false);

  const startProgress = useCallback(
    (operationName: string, message: string, total: number = 100, canCancel: boolean = true) => {
      cancellationRef.current.reset();
      setIsCancelled(false);
      setProgress({
        isLoading: true,
        current: 0,
        total,
        message,
        operationName,
        apiCalls: 0,
        startTime: Date.now(),
        canCancel,
        isCancelling: false,
        completed: 0,
        active: 0,
        failed: 0,
      });
    },
    [],
  );

  const updateBatch = useCallback((batch: BatchProgress, message?: string) => {
    setProgress((prev) => ({
      ...prev,
      isLoading: true,
      total: batch.total,
      completed: batch.completed,
      active: batch.active,
      failed: batch.failed,
      current: batch.completed + batch.failed,
      message: message ?? prev.message,
    }));
  }, []);

  const updateProgress = useCallback(
    (current: number, total?: number, message?: string, apiCalls?: number) => {
      setProgress((prev) => ({
        ...prev,
        isLoading: true,
        current,
        total: total ?? prev.total,
        message: message ?? prev.message,
        apiCalls: apiCalls ?? prev.apiCalls,
      }));
    },
    [],
  );

  const incrementApiCalls = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      apiCalls: (prev.apiCalls || 0) + 1,
    }));
  }, []);

  const completeProgress = useCallback(() => {
    cancellationRef.current.reset();
    setIsCancelled(false);
    setProgress({
      isLoading: false,
      current: 0,
      total: 100,
      message: '',
      completed: 0,
      active: 0,
      failed: 0,
    });
  }, []);

  const cancel = useCallback(() => {
    cancellationRef.current.cancel();
    setIsCancelled(true);
    setProgress((prev) => ({ ...prev, isCancelling: true }));
  }, []);

  const throwIfCancelled = useCallback(() => {
    cancellationRef.current.throwIfCancelled();
  }, []);

  const resetCancellation = useCallback(() => {
    cancellationRef.current.reset();
    setIsCancelled(false);
    setProgress((prev) => (prev.isCancelling ? { ...prev, isCancelling: false } : prev));
  }, []);

  const contextValue = useMemo(
    () => ({
      progress,
      startProgress,
      updateProgress,
      updateBatch,
      incrementApiCalls,
      completeProgress,
      cancel,
      throwIfCancelled,
      resetCancellation,
      isCancelled,
    }),
    [
      progress,
      startProgress,
      updateProgress,
      updateBatch,
      incrementApiCalls,
      completeProgress,
      cancel,
      throwIfCancelled,
      resetCancellation,
      isCancelled,
    ],
  );

  return <ProgressContext.Provider value={contextValue}>{children}</ProgressContext.Provider>;
};

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export const useProgressOptional = (): ProgressContextType | undefined =>
  useContext(ProgressContext);
