import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function prefersReduced(): boolean {
  return typeof window.matchMedia !== 'undefined' && window.matchMedia(QUERY).matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => prefersReduced());

  useEffect(() => {
    if (typeof window.matchMedia === 'undefined') {
      return;
    }
    const mql = window.matchMedia(QUERY);
    const update = () => setReduced(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return reduced;
}
