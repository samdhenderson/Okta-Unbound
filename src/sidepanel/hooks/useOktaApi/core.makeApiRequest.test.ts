import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCoreApi, isTransientPortError } from './core';

const runtimeSendMessage = chrome.runtime.sendMessage as ReturnType<typeof vi.fn>;

const PORT_CLOSED = 'The message port closed before a response was received.';
const NO_RECEIVER = 'Could not establish connection. Receiving end does not exist.';
const CONTEXT_INVALIDATED = 'Extension context invalidated.';

function makeCore() {
  const progress = { start: vi.fn(), reportBatch: vi.fn(), complete: vi.fn() };
  return createCoreApi(1, () => {}, vi.fn(), progress, {});
}

function scheduleCallCount(): number {
  return runtimeSendMessage.mock.calls.filter((c) => c[0]?.action === 'scheduleApiRequest').length;
}

beforeEach(() => {
  runtimeSendMessage.mockReset();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('isTransientPortError', () => {
  it.each([
    PORT_CLOSED,
    NO_RECEIVER,
    'the message port closed before a response was received',
    'RECEIVING END DOES NOT EXIST',
  ])('matches the transient service-worker wakeup failure: %s', (message) => {
    expect(isTransientPortError(message)).toBe(true);
  });

  it.each([
    CONTEXT_INVALIDATED,
    'Failed to fetch',
    'No target tab ID - not connected to Okta page',
    '',
  ])('does not match the non-recoverable failure: %s', (message) => {
    expect(isTransientPortError(message)).toBe(false);
  });
});

describe('coreApi.makeApiRequest transient-port retry', () => {
  it('retries a GET once after a dropped port and resolves', async () => {
    runtimeSendMessage
      .mockRejectedValueOnce(new Error(PORT_CLOSED))
      .mockResolvedValueOnce({ success: true, data: { id: '00gFAKEGROUP' } });

    const promise = makeCore().makeApiRequest('/api/v1/groups/00gFAKEGROUP/rules');
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ success: true, data: { id: '00gFAKEGROUP' } });
    expect(scheduleCallCount()).toBe(2);
  });

  it('gives up after two retries and propagates the error', async () => {
    runtimeSendMessage.mockRejectedValue(new Error(PORT_CLOSED));

    const promise = makeCore().makeApiRequest('/api/v1/groups');
    const assertion = expect(promise).rejects.toThrow(PORT_CLOSED);
    await vi.runAllTimersAsync();
    await assertion;

    expect(scheduleCallCount()).toBe(3);
  });

  it('never retries a write — a port error is ambiguous about whether it executed', async () => {
    runtimeSendMessage.mockRejectedValue(new Error(PORT_CLOSED));

    const promise = makeCore().makeApiRequest(
      '/api/v1/groups/00gFAKEGROUP/users/00uFAKEUSER',
      'PUT',
    );
    const assertion = expect(promise).rejects.toThrow(PORT_CLOSED);
    await vi.runAllTimersAsync();
    await assertion;

    expect(scheduleCallCount()).toBe(1);
  });

  it('does not retry a reloaded extension — the error surfaces immediately', async () => {
    runtimeSendMessage.mockRejectedValue(new Error(CONTEXT_INVALIDATED));

    const promise = makeCore().makeApiRequest('/api/v1/groups');
    const assertion = expect(promise).rejects.toThrow(CONTEXT_INVALIDATED);
    await vi.runAllTimersAsync();
    await assertion;

    expect(scheduleCallCount()).toBe(1);
  });
});
