import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { OktaPolicyListItem } from '../../shared/schemas/okta';
import type { PolicyListResult } from './useOktaApi/policyOperations';

const policies: OktaPolicyListItem[] = [
  { id: 'rstFAKE000000000001', name: 'Any two factors', status: 'ACTIVE', type: 'ACCESS_POLICY' },
];

const api = vi.hoisted(() => ({
  listPolicies: vi.fn(async (): Promise<PolicyListResult> => ({ outcome: 'listed', policies: [] })),
  getPolicyRules: vi.fn(async () => []),
}));

vi.mock('./useOktaApi', () => ({ useOktaApi: () => api }));

import { usePoliciesData, AUTH_POLICY_TYPE, POLICIES_CACHE_KEY } from './usePoliciesData';
import { resetEntityCache, setEntry } from '../cache/entityCache';

const onError = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
  api.listPolicies.mockResolvedValue({ outcome: 'listed', policies });
});

describe('usePoliciesData', () => {
  it('reports the cached entry fetch time when it paints from a cache hit', () => {
    setEntry(POLICIES_CACHE_KEY, policies);

    const { result } = renderHook(() => usePoliciesData({ targetTabId: 1, onError }));

    expect(result.current.policies).toEqual(policies);
    expect(result.current.lastFetchTime).not.toBeNull();
    expect(api.listPolicies).not.toHaveBeenCalled();
  });

  it('loads ACCESS_POLICY policies and records the fetch time', async () => {
    const { result } = renderHook(() => usePoliciesData({ targetTabId: 1, onError }));

    expect(result.current.policies).toEqual([]);
    expect(result.current.lastFetchTime).toBeNull();

    await act(async () => {
      await result.current.loadPolicies();
    });

    expect(api.listPolicies).toHaveBeenCalledWith(AUTH_POLICY_TYPE);
    expect(result.current.policies).toEqual(policies);
    expect(result.current.lastFetchTime).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(onError).toHaveBeenCalledWith('');
  });

  it('serves a second load from the entity cache without refetching', async () => {
    const { result } = renderHook(() => usePoliciesData({ targetTabId: 1, onError }));

    await act(async () => {
      await result.current.loadPolicies();
    });
    await act(async () => {
      await result.current.loadPolicies();
    });

    expect(api.listPolicies).toHaveBeenCalledTimes(1);
    expect(result.current.policies).toEqual(policies);
  });

  it('bypasses the cache when forced', async () => {
    const { result } = renderHook(() => usePoliciesData({ targetTabId: 1, onError }));

    await act(async () => {
      await result.current.loadPolicies();
    });
    await act(async () => {
      await result.current.loadPolicies(true);
    });

    expect(api.listPolicies).toHaveBeenCalledTimes(2);
  });

  it('reports a missing Okta tab instead of fetching', async () => {
    const { result } = renderHook(() => usePoliciesData({ onError }));

    await act(async () => {
      await result.current.loadPolicies();
    });

    expect(api.listPolicies).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith('No Okta tab connected');
    expect(result.current.policies).toEqual([]);
  });

  it('surfaces a rejected list read through onError', async () => {
    api.listPolicies.mockRejectedValue(new Error('scheduler unavailable'));
    const { result } = renderHook(() => usePoliciesData({ targetTabId: 1, onError }));

    await act(async () => {
      await result.current.loadPolicies();
    });

    expect(onError).toHaveBeenCalledWith('scheduler unavailable');
    expect(result.current.isLoading).toBe(false);
  });

  describe('readState (D-D)', () => {
    it('starts unread, even when the cache seeded rows', () => {
      setEntry(POLICIES_CACHE_KEY, policies);

      const { result } = renderHook(() => usePoliciesData({ targetTabId: 1, onError }));

      expect(result.current.readState).toBe('unread');
    });

    it('is listed once Okta answers, including when it answers with nothing', async () => {
      api.listPolicies.mockResolvedValue({ outcome: 'listed', policies: [] });
      const { result } = renderHook(() => usePoliciesData({ targetTabId: 1, onError }));

      await act(async () => {
        await result.current.loadPolicies();
      });

      expect(result.current.readState).toBe('listed');
      expect(result.current.policies).toEqual([]);
    });

    it('is forbidden on a 403, and says nothing through the error banner', async () => {
      api.listPolicies.mockResolvedValue({ outcome: 'forbidden' });
      const { result } = renderHook(() => usePoliciesData({ targetTabId: 1, onError }));

      await act(async () => {
        await result.current.loadPolicies();
      });

      expect(result.current.readState).toBe('forbidden');
      expect(result.current.policies).toEqual([]);
      expect(onError).not.toHaveBeenCalledWith(expect.stringContaining('olic'));
    });

    it('does not cache a refusal, so a widened role is picked up on the next load', async () => {
      api.listPolicies.mockResolvedValue({ outcome: 'forbidden' });
      const { result } = renderHook(() => usePoliciesData({ targetTabId: 1, onError }));

      await act(async () => {
        await result.current.loadPolicies();
      });
      expect(result.current.readState).toBe('forbidden');

      api.listPolicies.mockResolvedValue({ outcome: 'listed', policies });
      await act(async () => {
        await result.current.loadPolicies();
      });

      expect(api.listPolicies).toHaveBeenCalledTimes(2);
      expect(result.current.readState).toBe('listed');
      expect(result.current.policies).toEqual(policies);
    });

    it('stays unread on a non-403 failure, which does reach the error banner', async () => {
      api.listPolicies.mockResolvedValue({ outcome: 'failed', message: 'Bad gateway' });
      const { result } = renderHook(() => usePoliciesData({ targetTabId: 1, onError }));

      await act(async () => {
        await result.current.loadPolicies();
      });

      expect(result.current.readState).toBe('unread');
      expect(onError).toHaveBeenCalledWith('Bad gateway');
    });
  });
});
