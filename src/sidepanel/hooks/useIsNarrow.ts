import { useState, useEffect } from 'react';

function isBelow(maxWidthPx: number): boolean {
  return typeof window !== 'undefined' && window.innerWidth < maxWidthPx;
}

export function useIsNarrow(maxWidthPx: number): boolean {
  const [narrow, setNarrow] = useState(() => isBelow(maxWidthPx));

  useEffect(() => {
    const update = () => setNarrow(isBelow(maxWidthPx));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [maxWidthPx]);

  return narrow;
}
