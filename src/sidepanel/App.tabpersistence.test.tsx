import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { ProgressProvider } from './contexts/ProgressContext';

const ORIGIN = 'https://example.okta.com';

const { fakeDB, idbTables, collectionReads } = vi.hoisted(() => {
  const idbTables = new Map<string, Map<string, any>>();
  const collectionReads: string[] = [];
  const keyOf = (key: unknown) => (Array.isArray(key) ? key.join('::') : String(key));
  const table = (name: string) => {
    if (!idbTables.has(name)) idbTables.set(name, new Map());
    return idbTables.get(name)!;
  };
  const pk = (name: string, value: any) =>
    name === 'syncMeta' ? [value.origin, value.collection] : [value.origin, value.id];
  const fakeDB = {
    get: async (name: string, key: unknown) => table(name).get(keyOf(key)),
    put: async (name: string, value: any) => {
      table(name).set(keyOf(pk(name, value)), value);
    },
    delete: async (name: string, key: unknown) => {
      table(name).delete(keyOf(key));
    },
    getAllFromIndex: async (name: string, _i: string, origin: string) => {
      collectionReads.push(name);
      return [...table(name).values()].filter((v) => v.origin === origin);
    },
    getAllKeysFromIndex: async (name: string, _i: string, origin: string) =>
      [...table(name).values()].filter((v) => v.origin === origin).map((v) => pk(name, v)),
    transaction: (name: string) => ({
      store: {
        put: async (value: any) => {
          table(name).set(keyOf(pk(name, value)), value);
        },
        delete: async (key: unknown) => {
          table(name).delete(keyOf(key));
        },
      },
      done: Promise.resolve(),
    }),
  };
  return { fakeDB, idbTables, collectionReads };
});

vi.mock('idb', () => ({ openDB: vi.fn(async () => fakeDB) }));

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

function cachedGroup(over: Record<string, unknown> = {}) {
  return {
    id: 'g1',
    name: 'Engineering',
    description: 'Eng team',
    type: 'OKTA_GROUP',
    memberCount: 10,
    lastUpdated: '2024-01-01T00:00:00.000Z',
    created: '2020-01-01T00:00:00.000Z',
    hasRules: false,
    ruleCount: 0,
    selected: false,
    ...over,
  };
}

function seedGroupsCache(groups: Record<string, any>[]) {
  const table = new Map<string, unknown>();
  for (const summary of groups) {
    const entity = {
      id: summary.id,
      type: summary.type ?? 'OKTA_GROUP',
      profile: { name: summary.name, description: summary.description ?? null },
      lastUpdated: summary.lastUpdated,
      created: summary.created,
      _embedded: { stats: { usersCount: summary.memberCount ?? 0 } },
    };
    table.set(`${ORIGIN}::${entity.id}`, { origin: ORIGIN, id: entity.id, entity, syncedAt: 1 });
  }
  idbTables.set('groups', table);
  idbTables.set(
    'syncMeta',
    new Map([
      [
        `${ORIGIN}::groups`,
        {
          origin: ORIGIN,
          collection: 'groups',
          complete: true,
          lastFullWalkAt: 1,
          lastDeltaAt: null,
          watermark: null,
          itemCount: groups.length,
          cursor: null,
          walkStartedAt: null,
          deltaSupported: null,
        },
      ],
    ]),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  idbTables.clear();
  collectionReads.length = 0;

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
      local: { get: storageGet, set: storageSet, remove: vi.fn() },
      sync: { get: storageGet, set: storageSet, remove: vi.fn() },
      onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
    },
  } as unknown as typeof chrome;

  seedGroupsCache([cachedGroup()]);

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

async function openTab(uev: ReturnType<typeof userEvent.setup>, label: string) {
  await uev.click(
    within(screen.getByRole('tablist', { name: 'Main sections' })).getByRole('tab', {
      name: label,
    }),
  );
}

const TAB_MOUNT_TIMEOUT = 5000;

const groupRow = (name: string) =>
  screen.findByLabelText(`Select ${name}`, {}, { timeout: TAB_MOUNT_TIMEOUT });

const tabHeading = (name: string) =>
  screen.findByRole('heading', { name }, { timeout: TAB_MOUNT_TIMEOUT });

async function drillInto(uev: ReturnType<typeof userEvent.setup>, name: string) {
  const row = screen.getByLabelText(`Select ${name}`).closest('[data-group-id]') as HTMLElement;
  await uev.click(within(row).getByRole('button', { name: `Expand ${name}` }));
  await uev.click(within(row).getByRole('button', { name: 'View group details' }));
}

function scrollRoot(): HTMLElement {
  const node = screen.getByTestId('app-scroll-root');
  if (!Object.getOwnPropertyDescriptor(node, 'scrollTop')) {
    Object.defineProperty(node, 'scrollTop', { value: 0, writable: true, configurable: true });
  }
  return node;
}

function scrollTo(node: HTMLElement, top: number) {
  node.scrollTop = top;
  node.dispatchEvent(new Event('scroll'));
}

const syncMessages = () =>
  runtimeSendMessage.mock.calls
    .map(([m]) => m)
    .filter((m) => m?.action === 'syncSnapshot') as Array<{ origin?: string }>;

const appCalls = () => syncMessages().length;

