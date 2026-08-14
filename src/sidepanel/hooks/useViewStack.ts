import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ViewStackCrumb {
  key: string;
  label: string;
  depth: number;
  isCurrent: boolean;
  onSelect?: () => void;
}

export interface UseViewStackOptions<TEntry> {
  rootLabel: string;
  getLabel: (entry: TEntry) => string;
  getKey?: (entry: TEntry, depth: number) => string;
  viewRef?: React.RefObject<HTMLElement | null>;
  manageFocus?: boolean;
}

export type ViewStackTransition = 'push' | 'pop' | null;

export interface ViewStack<TEntry> {
  entries: readonly TEntry[];
  currentEntry: TEntry | undefined;
  depth: number;
  isRoot: boolean;
  trail: ViewStackCrumb[];
  transition: ViewStackTransition;
  push: (entry: TEntry) => void;
  pop: () => void;
  popTo: (depth: number) => void;
  reset: () => void;
}

export function useViewStack<TEntry>({
  rootLabel,
  getLabel,
  getKey,
  viewRef,
  manageFocus = true,
}: UseViewStackOptions<TEntry>): ViewStack<TEntry> {
  const [{ entries, transition }, setState] = useState<{
    entries: readonly TEntry[];
    transition: ViewStackTransition;
  }>({ entries: [], transition: null });
  const depth = entries.length;

  const focusOrigins = useRef<(HTMLElement | null)[]>([]);
  const pendingOrigin = useRef<HTMLElement | null>(null);
  const previousDepth = useRef(0);

  const push = useCallback((entry: TEntry) => {
    pendingOrigin.current = document.activeElement as HTMLElement | null;
    setState((prev) => ({ entries: [...prev.entries, entry], transition: 'push' }));
  }, []);

  const popTo = useCallback((targetDepth: number) => {
    const next = Math.max(0, targetDepth);
    setState((prev) =>
      next >= prev.entries.length
        ? prev
        : { entries: prev.entries.slice(0, next), transition: 'pop' },
    );
  }, []);

  const pop = useCallback(() => {
    setState((prev) =>
      prev.entries.length === 0
        ? prev
        : { entries: prev.entries.slice(0, prev.entries.length - 1), transition: 'pop' },
    );
  }, []);

  const reset = useCallback(() => {
    setState((prev) => (prev.entries.length === 0 ? prev : { entries: [], transition: 'pop' }));
  }, []);

  useEffect(() => {
    const previous = previousDepth.current;
    previousDepth.current = depth;
    if (depth === previous) return;

    if (depth > previous) {
      focusOrigins.current[previous] = pendingOrigin.current;
      pendingOrigin.current = null;
      if (!manageFocus) return;
      const node = viewRef?.current;
      if (!node) return;
      const first = node.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? node).focus?.();
      return;
    }

    const origin = focusOrigins.current[depth] ?? null;
    focusOrigins.current.length = depth;
    if (!manageFocus) return;
    if (origin?.isConnected) origin.focus?.();
  }, [depth, manageFocus, viewRef]);

  const trail = useMemo<ViewStackCrumb[]>(() => {
    const crumbs: ViewStackCrumb[] = [
      {
        key: 'view-stack-root',
        label: rootLabel,
        depth: 0,
        isCurrent: entries.length === 0,
        onSelect: entries.length === 0 ? undefined : () => popTo(0),
      },
    ];

    entries.forEach((entry, index) => {
      const crumbDepth = index + 1;
      const isCurrent = crumbDepth === entries.length;
      crumbs.push({
        key: getKey ? getKey(entry, crumbDepth) : `view-stack-${crumbDepth}`,
        label: getLabel(entry),
        depth: crumbDepth,
        isCurrent,
        onSelect: isCurrent ? undefined : () => popTo(crumbDepth),
      });
    });

    return crumbs;
  }, [entries, rootLabel, getLabel, getKey, popTo]);

  return {
    entries,
    currentEntry: entries.length === 0 ? undefined : entries[entries.length - 1],
    depth,
    isRoot: depth === 0,
    trail,
    transition,
    push,
    pop,
    popTo,
    reset,
  };
}
