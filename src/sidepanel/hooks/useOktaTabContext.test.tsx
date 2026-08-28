import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useGroupContext } from './useGroupContext';
import { useUserContext } from './useUserContext';
import { useOktaPageContext } from './useOktaPageContext';

type SendResponse = { success: boolean; data?: unknown };

function lastListener<T>(addListener: unknown): T {
  const calls = (addListener as { mock: { calls: unknown[][] } }).mock.calls;
  return calls[calls.length - 1][0] as T;
}

function sendCount(): number {
  return (chrome.tabs.sendMessage as unknown as { mock: { calls: unknown[] } }).mock.calls.length;
}

function setVisibility(state: 'visible' | 'hidden'): void {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  Object.defineProperty(document, 'hidden', { value: state === 'hidden', configurable: true });
}

const afterDebounce = () => new Promise((r) => setTimeout(r, 250));

function mockOktaTab(responder: (action: string) => SendResponse, tabs?: unknown[]) {
  (chrome as unknown as { windows: unknown }).windows = {
    getCurrent: vi.fn().mockResolvedValue({ id: 1 }),
  };
  chrome.tabs.query = vi
    .fn()
    .mockResolvedValue(
      tabs ?? [{ id: 42, url: 'https://acme.okta.com/admin/groups', active: true }],
    );
  chrome.tabs.sendMessage = vi
    .fn()
    .mockImplementation((_tabId: number, msg: { action: string }) =>
      Promise.resolve(responder(msg.action)),
    ) as unknown as typeof chrome.tabs.sendMessage;
  chrome.tabs.get = vi.fn();
}

const origin = (action: string): SendResponse =>
  action === 'getOktaOrigin'
    ? { success: true, data: 'https://acme.okta.com' }
    : { success: false };

describe('useOktaTabContext (via context hooks)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useGroupContext connects and returns group info on a group page', async () => {
    mockOktaTab((action) => {
      if (action === 'getGroupInfo')
        return { success: true, data: { groupId: '00g1', groupName: 'Engineering' } };
      return origin(action);
    });

    const { result } = renderHook(() => useGroupContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.connectionStatus).toBe('connected');
    expect(result.current.groupInfo).toEqual({ groupId: '00g1', groupName: 'Engineering' });
    expect(result.current.oktaOrigin).toBe('https://acme.okta.com');
    expect(result.current.targetTabId).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it('reports connected-with-null when on Okta admin but not a group page', async () => {
    mockOktaTab(origin); // getGroupInfo → { success: false }

    const { result } = renderHook(() => useGroupContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.connectionStatus).toBe('connected');
    expect(result.current.groupInfo).toBeNull();
  });

  it('surfaces an error when no Okta tab is open', async () => {
    mockOktaTab(origin, []); // no tabs in the window

    const { result } = renderHook(() => useUserContext());

    await waitFor(() => expect(result.current.connectionStatus).toBe('error'));
    expect(result.current.error).toMatch(/Okta admin page/);
    expect(result.current.userInfo).toBeNull();
  });

  it('useOktaPageContext detects a user page', async () => {
    mockOktaTab((action) => {
      if (action === 'getUserInfo')
        return { success: true, data: { userId: '00u1', userName: 'Jane Doe' } };
      return origin(action);
    });

    const { result } = renderHook(() => useOktaPageContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pageType).toBe('user');
    expect(result.current.userInfo).toEqual({ userId: '00u1', userName: 'Jane Doe' });
    expect(result.current.groupInfo).toBeNull();
    expect(result.current.appInfo).toBeNull();
  });

  it('reports error (not a fake "connected") when the content script is unreachable', async () => {
    vi.useFakeTimers();
    try {
      (chrome as unknown as { windows: unknown }).windows = {
        getCurrent: vi.fn().mockResolvedValue({ id: 1 }),
      };
      chrome.tabs.query = vi
        .fn()
        .mockResolvedValue([{ id: 42, url: 'https://acme.okta.com/admin/groups', active: true }]);
      chrome.tabs.get = vi.fn();
      chrome.tabs.sendMessage = vi
        .fn()
        .mockRejectedValue(
          new Error('Could not establish connection. Receiving end does not exist.'),
        ) as unknown as typeof chrome.tabs.sendMessage;

      const { result } = renderHook(() => useGroupContext());

      await act(async () => {
        await vi.advanceTimersByTimeAsync(20000);
      });

      expect(result.current.connectionStatus).toBe('error');
      expect(result.current.groupInfo).toBeNull();
      expect(result.current.error).toMatch(/reconnect/i);
    } finally {
      vi.useRealTimers();
    }
  });

  it('useOktaPageContext falls back to admin when no entity is detected', async () => {
    mockOktaTab(origin); // all entity probes → { success: false }

    const { result } = renderHook(() => useOktaPageContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pageType).toBe('admin');
    expect(result.current.connectionStatus).toBe('connected');
  });
});

