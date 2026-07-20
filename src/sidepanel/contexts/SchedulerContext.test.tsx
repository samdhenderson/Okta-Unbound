import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { SchedulerProvider, useScheduler } from './SchedulerContext';
import type { SchedulerState } from '../../shared/scheduler/types';

const sendMessage = chrome.runtime.sendMessage as ReturnType<typeof vi.fn>;
const addListener = chrome.runtime.onMessage.addListener as ReturnType<typeof vi.fn>;

const baseState: SchedulerState = {
  status: 'idle',
  queueLength: 0,
  activeRequests: 0,
  totalProcessed: 0,
  rateLimitInfo: null,
  cooldownEndsAt: null,
  errorCount: 0,
  lastError: null,
};

const Probe = () => {
  const { state } = useScheduler();
  return <div data-testid="probe">{state ? `${state.status}:${state.queueLength}` : 'none'}</div>;
};

function pushMessage(message: unknown): void {
  const listener = addListener.mock.calls.at(-1)?.[0] as (m: unknown) => void;
  act(() => listener(message));
}

beforeEach(() => {
  sendMessage.mockReset();
  addListener.mockReset();
  sendMessage.mockImplementation((msg: { action: string }) => {
    if (msg.action === 'getSchedulerState') {
      return Promise.resolve({ success: true, state: baseState });
    }
    if (msg.action === 'getSchedulerMetrics') {
      return Promise.resolve({ success: true, metrics: {} });
    }
    return Promise.resolve({ success: true });
  });
});

describe('SchedulerContext', () => {
  it('fetches state once on mount and then updates from push messages', async () => {
    render(
      <SchedulerProvider>
        <Probe />
      </SchedulerProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('probe')).toHaveTextContent('idle:0'));

    pushMessage({
      action: 'schedulerStateChanged',
      state: { ...baseState, status: 'processing', queueLength: 3 },
    });
    expect(screen.getByTestId('probe')).toHaveTextContent('processing:3');
  });

  it('does not poll: getSchedulerState is issued exactly once (on mount)', async () => {
    render(
      <SchedulerProvider>
        <Probe />
      </SchedulerProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('probe')).toHaveTextContent('idle:0'));

    const stateCalls = () =>
      sendMessage.mock.calls.filter((c) => c[0]?.action === 'getSchedulerState').length;
    expect(stateCalls()).toBe(1);

    await new Promise((r) => setTimeout(r, 1100));
    expect(stateCalls()).toBe(1);
  });
});
