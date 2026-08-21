import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const stateWrites: unknown[] = [];

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  const recordingUseState = ((initial: unknown) => {
    const [value, setValue] = actual.useState(initial);
    const record = actual.useCallback(
      (next: unknown) => {
        stateWrites.push(next);
        (setValue as (n: unknown) => void)(next);
      },
      [setValue],
    );
    return [value, record];
  }) as unknown as typeof actual.useState;
  return { ...actual, useState: recordingUseState };
});

import { useSearchWithDropdown } from './useSearchWithDropdown';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const afterDebounce = () => new Promise((resolve) => setTimeout(resolve, 40));

const DEBOUNCE_MS = 5;

const RESULTS = ['fake-one@example.com', 'fake-two@example.com'];

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  stateWrites.length = 0;
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useSearchWithDropdown result handling', () => {
  it('publishes results and opens the dropdown while mounted', async () => {
    const searchFn = vi.fn().mockResolvedValue(RESULTS);
    const { result } = renderHook(() =>
      useSearchWithDropdown<string>({ searchFn, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('fake');
    });

    await waitFor(() => expect(result.current.results).toEqual(RESULTS));
    expect(result.current.showDropdown).toBe(true);
    expect(result.current.isSearching).toBe(false);
    expect(searchFn).toHaveBeenCalledWith('fake');
  });

  it('keeps the dropdown closed when the search matches nothing', async () => {
    const searchFn = vi.fn().mockResolvedValue([]);
    const { result } = renderHook(() =>
      useSearchWithDropdown<string>({ searchFn, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('fake');
    });

    await waitFor(() => expect(result.current.isSearching).toBe(false));
    expect(result.current.results).toEqual([]);
    expect(result.current.showDropdown).toBe(false);
  });

  it('publishes the filtered list when a filterFn is supplied', async () => {
    const searchFn = vi.fn().mockResolvedValue(RESULTS);
    const filterFn = (rows: string[]) => rows.filter((r) => r.startsWith('fake-two'));
    const { result } = renderHook(() =>
      useSearchWithDropdown<string>({ searchFn, filterFn, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('fake');
    });

    await waitFor(() => expect(result.current.results).toEqual(['fake-two@example.com']));
    expect(result.current.showDropdown).toBe(true);
  });

  it('does not write results that resolve after unmount', async () => {
    const pending = deferred<string[]>();
    const searchFn = vi.fn().mockReturnValue(pending.promise);
    const filterFn = vi.fn((rows: string[]) => rows);

    const { result, unmount } = renderHook(() =>
      useSearchWithDropdown<string>({ searchFn, filterFn, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('fake');
    });
    await waitFor(() => expect(searchFn).toHaveBeenCalledWith('fake'));

    unmount();
    stateWrites.length = 0;

    await act(async () => {
      pending.resolve(RESULTS);
      await flush();
    });

    expect(filterFn).toHaveBeenCalledWith(RESULTS);
    expect(stateWrites).toEqual([]);
  });

  it('clears results and closes the dropdown when the search fails', async () => {
    const searchFn = vi.fn().mockResolvedValue(RESULTS);
    const { result } = renderHook(() =>
      useSearchWithDropdown<string>({ searchFn, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('fake');
    });
    await waitFor(() => expect(result.current.results).toEqual(RESULTS));

    searchFn.mockRejectedValue(new Error('Search failed'));
    act(() => {
      result.current.setQuery('fake-t');
    });

    await waitFor(() => expect(result.current.results).toEqual([]));
    expect(result.current.showDropdown).toBe(false);
    expect(result.current.isSearching).toBe(false);
    expect(consoleError).toHaveBeenCalled();
  });

  it('does not write state when the search fails after unmount', async () => {
    const pending = deferred<string[]>();
    const searchFn = vi.fn().mockReturnValue(pending.promise);

    const { result, unmount } = renderHook(() =>
      useSearchWithDropdown<string>({ searchFn, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('fake');
    });
    await waitFor(() => expect(searchFn).toHaveBeenCalledWith('fake'));

    unmount();
    stateWrites.length = 0;

    await act(async () => {
      pending.reject(new Error('Search failed'));
      await flush();
    });

    expect(consoleError).toHaveBeenCalled();
    expect(stateWrites).toEqual([]);
  });
});

describe('useSearchWithDropdown search suppression', () => {
  it('does not search below the minimum query length, and does once it is met', async () => {
    const searchFn = vi.fn().mockResolvedValue(RESULTS);
    const { result } = renderHook(() =>
      useSearchWithDropdown<string>({ searchFn, debounceMs: DEBOUNCE_MS, minQueryLength: 3 }),
    );

    act(() => {
      result.current.setQuery('fa');
    });
    await afterDebounce();
    expect(searchFn).not.toHaveBeenCalled();

    act(() => {
      result.current.setQuery('fak');
    });
    await waitFor(() => expect(searchFn).toHaveBeenCalledWith('fak'));
  });

  it('does not search while disabled', async () => {
    const searchFn = vi.fn().mockResolvedValue(RESULTS);
    const { result } = renderHook(() =>
      useSearchWithDropdown<string>({ searchFn, debounceMs: DEBOUNCE_MS, disabled: true }),
    );

    act(() => {
      result.current.setQuery('fake');
    });
    await afterDebounce();

    expect(searchFn).not.toHaveBeenCalled();
    expect(result.current.showDropdown).toBe(false);
  });

  it('pauses searching while an item is selected and resumes once cleared', async () => {
    const searchFn = vi.fn().mockResolvedValue(RESULTS);
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useSearchWithDropdown<string>({ searchFn, onSelect, debounceMs: DEBOUNCE_MS }),
    );

    act(() => {
      result.current.setQuery('fake');
    });
    await waitFor(() => expect(result.current.showDropdown).toBe(true));

    act(() => {
      result.current.selectItem(RESULTS[0]);
    });
    expect(onSelect).toHaveBeenCalledWith(RESULTS[0]);
    expect(result.current.selectedItem).toBe(RESULTS[0]);
    expect(result.current.showDropdown).toBe(false);
    expect(result.current.results).toEqual([]);

    const callsWhileSelected = searchFn.mock.calls.length;
    await afterDebounce();
    expect(searchFn.mock.calls.length).toBe(callsWhileSelected);

    act(() => {
      result.current.clearSearch();
    });
    expect(result.current.selectedItem).toBeNull();
    expect(result.current.query).toBe('');
  });

  it('seeds an initially-selected item so search starts paused', async () => {
    const searchFn = vi.fn().mockResolvedValue(RESULTS);
    const { result } = renderHook(() =>
      useSearchWithDropdown<string>({
        searchFn,
        debounceMs: DEBOUNCE_MS,
        initialSelected: RESULTS[1],
      }),
    );

    expect(result.current.selectedItem).toBe(RESULTS[1]);

    act(() => {
      result.current.setQuery('fake');
    });
    await afterDebounce();
    expect(searchFn).not.toHaveBeenCalled();
  });
});
