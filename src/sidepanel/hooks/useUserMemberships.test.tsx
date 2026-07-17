import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserMemberships } from './useUserMemberships';
import { setEntry, resetEntityCache } from '../cache/entityCache';
import type { OktaUser } from '../../shared/types';

const tabsSendMessage = vi.fn();
globalThis.chrome = {
  tabs: { sendMessage: tabsSendMessage },
} as unknown as typeof chrome;

const user = { id: 'u1' } as OktaUser;

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
});

describe('useUserMemberships cache-hit loading lifecycle', () => {
  it('clears the loading flag when serving a cached analysis', async () => {
    setEntry(['userMemberships', user.id], []);

    const onLoadingChange = vi.fn();
    const { result } = renderHook(() => useUserMemberships({ targetTabId: 1, onLoadingChange }));

    await act(async () => {
      await result.current.loadMemberships(user);
    });

    expect(onLoadingChange).toHaveBeenCalledWith(false);
    expect(tabsSendMessage).not.toHaveBeenCalled();
  });
});
