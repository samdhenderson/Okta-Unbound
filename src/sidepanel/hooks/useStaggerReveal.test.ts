import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, render, act } from '@testing-library/react';
import { createElement, type ReactElement } from 'react';
import { useStaggerReveal } from './useStaggerReveal';

function makeContainer(n: number) {
  const el = document.createElement('div');
  el.className = 'rise-in-stagger';
  for (let i = 0; i < n; i++) el.appendChild(document.createElement('div'));
  document.body.appendChild(el);
  return el;
}

function attach(n: number, enabled?: boolean) {
  const el = makeContainer(n);
  const rendered = renderHook(({ on }: { on?: boolean }) => useStaggerReveal(on), {
    initialProps: { on: enabled },
  });
  act(() => {
    rendered.result.current(el);
  });
  return { el, ...rendered };
}

function stubObserver() {
  const observed = new Set<Element>();
  let fire: (entries: { target: Element; isIntersecting: boolean }[]) => void = () => {};
  class IO {
    constructor(cb: (entries: unknown[]) => void) {
      fire = (entries) => cb(entries as unknown[]);
    }
    observe(el: Element) {
      observed.add(el);
    }
    unobserve(el: Element) {
      observed.delete(el);
    }
    disconnect() {
      observed.clear();
    }
  }
  vi.stubGlobal('IntersectionObserver', IO);
  return {
    observed,
    fire: (entries: { target: Element; isIntersecting: boolean }[]) => fire(entries),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('useStaggerReveal', () => {
  it('does nothing when IntersectionObserver is unavailable, so rows are never held invisible', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { el } = attach(3);

    expect(el.hasAttribute('data-stagger-reveal')).toBe(false);
  });

  it('marks the container only once the observer exists', () => {
    stubObserver();
    const { el } = attach(3);

    expect(el.getAttribute('data-stagger-reveal')).toBe('on');
  });

  it('observes every child that has not yet been revealed', () => {
    const { observed } = stubObserver();
    const { el } = attach(4);

    expect(observed.size).toBe(4);
    expect(Array.from(observed)).toEqual(Array.from(el.children));
  });

  it('reveals intersecting rows and cascades their delay in DOM order', () => {
    const { fire } = stubObserver();
    const { el } = attach(3);

    const children = Array.from(el.children) as HTMLElement[];
    fire([
      { target: children[2], isIntersecting: true },
      { target: children[0], isIntersecting: true },
      { target: children[1], isIntersecting: true },
    ]);

    expect(children.map((c) => c.hasAttribute('data-revealed'))).toEqual([true, true, true]);
    expect(children[0].style.getPropertyValue('--reveal-delay')).toBe('0ms');
    expect(children[1].style.getPropertyValue('--reveal-delay')).toBe('24ms');
    expect(children[2].style.getPropertyValue('--reveal-delay')).toBe('48ms');
  });

  it('keeps the full step when a small batch can afford it', () => {
    const { fire } = stubObserver();
    const { el } = attach(9);

    const children = Array.from(el.children) as HTMLElement[];
    fire(children.map((target) => ({ target, isIntersecting: true })));

    expect(children[1].style.getPropertyValue('--reveal-delay')).toBe('24ms');
    expect(children[8].style.getPropertyValue('--reveal-delay')).toBe('192ms');
  });

  it('compresses the step on a tall viewport so the cascade still fits its budget', () => {
    const { fire } = stubObserver();
    const { el } = attach(40);

    const children = Array.from(el.children) as HTMLElement[];
    fire(children.map((target) => ({ target, isIntersecting: true })));

    const delays = children.map((c) => parseFloat(c.style.getPropertyValue('--reveal-delay')));

    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1]);
    }
    expect(delays[delays.length - 1]).toBeLessThanOrEqual(320);
  });

  it('leaves rows that have not intersected alone', () => {
    const { fire } = stubObserver();
    const { el } = attach(3);

    const children = Array.from(el.children) as HTMLElement[];
    fire([
      { target: children[0], isIntersecting: true },
      { target: children[1], isIntersecting: false },
    ]);

    expect(children[0].hasAttribute('data-revealed')).toBe(true);
    expect(children[1].hasAttribute('data-revealed')).toBe(false);
  });

  it('stops observing a row once revealed, so scrolling back does not replay it', () => {
    const { observed, fire } = stubObserver();
    const { el } = attach(2);

    const children = Array.from(el.children) as HTMLElement[];
    fire([{ target: children[0], isIntersecting: true }]);

    expect(observed.has(children[0])).toBe(false);
    expect(observed.has(children[1])).toBe(true);
  });

  it('does nothing when disabled', () => {
    stubObserver();
    const { el } = attach(3, false);

    expect(el.hasAttribute('data-stagger-reveal')).toBe(false);
  });

  it('releases the hold on unmount', () => {
    stubObserver();
    const { el, unmount } = attach(3);
    expect(el.getAttribute('data-stagger-reveal')).toBe('on');

    unmount();
    expect(el.hasAttribute('data-stagger-reveal')).toBe(false);
  });

  it('engages when the container mounts on a later commit than the hook', () => {
    stubObserver();

    function List({ ready }: { ready: boolean }): ReactElement {
      const setStaggerRef = useStaggerReveal();

      if (!ready) return createElement('div', { 'data-testid': 'empty' });

      return createElement(
        'div',
        { ref: setStaggerRef, className: 'rise-in-stagger', 'data-testid': 'rows' },
        createElement('div', { key: 'a' }),
        createElement('div', { key: 'b' }),
      );
    }

    const { queryByTestId, getByTestId, rerender } = render(createElement(List, { ready: false }));

    expect(queryByTestId('rows')).toBeNull();

    rerender(createElement(List, { ready: true }));

    expect(getByTestId('rows').getAttribute('data-stagger-reveal')).toBe('on');
  });

  it('re-arms on a fresh container when the list swaps to a placeholder and back', () => {
    stubObserver();

    function List({ ready }: { ready: boolean }): ReactElement {
      const setStaggerRef = useStaggerReveal();
      if (!ready) return createElement('p', { 'data-testid': 'placeholder' });
      return createElement(
        'div',
        { ref: setStaggerRef, className: 'rise-in-stagger', 'data-testid': 'rows' },
        createElement('div', { key: 'a' }),
      );
    }

    const { getByTestId, rerender } = render(createElement(List, { ready: true }));
    const first = getByTestId('rows');
    expect(first.getAttribute('data-stagger-reveal')).toBe('on');

    rerender(createElement(List, { ready: false }));
    expect(first.hasAttribute('data-stagger-reveal')).toBe(false);

    rerender(createElement(List, { ready: true }));
    const second = getByTestId('rows');
    expect(second).not.toBe(first);
    expect(second.getAttribute('data-stagger-reveal')).toBe('on');
  });
});
