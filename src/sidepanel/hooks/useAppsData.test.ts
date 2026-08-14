import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { OktaAppListItem } from '../../shared/schemas/okta';

const appsA: OktaAppListItem[] = [
  { id: '0oaFAKE000000000001', label: 'Payroll', status: 'ACTIVE', signOnMode: 'SAML_2_0' },
];
const appsB: OktaAppListItem[] = [
  { id: '0oaFAKE000000000002', label: 'Helpdesk', status: 'ACTIVE', signOnMode: 'SAML_2_0' },
];

const getAllApps = vi.fn(async () => [] as OktaAppListItem[]);
const api = { getAllApps } as unknown as Parameters<typeof useAppsData>[0]['api'];

import { useAppsData } from './useAppsData';
import { resetEntityCache } from '../cache/entityCache';

const onError = vi.fn();
const ORIGIN = 'https://example.okta.com';

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
  getAllApps.mockResolvedValue(appsA);
});

const renderIdle = (over: Partial<Parameters<typeof useAppsData>[0]> = {}) =>
  renderHook(() =>
    useAppsData({
      api,
      onError,
      targetTabId: 1,
      oktaOrigin: ORIGIN,
      enabled: false,
      ...over,
    }),
  );

describe('useAppsData', () => {
  it('loads the inventory and records the fetch time', async () => {
    const { result } = renderIdle();

    expect(result.current.apps).toEqual([]);
    expect(result.current.lastFetchTime).toBeNull();

    await act(async () => {
      await result.current.loadApps();
    });

    expect(getAllApps).toHaveBeenCalledTimes(1);
    expect(result.current.apps).toEqual(appsA);
    expect(result.current.lastFetchTime).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(onError).toHaveBeenCalledWith('');
  });

  it('serves a second load from the entity cache without refetching', async () => {
    const { result } = renderIdle();

    await act(async () => {
      await result.current.loadApps();
    });
    await act(async () => {
      await result.current.loadApps();
    });

    expect(getAllApps).toHaveBeenCalledTimes(1);
    expect(result.current.apps).toEqual(appsA);
    expect(result.current.lastFetchTime).not.toBeNull();
  });

  it('bypasses the cache when forced', async () => {
    const { result } = renderIdle();

    await act(async () => {
      await result.current.loadApps();
    });
    await act(async () => {
      await result.current.loadApps(true);
    });

    expect(getAllApps).toHaveBeenCalledTimes(2);
  });

  it('seeds a fresh consumer from the cache without fetching', async () => {
    const first = renderIdle();
    await act(async () => {
      await first.result.current.loadApps();
    });

    const second = renderIdle();
    expect(second.result.current.apps).toEqual(appsA);
    expect(getAllApps).toHaveBeenCalledTimes(1);
  });

  it('carries the fetch time back when returning to an already-cached org', async () => {
    const { result, rerender } = renderHook(
      ({ origin }: { origin: string }) =>
        useAppsData({ api, onError, targetTabId: 1, oktaOrigin: origin, enabled: false }),
      { initialProps: { origin: ORIGIN } },
    );

    await act(async () => {
      await result.current.loadApps();
    });
    const firstFetch = result.current.lastFetchTime;
    expect(firstFetch).not.toBeNull();

    rerender({ origin: 'https://other.okta.com' });
    expect(result.current.apps).toEqual([]);
    expect(result.current.lastFetchTime).toBeNull();

    rerender({ origin: ORIGIN });
    expect(result.current.apps).toEqual(appsA);
    expect(result.current.lastFetchTime).toBe(firstFetch);
    expect(getAllApps).toHaveBeenCalledTimes(1);
  });

  it('keeps each org in its own cache entry', async () => {
    const { result, rerender } = renderHook(
      ({ origin }: { origin: string }) =>
        useAppsData({ api, onError, targetTabId: 1, oktaOrigin: origin, enabled: false }),
      { initialProps: { origin: ORIGIN } },
    );

    await act(async () => {
      await result.current.loadApps();
    });
    expect(result.current.apps).toEqual(appsA);

    getAllApps.mockResolvedValue(appsB);
    rerender({ origin: 'https://other.okta.com' });
    expect(result.current.apps).toEqual([]);

    await act(async () => {
      await result.current.loadApps();
    });
    expect(getAllApps).toHaveBeenCalledTimes(2);
    expect(result.current.apps).toEqual(appsB);
  });

  it('reports a missing Okta tab instead of fetching', async () => {
    const { result } = renderIdle({ targetTabId: null });

    await act(async () => {
      await result.current.loadApps();
    });

    expect(getAllApps).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith('No Okta tab connected');
    expect(result.current.apps).toEqual([]);
  });

  it('surfaces a fatal inventory read through onError', async () => {
    getAllApps.mockRejectedValue(new Error('scheduler unavailable'));
    const { result } = renderIdle();

    await act(async () => {
      await result.current.loadApps();
    });

    expect(onError).toHaveBeenCalledWith('scheduler unavailable');
    expect(result.current.apps).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('defers the auto-load while the tab is hidden and pays it on the next show', async () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useAppsData({ api, onError, targetTabId: 1, oktaOrigin: ORIGIN, enabled }),
      { initialProps: { enabled: false } },
    );

    expect(getAllApps).not.toHaveBeenCalled();

    rerender({ enabled: true });
    await waitFor(() => expect(getAllApps).toHaveBeenCalledTimes(1));
  });

  it('re-arms the auto-load when the org changes under a stable tab id', async () => {
    const { rerender } = renderHook(
      ({ origin }: { origin: string }) =>
        useAppsData({ api, onError, targetTabId: 1, oktaOrigin: origin, enabled: true }),
      { initialProps: { origin: ORIGIN } },
    );

    await waitFor(() => expect(getAllApps).toHaveBeenCalledTimes(1));

    getAllApps.mockResolvedValue(appsB);
    rerender({ origin: 'https://other.okta.com' });

    await waitFor(() => expect(getAllApps).toHaveBeenCalledTimes(2));
  });
});