async function retargetTo({ id, origin }: { id: number; origin?: string }) {
  const probesBefore = tabsSendMessage.mock.calls.length;
  const onUpdated = (chrome.tabs.onUpdated.addListener as ReturnType<typeof vi.fn>).mock
    .calls[0][0] as (
    tabId: number,
    changeInfo: { status?: string; url?: string },
    tab: typeof OKTA_TAB,
  ) => void;

  if (origin) {
    tabsSendMessage.mockImplementation(async (_tabId: number, msg: { action: string }) => {
      if (msg.action === 'getOktaOrigin') return { success: true, data: origin };
      return { success: false };
    });
  }
  const tab = { ...OKTA_TAB, id, url: `${origin ?? 'https://example.okta.com'}/admin/groups` };
  (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([tab]);
  onUpdated(id, { status: 'complete' }, tab);

  await waitFor(() => expect(tabsSendMessage.mock.calls.length).toBeGreaterThan(probesBefore));
  await new Promise((resolve) => setTimeout(resolve, 250));
}

describe('App tab lifetime', () => {
  it('mounts a tab only once it has been activated', async () => {
    const uev = userEvent.setup();
    renderApp();

    expect(screen.queryByPlaceholderText('Search groups...')).not.toBeInTheDocument();

    await openTab(uev, 'Groups');
    expect(await groupRow('Engineering')).toBeInTheDocument();
  });

  it('keeps a visited tab mounted (hidden) after switching away', async () => {
    const uev = userEvent.setup();
    renderApp();

    await openTab(uev, 'Groups');
    const row = await groupRow('Engineering');

    await openTab(uev, 'Rules');
    await tabHeading('Group Rules');

    expect(row).toBeInTheDocument();
    expect(row).not.toBeVisible();
  });

  it('restores the open group detail view, its filter and its selection after a trip to Rules', async () => {
    const uev = userEvent.setup();
    renderApp();

    await openTab(uev, 'Groups');
    await groupRow('Engineering');

    await uev.type(screen.getByPlaceholderText('Search groups...'), 'Engin');
    await uev.click(screen.getByLabelText('Select Engineering'));
    await drillInto(uev, 'Engineering');
    expect(screen.getByTestId('group-detail-view')).toBeInTheDocument();

    await openTab(uev, 'Rules');
    await tabHeading('Group Rules');
    await openTab(uev, 'Groups');

    const detail = screen.getByTestId('group-detail-view');
    expect(detail).toBeVisible();
    await uev.click(
      within(detail).getByRole('tab', {
        name: 'Insights',
      }),
    );
    expect(within(detail).getByText('g1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to groups' })).toBeVisible();

    await uev.click(screen.getByRole('button', { name: 'Back to groups' }));
    expect(screen.getByPlaceholderText('Search groups...')).toHaveValue('Engin');
    expect(screen.getByLabelText('Select Engineering')).toBeChecked();
  });

  it('leaves the first tab mounted and does not re-run the Groups cache read on return', async () => {
    const uev = userEvent.setup();
    renderApp();

    const groupReads = () => collectionReads.filter((name) => name === 'groups').length;

    await waitFor(() => {
      expect(collectionReads).toContain('rules');
      expect(collectionReads).toContain('apps');
      expect(collectionReads).toContain('groups');
    });
    const beforeGroups = groupReads();

    await openTab(uev, 'Groups');
    await groupRow('Engineering');
    const afterGroups = groupReads();
    expect(afterGroups - beforeGroups).toBe(1);

    await openTab(uev, 'Apps');
    await openTab(uev, 'Groups');

    expect(groupReads()).toBe(afterGroups);
  });

  it("restores each tab's own scroll offset on return, not the offset it was left at", async () => {
    const uev = userEvent.setup();
    renderApp();

    await openTab(uev, 'Groups');
    await groupRow('Engineering');

    const root = scrollRoot();
    scrollTo(root, 240);

    await openTab(uev, 'Rules');
    await tabHeading('Group Rules');
    scrollTo(root, 90);

    await openTab(uev, 'Groups');
    expect(root.scrollTop).toBe(240);

    await openTab(uev, 'Rules');
    expect(root.scrollTop).toBe(90);
  });

  it('opens a newly activated tab at the top rather than the previous tab’s offset', async () => {
    const uev = userEvent.setup();
    renderApp();

    await openTab(uev, 'Groups');
    await groupRow('Engineering');
    const root = scrollRoot();
    scrollTo(root, 320);

    await openTab(uev, 'Apps');
    expect(root.scrollTop).toBe(0);
  });

  it('does not let a hidden Applications tab re-load the inventory when the Okta tab changes', async () => {
    const uev = userEvent.setup();
    renderApp();

    await openTab(uev, 'Apps');
    await tabHeading('Applications');
    await waitFor(() => expect(appCalls()).toBeGreaterThan(0));

    await openTab(uev, 'Groups');
    await groupRow('Engineering');
    const before = appCalls();

    await retargetTo({ id: 2 });
    expect(appCalls()).toBe(before);

    await openTab(uev, 'Apps');
    await waitFor(() => expect(appCalls()).toBe(before + 1));
    expect(syncMessages().at(-1)?.origin).toBe(ORIGIN);
  });

  it('re-fetches the inventory when the connected tab moves to a different org', async () => {
    const uev = userEvent.setup();
    renderApp();

    await openTab(uev, 'Apps');
    await tabHeading('Applications');
    await waitFor(() => expect(appCalls()).toBeGreaterThan(0));

    await openTab(uev, 'Groups');
    await groupRow('Engineering');
    const before = appCalls();

    await retargetTo({ id: 2, origin: 'https://other.okta.com' });

    expect(appCalls()).toBe(before);

    await openTab(uev, 'Apps');
    await waitFor(() => expect(appCalls()).toBe(before + 1));
    expect(syncMessages().at(-1)?.origin).toBe('https://other.okta.com');
  });
});
