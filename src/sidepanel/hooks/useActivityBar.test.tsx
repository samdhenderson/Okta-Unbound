import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SchedulerProvider } from '../contexts/SchedulerContext';
import { ProgressProvider, useProgress } from '../contexts/ProgressContext';
import { useActivityBar } from './useActivityBar';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProgressProvider>
    <SchedulerProvider>{children}</SchedulerProvider>
  </ProgressProvider>
);

const sendMessage = chrome.runtime.sendMessage as ReturnType<typeof vi.fn>;

beforeEach(() => {
  sendMessage.mockReset();
  sendMessage.mockImplementation((msg: { action: string }) => {
    if (msg.action === 'getSchedulerState') {
      return Promise.resolve({
        success: true,
        state: {
          status: 'processing',
          queueLength: 6,
          activeRequests: 2,
          totalProcessed: 4,
          rateLimitInfo: { limit: 600, remaining: 550, reset: 0, endpoint: '/x', timestamp: 0 },
          cooldownEndsAt: null,
          errorCount: 0,
          lastError: null,
        },
      });
    }
    if (msg.action === 'getSchedulerMetrics') {
      return Promise.resolve({ success: true, metrics: { failedRequests: 1 } });
    }
    return Promise.resolve({ success: true });
  });
});

function schedulerStateIs(state: Record<string, unknown>): void {
  sendMessage.mockImplementation((msg: { action: string }) => {
    if (msg.action === 'getSchedulerState') return Promise.resolve({ success: true, state });
    if (msg.action === 'getSchedulerMetrics') {
      return Promise.resolve({ success: true, metrics: { failedRequests: 0 } });
    }
    return Promise.resolve({ success: true });
  });
}

describe('useActivityBar', () => {
  it('merges scheduler state into the view', async () => {
    const { result } = renderHook(() => useActivityBar(), { wrapper });

    await waitFor(() => expect(result.current.view.queueLength).toBe(6));
    expect(result.current.view.activeRequests).toBe(2);
    expect(result.current.view.rateLimit).toEqual({ remaining: 550, limit: 600, low: false });
    expect(result.current.view.statusLabel).toBe('Processing');
  });

  it('reflects a running operation from progress', () => {
    const { result } = renderHook(() => ({ bar: useActivityBar(), progress: useProgress() }), {
      wrapper,
    });

    act(() => result.current.progress.startProgress('Removing users', 'Working…', 10));

    expect(result.current.bar.view.operationActive).toBe(true);
    expect(result.current.bar.view.operationName).toBe('Removing users');
    expect(result.current.bar.view.canCancel).toBe(true);
  });

  it('surfaces the operation breakdown from updateBatch', () => {
    const { result } = renderHook(() => ({ bar: useActivityBar(), progress: useProgress() }), {
      wrapper,
    });

    act(() => result.current.progress.startProgress('Removing users', 'Working…', 30));
    act(() =>
      result.current.progress.updateBatch({ total: 30, completed: 18, active: 5, failed: 2 }),
    );

    expect(result.current.bar.view.total).toBe(30);
    expect(result.current.bar.view.opCompleted).toBe(18);
    expect(result.current.bar.view.opActive).toBe(5);
    expect(result.current.bar.view.opFailed).toBe(2);
    expect(result.current.bar.view.current).toBe(20); // completed + failed
  });

  it('cancel() drains the queue AND cancels the operation', async () => {
    const { result } = renderHook(() => ({ bar: useActivityBar(), progress: useProgress() }), {
      wrapper,
    });

    act(() => result.current.progress.startProgress('Removing users', 'Working…', 10));
    act(() => result.current.bar.cancel());

    expect(sendMessage).toHaveBeenCalledWith({ action: 'clearSchedulerQueue' });
    expect(result.current.progress.progress.isCancelling).toBe(true);
    expect(result.current.progress.isCancelled).toBe(true);
  });
});

describe('useActivityBar low-headroom threshold', () => {
  const stateWith = (remaining: number, threshold: number) => ({
    status: 'processing',
    queueLength: 0,
    activeRequests: 0,
    totalProcessed: 0,
    rateLimitInfo: {
      limit: 100,
      remaining,
      reset: 0,
      endpoint: '/api/v1/users',
      bucket: '/api/v1/users',
      timestamp: 0,
    },
    cooldownEndsAt: null,
    errorCount: 0,
    lastError: null,
    buckets: [],
    plans: [],
    minRemainingThresholdPercent: threshold,
  });

  it('marks headroom low at the threshold the scheduler actually backs off at', async () => {
    schedulerStateIs(stateWith(30, 35));

    const { result } = renderHook(() => useActivityBar(), { wrapper });

    await waitFor(() => expect(result.current.view.rateLimit).not.toBeNull());
    expect(result.current.view.rateLimit).toEqual({ remaining: 30, limit: 100, low: true });
  });

  it('leaves headroom unflagged above the org threshold', async () => {
    schedulerStateIs(stateWith(30, 10));

    const { result } = renderHook(() => useActivityBar(), { wrapper });

    await waitFor(() => expect(result.current.view.rateLimit).not.toBeNull());
    expect(result.current.view.rateLimit?.low).toBe(false);
  });

  it('reports no headroom rather than dividing by a zero limit', async () => {
    schedulerStateIs({
      ...stateWith(0, 10),
      rateLimitInfo: { ...stateWith(0, 10).rateLimitInfo, limit: 0 },
    });

    const { result } = renderHook(() => useActivityBar(), { wrapper });

    await waitFor(() => expect(result.current.view.statusLabel).toBe('Processing'));
    expect(result.current.view.rateLimit).toBeNull();
  });
});
