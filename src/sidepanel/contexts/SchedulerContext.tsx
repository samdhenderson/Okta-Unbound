import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type { SchedulerState, SchedulerMetrics } from '../../shared/scheduler/types';

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
      console.error('[SchedulerContext] Failed to fetch scheduler state:', error);
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
      console.error('[SchedulerContext] Failed to fetch scheduler metrics:', error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshState();
      await refreshMetrics();
    })();

    const interval = setInterval(() => {
      void refreshState();
    }, 1000); // Update every second for smooth countdown

    return () => clearInterval(interval);
  }, [refreshState, refreshMetrics]);

  useEffect(() => {
    const listener = (message: any) => {
      if (message.action === 'schedulerStateChanged') {
        setState(message.state);
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
      console.error('[SchedulerContext] Failed to pause scheduler:', error);
    }
  }, [refreshState]);

  const resume = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ action: 'resumeScheduler' });
      await refreshState();
    } catch (error) {
      console.error('[SchedulerContext] Failed to resume scheduler:', error);
    }
  }, [refreshState]);

  const clearQueue = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ action: 'clearSchedulerQueue' });
      await refreshState();
    } catch (error) {
      console.error('[SchedulerContext] Failed to clear queue:', error);
    }
  }, [refreshState]);

  return (
    <SchedulerContext.Provider
      value={{
        state,
        metrics,
        pause,
        resume,
        clearQueue,
        refreshState,
        refreshMetrics,
      }}
    >
      {children}
    </SchedulerContext.Provider>
  );
};

export const useScheduler = (): SchedulerContextType => {
  const context = useContext(SchedulerContext);
  if (!context) {
    throw new Error('useScheduler must be used within a SchedulerProvider');
  }
  return context;
};
