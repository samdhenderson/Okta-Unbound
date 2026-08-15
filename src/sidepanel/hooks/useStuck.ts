import { useEffect, useState, type RefObject } from 'react';

export function useStuck(
  sentinelRef: RefObject<HTMLElement | null>,
  stickyRef: RefObject<HTMLElement | null>,
  enabled = true,
): boolean {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setStuck(false);
      return;
    }
    const sentinel = sentinelRef.current;
    const sticky = stickyRef.current;
    if (!sentinel || !sticky || typeof IntersectionObserver !== 'function') return;

    let observer: IntersectionObserver | null = null;

    const observe = () => {
      observer?.disconnect();
      const offset = Number.parseFloat(window.getComputedStyle(sticky).top) || 0;
      observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
        rootMargin: `-${offset}px 0px 0px 0px`,
        threshold: 0,
      });
      observer.observe(sentinel);
    };

    observe();
    window.addEventListener('resize', observe);

    return () => {
      window.removeEventListener('resize', observe);
      observer?.disconnect();
    };
  }, [sentinelRef, stickyRef, enabled]);

  return stuck;
}
