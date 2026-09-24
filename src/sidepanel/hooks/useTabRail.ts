import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type React from 'react';

export type TabRailEdge = 'none' | 'start' | 'end' | 'both';

export interface TabRailIndicator {
  left: number;
  width: number;
}

export interface UseTabRailOptions {
  listRef: React.RefObject<HTMLElement | null>;
  activeKey: string;
  tabCount: number;
  reducedMotion: boolean;
}

export interface TabRailState {
  edge: TabRailEdge;
  indicator: TabRailIndicator;
  sliding: boolean;
}

const SLIDE_MS = 220;

const EPSILON = 1;

function readEdge(list: HTMLElement): TabRailEdge {
  const max = list.scrollWidth - list.clientWidth;
  if (max <= EPSILON) return 'none';
  const atStart = list.scrollLeft <= EPSILON;
  const atEnd = list.scrollLeft >= max - EPSILON;
  if (atStart) return 'end';
  if (atEnd) return 'start';
  return 'both';
}

function findActive(list: HTMLElement): HTMLElement | null {
  return list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
}

export function useTabRail({
  listRef,
  activeKey,
  tabCount,
  reducedMotion,
}: UseTabRailOptions): TabRailState {
  const [edge, setEdge] = useState<TabRailEdge>('none');
  const [indicator, setIndicator] = useState<TabRailIndicator>({ left: 0, width: 0 });
  const [sliding, setSliding] = useState(false);
  const frameRef = useRef(0);
  const lastKeyRef = useRef(activeKey);
  const scrolledKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (lastKeyRef.current === activeKey) return;
    lastKeyRef.current = activeKey;
    if (reducedMotion) return;
    setSliding(true);
    const timer = window.setTimeout(() => setSliding(false), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [activeKey, reducedMotion]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const nextEdge = readEdge(list);
      const active = findActive(list);
      const left = active ? active.offsetLeft : 0;
      const width = active ? active.offsetWidth : 0;
      setEdge((prev) => (prev === nextEdge ? prev : nextEdge));
      setIndicator((prev) => (prev.left === left && prev.width === width ? prev : { left, width }));
    };

    measure();

    const onScroll = () => {
      const next = readEdge(list);
      setEdge((prev) => (prev === next ? prev : next));
    };
    list.addEventListener('scroll', onScroll, { passive: true });

    const schedule = () => {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;
        measure();
      });
    };

    const observer =
      typeof window.ResizeObserver === 'undefined'
        ? null
        : new window.ResizeObserver(() => schedule());
    if (observer) {
      observer.observe(list);
      const active = findActive(list);
      if (active) observer.observe(active);
    }

    return () => {
      list.removeEventListener('scroll', onScroll);
      observer?.disconnect();
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
  }, [listRef, activeKey, tabCount]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || scrolledKeyRef.current === activeKey) return;
    scrolledKeyRef.current = activeKey;
    const active = findActive(list);
    if (!active) return;
    const start = active.offsetLeft;
    const end = start + active.offsetWidth;
    const clipped = start < list.scrollLeft || end > list.scrollLeft + list.clientWidth;
    if (!clipped) return;
    active.scrollIntoView?.({
      inline: 'nearest',
      block: 'nearest',
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [listRef, activeKey, reducedMotion]);

  return { edge, indicator, sliding };
}
