import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { fitActions } from './actionBarFit';

export interface MeasurableAction {
  id: string;
  label: string;
  icon?: string;
  variant?: string;
  loading?: boolean;
}

export interface ActionOverflowRefs {
  band: RefObject<HTMLDivElement | null>;
  probe: RefObject<HTMLDivElement | null>;
  sentinel: RefObject<HTMLDivElement | null>;
  cluster: RefObject<HTMLElement | null>;
  more: RefObject<HTMLButtonElement | null>;
}

export interface ActionOverflowState {
  inBar: number;
  compact: boolean;
  measuring: boolean;
}

export interface ActionOverflowOptions {
  pinned: number;
  tierAlwaysPresent: boolean;
  tierOpen: boolean;
  refs: ActionOverflowRefs;
}

interface CacheEntry {
  signature: string;
  full: number;
  compact: number;
}

function signatureOf(action: MeasurableAction): string {
  return `${action.label}|${action.icon ?? ''}|${action.variant ?? 'secondary'}|${
    action.loading ? 1 : 0
  }`;
}

function readPx(style: CSSStyleDeclaration, property: string, fallback: string): number {
  const raw = style.getPropertyValue(property) || style.getPropertyValue(fallback);
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function useActionOverflow(
  actions: readonly MeasurableAction[],
  options: ActionOverflowOptions,
): ActionOverflowState {
  const { pinned, tierAlwaysPresent, tierOpen, refs } = options;

  const [split, setSplit] = useState<{ inBar: number; compact: boolean }>(() => ({
    inBar: actions.length,
    compact: false,
  }));
  const [measuring, setMeasuring] = useState(false);

  const splitRef = useRef(split);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const clusterWidthRef = useRef(0);
  const clusterMeasuredRef = useRef(false);
  const lastWidthRef = useRef(Number.NaN);
  const pendingRef = useRef(true);
  const lastFocusedActionIdRef = useRef<string | null>(null);
  const recoverRef = useRef<{ from: number; to: number } | null>(null);
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const rowOf = (band: HTMLElement): HTMLElement | null => {
    const viaCluster = refs.cluster.current?.parentElement;
    if (viaCluster instanceof HTMLElement && band.contains(viaCluster)) return viaCluster;
    const probe = refs.probe.current;
    for (const child of band.children) {
      if (!(child instanceof HTMLElement)) continue;
      if (probe && (child === probe || child.contains(probe))) continue;
      return child;
    }
    return null;
  };

  const readProbe = (
    probe: HTMLElement,
    stale: readonly MeasurableAction[],
    cache: Map<string, CacheEntry>,
  ): boolean => {
    const widthOf = (kind: 'full' | 'compact', id: string): number => {
      const nodes = probe.querySelectorAll<HTMLElement>(`[data-measure="${kind}"]`);
      for (const node of nodes) {
        if (node.dataset.actionId === id) return node.getBoundingClientRect().width;
      }
      return 0;
    };

    const measured: CacheEntry[] = [];
    for (const action of stale) {
      const full = widthOf('full', action.id);
      const compact = widthOf('compact', action.id);
      if (full <= 0 || compact <= 0) return false;
      measured.push({ signature: signatureOf(action), full, compact });
    }

    const clusterNode = probe.querySelector<HTMLElement>('[data-measure="cluster"]');
    let clusterWidth = 0;
    if (clusterNode) {
      clusterWidth = clusterNode.getBoundingClientRect().width;
      if (clusterWidth <= 0) return false;
    }

    stale.forEach((action, index) => cache.set(action.id, measured[index]));
    clusterWidthRef.current = clusterWidth;
    clusterMeasuredRef.current = true;
    return true;
  };

  const findActionNode = (band: HTMLElement, id: string): HTMLElement | null => {
    const probe = refs.probe.current;
    const nodes = band.querySelectorAll<HTMLElement>('[data-action-id]');
    for (const node of nodes) {
      if (node.dataset.actionId !== id) continue;
      if (probe && probe.contains(node)) continue;
      return node;
    }
    return null;
  };

  const recoverFocus = (from: number, to: number): void => {
    const band = refs.band.current;
    const id = lastFocusedActionIdRef.current;
    if (!band || id === null) return;

    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body && band.contains(active)) return;

    const index = actionsRef.current.findIndex((action) => action.id === id);
    if (index < 0) return;

    const movedOut = index >= to && index < from;
    const movedIn = index < to && index >= from;
    if (!movedOut && !movedIn) return;

    if (movedOut && !tierOpen) {
      refs.more.current?.focus();
      return;
    }

    const node = findActionNode(band, id);
    node?.focus();
    if (document.activeElement !== node) refs.more.current?.focus();
  };

  const publish = (): void => {
    const band = refs.band.current;
    if (!band) return;
    if (band.clientWidth <= 0) return;

    const bandRect = band.getBoundingClientRect();

    band.style.setProperty('--bar-bleed', `${Math.round(bandRect.left)}px`);

    const sentinel = refs.sentinel.current;
    const host = band.parentElement;
    if (sentinel && host) {
      const offset = Math.max(0, Math.round(bandRect.top - sentinel.getBoundingClientRect().top));
      host.style.setProperty('--dock-offset', `${offset}px`);
    }
  };

  const runPass = (): void => {
    if (typeof ResizeObserver !== 'function') return;
    const band = refs.band.current;
    if (!band) return;

    const width = band.clientWidth;
    if (width <= 0) {
      pendingRef.current = true;
      return;
    }

    const current = actionsRef.current;
    const cache = cacheRef.current;
    const stale = current.filter((action) => {
      const entry = cache.get(action.id);
      return entry === undefined || entry.signature !== signatureOf(action);
    });
    const needsProbe = stale.length > 0 || !clusterMeasuredRef.current;

    if (!pendingRef.current && !needsProbe && Math.abs(width - lastWidthRef.current) < 1) return;

    if (needsProbe) {
      const probe = refs.probe.current;
      if (!probe) {
        pendingRef.current = true;
        setMeasuring(true);
        return;
      }
      if (!readProbe(probe, stale, cache)) {
        pendingRef.current = true;
        return;
      }
    }

    const row = rowOf(band);
    let gap = 0;
    let available = Math.floor(width);
    if (row) {
      const rowStyle = getComputedStyle(row);
      gap = readPx(rowStyle, 'column-gap', 'gap');
      available = Math.floor(
        row.clientWidth -
          readPx(rowStyle, 'padding-inline-start', 'padding-left') -
          readPx(rowStyle, 'padding-inline-end', 'padding-right'),
      );
    }

    if (available <= 0) {
      pendingRef.current = true;
      return;
    }

    const widths: number[] = [];
    const compactWidths: number[] = [];
    for (const action of current) {
      const entry = cache.get(action.id);
      widths.push(entry?.full ?? 0);
      compactWidths.push(entry?.compact ?? 0);
    }

    const next = fitActions({
      widths,
      compactWidths,
      available,
      gap,
      overflowWidth: clusterWidthRef.current,
      pinned,
      tierAlwaysPresent,
      previous: splitRef.current.inBar,
    });

    lastWidthRef.current = width;
    pendingRef.current = false;
    setMeasuring(false);

    const previous = splitRef.current;
    if (next.inBar !== previous.inBar || next.compact !== previous.compact) {
      if (next.inBar !== previous.inBar) {
        recoverRef.current = { from: previous.inBar, to: next.inBar };
      }
      splitRef.current = next;
      setSplit(next);
    }

    publish();
  };

  const passRef = useRef(runPass);
  useLayoutEffect(() => {
    passRef.current = runPass;
  });

  useLayoutEffect(() => {
    const band = refs.band.current;
    if (!band || typeof ResizeObserver !== 'function') return;

    const remember = (event: FocusEvent) => {
      const target = event.target;
      const owner = target instanceof Element ? target.closest('[data-action-id]') : null;
      lastFocusedActionIdRef.current =
        owner instanceof HTMLElement ? (owner.dataset.actionId ?? null) : null;
    };
    band.addEventListener('focusin', remember);

    const observer = new ResizeObserver(() => passRef.current());
    observer.observe(band);
    passRef.current();

    return () => {
      band.removeEventListener('focusin', remember);
      observer.disconnect();
      band.style.removeProperty('--bar-bleed');
      band.parentElement?.style.removeProperty('--dock-offset');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actionsSignature = `${actions.map(signatureOf).join('\x00')}|${pinned}|${tierAlwaysPresent}`;
  useLayoutEffect(() => {
    pendingRef.current = true;
    passRef.current();
  }, [actionsSignature]);

  useLayoutEffect(() => {
    if (measuring) passRef.current();
  }, [measuring]);

  useLayoutEffect(() => {
    if (typeof ResizeObserver !== 'function') return;
    publish();
    const pending = recoverRef.current;
    if (!pending) return;
    recoverRef.current = null;
    recoverFocus(pending.from, pending.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [split]);

  useLayoutEffect(() => {
    if (typeof ResizeObserver !== 'function') return;
    const fonts: FontFaceSet | undefined = document.fonts;
    if (!fonts) return;
    let cancelled = false;
    void fonts.ready.then(() => {
      if (cancelled) return;
      cacheRef.current.clear();
      clusterMeasuredRef.current = false;
      pendingRef.current = true;
      setMeasuring(true);
      passRef.current();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasObserver = typeof ResizeObserver === 'function';
  return useMemo(
    () =>
      hasObserver
        ? { inBar: Math.min(split.inBar, actions.length), compact: split.compact, measuring }
        : { inBar: actions.length, compact: false, measuring: false },
    [hasObserver, split.inBar, split.compact, measuring, actions.length],
  );
}
