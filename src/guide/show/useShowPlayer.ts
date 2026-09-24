import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../sidepanel/hooks/useReducedMotion';
import { motionAvailable, readDurToken } from './motion';

export type ShowState = 'waiting' | 'playing' | 'done';

export interface ShowPlayer {
  beat: number;
  state: ShowState;
  ref: (node: HTMLElement | null) => void;
}

const START_RATIO = 0.5;

export function useShowPlayer(
  beatCount: number,
  holds: ReadonlyArray<number | undefined>,
): ShowPlayer {
  const reduced = useReducedMotion();
  const last = Math.max(0, beatCount - 1);
  const [stage, setStage] = useState<HTMLElement | null>(null);
  const [beat, setBeat] = useState(0);
  const [state, setState] = useState<ShowState>('waiting');
  const started = useRef(false);
  const holdsRef = useRef(holds);
  useEffect(() => {
    holdsRef.current = holds;
  });

  const ref = useCallback((node: HTMLElement | null) => setStage(node), []);

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  useEffect(() => {
    if (started.current) return;
    const plays =
      !reduced && motionAvailable() && typeof IntersectionObserver === 'function' && last > 0;
    if (!plays) {
      started.current = true;
      setBeat(last);
      setState('done');
      return;
    }
    if (!stage) return;

    const run = () => {
      started.current = true;
      setState('playing');
      const tell = readDurToken('--dur-tell');
      let at = 0;
      for (let target = 1; target <= last; target += 1) {
        at += (holdsRef.current[target - 1] ?? 2) * tell;
        timers.current.push(
          window.setTimeout(() => {
            setBeat(target);
            if (target === last) setState('done');
          }, at),
        );
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || !entry.isIntersecting) return;
        const visible = entry.intersectionRect.height;
        const own = entry.boundingClientRect.height;
        const root = entry.rootBounds?.height ?? own;
        if (visible >= START_RATIO * Math.min(own, root)) {
          observer.disconnect();
          run();
        }
      },
      { threshold: [0, START_RATIO, 1] },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stage, reduced, last]);

  return { beat, state, ref };
}
