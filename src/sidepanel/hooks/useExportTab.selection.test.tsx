import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExportTab, type ExportTabApi } from './useExportTab';
import { ProgressProvider } from '../contexts/ProgressContext';
import { selectedUsersDescriptor, usersDescriptor } from '../export/descriptors/users';
import { selectionStore } from '../selection/selectionStore';
import type { EntityExport } from '../export/types';

const registry: Record<string, EntityExport> = {
  [usersDescriptor.id]: usersDescriptor as EntityExport,
  [selectedUsersDescriptor.id]: selectedUsersDescriptor as EntityExport,
};

function tickUsers(count: number): void {
  selectionStore.replaceKind(
    'user',
    Array.from({ length: count }, (_, i) => ({
      kind: 'user' as const,
      id: `00uFAKE${i}`,
      name: `Ticked ${i}`,
    })),
  );
}

function makeApi(overrides: Partial<ExportTabApi> = {}): ExportTabApi {
  return {
    fetchExportRows: vi.fn().mockResolvedValue({ rows: [], fetched: 0, dropped: 0, capped: false }),
    fetchSelectionExportRows: vi.fn().mockResolvedValue({
      rows: [],
      fetched: 0,
      dropped: 0,
      capped: false,
      requested: 0,
      missing: [],
      duplicates: 0,
    }),
    countExportRows: vi.fn().mockResolvedValue({ count: 0, hasMore: false }),
    runExport: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function render(api: ExportTabApi) {
  return renderHook(
    () =>
      useExportTab({
        api,
        registry,
        deps: { searchGroups: vi.fn() },
        hasConnectedTab: true,
        onError: vi.fn(),
      }),
    { wrapper: ({ children }) => <ProgressProvider>{children}</ProgressProvider> },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  selectionStore.clearAll();
});

afterEach(() => {
  selectionStore.clearAll();
});

describe('listing a from-selection descriptor', () => {
  it('omits it entirely while its partition is empty', () => {
    const { result } = render(makeApi());

    expect(result.current.descriptors.map((d) => d.id)).toEqual(['users']);
  });

  it('lists it once an entity of an accepted kind is ticked', () => {
    const { result } = render(makeApi());

    act(() => tickUsers(2));

    expect(result.current.descriptors.map((d) => d.id)).toContain('users-selected');
    expect(result.current.descriptors.map((d) => d.id)).toContain('users');
  });

  it('ignores ticks of a kind it does not accept', () => {
    const { result } = render(makeApi());

    act(() =>
      selectionStore.replaceKind('group', [{ kind: 'group', id: '00gFAKE1', name: 'Sales' }]),
    );

    expect(result.current.descriptors.map((d) => d.id)).toEqual(['users']);
  });

  it('leaves the configure phase when the last tick is removed', () => {
    const { result } = render(makeApi());
    act(() => tickUsers(1));
    act(() => result.current.selectEntity('users-selected'));
    expect(result.current.phase).toBe('configure');

    act(() => selectionStore.clearKind('user'));

    expect(result.current.phase).toBe('pick');
    expect(result.current.descriptor).toBeNull();
  });
});

describe('reading a from-selection descriptor', () => {
  it('states the tick count before anything is fetched, and never probes for one', () => {
    const api = makeApi();
    const { result } = render(api);
    act(() => tickUsers(3));

    act(() => result.current.selectEntity('users-selected'));

    expect(result.current.selectionCount).toBe(3);
    expect(result.current.selectionLabel).toBe('users');
    expect(result.current.matchCount).toBeNull();
    expect(api.countExportRows).not.toHaveBeenCalled();
  });

  it('reports no tick count at all for a whole-org descriptor', () => {
    const { result } = render(makeApi());

    act(() => result.current.selectEntity('users'));

    expect(result.current.selectionCount).toBeNull();
    expect(result.current.selectionLabel).toBeNull();
  });

  it('reads through the selection fan-out with the live basket, not the whole-org walk', async () => {
    const api = makeApi({
      fetchSelectionExportRows: vi.fn().mockResolvedValue({
        rows: [{ id: '00uFAKE0' }, { id: '00uFAKE1' }],
        fetched: 2,
        dropped: 0,
        capped: false,
        requested: 2,
        missing: [],
        duplicates: 0,
      }),
    });
    const { result } = render(api);
    act(() => tickUsers(2));
    act(() => result.current.selectEntity('users-selected'));

    await act(async () => {
      await result.current.loadPreview();
    });

    expect(api.fetchExportRows).not.toHaveBeenCalled();
    expect(api.fetchSelectionExportRows).toHaveBeenCalledTimes(1);
    const [descriptor, basket] = vi.mocked(api.fetchSelectionExportRows).mock.calls[0];
    expect(descriptor.id).toBe('users-selected');
    expect(basket.picked.map((ref) => ref.id)).toEqual(['00uFAKE0', '00uFAKE1']);
    expect(result.current.previewRows).toHaveLength(2);
    expect(result.current.selectionShortfall).toBeNull();
  });

  it('states a shortfall with its true count and carries it into the filename', async () => {
    const api = makeApi({
      fetchSelectionExportRows: vi.fn().mockResolvedValue({
        rows: [{ id: '00uFAKE0' }],
        fetched: 1,
        dropped: 0,
        capped: false,
        requested: 3,
        missing: [
          { kind: 'user', id: '00uFAKE1' },
          { kind: 'user', id: '00uFAKE2' },
        ],
        duplicates: 0,
      }),
    });
    const { result } = render(api);
    act(() => tickUsers(3));
    act(() => result.current.selectEntity('users-selected'));

    await act(async () => {
      await result.current.download();
    });

    expect(result.current.selectionShortfall).toEqual({ requested: 3, missing: 2 });
    expect(api.runExport).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.runExport).mock.calls[0][0].selection).toEqual({
      requested: 3,
      missing: 2,
    });
  });

  it('carries the cohort size into the filename even when nothing was missing', async () => {
    const api = makeApi({
      fetchSelectionExportRows: vi.fn().mockResolvedValue({
        rows: [{ id: '00uFAKE0' }],
        fetched: 1,
        dropped: 0,
        capped: false,
        requested: 1,
        missing: [],
        duplicates: 0,
      }),
    });
    const { result } = render(api);
    act(() => tickUsers(1));
    act(() => result.current.selectEntity('users-selected'));

    await act(async () => {
      await result.current.download();
    });

    expect(vi.mocked(api.runExport).mock.calls[0][0].selection).toEqual({
      requested: 1,
      missing: 0,
    });
  });

  it('sends no selection marker for a whole-org export', async () => {
    const api = makeApi();
    const { result } = render(api);

    act(() => result.current.selectEntity('users'));
    await act(async () => {
      await result.current.download();
    });

    expect(api.fetchExportRows).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.runExport).mock.calls[0][0].selection).toBeUndefined();
  });
});
