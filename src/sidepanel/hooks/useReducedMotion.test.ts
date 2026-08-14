import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

function mockMatchMedia(matches: boolean) {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  const mql = { matches, addEventListener, removeEventListener };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return { addEventListener, removeEventListener };
}

describe('useReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    // @ts-expect-error -- test-only cleanup of a mock installed on window
    delete window.matchMedia;
  });

  it('returns false when the OS has no reduced-motion preference', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when the OS prefers reduced motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('adds a change listener on mount and removes it on unmount', () => {
    const { addEventListener, removeEventListener } = mockMatchMedia(false);
    const { unmount } = renderHook(() => useReducedMotion());
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
