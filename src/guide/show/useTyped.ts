import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../sidepanel/hooks/useReducedMotion';
import { motionAvailable, readDurToken } from './motion';

export function useTyped(text: string, live: boolean): string {
  const reduced = useReducedMotion();
  const animates = !reduced && motionAvailable();
  const [shown, setShown] = useState(0);

  const [seen, setSeen] = useState(text);
  if (text !== seen) {
    setSeen(text);
    setShown(0);
  }

  useEffect(() => {
    if (!live || !animates) return;
    const step = readDurToken('--dur-quick');
    let count = 0;
    const id = window.setInterval(() => {
      count += 1;
      setShown(count);
      if (count >= text.length) window.clearInterval(id);
    }, step);
    return () => window.clearInterval(id);
  }, [text, live, animates]);

  if (!live) return '';
  return animates ? text.slice(0, shown) : text;
}
