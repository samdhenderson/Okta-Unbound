import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserContext } from './useUserContext';
import type { UserInfo } from '../../shared/types';

type SendResponse = { success: boolean; data?: unknown };

const FAKE_ORIGIN = 'https://fake-org.okta.com';
const FAKE_TAB_URL = `${FAKE_ORIGIN}/admin/user/profile/view/00uFAKEUSER1`;

const USER: UserInfo = {
  userId: '00uFAKEUSER1',
  userName: 'Fake User',
  userEmail: 'user@example.com',
};

function mockOktaTab(responder: (action: string) => SendResponse) {
  (chrome as unknown as { windows: unknown }).windows = {
    getCurrent: vi.fn().mockResolvedValue({ id: 1 }),
  };
  chrome.tabs.query = vi.fn().mockResolvedValue([{ id: 42, url: FAKE_TAB_URL, active: true }]);
  chrome.tabs.get = vi.fn();
  chrome.tabs.sendMessage = vi
    .fn()
    .mockImplementation((_tabId: number, msg: { action: string }) =>
      Promise.resolve(responder(msg.action)),
    ) as unknown as typeof chrome.tabs.sendMessage;
}

const originResponse: SendResponse = { success: true, data: FAKE_ORIGIN };

describe('useUserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports the user when the content script returns one', async () => {
    mockOktaTab((action) =>
      action === 'getUserInfo' ? { success: true, data: USER } : originResponse,
    );

    const { result } = renderHook(() => useUserContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.userInfo).toEqual(USER);
    expect(result.current.connectionStatus).toBe('connected');
    expect(result.current.oktaOrigin).toBe(FAKE_ORIGIN);
    expect(result.current.targetTabId).toBe(42);
  });

  it('reports no user — while staying connected — when the probe fails', async () => {
    mockOktaTab((action) => (action === 'getUserInfo' ? { success: false } : originResponse));

    const { result } = renderHook(() => useUserContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.userInfo).toBeNull();
    expect(result.current.connectionStatus).toBe('connected');
    expect(result.current.error).toBeNull();
  });

  it('does not trust a failure response that still carries a payload', async () => {
    mockOktaTab((action) =>
      action === 'getUserInfo' ? { success: false, data: USER } : originResponse,
    );

    const { result } = renderHook(() => useUserContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.userInfo).toBeNull();
  });

  it('reports no user when a successful response carries no data', async () => {
    mockOktaTab((action) => (action === 'getUserInfo' ? { success: true } : originResponse));

    const { result } = renderHook(() => useUserContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.userInfo).toBeNull();
    expect(result.current.connectionStatus).toBe('connected');
  });
});
