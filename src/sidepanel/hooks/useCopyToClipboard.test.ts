import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from './useCopyToClipboard';

function mockClipboard(writeText: (text: string) => Promise<void>): ReturnType<typeof vi.fn> {
  const spy = vi.fn(writeText);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: spy },
  });
  return spy;
}

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('copies the text and sets copied, resetting after 1500 ms', async () => {
    const writeText = mockClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.copied).toBe(false);
    await act(async () => {
      result.current.copy('00gFAKE00000000000001');
    });

    expect(writeText).toHaveBeenCalledWith('00gFAKE00000000000001');
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(result.current.copied).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });

  it('restarts the confirmation window on a second copy', async () => {
    mockClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      result.current.copy('first');
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await act(async () => {
      result.current.copy('second');
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(true);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.copied).toBe(false);
  });

  it('fails quietly when the clipboard rejects, leaving copied false', async () => {
    mockClipboard(() => Promise.reject(new Error('clipboard blocked')));
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      result.current.copy('blocked');
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.copied).toBe(false);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.copied).toBe(false);
  });

  it('clears the pending reset timer on unmount', async () => {
    mockClipboard(() => Promise.resolve());
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { result, unmount } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      result.current.copy('text');
    });
    const before = clearSpy.mock.calls.length;
    unmount();
    expect(clearSpy.mock.calls.length).toBeGreaterThan(before);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    clearSpy.mockRestore();
  });
});
