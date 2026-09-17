import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserMemberships } from './useUserMemberships';
import { setEntry, resetEntityCache } from '../cache/entityCache';
import type { OktaUser } from '../../shared/types';

vi.mock('./getUserGroupsRequest', () => ({
  getUserGroupsRequest: vi.fn().mockRejectedValue(new Error('boundary validation failed')),
}));
const { logError } = vi.hoisted(() => ({ logError: vi.fn() }));
vi.mock('../../shared/utils/logger', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: logError }),
}));

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

describe('useUserMemberships load failure logging (D-051)', () => {
  it('logs a narrowed message, never the raw caught error object', async () => {
    const { result } = renderHook(() => useUserMemberships({ targetTabId: 1 }));

    await act(async () => {
      await result.current.loadMemberships(user);
    });

    expect(logError).toHaveBeenCalledWith(
      'Membership loading error:',
      'boundary validation failed',
    );
    for (const call of logError.mock.calls) {
      for (const arg of call) {
        expect(arg).not.toBeInstanceOf(Error);
      }
    }
  });
});

describe('a membership list nobody read is not an empty one', () => {
  it('leaves memberships undefined after a load that failed', async () => {
    const { result } = renderHook(() => useUserMemberships({ targetTabId: 1 }));

    await act(async () => {
      await result.current.loadMemberships(user);
    });

    expect(result.current.error).toBe('boundary validation failed');
    expect(result.current.memberships).toBeUndefined();
  });

  it('starts undefined and returns there on clear, never at []', async () => {
    setEntry(['userMemberships', user.id], []);
    const { result } = renderHook(() => useUserMemberships({ targetTabId: 1 }));

    expect(result.current.memberships).toBeUndefined();

    await act(async () => {
      await result.current.loadMemberships(user);
    });
    expect(result.current.memberships).toEqual([]);

    act(() => {
      result.current.clearMemberships();
    });
    expect(result.current.memberships).toBeUndefined();
  });
});
