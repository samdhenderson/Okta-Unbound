import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRevealOnView } from './useRevealOnView';

const VIEWPORT = 800;

function stubObserver() {
  const created: string[] = [];
  let fire: (entries: { isIntersecting: boolean }[]) => void = () => {};
  class IO {
    constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
      created.push('io');
      fire = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', IO);
  return {
    created,
    report(isIntersecting: boolean) {
      act(() => {
        fire([{ isIntersecting }]);
      });
    },
  };
}

function enableMotionScale() {
  document.documentElement.style.setProperty('--dur-tell', '500ms');
}

function mockMatchMedia(matches: boolean) {
  const mql = { matches, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql));
}

function attach(top: number) {
  vi.stubGlobal('innerHeight', VIEWPORT);
  const node = document.createElement('section');
  document.body.appendChild(node);
  node.getBoundingClientRect = () =>
    ({ top, bottom: top + 300, height: 300 }) as ReturnType<Element['getBoundingClientRect']>;

  const rendered = renderHook(() => useRevealOnView());
  act(() => {
    rendered.result.current(node);
  });
  return { node, ...rendered };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.documentElement.style.removeProperty('--dur-tell');
  document.body.innerHTML = '';
});

describe('useRevealOnView', () => {
  it('holds a scene that mounts below the fold', () => {
    enableMotionScale();
    stubObserver();

    const { node } = attach(VIEWPORT + 200);

    expect(node.hasAttribute('data-held')).toBe(true);
  });

  it('releases the hold once the scene is reported on screen', () => {
    enableMotionScale();
    const observer = stubObserver();

    const { node } = attach(VIEWPORT + 200);
    expect(node.hasAttribute('data-held')).toBe(true);

    observer.report(true);

    expect(node.hasAttribute('data-held')).toBe(false);
  });

  it('keeps holding while the observer reports the scene still off screen', () => {
    enableMotionScale();
    const observer = stubObserver();

    const { node } = attach(VIEWPORT + 200);
    observer.report(false);

    expect(node.hasAttribute('data-held')).toBe(true);
  });

  it('never holds a scene that is already on screen at mount', () => {
    enableMotionScale();
    const observer = stubObserver();

    const { node } = attach(100);

    expect(node.hasAttribute('data-held')).toBe(false);
    expect(observer.created).toHaveLength(0);
  });

  it('never holds when no motion scale is loaded', () => {
    stubObserver();

    const { node } = attach(VIEWPORT + 200);

    expect(node.hasAttribute('data-held')).toBe(false);
  });

  it('never holds when the reader prefers reduced motion', () => {
    enableMotionScale();
    mockMatchMedia(true);
    const observer = stubObserver();

    const { node } = attach(VIEWPORT + 200);

    expect(node.hasAttribute('data-held')).toBe(false);
    expect(observer.created).toHaveLength(0);
  });

  it('never holds when there is no IntersectionObserver to release it', () => {
    enableMotionScale();
    vi.stubGlobal('IntersectionObserver', undefined);

    const { node } = attach(VIEWPORT + 200);

    expect(node.hasAttribute('data-held')).toBe(false);
  });

  it('releases the hold on unmount', () => {
    enableMotionScale();
    stubObserver();

    const { node, unmount } = attach(VIEWPORT + 200);
    expect(node.hasAttribute('data-held')).toBe(true);

    unmount();

    expect(node.hasAttribute('data-held')).toBe(false);
  });
});
