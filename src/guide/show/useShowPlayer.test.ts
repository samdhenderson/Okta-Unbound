import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useShowPlayer } from './useShowPlayer';

const TELL = 100;

interface FakeEntry {
  isIntersecting: boolean;
  intersectionRect: { height: number };
  boundingClientRect: { height: number };
  rootBounds: { height: number } | null;
}

function stubObserver() {
  const created: string[] = [];
  let fire: (entries: FakeEntry[]) => void = () => {};
  let disconnected = false;
  class IO {
    constructor(cb: (entries: FakeEntry[]) => void) {
      created.push('io');
      fire = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {
      disconnected = true;
    }
  }
  vi.stubGlobal('IntersectionObserver', IO);
  return {
    created,
    isDisconnected: () => disconnected,
    report(visible: number, own = 400, root = 800) {
      if (disconnected) return;
      act(() => {
        fire([
          {
            isIntersecting: visible > 0,
            intersectionRect: { height: visible },
            boundingClientRect: { height: own },
            rootBounds: { height: root },
          },
        ]);
      });
    },
  };
}

function enableMotionScale() {
  document.documentElement.style.setProperty('--dur-tell', `${TELL}ms`);
}

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  const mql = {
    matches,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql));
  return {
    flip(next: boolean) {
      mql.matches = next;
      act(() => {
        listeners.forEach((fn) => fn());
      });
    },
  };
}

function play(beatCount: number, holds: ReadonlyArray<number | undefined>) {
  const stage = document.createElement('div');
  document.body.appendChild(stage);
  const rendered = renderHook(() => useShowPlayer(beatCount, holds));
  act(() => {
    rendered.result.current.ref(stage);
  });
  return rendered;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.documentElement.style.removeProperty('--dur-tell');
  document.body.innerHTML = '';
});

describe('useShowPlayer without motion', () => {
  it('lands on the last beat, done, in the first render when no motion scale is loaded', () => {
    const { result } = renderHook(() => useShowPlayer(4, [1, 1, 1]));

    expect(result.current.beat).toBe(3);
    expect(result.current.state).toBe('done');
  });

  it('never builds an observer when there is no motion scale', () => {
    const observer = stubObserver();
    play(3, [1, 1]);

    expect(observer.created).toHaveLength(0);
  });

  it('lands on the last beat at once when the reader prefers reduced motion', () => {
    enableMotionScale();
    mockMatchMedia(true);
    const observer = stubObserver();

    const { result } = play(3, [1, 1]);

    expect(result.current.beat).toBe(2);
    expect(result.current.state).toBe('done');
    expect(observer.created).toHaveLength(0);
  });

  it('finishes a single-beat show without waiting for an observer', () => {
    enableMotionScale();
    const observer = stubObserver();

    const { result } = play(1, []);

    expect(result.current.beat).toBe(0);
    expect(result.current.state).toBe('done');
    expect(observer.created).toHaveLength(0);
  });
});

describe('useShowPlayer with motion', () => {
  it('holds beat 0 until the stage is half on screen, then steps one beat per hold', () => {
    vi.useFakeTimers();
    enableMotionScale();
    const observer = stubObserver();

    const { result } = play(3, [1, 3]);
    expect(result.current.beat).toBe(0);
    expect(result.current.state).toBe('waiting');

    observer.report(0);
    expect(result.current.state).toBe('waiting');
    observer.report(120);
    expect(result.current.state).toBe('waiting');

    observer.report(200);
    expect(result.current.state).toBe('playing');
    expect(result.current.beat).toBe(0);

    act(() => void vi.advanceTimersByTime(TELL));
    expect(result.current.beat).toBe(1);
    expect(result.current.state).toBe('playing');

    act(() => void vi.advanceTimersByTime(3 * TELL));
    expect(result.current.beat).toBe(2);
    expect(result.current.state).toBe('done');
  });

  it('starts a stage taller than the viewport once half the viewport is filled', () => {
    vi.useFakeTimers();
    enableMotionScale();
    const observer = stubObserver();

    const { result } = play(2, [1]);
    observer.report(400, 2000, 800);

    expect(result.current.state).toBe('playing');
  });

  it('rests two beats where the holds array has no entry', () => {
    vi.useFakeTimers();
    enableMotionScale();
    const observer = stubObserver();

    const { result } = play(3, []);
    observer.report(200);

    act(() => void vi.advanceTimersByTime(2 * TELL - 1));
    expect(result.current.beat).toBe(0);

    act(() => void vi.advanceTimersByTime(1));
    expect(result.current.beat).toBe(1);

    act(() => void vi.advanceTimersByTime(2 * TELL));
    expect(result.current.beat).toBe(2);
    expect(result.current.state).toBe('done');
  });

  it('stops watching once it has started, so scrolling back does not replay it', () => {
    vi.useFakeTimers();
    enableMotionScale();
    const observer = stubObserver();

    const { result } = play(3, [1, 1]);
    observer.report(200);
    expect(observer.isDisconnected()).toBe(true);

    act(() => void vi.advanceTimersByTime(2 * TELL));
    expect(result.current.beat).toBe(2);
    expect(result.current.state).toBe('done');

    observer.report(400);
    expect(result.current.beat).toBe(2);
    expect(result.current.state).toBe('done');
  });

  it('keeps its pending timers when a re-render re-runs the effect mid-play', () => {
    vi.useFakeTimers();
    enableMotionScale();
    const media = mockMatchMedia(false);
    const observer = stubObserver();

    const { result, rerender } = play(3, [1, 1]);
    observer.report(200);
    expect(result.current.state).toBe('playing');

    act(() => void vi.advanceTimersByTime(TELL));
    expect(result.current.beat).toBe(1);

    media.flip(true);
    rerender();

    act(() => void vi.advanceTimersByTime(TELL));
    expect(result.current.beat).toBe(2);
    expect(result.current.state).toBe('done');
  });

  it('clears its pending timers on unmount', () => {
    vi.useFakeTimers();
    enableMotionScale();
    const observer = stubObserver();

    const { result, unmount } = play(3, [1, 1]);
    observer.report(200);
    const beforeUnmount = result.current.beat;
    unmount();

    act(() => void vi.advanceTimersByTime(10 * TELL));
    expect(result.current.beat).toBe(beforeUnmount);
    expect(vi.getTimerCount()).toBe(0);
  });
});
