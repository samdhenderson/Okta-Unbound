import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useDebouncedUserSearch } from './useDebouncedUserSearch';
import { searchUsersRequest } from './searchUsersRequest';
import type { OktaUser } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';

const makeApiRequest = vi.fn();
vi.mock('./useOktaApi', () => ({ useOktaApi: () => ({ makeApiRequest }) }));

vi.mock('./searchUsersRequest', () => ({ searchUsersRequest: vi.fn() }));

const search = vi.mocked(searchUsersRequest);

const ada = {
  id: '00uFAKE0001',
  status: 'ACTIVE',
  profile: { login: 'ada@example.com', email: 'ada@example.com' },
} as OktaUser;

const onError = vi.fn();
const log = createLogger('test');

function renderSearch() {
  return renderHook(() =>
    useDebouncedUserSearch({ targetTabId: 1, onError, debounceMs: 0, minQueryLength: 1, log }),
  );
}

beforeEach(() => {
  search.mockReset();
  onError.mockClear();
});

describe('useDebouncedUserSearch truncation (D-C)', () => {
  it('starts false, before any search has said anything', () => {
    const { result } = renderSearch();

    expect(result.current.resultsTruncated).toBe(false);
  });

  it('reports the truncation the search returned', async () => {
    search.mockResolvedValue({ success: true, data: [ada], truncated: true });
    const { result } = renderSearch();

    act(() => result.current.setSearchQuery('ada'));

    await waitFor(() => expect(result.current.searchResults).toEqual([ada]));
    expect(result.current.resultsTruncated).toBe(true);
  });

  it('clears a standing truncation when the next search is complete', async () => {
    search.mockResolvedValueOnce({ success: true, data: [ada], truncated: true });
    const { result } = renderSearch();

    act(() => result.current.setSearchQuery('a'));
    await waitFor(() => expect(result.current.resultsTruncated).toBe(true));

    search.mockResolvedValueOnce({ success: true, data: [ada], truncated: false });
    act(() => result.current.setSearchQuery('ada'));

    await waitFor(() => expect(result.current.resultsTruncated).toBe(false));
  });

  it('clears it when a search fails, so no flag describes rows that are gone', async () => {
    search.mockResolvedValueOnce({ success: true, data: [ada], truncated: true });
    const { result } = renderSearch();

    act(() => result.current.setSearchQuery('a'));
    await waitFor(() => expect(result.current.resultsTruncated).toBe(true));

    search.mockResolvedValueOnce({ success: false, truncated: false, error: 'boom' });
    act(() => result.current.setSearchQuery('ada'));

    await waitFor(() => expect(result.current.searchResults).toEqual([]));
    expect(result.current.resultsTruncated).toBe(false);
  });

  it('clears it when a host replaces the results itself', async () => {
    search.mockResolvedValue({ success: true, data: [ada], truncated: true });
    const { result } = renderSearch();

    act(() => result.current.setSearchQuery('ada'));
    await waitFor(() => expect(result.current.resultsTruncated).toBe(true));

    act(() => result.current.setSearchResults([ada]));

    expect(result.current.resultsTruncated).toBe(false);
  });
});
