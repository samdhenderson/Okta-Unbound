import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRemoveDeprovisioned } from './useRemoveDeprovisioned';
import type { OperationResult } from '../../../hooks/useOktaApi/types';
import type { OperationResultListener } from '../../../hooks/useOperationResultBus';

const removeDeprovisioned = vi.fn<(groupId: string) => Promise<void>>();

const listeners = new Set<OperationResultListener>();
const subscribeToResults = (listener: OperationResultListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const emit = (result: OperationResult): void => {
  for (const listener of [...listeners]) listener(result);
};

const GROUP_ID = '00gFAKEgroup00001';

function mount(onDone: () => void = vi.fn()) {
  return renderHook(() =>
    useRemoveDeprovisioned({
      groupId: GROUP_ID,
      api: { removeDeprovisioned },
      subscribeToResults,
      onDone,
    }),
  );
}

describe('useRemoveDeprovisioned', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listeners.clear();
  });

  it('calls the facade operation with the group id and clears the flag when it settles', async () => {
    let release!: () => void;
    removeDeprovisioned.mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    const onDone = vi.fn();
    const { result } = mount(onDone);

    expect(result.current.isRemoving).toBe(false);

    act(() => result.current.run());
    expect(removeDeprovisioned).toHaveBeenCalledWith(GROUP_ID);
    expect(result.current.isRemoving).toBe(true);
    expect(onDone).not.toHaveBeenCalled();

    await act(async () => {
      release();
    });

    expect(result.current.isRemoving).toBe(false);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('still refreshes the roster when the operation rejects, and says so', async () => {
    removeDeprovisioned.mockRejectedValue(new Error('network died'));
    const onDone = vi.fn();
    const { result } = mount(onDone);

    act(() => result.current.run());

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(result.current.isRemoving).toBe(false);
    expect(result.current.error).toMatch(/Removal failed/);
  });

  it("keeps the operation's error line, and ignores its non-error chatter", async () => {
    let release!: () => void;
    removeDeprovisioned.mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    const { result } = mount();

    act(() => result.current.run());

    act(() => {
      emit({ message: 'Found 3 deprovisioned users', type: 'warning' });
      emit({ message: 'Removed: ada@example.com', type: 'success' });
    });
    expect(result.current.error).toBeNull();

    act(() => {
      emit({ message: '403 Forbidden: grace@example.com', type: 'error' });
    });
    expect(result.current.error).toBe('403 Forbidden: grace@example.com');

    await act(async () => {
      release();
    });

    await act(async () => {
      result.current.run();
    });
    expect(result.current.error).toBeNull();
  });

  it('ignores results reported while its own run is not in flight', async () => {
    removeDeprovisioned.mockResolvedValue(undefined);
    const { result } = mount();

    act(() => {
      emit({ message: 'A different operation failed', type: 'error' });
    });
    expect(result.current.error).toBeNull();

    await act(async () => {
      result.current.run();
    });

    act(() => {
      emit({ message: 'A later, unrelated failure', type: 'error' });
    });
    expect(result.current.error).toBeNull();
  });
});
