import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHoleCandidates } from './useHoleCandidates';

const searchByName = vi.fn();
const searchGroups = vi.fn();
const searchUsers = vi.fn();

vi.mock('./useOktaApi', () => ({ useOktaApi: () => ({}) }));

vi.mock('../contexts/OrgEntityIndexContext', () => ({
  useOrgEntityIndex: () => ({ searchByName }),
}));

vi.mock('./useEntitySearchSources', () => ({
  useEntitySearchSources: () => ({
    searchers: { group: searchGroups, user: searchUsers },
    fetchers: {},
  }),
}));

const BASE = { targetTabId: 1, oktaOrigin: 'https://example.okta.com', enabled: true } as const;

beforeEach(() => {
  vi.clearAllMocks();
  searchByName.mockReturnValue([]);
  searchGroups.mockResolvedValue([]);
  searchUsers.mockResolvedValue([]);
});

describe('useHoleCandidates', () => {
  it('offers nothing, and asks nothing, when the caret is not in a hole', () => {
    const { result } = renderHook(() => useHoleCandidates({ ...BASE, kind: null, query: '' }));

    expect(result.current.candidates).toEqual([]);
    expect(searchByName).not.toHaveBeenCalled();
    expect(searchGroups).not.toHaveBeenCalled();
  });

  it('offers the live tab’s entity first, at no cost', () => {
    const { result } = renderHook(() =>
      useHoleCandidates({
        ...BASE,
        kind: 'group',
        query: '',
        tabEntity: { kind: 'group', id: '00gFAKE000000000001', label: 'Engineering' },
      }),
    );

    expect(result.current.candidates[0]).toEqual({
      kind: 'group',
      id: '00gFAKE000000000001',
      label: 'Engineering',
      source: 'tab',
    });
    expect(searchGroups).not.toHaveBeenCalled();
  });

  it('withholds the tab’s entity when it is the wrong kind for the hole', () => {
    const { result } = renderHook(() =>
      useHoleCandidates({
        ...BASE,
        kind: 'user',
        query: '',
        tabEntity: { kind: 'group', id: '00gFAKE000000000001', label: 'Engineering' },
      }),
    );

    expect(result.current.candidates).toEqual([]);
  });

  it('reads the snapshot for a kind it holds', () => {
    searchByName.mockReturnValue([
      { kind: 'group', id: '00gFAKE000000000002', name: 'Engineering Leads' },
    ]);

    const { result } = renderHook(() =>
      useHoleCandidates({ ...BASE, kind: 'group', query: 'eng' }),
    );

    expect(searchByName).toHaveBeenCalledWith('group', 'eng');
    expect(result.current.candidates[0]?.source).toBe('snapshot');
  });

  it('does not read the snapshot for users, which it does not hold', () => {
    renderHook(() => useHoleCandidates({ ...BASE, kind: 'user', query: 'ada' }));

    expect(searchByName).not.toHaveBeenCalled();
  });

  it('spends a request once the query is long enough, and shows what came back', async () => {
    searchUsers.mockResolvedValue([
      {
        kind: 'user',
        id: '00uFAKE000000000001',
        name: 'Ada Lovelace',
        secondary: 'ada@example.com',
      },
    ]);

    const { result } = renderHook(() => useHoleCandidates({ ...BASE, kind: 'user', query: 'ada' }));

    await waitFor(() => expect(result.current.candidates).toHaveLength(1));
    expect(result.current.candidates[0]).toMatchObject({
      id: '00uFAKE000000000001',
      label: 'Ada Lovelace',
      source: 'search',
    });
  });

  it('spends nothing on a one-character query', async () => {
    renderHook(() => useHoleCandidates({ ...BASE, kind: 'user', query: 'a' }));

    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(searchUsers).not.toHaveBeenCalled();
  });

  it('spends nothing while the Explorer is not the visible tab', async () => {
    renderHook(() => useHoleCandidates({ ...BASE, enabled: false, kind: 'user', query: 'ada' }));

    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(searchUsers).not.toHaveBeenCalled();
  });

  it('spends nothing on the literal hole a just-accepted path left behind', async () => {
    renderHook(() => useHoleCandidates({ ...BASE, kind: 'user', query: '{userId}' }));

    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(searchUsers).not.toHaveBeenCalled();
  });

  it('keeps the cheapest source when two of them name the same id', async () => {
    searchByName.mockReturnValue([{ kind: 'group', id: '00gFAKE000000000001', name: 'Eng' }]);
    searchGroups.mockResolvedValue([
      { kind: 'group', id: '00gFAKE000000000001', name: 'Engineering' },
    ]);

    const { result } = renderHook(() =>
      useHoleCandidates({
        ...BASE,
        kind: 'group',
        query: 'eng',
        tabEntity: { kind: 'group', id: '00gFAKE000000000001', label: 'Engineering' },
      }),
    );

    await waitFor(() => expect(searchGroups).toHaveBeenCalled());
    expect(result.current.candidates).toHaveLength(1);
    expect(result.current.candidates[0]?.source).toBe('tab');
  });

  it('shows nothing rather than an error when the search fails', async () => {
    searchUsers.mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useHoleCandidates({ ...BASE, kind: 'user', query: 'ada' }));

    await waitFor(() => expect(searchUsers).toHaveBeenCalled());
    expect(result.current.candidates).toEqual([]);
  });

  it('never shows one hole’s results against another', async () => {
    searchUsers.mockResolvedValue([{ kind: 'user', id: '00uFAKE000000000001', name: 'Ada' }]);

    const { result, rerender } = renderHook(
      (props: { kind: 'user' | 'group'; query: string }) =>
        useHoleCandidates({ ...BASE, kind: props.kind, query: props.query }),
      { initialProps: { kind: 'user' as 'user' | 'group', query: 'ada' } },
    );

    await waitFor(() => expect(result.current.candidates).toHaveLength(1));

    rerender({ kind: 'group', query: 'sales' });
    expect(result.current.candidates.every((candidate) => candidate.kind === 'group')).toBe(true);
  });
});
