import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { ProgressProvider } from './contexts/ProgressContext';
import { WELCOME_SEEN_STORAGE_KEY } from '../shared/storage/welcomeStore';

vi.mock('idb', () => ({
  openDB: vi.fn(async () => ({
    get: async () => undefined,
    put: async () => {},
    delete: async () => {},
    getAllFromIndex: async () => [],
    getAllKeysFromIndex: async () => [],
    transaction: () => ({
      store: { put: async () => {}, delete: async () => {} },
      done: Promise.resolve(),
    }),
  })),
}));

const ORIGIN = 'https://example.okta.com';

const OKTA_TAB = {
  id: 1,
  active: true,
  url: `${ORIGIN}/admin/groups`,
  windowId: 1,
};

const runtimeSendMessage = vi.fn();
const tabsSendMessage = vi.fn();
const storageGet = vi.fn();
const storageSet = vi.fn();
const storageRemove = vi.fn();

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
      create: vi.fn(async () => ({})),
      sendMessage: tabsSendMessage,
      onActivated: { addListener: vi.fn(), removeListener: vi.fn() },
      onUpdated: { addListener: vi.fn(), removeListener: vi.fn() },
    },
    windows: { getCurrent: vi.fn(async () => ({ id: 1 })) },
    storage: {
      local: { get: storageGet, set: storageSet, remove: storageRemove },
      sync: { get: storageGet, set: storageSet, remove: vi.fn() },
      onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
    },
  } as unknown as typeof chrome;

  storageGet.mockResolvedValue({});
  storageSet.mockResolvedValue(undefined);
  storageRemove.mockResolvedValue(undefined);

  tabsSendMessage.mockImplementation(async (_tabId: number, msg: { action: string }) => {
    if (msg.action === 'getOktaOrigin') return { success: true, data: ORIGIN };
    return { success: false };
  });

  runtimeSendMessage.mockImplementation(async () => ({ success: true, data: [] }));
});

const renderApp = () =>
  render(
    <ProgressProvider>
      <App />
    </ProgressProvider>,
  );

const welcomeHeading = () => screen.queryByRole('heading', { name: 'Welcome to Okta Unbound' });
const rail = () => screen.queryByRole('tablist', { name: 'Main sections' });

const welcomeWrites = () =>
  storageSet.mock.calls.filter(([value]) => value?.[WELCOME_SEEN_STORAGE_KEY] === true);

describe('App welcome gate', () => {
  it('renders the welcome and not the rail when the flag is unset', async () => {
    renderApp();

    expect(await screen.findByRole('heading', { name: 'Welcome to Okta Unbound' })).toBeVisible();
    expect(rail()).not.toBeInTheDocument();
  });

  it('brings the rail in and writes the flag when "Start using it" is pressed', async () => {
    const uev = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'Welcome to Okta Unbound' });

    await uev.click(screen.getByRole('button', { name: 'Start using it' }));

    expect(await screen.findByRole('tablist', { name: 'Main sections' })).toBeInTheDocument();
    expect(welcomeHeading()).not.toBeInTheDocument();
    await waitFor(() => expect(welcomeWrites()).toHaveLength(1));
  });

  it('renders the rail and no welcome when the flag is set', async () => {
    storageGet.mockImplementation(async (key: unknown) =>
      key === WELCOME_SEEN_STORAGE_KEY ? { [WELCOME_SEEN_STORAGE_KEY]: true } : {},
    );
    renderApp();

    expect(await screen.findByRole('tablist', { name: 'Main sections' })).toBeInTheDocument();
    expect(welcomeHeading()).not.toBeInTheDocument();
  });

  it('renders neither while the storage read is pending', async () => {
    let resolveRead: (value: Record<string, unknown>) => void = () => {};
    storageGet.mockImplementation(
      (key: unknown) =>
        new Promise<Record<string, unknown>>((resolve) => {
          if (key === WELCOME_SEEN_STORAGE_KEY) resolveRead = resolve;
          else resolve({});
        }),
    );
    renderApp();

    await waitFor(() => expect(storageGet).toHaveBeenCalledWith(WELCOME_SEEN_STORAGE_KEY));
    expect(welcomeHeading()).not.toBeInTheDocument();
    expect(rail()).not.toBeInTheDocument();

    resolveRead({});
    expect(await screen.findByRole('heading', { name: 'Welcome to Okta Unbound' })).toBeVisible();
  });
});
