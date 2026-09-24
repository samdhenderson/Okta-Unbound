import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from '../../sidepanel/hooks/useReducedMotion';
import { motionAvailable } from '../show/motion';

const REACH = '0px 0px -10% 0px';

export function useRevealOnView(): (node: HTMLElement | null) => void {
  const reduced = useReducedMotion();
  const [node, setNode] = useState<HTMLElement | null>(null);
  const ref = useCallback((el: HTMLElement | null) => setNode(el), []);

  useEffect(() => {
    if (!node || reduced || !motionAvailable()) return;
    if (typeof IntersectionObserver !== 'function') return;

    const rect = node.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < viewport * 0.9 && rect.bottom > 0) return;

    node.setAttribute('data-held', '');
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        node.removeAttribute('data-held');
        observer.disconnect();
      },
      { rootMargin: REACH },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      node.removeAttribute('data-held');
    };
  }, [node, reduced]);

  return ref;
}
