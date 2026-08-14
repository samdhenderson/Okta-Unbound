import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

const STEP_MS = 24;

const CASCADE_BUDGET_MS = 320;

export function useStaggerReveal(enabled = true): (node: HTMLElement | null) => void {
  const reduced = useReducedMotion();
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const setStaggerRef = useCallback((node: HTMLElement | null) => {
    setContainer(node);
  }, []);

  useEffect(() => {
    if (!container || !enabled || reduced) return;
    if (typeof IntersectionObserver !== 'function') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const arrived = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) =>
            a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
          );

        const gaps = Math.max(arrived.length - 1, 1);
        const step = Math.min(STEP_MS, CASCADE_BUDGET_MS / gaps);

        arrived.forEach((el, index) => {
          el.style.setProperty('--reveal-delay', `${Math.round(index * step)}ms`);
          el.setAttribute('data-revealed', '');
          observer.unobserve(el);
        });
      },
      { rootMargin: '0px 0px 12% 0px' },
    );

    const observeChildren = () => {
      for (const child of Array.from(container.children)) {
        if (!child.hasAttribute('data-revealed')) observer.observe(child);
      }
    };

    container.setAttribute('data-stagger-reveal', 'on');
    observeChildren();

    const mutations =
      typeof MutationObserver === 'function' ? new MutationObserver(observeChildren) : null;
    mutations?.observe(container, { childList: true });

    return () => {
      observer.disconnect();
      mutations?.disconnect();
      container.removeAttribute('data-stagger-reveal');
    };
  }, [container, enabled, reduced]);

  return setStaggerRef;
}
