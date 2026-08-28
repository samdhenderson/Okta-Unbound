import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

const COUNT_UP_MS = 500;

function motionAvailable(): boolean {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return false;
  if (document.querySelector('[data-motion="off"]')) return false;
  return getComputedStyle(document.documentElement).getPropertyValue('--dur-tell').trim() !== '';
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export interface UseCountUpOptions {
  enabled?: boolean;
}

export interface UseCountUpResult {
  value: number;
  justResolved: boolean;
}

export function useCountUp(target: number, options: UseCountUpOptions = {}): UseCountUpResult {
  const { enabled = true } = options;
  const reduced = useReducedMotion();
  const animates = enabled && !reduced && motionAvailable();

  const [display, setDisplay] = useState(() => (animates ? 0 : target));
  const [seenTarget, setSeenTarget] = useState(target);
  const [justResolved, setJustResolved] = useState(false);

  const displayRef = useRef(display);

  if (target !== seenTarget) {
    setSeenTarget(target);
    if (!animates) setDisplay(target);
    if (enabled) setJustResolved(true);
  }

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    const from = displayRef.current;
    if (!animates || from === target) {
      if (from !== target) {
        displayRef.current = target;
        setDisplay(target);
      }
      return;
    }

    const start = performance.now();
    const distance = target - from;
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_UP_MS);
      const next = progress >= 1 ? target : Math.round(from + distance * easeOut(progress));
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, animates]);

  useEffect(() => {
    if (!justResolved) return undefined;
    const timer = setTimeout(() => setJustResolved(false), COUNT_UP_MS);
    return () => clearTimeout(timer);
  }, [justResolved]);

  return { value: display, justResolved };
}
