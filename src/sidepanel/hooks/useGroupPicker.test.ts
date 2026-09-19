import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { GroupSearchResult } from './useAddToGroup';

const api = vi.hoisted(() => ({ searchGroups: vi.fn() }));

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => api,
}));

import { useGroupPicker } from './useGroupPicker';

const held: GroupSearchResult = {
  id: '00gFAKEHELD',
  name: 'Fake Engineering',
  description: '',
  type: 'OKTA_GROUP',
};

beforeEach(() => {
  vi.useFakeTimers();
  api.searchGroups.mockReset();
  api.searchGroups.mockResolvedValue([held]);
});

afterEach(() => {
  vi.useRealTimers();
});

const typeAndSettle = async (setQuery: (q: string) => void, query: string) => {
  act(() => setQuery(query));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(400);
  });
};

describe('useGroupPicker', () => {
  it('does not search while the modal is closed', async () => {
    const { result } = renderHook(() => useGroupPicker({ targetTabId: 1, onPick: vi.fn() }));
    await typeAndSettle(result.current.setQuery, 'eng');
    expect(api.searchGroups).not.toHaveBeenCalled();
  });

  it('searches once open, and returns every match — a held group is not filtered out', async () => {
    const { result } = renderHook(() => useGroupPicker({ targetTabId: 1, onPick: vi.fn() }));
    act(() => result.current.open());
    await typeAndSettle(result.current.setQuery, 'eng');
    expect(api.searchGroups).toHaveBeenCalledWith('eng');
    expect(result.current.results).toEqual([held]);
  });

  it('does not search below two characters', async () => {
    const { result } = renderHook(() => useGroupPicker({ targetTabId: 1, onPick: vi.fn() }));
    act(() => result.current.open());
    await typeAndSettle(result.current.setQuery, 'e');
    expect(api.searchGroups).not.toHaveBeenCalled();
  });

  it('never searches while the owning view is hidden', async () => {
    const { result } = renderHook(() =>
      useGroupPicker({ targetTabId: 1, onPick: vi.fn(), enabled: false }),
    );
    act(() => result.current.open());
    await typeAndSettle(result.current.setQuery, 'eng');
    expect(api.searchGroups).not.toHaveBeenCalled();
  });

  it('a pick closes the modal, clears the query and results, and reports the group', async () => {
    const onPick = vi.fn();
    const { result } = renderHook(() => useGroupPicker({ targetTabId: 1, onPick }));
    act(() => result.current.open());
    await typeAndSettle(result.current.setQuery, 'eng');
    act(() => result.current.pick(held));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(onPick).toHaveBeenCalledWith(held);
  });

  it('states a failed search as an error, never as an empty answer', async () => {
    api.searchGroups.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useGroupPicker({ targetTabId: 1, onPick: vi.fn() }));
    act(() => result.current.open());
    await typeAndSettle(result.current.setQuery, 'eng');
    expect(result.current.searchError).toBe('Group search failed.');
    expect(result.current.results).toEqual([]);
  });
});
