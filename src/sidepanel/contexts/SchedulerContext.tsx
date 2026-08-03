import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type { SchedulerState, SchedulerMetrics } from '../../shared/scheduler/types';
import type { SchedulerStateChangedMessage } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('SchedulerContext');

interface SchedulerContextType {
  state: SchedulerState | null;
  metrics: SchedulerMetrics | null;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  clearQueue: () => Promise<void>;
  refreshState: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
}

const SchedulerContext = createContext<SchedulerContextType | undefined>(undefined);

export const SchedulerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SchedulerState | null>(null);
  const [metrics, setMetrics] = useState<SchedulerMetrics | null>(null);

  const refreshState = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getSchedulerState',
      });

      if (response.success) {
        setState(response.state);
      }
    } catch (error) {
      log.error('Failed to fetch scheduler state:', error);
    }
  }, []);

  const refreshMetrics = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getSchedulerMetrics',
      });

      if (response.success) {
        setMetrics(response.metrics);
      }
    } catch (error) {
      log.error('Failed to fetch scheduler metrics:', error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshState();
      await refreshMetrics();
    })();
  }, [refreshState, refreshMetrics]);

  useEffect(() => {
    const listener = (message: Partial<SchedulerStateChangedMessage> & { action?: string }) => {
      if (message.action === 'schedulerStateChanged') {
        setState(message.state ?? null);
        if (message.metrics) {
          setMetrics(message.metrics);
        }
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const pause = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ action: 'pauseScheduler' });
      await refreshState();
    } catch (error) {
      log.error('Failed to pause scheduler:', error);
    }
  }, [refreshState]);

  const resume = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ action: 'resumeScheduler' });
      await refreshState();
    } catch (error) {
      log.error('Failed to resume scheduler:', error);
    }
  }, [refreshState]);

  const clearQueue = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ action: 'clearSchedulerQueue' });
      await refreshState();
    } catch (error) {
      log.error('Failed to clear queue:', error);
    }
  }, [refreshState]);

  const contextValue = useMemo(
    () => ({
      state,
      metrics,
      pause,
      resume,
      clearQueue,
      refreshState,
      refreshMetrics,
    }),
    [state, metrics, pause, resume, clearQueue, refreshState, refreshMetrics],
  );

  return <SchedulerContext.Provider value={contextValue}>{children}</SchedulerContext.Provider>;
};

export const useScheduler = (): SchedulerContextType => {
  const context = useContext(SchedulerContext);
  if (!context) {
    throw new Error('useScheduler must be used within a SchedulerProvider');
  }
  return context;
};
