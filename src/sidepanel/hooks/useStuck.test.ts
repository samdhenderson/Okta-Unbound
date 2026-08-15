import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStuck } from './useStuck';

type Entry = { isIntersecting: boolean };
type Callback = (entries: Entry[]) => void;

interface Armed {
  callback: Callback;
  rootMargin?: string;
}

let armed: Armed[] = [];
const originalIntersectionObserver = globalThis.IntersectionObserver;

const makeSticky = (offset: number): HTMLElement => {
  const node = document.createElement('div');
  node.style.position = 'sticky';
  node.style.top = `${offset}px`;
  return node;
};

beforeEach(() => {
  armed = [];
  globalThis.IntersectionObserver = class {
    constructor(callback: Callback, options?: { rootMargin?: string }) {
      armed.push({ callback, rootMargin: options?.rootMargin });
    }
    observe() {}
    disconnect() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  globalThis.IntersectionObserver = originalIntersectionObserver;
  document.body.innerHTML = '';
});

describe('useStuck', () => {
  const setup = (offset = 44, enabled = true) => {
    const sentinel = document.createElement('div');
    const sticky = makeSticky(offset);
    document.body.append(sentinel, sticky);
    return {
      sentinel,
      sticky,
      ...renderHook(() => useStuck({ current: sentinel }, { current: sticky }, enabled)),
    };
  };

  it('starts unpinned', () => {
    const { result } = setup();

    expect(result.current).toBe(false);
  });

  it('reports pinned once the sentinel stops intersecting', () => {
    const { result } = setup();

    act(() => armed[0].callback([{ isIntersecting: false }]));

    expect(result.current).toBe(true);
  });

  it('reports unpinned again when the sentinel comes back', () => {
    const { result } = setup();

    act(() => armed[0].callback([{ isIntersecting: false }]));
    act(() => armed[0].callback([{ isIntersecting: true }]));

    expect(result.current).toBe(false);
  });

  it("shifts the observer's top edge onto the sticky element's own offset", () => {
    setup(44);

    expect(armed[0].rootMargin).toBe('-44px 0px 0px 0px');
  });

  it('falls back to no offset when the element is not sticky', () => {
    const sentinel = document.createElement('div');
    const sticky = document.createElement('div');
    document.body.append(sentinel, sticky);

    renderHook(() => useStuck({ current: sentinel }, { current: sticky }));

    expect(armed[0].rootMargin).toBe('-0px 0px 0px 0px');
  });

  it('observes nothing while disabled', () => {
    const { result } = setup(44, false);

    expect(armed).toHaveLength(0);
    expect(result.current).toBe(false);
  });

  it('no-ops where IntersectionObserver is unavailable rather than throwing', () => {
    // @ts-expect-error — deliberately removing the API the hook guards on.
    delete globalThis.IntersectionObserver;

    const { result } = setup();

    expect(result.current).toBe(false);
  });
});
