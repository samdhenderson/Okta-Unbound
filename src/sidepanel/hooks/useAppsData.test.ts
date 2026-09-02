import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { OktaAppListItem } from '../../shared/schemas/okta';

const { fakeDB, idbTables } = await vi.hoisted(async () => {
  const { createFakeIdb } = await import('@/test/factories/idb');
  const { fakeDB, tables } = createFakeIdb();
  return { fakeDB, idbTables: tables };
});

vi.mock('idb', () => ({ openDB: vi.fn(async () => fakeDB) }));

import { useAppsData } from './useAppsData';

const appsA: OktaAppListItem[] = [
  { id: '0oaFAKE000000000001', label: 'Payroll', status: 'ACTIVE', signOnMode: 'SAML_2_0' },
];
const appsB: OktaAppListItem[] = [
  { id: '0oaFAKE000000000002', label: 'Helpdesk', status: 'ACTIVE', signOnMode: 'SAML_2_0' },
];

const ORIGIN = 'https://example.okta.com';
const OTHER_ORIGIN = 'https://other.okta.com';
const WALKED_AT = 1_800_000_000_000;

const onError = vi.fn();
const sendMessage = vi.fn();

globalThis.chrome = {
  runtime: {
    sendMessage,
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
  },
} as unknown as typeof chrome;

function seedApps(apps: OktaAppListItem[], origin = ORIGIN) {
  const table = (idbTables.get('apps') ?? new Map()) as Map<string, unknown>;
  for (const entity of apps) {
    table.set(`${origin}::${entity.id}`, { origin, id: entity.id, entity, syncedAt: WALKED_AT });
  }
  idbTables.set('apps', table);
  const meta = (idbTables.get('syncMeta') ?? new Map()) as Map<string, unknown>;
  meta.set(`${origin}::apps`, {
    origin,
    collection: 'apps',
    complete: true,
    lastFullWalkAt: WALKED_AT,
    lastDeltaAt: null,
    watermark: null,
    itemCount: apps.length,
    cursor: null,
    walkStartedAt: null,
    deltaSupported: null,
  });
  idbTables.set('syncMeta', meta);
}

function syncCalls() {
  return sendMessage.mock.calls
    .map((call) => call[0])
    .filter((msg) => msg?.action === 'syncSnapshot');
}

beforeEach(() => {
  vi.clearAllMocks();
  idbTables.clear();
  sendMessage.mockImplementation(async (msg: { action?: string; origin?: string }) => {
    if (msg?.action !== 'syncSnapshot') return undefined;
    seedApps(appsA, msg.origin);
    return { success: true };
  });
});

const renderIdle = (over: Partial<Parameters<typeof useAppsData>[0]> = {}) =>
  renderHook(() =>
    useAppsData({ onError, targetTabId: 1, oktaOrigin: ORIGIN, enabled: false, ...over }),
  );

describe('useAppsData', () => {
  it('loads the inventory and reports the walk that produced it', async () => {
    const { result } = renderIdle({ enabled: true });

    await waitFor(() => expect(result.current.apps).toEqual(appsA));
    expect(syncCalls()).toHaveLength(1);
    expect(result.current.lastFetchTime).toBe(new Date(WALKED_AT).toISOString());
    expect(result.current.complete).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(onError).toHaveBeenCalledWith('');
  });

  it('paints a seeded org without asking the background for anything', async () => {
    seedApps(appsA);

    const { result } = renderIdle();

    await waitFor(() => expect(result.current.apps).toEqual(appsA));
    expect(syncCalls()).toHaveLength(0);
    expect(result.current.lastFetchTime).toBe(new Date(WALKED_AT).toISOString());
  });

  it('forces a full walk when refreshed', async () => {
    const { result } = renderIdle({ enabled: true });
    await waitFor(() => expect(result.current.apps).toEqual(appsA));

    await act(async () => {
      await result.current.loadApps(true);
    });

    expect(syncCalls().map((msg) => msg.force)).toEqual([false, true]);
  });

  it('keeps each org in its own rows, and blanks the previous one immediately', async () => {
    seedApps(appsA, ORIGIN);
    seedApps(appsB, OTHER_ORIGIN);

    const { result, rerender } = renderHook(
      ({ origin }: { origin: string }) =>
        useAppsData({ onError, targetTabId: 1, oktaOrigin: origin, enabled: false }),
      { initialProps: { origin: ORIGIN } },
    );
    await waitFor(() => expect(result.current.apps).toEqual(appsA));

    rerender({ origin: OTHER_ORIGIN });
    expect(result.current.apps).toEqual([]);
    await waitFor(() => expect(result.current.apps).toEqual(appsB));
  });

  it('carries the fetch time back when returning to an org already on disk', async () => {
    seedApps(appsA, ORIGIN);

    const { result, rerender } = renderHook(
      ({ origin }: { origin: string }) =>
        useAppsData({ onError, targetTabId: 1, oktaOrigin: origin, enabled: false }),
      { initialProps: { origin: ORIGIN } },
    );
    await waitFor(() => expect(result.current.lastFetchTime).not.toBeNull());
    const firstFetch = result.current.lastFetchTime;

    rerender({ origin: OTHER_ORIGIN });
    await waitFor(() => expect(result.current.lastFetchTime).toBeNull());
    expect(result.current.apps).toEqual([]);

    rerender({ origin: ORIGIN });
    await waitFor(() => expect(result.current.apps).toEqual(appsA));
    expect(result.current.lastFetchTime).toBe(firstFetch);
    expect(syncCalls()).toHaveLength(0);
  });

  it('reports a missing Okta tab instead of syncing', async () => {
    const { result } = renderIdle({ targetTabId: null });

    await act(async () => {
      await result.current.loadApps();
    });

    expect(syncCalls()).toHaveLength(0);
    expect(onError).toHaveBeenCalledWith('No Okta tab connected');
    expect(result.current.apps).toEqual([]);
  });

  it('surfaces a fatal inventory read through onError', async () => {
    sendMessage.mockResolvedValue({ success: false, error: 'scheduler unavailable' });
    const { result } = renderIdle({ enabled: true });

    await waitFor(() => expect(onError).toHaveBeenCalledWith('scheduler unavailable'));
    expect(result.current.apps).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('defers the auto-load while the tab is hidden and pays it on the next show', async () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useAppsData({ onError, targetTabId: 1, oktaOrigin: ORIGIN, enabled }),
      { initialProps: { enabled: false } },
    );

    expect(syncCalls()).toHaveLength(0);

    rerender({ enabled: true });
    await waitFor(() => expect(syncCalls()).toHaveLength(1));
  });

  it('re-arms the auto-load when the org changes under a stable tab id', async () => {
    const { rerender } = renderHook(
      ({ origin }: { origin: string }) =>
        useAppsData({ onError, targetTabId: 1, oktaOrigin: origin, enabled: true }),
      { initialProps: { origin: ORIGIN } },
    );

    await waitFor(() => expect(syncCalls()).toHaveLength(1));

    rerender({ origin: OTHER_ORIGIN });

    await waitFor(() => expect(syncCalls()).toHaveLength(2));
    expect(syncCalls().map((msg) => msg.origin)).toEqual([ORIGIN, OTHER_ORIGIN]);
  });
});