describe('useOktaTabContext detection hygiene', () => {
  const groupResponder = (action: string): SendResponse =>
    action === 'getGroupInfo'
      ? { success: true, data: { groupId: '00g1', groupName: 'Engineering' } }
      : origin(action);

  beforeEach(() => {
    vi.clearAllMocks();
    setVisibility('visible');
  });

  afterEach(() => {
    setVisibility('visible');
  });

  it('does not refetch on a hash-only URL change', async () => {
    mockOktaTab(groupResponder); // initial tab url: .../admin/groups
    const { result } = renderHook(() => useGroupContext());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const before = sendCount();
    const onUpdated = lastListener<
      (id: number, change: { url?: string }, tab: chrome.tabs.Tab) => void
    >(chrome.tabs.onUpdated.addListener);

    const hashUrl = 'https://acme.okta.com/admin/groups#assignments';
    onUpdated(42, { url: hashUrl }, { url: hashUrl } as chrome.tabs.Tab);

    await afterDebounce();
    expect(sendCount()).toBe(before);
  });

  it('refetches when navigating to a different entity URL', async () => {
    mockOktaTab(groupResponder);
    const { result } = renderHook(() => useGroupContext());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const before = sendCount();
    const onUpdated = lastListener<
      (id: number, change: { url?: string }, tab: chrome.tabs.Tab) => void
    >(chrome.tabs.onUpdated.addListener);

    const nextUrl = 'https://acme.okta.com/admin/groups/00gOTHER';
    onUpdated(42, { url: nextUrl }, { url: nextUrl } as chrome.tabs.Tab);

    await waitFor(() => expect(sendCount()).toBeGreaterThan(before));
  });

  it('defers refetch while the panel is hidden and catches up when shown', async () => {
    mockOktaTab(groupResponder);
    const { result } = renderHook(() => useGroupContext());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const before = sendCount();
    const onUpdated = lastListener<
      (id: number, change: { url?: string }, tab: chrome.tabs.Tab) => void
    >(chrome.tabs.onUpdated.addListener);

    setVisibility('hidden');
    const nextUrl = 'https://acme.okta.com/admin/groups/00gHIDDEN';
    onUpdated(42, { url: nextUrl }, { url: nextUrl } as chrome.tabs.Tab);
    await afterDebounce();
    expect(sendCount()).toBe(before);

    setVisibility('visible');
    document.dispatchEvent(new globalThis.Event('visibilitychange'));
    await waitFor(() => expect(sendCount()).toBeGreaterThan(before));
  });
});

