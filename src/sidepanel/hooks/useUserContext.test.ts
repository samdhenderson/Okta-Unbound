import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserContext } from './useUserContext';

type SendResponse = { success: boolean; data?: unknown };

const FAKE_ORIGIN = 'https://fake-org.okta.com';
const FAKE_TAB = { id: 42, url: `${FAKE_ORIGIN}/admin/user/profile/view/00uFAKE1`, active: true };

function mockOktaTab(responder: (action: string) => SendResponse) {
  (chrome as unknown as { windows: unknown }).windows = {
    getCurrent: vi.fn().mockResolvedValue({ id: 1 }),
  };
  chrome.tabs.query = vi.fn().mockResolvedValue([FAKE_TAB]);
  chrome.tabs.sendMessage = vi
    .fn()
    .mockImplementation((_tabId: number, msg: { action: string }) =>
      Promise.resolve(responder(msg.action)),
    ) as unknown as typeof chrome.tabs.sendMessage;
  chrome.tabs.get = vi.fn();
}

const originReply: SendResponse = { success: true, data: FAKE_ORIGIN };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useUserContext user-info reduction', () => {
  it('exposes the detected user when the probe succeeds with data', async () => {
    const userInfo = { userId: '00uFAKE1', userName: 'Fake User' };
    mockOktaTab((action) =>
      action === 'getUserInfo' ? { success: true, data: userInfo } : originReply,
    );

    const { result } = renderHook(() => useUserContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.userInfo).toEqual(userInfo);
    expect(result.current.connectionStatus).toBe('connected');
  });

  it('ignores the payload of an unsuccessful probe', async () => {
    mockOktaTab((action) =>
      action === 'getUserInfo'
        ? { success: false, data: { userId: '00uFAKE9', userName: 'Should Not Render' } }
        : originReply,
    );

    const { result } = renderHook(() => useUserContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.userInfo).toBeNull();
    expect(result.current.connectionStatus).toBe('connected');
    expect(result.current.error).toBeNull();
  });

  it('normalises a successful but empty probe to null', async () => {
    mockOktaTab((action) => (action === 'getUserInfo' ? { success: true } : originReply));

    const { result } = renderHook(() => useUserContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.userInfo).toBeNull();
    expect(result.current.connectionStatus).toBe('connected');
  });
});
