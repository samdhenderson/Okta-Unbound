import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRemoveDeprovisioned } from './useRemoveDeprovisioned';
import type { OperationResult } from '../../../hooks/useOktaApi/types';

const facade = vi.hoisted(() => ({
  removeDeprovisioned: vi.fn<(groupId: string) => Promise<void>>(),
  lastOnResult: null as ((result: OperationResult) => void) | null,
}));

vi.mock('../../../hooks/useOktaApi', () => ({
  useOktaApi: ({ onResult }: { onResult?: (result: OperationResult) => void }) => {
    facade.lastOnResult = onResult ?? null;
    return { removeDeprovisioned: facade.removeDeprovisioned };
  },
}));

const GROUP_ID = '00gFAKEgroup00001';

describe('useRemoveDeprovisioned', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    facade.lastOnResult = null;
  });

  it('calls the facade operation with the group id and clears the flag when it settles', async () => {
    let release!: () => void;
    facade.removeDeprovisioned.mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    const onDone = vi.fn();
    const { result } = renderHook(() => useRemoveDeprovisioned(GROUP_ID, 1, onDone));

    expect(result.current.isRemoving).toBe(false);

    act(() => result.current.run());
    expect(facade.removeDeprovisioned).toHaveBeenCalledWith(GROUP_ID);
    expect(result.current.isRemoving).toBe(true);
    expect(onDone).not.toHaveBeenCalled();

    await act(async () => {
      release();
    });

    expect(result.current.isRemoving).toBe(false);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('still refreshes the roster when the operation rejects, and says so', async () => {
    facade.removeDeprovisioned.mockRejectedValue(new Error('network died'));
    const onDone = vi.fn();
    const { result } = renderHook(() => useRemoveDeprovisioned(GROUP_ID, 1, onDone));

    act(() => result.current.run());

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(result.current.isRemoving).toBe(false);
    expect(result.current.error).toMatch(/Removal failed/);
  });

  it("keeps the operation's error line, and ignores its non-error chatter", async () => {
    facade.removeDeprovisioned.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoveDeprovisioned(GROUP_ID, 1, vi.fn()));

    act(() => {
      facade.lastOnResult?.({ message: 'Found 3 deprovisioned users', type: 'warning' });
      facade.lastOnResult?.({ message: 'Removed: ada@example.com', type: 'success' });
    });
    expect(result.current.error).toBeNull();

    act(() => {
      facade.lastOnResult?.({ message: '403 Forbidden: grace@example.com', type: 'error' });
    });
    expect(result.current.error).toBe('403 Forbidden: grace@example.com');

    await act(async () => {
      result.current.run();
    });
    expect(result.current.error).toBeNull();
  });
});
