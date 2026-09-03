import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useActionOverflow,
  type ActionOverflowRefs,
  type MeasurableAction,
} from './useActionOverflow';

type ObserverCallback = () => void;

let callbacks: ObserverCallback[] = [];
const originalResizeObserver = globalThis.ResizeObserver;

function installObserver(): void {
  globalThis.ResizeObserver = class {
    constructor(callback: ObserverCallback) {
      callbacks.push(callback);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

const resize = (): void => {
  act(() => {
    callbacks.forEach((callback) => callback());
  });
};

interface Rect {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

function setRect(node: HTMLElement, { left = 0, top = 0, width = 0, height = 24 }: Rect): void {
  node.getBoundingClientRect = () =>
    ({
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      x: left,
      y: top,
    }) as DOMRect;
}

function setClientWidth(node: HTMLElement, value: number): void {
  Object.defineProperty(node, 'clientWidth', { value, configurable: true });
}

const ACTIONS: readonly MeasurableAction[] = [
  { id: 'a', label: 'Add group', icon: 'plus', variant: 'primary' },
  { id: 'b', label: 'Compare', icon: 'users' },
  { id: 'c', label: 'Export', icon: 'download' },
];

interface Fixture {
  parent: HTMLElement;
  sentinel: HTMLDivElement;
  band: HTMLDivElement;
  row: HTMLDivElement;
  cluster: HTMLElement;
  more: HTMLButtonElement;
  probe: HTMLDivElement;
  refs: ActionOverflowRefs;
  setWidth: (width: number) => void;
  setProbeWidths: (full: number, compact: number, cluster?: number) => void;
}

function makeFixture(options: { width?: number; withProbe?: boolean } = {}): Fixture {
  const { width = 332, withProbe = true } = options;

  const parent = document.createElement('div');
  const sentinel = document.createElement('div');
  const band = document.createElement('div');
  const row = document.createElement('div');
  const cluster = document.createElement('span');
  const more = document.createElement('button');
  const probe = document.createElement('div');

  row.style.setProperty('column-gap', '8px');
  row.style.setProperty('padding-left', '8px');
  row.style.setProperty('padding-right', '8px');

  ACTIONS.forEach((action, index) => {
    const wrapper = document.createElement('span');
    wrapper.dataset.actionId = action.id;
    const button = document.createElement('button');
    button.textContent = action.label;
    wrapper.appendChild(button);
    setRect(wrapper, { left: 32 + index * 108, top: 100, width: 100 });
    row.appendChild(wrapper);
  });

  cluster.appendChild(more);
  setRect(cluster, { left: 356, top: 100, width: 50 });
  row.appendChild(cluster);

  probe.append(
    ...ACTIONS.map((action) => {
      const node = document.createElement('span');
      node.dataset.actionId = action.id;
      node.dataset.measure = 'full';
      setRect(node, { width: 100 });
      return node;
    }),
    ...ACTIONS.map((action) => {
      const node = document.createElement('span');
      node.dataset.actionId = action.id;
      node.dataset.measure = 'compact';
      setRect(node, { width: 80 });
      return node;
    }),
  );
  const probeCluster = document.createElement('span');
  probeCluster.dataset.measure = 'cluster';
  setRect(probeCluster, { width: 50 });
  probe.appendChild(probeCluster);

  band.appendChild(row);
  if (withProbe) band.appendChild(probe);
  parent.append(sentinel, band);
  document.body.appendChild(parent);

  setRect(sentinel, { left: 24, top: 76, height: 0 });
  setRect(band, { left: 24, top: 100, width, height: 48 });
  band.style.marginTop = '24px';

  const fixture: Fixture = {
    parent,
    sentinel,
    band,
    row,
    cluster,
    more,
    probe,
    refs: {
      band: { current: band },
      probe: { current: withProbe ? probe : null },
      sentinel: { current: sentinel },
      cluster: { current: cluster },
      more: { current: more },
    },
    setWidth: (next) => {
      setClientWidth(band, next);
      setClientWidth(row, next);
      setRect(band, { left: 24, top: 100, width: next, height: 48 });
    },
    setProbeWidths: (full, compact, clusterWidth = 50) => {
      probe.querySelectorAll<HTMLElement>('[data-measure="full"]').forEach((node) => {
        setRect(node, { width: full });
      });
      probe.querySelectorAll<HTMLElement>('[data-measure="compact"]').forEach((node) => {
        setRect(node, { width: compact });
      });
      setRect(probeCluster, { width: clusterWidth });
    },
  };

  fixture.setWidth(width);
  return fixture;
}

function mount(fixture: Fixture, options: { pinned?: number; tierOpen?: boolean } = {}) {
  return renderHook(() =>
    useActionOverflow(ACTIONS, {
      pinned: options.pinned ?? 0,
      tierAlwaysPresent: false,
      tierOpen: options.tierOpen ?? false,
      refs: fixture.refs,
    }),
  );
}

beforeEach(() => {
  callbacks = [];
  installObserver();
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
  document.body.innerHTML = '';
});

describe('useActionOverflow', () => {
  describe('without a ResizeObserver', () => {
    it('keeps every action in the bar and never asks for a probe', () => {
      globalThis.ResizeObserver = undefined as unknown as typeof ResizeObserver;
      const fixture = makeFixture({ width: 200 });

      const { result } = mount(fixture);

      expect(result.current).toEqual({ inBar: ACTIONS.length, compact: false, measuring: false });
      expect(fixture.band.style.getPropertyValue('--bar-bleed')).toBe('');
    });
  });

  describe('the measured split', () => {
    it('seats every action when the row is wide enough', () => {
      const fixture = makeFixture({ width: 332 }); // available 316 = natural k=3
      const { result } = mount(fixture);

      expect(result.current).toEqual({ inBar: 3, compact: false, measuring: false });
    });

    it('drops the icons before it overflows anything', () => {
      const fixture = makeFixture({ width: 316 }); // available 300: natural k=3 needs 316
      const { result } = mount(fixture);

      expect(result.current).toEqual({ inBar: 3, compact: true, measuring: false });
    });

    it('overflows the tail once a compact row still will not fit', () => {
      const fixture = makeFixture({ width: 266 }); // available 250: compact k=2 needs 226
      const { result } = mount(fixture);

      expect(result.current).toEqual({ inBar: 2, compact: true, measuring: false });
    });

    it('asks the component for a probe when there is nothing to measure from', () => {
      const fixture = makeFixture({ width: 266, withProbe: false });
      const { result } = mount(fixture);

      expect(result.current.measuring).toBe(true);
      expect(result.current.inBar).toBe(ACTIONS.length);
    });
  });

  describe('a hidden rung', () => {
    it('abandons a pass taken at zero width without touching the split', () => {
      const fixture = makeFixture({ width: 0 });

      const { result } = mount(fixture);

      expect(result.current).toEqual({ inBar: 3, compact: false, measuring: false });
      expect(fixture.band.style.getPropertyValue('--bar-bleed')).toBe('');
    });

    it('reads nothing at all while hidden, so the cache stays empty', () => {
      const fixture = makeFixture({ width: 0 });
      const { result } = mount(fixture);

      fixture.refs.probe.current = null;
      fixture.setWidth(266);
      resize();

      expect(result.current).toEqual({ inBar: 3, compact: false, measuring: true });
    });

    it('commits a real split on the first non-zero report, un-poisoned', () => {
      const fixture = makeFixture({ width: 0 });
      const { result } = mount(fixture);
      expect(result.current.inBar).toBe(3);

      fixture.setWidth(266);
      resize();

      expect(result.current).toEqual({ inBar: 2, compact: true, measuring: false });
      expect(fixture.band.style.getPropertyValue('--bar-bleed')).toBe('24px');
    });

    it('keeps the split when the row reports no room to lay out in', () => {
      const fixture = makeFixture({ width: 332 });
      const { result } = mount(fixture);
      expect(result.current.inBar).toBe(3);

      setClientWidth(fixture.row, 0);
      setClientWidth(fixture.band, 300);
      resize();

      expect(result.current).toEqual({ inBar: 3, compact: false, measuring: false });
    });

    it('abandons a pass whose probe measured zero, and recovers from it', () => {
      const fixture = makeFixture({ width: 266 });
      fixture.setProbeWidths(0, 0, 0);

      const { result } = mount(fixture);
      expect(result.current).toEqual({ inBar: 3, compact: false, measuring: false });

      fixture.setProbeWidths(100, 80, 50);
      fixture.setWidth(267);
      resize();

      expect(result.current).toEqual({ inBar: 2, compact: true, measuring: false });
    });
  });

  describe('the loop guard', () => {
    it('ignores a repeated width, and only a repeated width', () => {
      const fixture = makeFixture({ width: 332 });
      const { result } = mount(fixture);
      expect(result.current.inBar).toBe(3);

      setClientWidth(fixture.row, 174);
      resize();
      expect(result.current).toEqual({ inBar: 3, compact: false, measuring: false });

      setClientWidth(fixture.band, 331);
      resize();
      expect(result.current).toEqual({ inBar: 1, compact: true, measuring: false });
    });
  });

  describe('the published variables', () => {
    it('puts --dock-offset on the parent and --bar-bleed on the band', () => {
      const fixture = makeFixture({ width: 500 });

      mount(fixture);

      const band = fixture.band.style;
      const parent = fixture.parent.style;

      expect(band.getPropertyValue('--bar-bleed')).toBe('24px');
      expect(band.getPropertyValue('--dock-offset')).toBe('');

      expect(parent.getPropertyValue('--dock-offset')).toBe('24px');
      expect(parent.getPropertyValue('--bar-bleed')).toBe('');
    });

    it('publishes the untransformed offset when an ancestor is mid-transform (D-044)', () => {
      const fixture = makeFixture({ width: 500 });

      Object.defineProperty(fixture.band, 'offsetLeft', { value: 24, configurable: true });
      Object.defineProperty(fixture.band, 'offsetParent', {
        value: fixture.parent,
        configurable: true,
      });
      Object.defineProperty(fixture.parent, 'offsetLeft', { value: 0, configurable: true });
      Object.defineProperty(fixture.parent, 'offsetParent', { value: null, configurable: true });

      setRect(fixture.band, { left: 24 + 0.16 * 500, top: 100, width: 500, height: 48 });

      mount(fixture);

      expect(fixture.band.style.getPropertyValue('--bar-bleed')).toBe('24px');
    });

    it('keeps --dock-offset a layout gap once the band has stuck', () => {
      const fixture = makeFixture({ width: 500 });
      mount(fixture);
      expect(fixture.parent.style.getPropertyValue('--dock-offset')).toBe('24px');

      setRect(fixture.sentinel, { left: 24, top: -304, height: 0 });
      fixture.setWidth(480);
      resize();

      expect(fixture.parent.style.getPropertyValue('--dock-offset')).toBe('24px');
    });

    it('publishes nothing while the band is hidden', () => {
      const fixture = makeFixture({ width: 0 });
      mount(fixture);

      expect(fixture.band.style.getPropertyValue('--bar-bleed')).toBe('');
      expect(fixture.parent.style.getPropertyValue('--dock-offset')).toBe('');
    });

    it('removes what it published on unmount', () => {
      const fixture = makeFixture({ width: 332 });
      const { unmount } = mount(fixture);
      expect(fixture.parent.style.getPropertyValue('--dock-offset')).toBe('24px');

      unmount();

      expect(fixture.band.style.getPropertyValue('--bar-bleed')).toBe('');
      expect(fixture.parent.style.getPropertyValue('--dock-offset')).toBe('');
    });
  });

  describe('the deadband across successive resizes', () => {
    it('threads the previous split back in, so promotion needs real slack', () => {
      const fixture = makeFixture({ width: 266 }); // available 250
      const { result } = mount(fixture);
      expect(result.current).toEqual({ inBar: 2, compact: true, measuring: false });

      fixture.setWidth(272); // available 256: enough, but not enough to promote
      resize();
      expect(result.current).toEqual({ inBar: 2, compact: true, measuring: false });

      fixture.setWidth(280); // available 264: 256 + one gap of slack
      resize();
      expect(result.current).toEqual({ inBar: 3, compact: true, measuring: false });
    });
  });

  describe('focus recovery', () => {
    it('hands focus to More when the focused action goes behind a closed tier', () => {
      const fixture = makeFixture({ width: 332 });
      const { result } = mount(fixture);
      expect(result.current.inBar).toBe(3);

      const third = fixture.row.children[2].querySelector('button');
      (third as HTMLButtonElement).focus();

      fixture.setWidth(266);
      (document.activeElement as HTMLElement).blur();
      resize();

      expect(result.current.inBar).toBe(2);
      expect(document.activeElement).toBe(fixture.more);
    });

    it('leaves focus alone when it survived the split', () => {
      const fixture = makeFixture({ width: 332 });
      const { result } = mount(fixture);

      const first = fixture.row.children[0].querySelector('button') as HTMLButtonElement;
      first.focus();

      fixture.setWidth(266);
      resize();

      expect(result.current.inBar).toBe(2);
      expect(document.activeElement).toBe(first);
    });

    it('never moves focus for an action that did not change side', () => {
      const fixture = makeFixture({ width: 332 });
      const { result } = mount(fixture);

      const first = fixture.row.children[0].querySelector('button') as HTMLButtonElement;
      first.focus();
      first.blur();

      fixture.setWidth(266);
      resize();

      expect(result.current.inBar).toBe(2);
      expect(document.activeElement).toBe(document.body);
    });
  });
});
