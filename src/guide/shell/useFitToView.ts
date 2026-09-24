import { useCallback, useEffect, useState } from 'react';

const FLOOR = 0.5;

export function useFitToView(): (node: HTMLElement | null) => void {
  const [box, setBox] = useState<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => setBox(node), []);

  useEffect(() => {
    if (!box) return;
    const inner = box.firstElementChild;
    if (!(inner instanceof HTMLElement)) return;

    const fit = () => {
      const tall = inner.offsetHeight;
      const wide = inner.offsetWidth;
      const room = box.clientHeight;
      const across = box.clientWidth;
      if (!tall || !room) {
        inner.style.setProperty('--guide-fit', '1');
        return;
      }
      const ratios = [room / tall];
      if (wide && across) ratios.push(across / wide);
      inner.style.setProperty(
        '--guide-fit',
        Math.min(1, Math.max(FLOOR, Math.min(...ratios))).toFixed(3),
      );
    };

    fit();
    if (typeof ResizeObserver !== 'function') return;
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [box]);

  return ref;
}
