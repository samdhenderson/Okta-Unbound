import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { OktaUser } from '../../shared/types';

const debounced = vi.hoisted(() => ({
  options: [] as Array<{ enabled?: boolean }>,
  state: {
    searchQuery: '',
    setSearchQuery: vi.fn(),
    searchResults: [] as OktaUser[],
    setSearchResults: vi.fn(),
    isSearching: false,
    resultsTruncated: false,
  },
}));

vi.mock('./useDebouncedUserSearch', () => ({
  useDebouncedUserSearch: (options: { enabled?: boolean }) => {
    debounced.options.push(options);
    return debounced.state;
  },
}));

import { useUserPicker } from './useUserPicker';

const user: OktaUser = {
  id: '00uFAKEPICKED',
  status: 'ACTIVE',
  profile: { login: 'ada@example.com', email: 'ada@example.com', firstName: 'Ada', lastName: 'L' },
};

const lastEnabled = () => debounced.options[debounced.options.length - 1].enabled;

beforeEach(() => {
  debounced.options.length = 0;
  debounced.state.setSearchQuery.mockReset();
  debounced.state.setSearchResults.mockReset();
});

describe('useUserPicker', () => {
  it('keeps the search disabled until the modal opens, and disables it again on close', () => {
    const { result } = renderHook(() => useUserPicker({ targetTabId: 1, onPick: vi.fn() }));
    expect(result.current.isOpen).toBe(false);
    expect(lastEnabled()).toBe(false);

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    expect(lastEnabled()).toBe(true);

    act(() => result.current.close());
    expect(lastEnabled()).toBe(false);
  });

  it('never enables the search while the owning view is hidden', () => {
    const { result } = renderHook(() =>
      useUserPicker({ targetTabId: 1, onPick: vi.fn(), enabled: false }),
    );
    act(() => result.current.open());
    expect(lastEnabled()).toBe(false);
  });

  it('a pick closes the modal, clears the query and results, and reports the user', () => {
    const onPick = vi.fn();
    const { result } = renderHook(() => useUserPicker({ targetTabId: 1, onPick }));
    act(() => result.current.open());
    act(() => result.current.pick(user));
    expect(result.current.isOpen).toBe(false);
    expect(onPick).toHaveBeenCalledWith(user);
    expect(debounced.state.setSearchQuery).toHaveBeenLastCalledWith('');
    expect(debounced.state.setSearchResults).toHaveBeenLastCalledWith([]);
  });
});
