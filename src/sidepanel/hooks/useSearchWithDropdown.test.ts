import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSearchWithDropdown } from './useSearchWithDropdown';

const DEBOUNCE_MS = 10;

interface Row {
  id: string;
  label: string;
}

const alice: Row = { id: '00uFAKE1', label: 'alice@example.com' };
const bob: Row = { id: '00uFAKE2', label: 'bob@example.com' };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const searchErrors: unknown[][] = [];

beforeEach(() => {
  searchErrors.length = 0;
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (args[1] === 'Search error:') searchErrors.push(args);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useSearchWithDropdown search results', () => {
  it('publishes filtered results and opens the dropdown', async () => {
    const searchFn = vi.fn(async () => [alice, bob]);
    const filterFn = vi.fn((rows: Row[]) => rows.filter((r) => r.id !== bob.id));

    const { result } = renderHook(() =>
      useSearchWithDropdown<Row>({ searchFn, filterFn, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('al');
    });

    await waitFor(() => expect(result.current.results).toEqual([alice]));
    expect(result.current.showDropdown).toBe(true);
    expect(result.current.isSearching).toBe(false);
    expect(searchFn).toHaveBeenCalledWith('al');
  });

  it('keeps the dropdown closed when the search finds nothing', async () => {
    const searchFn = vi.fn(async () => [] as Row[]);

    const { result } = renderHook(() =>
      useSearchWithDropdown<Row>({ searchFn, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('zz');
    });

    await waitFor(() => expect(searchFn).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.isSearching).toBe(false));
    expect(result.current.results).toEqual([]);
    expect(result.current.showDropdown).toBe(false);
  });

  it('clears the open dropdown when a later search throws', async () => {
    const searchFn = vi.fn(async (query: string) => {
      if (query === 'alx') throw new Error('Okta search failed');
      return [alice];
    });

    const { result } = renderHook(() =>
      useSearchWithDropdown<Row>({ searchFn, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('al');
    });
    await waitFor(() => expect(result.current.showDropdown).toBe(true));
    expect(result.current.results).toEqual([alice]);

    act(() => {
      result.current.setQuery('alx');
    });

    await waitFor(() => expect(searchErrors).toHaveLength(1));
    await waitFor(() => expect(result.current.showDropdown).toBe(false));
    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });
});

describe('useSearchWithDropdown selection', () => {
  it('pauses searching while an item is selected and resumes after clearSearch', async () => {
    const searchFn = vi.fn(async () => [alice]);
    const onSelect = vi.fn();

    const { result } = renderHook(() =>
      useSearchWithDropdown<Row>({ searchFn, onSelect, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('al');
    });
    await waitFor(() => expect(result.current.showDropdown).toBe(true));

    act(() => {
      result.current.selectItem(alice);
    });

    expect(result.current.selectedItem).toEqual(alice);
    expect(onSelect).toHaveBeenCalledWith(alice);
    expect(result.current.showDropdown).toBe(false);
    expect(result.current.results).toEqual([]);

    const callsWhileSelected = searchFn.mock.calls.length;
    await new Promise((r) => setTimeout(r, DEBOUNCE_MS * 5));
    expect(searchFn).toHaveBeenCalledTimes(callsWhileSelected);

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.query).toBe('');
    expect(result.current.selectedItem).toBeNull();

    act(() => {
      result.current.setQuery('al');
    });
    await waitFor(() => expect(searchFn.mock.calls.length).toBeGreaterThan(callsWhileSelected));
    await waitFor(() => expect(result.current.showDropdown).toBe(true));
  });
});

describe('useSearchWithDropdown unmount handling', () => {
  it('never starts a search unmounted before the debounce elapses', async () => {
    const searchFn = vi.fn(async () => [alice]);

    const { result, unmount } = renderHook(() =>
      useSearchWithDropdown<Row>({ searchFn, debounceMs: 200 }),
    );

    act(() => {
      result.current.setQuery('al');
    });
    unmount();

    await new Promise((r) => setTimeout(r, 300));
    expect(searchFn).not.toHaveBeenCalled();
  });

  it('drops results that arrive after unmount', async () => {
    const pending = deferred<Row[]>();
    const searchFn = vi.fn(() => pending.promise);
    const filterFn = vi.fn((rows: Row[]) => rows);

    const { result, unmount } = renderHook(() =>
      useSearchWithDropdown<Row>({ searchFn, filterFn, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('al');
    });
    await waitFor(() => expect(result.current.isSearching).toBe(true));
    expect(searchFn).toHaveBeenCalledTimes(1);

    unmount();
    await act(async () => {
      pending.resolve([alice]);
      await pending.promise;
    });

    expect(filterFn).toHaveBeenCalledTimes(1);
    expect(result.current.results).toEqual([]);
    expect(result.current.showDropdown).toBe(false);
    expect(result.current.isSearching).toBe(true);
  });

  it('drops a search failure that arrives after unmount', async () => {
    const pending = deferred<Row[]>();
    const searchFn = vi.fn(() => pending.promise);

    const { result, unmount } = renderHook(() =>
      useSearchWithDropdown<Row>({ searchFn, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('al');
    });
    await waitFor(() => expect(result.current.isSearching).toBe(true));
    expect(searchFn).toHaveBeenCalledTimes(1);

    unmount();
    await act(async () => {
      pending.reject(new Error('Okta search failed'));
      await pending.promise.catch(() => {});
    });

    expect(searchErrors).toHaveLength(1);
    expect(result.current.results).toEqual([]);
    expect(result.current.showDropdown).toBe(false);
    expect(result.current.isSearching).toBe(true);
  });
});
