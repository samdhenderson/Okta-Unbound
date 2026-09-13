import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelection } from './useSelection';
import { selectionStore } from './selectionStore';

beforeEach(() => {
  selectionStore.clearAll();
});

describe('useSelection', () => {
  it('repaints total and counts after a tick made through the hook', () => {
    const { result } = renderHook(() => useSelection());
    expect(result.current.total).toBe(0);
    expect(result.current.counts).toEqual({});

    act(() => {
      result.current.toggle({ kind: 'user', id: '00uFAKE1', name: 'user@example.com' });
    });

    expect(result.current.total).toBe(1);
    expect(result.current.counts).toEqual({ user: 1 });
  });

  it('isPicked reflects the new basket after a tick — the memoized-row staleness guard', () => {
    const { result } = renderHook(() => useSelection());
    expect(result.current.isPicked('user', '00uFAKE1')).toBe(false);

    act(() => {
      result.current.toggle({ kind: 'user', id: '00uFAKE1', name: 'user@example.com' });
    });

    expect(result.current.isPicked('user', '00uFAKE1')).toBe(true);

    act(() => {
      result.current.toggle({ kind: 'user', id: '00uFAKE1', name: 'user@example.com' });
    });

    expect(result.current.isPicked('user', '00uFAKE1')).toBe(false);
  });

  it('two independently-rendered consumers of the singleton both see a tick made through either one', () => {
    const first = renderHook(() => useSelection());
    const second = renderHook(() => useSelection());

    act(() => {
      first.result.current.toggle({ kind: 'group', id: '00gFAKE1', name: 'A group' });
    });

    expect(first.result.current.total).toBe(1);
    expect(second.result.current.total).toBe(1);
    expect(second.result.current.isPicked('group', '00gFAKE1')).toBe(true);

    act(() => {
      second.result.current.remove({ kind: 'group', id: '00gFAKE1' });
    });

    expect(first.result.current.total).toBe(0);
    expect(second.result.current.total).toBe(0);
  });
});
