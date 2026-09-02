import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { ProgressProvider } from './contexts/ProgressContext';

const ORIGIN = 'https://example.okta.com';

const { fakeDB } = vi.hoisted(() => ({
  fakeDB: {
    get: async () => undefined,
    put: async () => undefined,
    delete: async () => undefined,
    getAllFromIndex: async () => [],
    getAllKeysFromIndex: async () => [],
    transaction: () => ({
      store: { put: async () => undefined, delete: async () => undefined },
      done: Promise.resolve(),
    }),
  },
}));

vi.mock('idb', () => ({ openDB: vi.fn(async () => fakeDB) }));

const ENGINEERING = { groupId: '00g1', groupName: 'Engineering' };
const FINANCE = { groupId: '00g2', groupName: 'Finance' };

const OKTA_TAB = { id: 1, active: true, url: `${ORIGIN}/admin/group/00g1`, windowId: 1 };

const tabsSendMessage = vi.fn();
const runtimeSendMessage = vi.fn();

function onGroupPage(group: { groupId: string; groupName: string }) {
  tabsSendMessage.mockImplementation(async (_tabId: number, msg: { action: string }) => {
    if (msg.action === 'getOktaOrigin') return { success: true, data: ORIGIN };
    if (msg.action === 'getGroupInfo') return { success: true, data: group };
    return { success: false };
  });
}

const originCalls = () =>
  tabsSendMessage.mock.calls.filter(([, msg]) => msg?.action === 'getOktaOrigin').length;

const updateListeners = () =>
  (chrome.tabs.onUpdated.addListener as ReturnType<typeof vi.fn>).mock.calls;

function navigateTo(url: string) {
  const tab = { ...OKTA_TAB, url };
  (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([tab]);
  for (const [listener] of updateListeners()) {
    (listener as (id: number, c: { url?: string }, t: unknown) => void)(1, { url }, tab);
  }
}

beforeEach(() => {
  vi.clearAllMocks();

  globalThis.chrome = {
    runtime: {
      sendMessage: runtimeSendMessage,
      getURL: (p: string) => p,
      onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
      lastError: undefined,
    },
    tabs: {
      query: vi.fn(async () => [OKTA_TAB]),
      get: vi.fn(),
      reload: vi.fn(),
      sendMessage: tabsSendMessage,
      onActivated: { addListener: vi.fn(), removeListener: vi.fn() },
      onUpdated: { addListener: vi.fn(), removeListener: vi.fn() },
    },
    windows: { getCurrent: vi.fn(async () => ({ id: 1 })) },
    storage: {
      local: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
      sync: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
      onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
    },
  } as unknown as typeof chrome;

  onGroupPage(ENGINEERING);
  runtimeSendMessage.mockImplementation(async () => ({ success: true, data: [] }));
});

const renderApp = () =>
  render(
    <ProgressProvider>
      <App />
    </ProgressProvider>,
  );

describe('App context engine', () => {
  it('probes the live tab once per navigation, from one listener', async () => {
    renderApp();

    expect(await screen.findByText('Engineering')).toBeInTheDocument();

    expect(updateListeners()).toHaveLength(1);
    expect(originCalls()).toBe(1);

    const before = originCalls();
    navigateTo(`${ORIGIN}/admin/group/00g2`);
    onGroupPage(FINANCE);

    await waitFor(() => expect(screen.getByText('Finance')).toBeInTheDocument());
    expect(originCalls()).toBe(before + 1);
  });

  it('keeps detecting while pinned, and names where the live tab went', async () => {
    const uev = userEvent.setup();
    renderApp();
    expect(await screen.findByText('Engineering')).toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: 'Pin' }));
    expect(screen.getByRole('button', { name: 'Pinned' })).toBeInTheDocument();

    const before = originCalls();
    navigateTo(`${ORIGIN}/admin/group/00g2`);
    onGroupPage(FINANCE);

    await waitFor(() => expect(originCalls()).toBeGreaterThan(before));

    await screen.findByText('Finance', { selector: 'strong' });
    expect(screen.getByText(/Live tab moved to/)).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('raises no live-changed hint while the live tab is still on the pinned entity', async () => {
    const uev = userEvent.setup();
    renderApp();
    expect(await screen.findByText('Engineering')).toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: 'Pin' }));

    navigateTo(`${ORIGIN}/admin/group/00g1`);
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(screen.queryByText(/Live tab moved to/)).not.toBeInTheDocument();
    expect(screen.queryByText(/The live Okta tab has changed/)).not.toBeInTheDocument();
  });
});