describe('useOktaTabContext reload recovery', () => {
  const groupUrl = 'https://acme.okta.com/admin/groups';

  const groupResponder = (action: string): SendResponse =>
    action === 'getGroupInfo'
      ? { success: true, data: { groupId: '00g1', groupName: 'Engineering' } }
      : origin(action);

  type OnUpdated = (
    id: number,
    change: { url?: string; status?: string },
    tab: chrome.tabs.Tab,
  ) => void;

  function mockUnreachableTab() {
    (chrome as unknown as { windows: unknown }).windows = {
      getCurrent: vi.fn().mockResolvedValue({ id: 1 }),
    };
    chrome.tabs.query = vi.fn().mockResolvedValue([{ id: 42, url: groupUrl, active: true }]);
    chrome.tabs.get = vi.fn();
    const sendMessage = vi
      .fn()
      .mockRejectedValue(
        new Error('Could not establish connection. Receiving end does not exist.'),
      );
    chrome.tabs.sendMessage = sendMessage as unknown as typeof chrome.tabs.sendMessage;
    return sendMessage;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    setVisibility('visible');
  });

  afterEach(() => {
    setVisibility('visible');
    vi.useRealTimers();
  });

  it('recovers from error when the Okta tab is reloaded at the same URL', async () => {
    vi.useFakeTimers();
    const sendMessage = mockUnreachableTab();

    const { result } = renderHook(() => useGroupContext());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });
    expect(result.current.connectionStatus).toBe('error');

    sendMessage.mockImplementation((_tabId: number, msg: { action: string }) =>
      Promise.resolve(groupResponder(msg.action)),
    );

    const onUpdated = lastListener<OnUpdated>(chrome.tabs.onUpdated.addListener);
    await act(async () => {
      onUpdated(42, { status: 'complete' }, { url: groupUrl } as chrome.tabs.Tab);
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(result.current.connectionStatus).toBe('connected');
    expect(result.current.groupInfo).toEqual({ groupId: '00g1', groupName: 'Engineering' });
    expect(result.current.error).toBeNull();
  });

  it('re-probes on a same-URL document reload while already connected', async () => {
    mockOktaTab(groupResponder);
    const { result } = renderHook(() => useGroupContext());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.connectionStatus).toBe('connected');

    const before = sendCount();
    const onUpdated = lastListener<OnUpdated>(chrome.tabs.onUpdated.addListener);

    onUpdated(42, { status: 'complete' }, { url: groupUrl } as chrome.tabs.Tab);

    await waitFor(() => expect(sendCount()).toBeGreaterThan(before));
  });

  it('does not latch the entity URL after a failed attempt', async () => {
    vi.useFakeTimers();
    mockUnreachableTab();

    const { result } = renderHook(() => useGroupContext());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });
    expect(result.current.connectionStatus).toBe('error');

    const before = sendCount();
    const onUpdated = lastListener<OnUpdated>(chrome.tabs.onUpdated.addListener);

    await act(async () => {
      onUpdated(42, { url: groupUrl }, { url: groupUrl } as chrome.tabs.Tab);
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(sendCount()).toBeGreaterThan(before);
  });

  it('clears a pending backoff retry on unmount', async () => {
    vi.useFakeTimers();
    mockUnreachableTab();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = renderHook(() => useGroupContext());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    const afterFirstAttempt = sendCount();
    expect(afterFirstAttempt).toBeGreaterThan(0);

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });

    expect(sendCount()).toBe(afterFirstAttempt);
    expect(
      consoleError.mock.calls.filter(([first]) =>
        /not wrapped in act|unmounted component/i.test(String(first)),
      ),
    ).toEqual([]);
    consoleError.mockRestore();
  });
});

describe('useOktaPageContext enablement', () => {
  const groupResponder = (action: string): SendResponse =>
    action === 'getGroupInfo'
      ? { success: true, data: { groupId: '00g1', groupName: 'Engineering' } }
      : origin(action);

  beforeEach(() => {
    vi.clearAllMocks();
    setVisibility('visible');
  });

  afterEach(() => {
    setVisibility('visible');
  });

  function navigateTo(url: string): void {
    const onUpdated = lastListener<
      (id: number, change: { url?: string }, tab: chrome.tabs.Tab) => void
    >(chrome.tabs.onUpdated.addListener);
    onUpdated(42, { url }, { url } as chrome.tabs.Tab);
  }

  it('re-detects on navigation while enabled, whatever tab is on screen', async () => {
    mockOktaTab(groupResponder);
    const { result } = renderHook(() => useOktaPageContext(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const before = sendCount();
    navigateTo('https://acme.okta.com/admin/groups/00gOTHER');
    await waitFor(() => expect(sendCount()).toBeGreaterThan(before));
  });

  it('stays inert once pinned', async () => {
    mockOktaTab(groupResponder);
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useOktaPageContext(enabled),
      { initialProps: { enabled: true } },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ enabled: false });
    const before = sendCount();
    navigateTo('https://acme.okta.com/admin/groups/00gOTHER');
    await afterDebounce();
    expect(sendCount()).toBe(before);
  });

  it('stays inert while the panel is hidden, even though it is always enabled', async () => {
    mockOktaTab(groupResponder);
    const { result } = renderHook(() => useOktaPageContext(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const before = sendCount();
    setVisibility('hidden');
    navigateTo('https://acme.okta.com/admin/groups/00gHIDDEN');
    await afterDebounce();
    expect(sendCount()).toBe(before);

    setVisibility('visible');
    document.dispatchEvent(new globalThis.Event('visibilitychange'));
    await waitFor(() => expect(sendCount()).toBeGreaterThan(before));
  });
});
