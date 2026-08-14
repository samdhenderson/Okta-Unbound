import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOwedLoad } from './useOwedLoad';

const renderLatch = (run: () => void, initial: { id: string | null; ready: boolean }) =>
  renderHook(
    ({ id, ready }: { id: string | null; ready: boolean }) => useOwedLoad(id, ready, run),
    {
      initialProps: initial,
    },
  );

describe('useOwedLoad', () => {
  it('runs once when ready, and not again for the same identity', () => {
    const run = vi.fn();
    const { rerender } = renderLatch(run, { id: 'a', ready: true });
    expect(run).toHaveBeenCalledTimes(1);

    rerender({ id: 'a', ready: true });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('does not run while not ready', () => {
    const run = vi.fn();
    renderLatch(run, { id: 'a', ready: false });
    expect(run).not.toHaveBeenCalled();
  });

  it('defers rather than drops: a load owed while hidden runs on becoming ready', () => {
    const run = vi.fn();
    const { rerender } = renderLatch(run, { id: 'a', ready: false });
    expect(run).not.toHaveBeenCalled();

    rerender({ id: 'b', ready: false });
    expect(run).not.toHaveBeenCalled();

    rerender({ id: 'b', ready: true });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('does not re-run on a bare hide/show with the identity unchanged', () => {
    const run = vi.fn();
    const { rerender } = renderLatch(run, { id: 'a', ready: true });
    expect(run).toHaveBeenCalledTimes(1);

    rerender({ id: 'a', ready: false });
    rerender({ id: 'a', ready: true });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('runs again when the identity genuinely changes', () => {
    const run = vi.fn();
    const { rerender } = renderLatch(run, { id: 'a', ready: true });
    rerender({ id: 'b', ready: true });
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('skips a round trip when the identity returns to one already paid for', () => {
    const run = vi.fn();
    const { rerender } = renderLatch(run, { id: 'a', ready: true });
    expect(run).toHaveBeenCalledTimes(1);

    rerender({ id: 'a', ready: false });
    rerender({ id: 'b', ready: false });
    rerender({ id: 'a', ready: false });
    rerender({ id: 'a', ready: true });

    expect(run).toHaveBeenCalledTimes(1);
  });

  it('never runs for a null identity, however ready', () => {
    const run = vi.fn();
    const { rerender } = renderLatch(run, { id: null, ready: true });
    expect(run).not.toHaveBeenCalled();

    rerender({ id: 'a', ready: true });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('reads the callback through a ref, so a fresh closure does not re-trigger', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ run }: { run: () => void }) => useOwedLoad('a', true, run), {
      initialProps: { run: first },
    });
    expect(first).toHaveBeenCalledTimes(1);

    rerender({ run: second });
    expect(second).not.toHaveBeenCalled();
    expect(first).toHaveBeenCalledTimes(1);
  });

  it('calls the latest callback when a real identity change does trigger', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ id, run }: { id: string; run: () => void }) => useOwedLoad(id, true, run),
      { initialProps: { id: 'a', run: first } },
    );
    expect(first).toHaveBeenCalledTimes(1);

    rerender({ id: 'b', run: second });
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);
  });
});
