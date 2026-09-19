import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppsTab from './AppsTab';
import { selectionStore } from '../selection/selectionStore';
import type { OktaAppListItem } from '../../shared/schemas/okta';

const api = vi.hoisted(() => ({
  getAppAssignmentCounts: vi.fn(),
  isLoading: false,
}));

vi.mock('../hooks/useOktaApi', () => ({
  useOktaApi: () => api,
}));

const { fakeDB, idbTables } = vi.hoisted(() => {
  const idbTables = new Map<string, Map<string, any>>();
  const keyOf = (key: unknown) => (Array.isArray(key) ? key.join('::') : String(key));
  const table = (name: string) => {
    if (!idbTables.has(name)) idbTables.set(name, new Map());
    return idbTables.get(name)!;
  };
  const fakeDB = {
    get: async (name: string, key: unknown) => table(name).get(keyOf(key)),
    put: async () => {},
    delete: async () => {},
    getAllFromIndex: async (name: string, _i: string, origin: string) =>
      [...table(name).values()].filter((v) => v.origin === origin),
    getAllKeysFromIndex: async () => [],
    transaction: () => ({
      store: { put: async () => {}, delete: async () => {} },
      done: Promise.resolve(),
    }),
  };
  return { fakeDB, idbTables };
});

vi.mock('idb', () => ({ openDB: vi.fn(async () => fakeDB) }));

const ORIGIN = 'https://example.okta.com';

const sendMessage = vi.fn();

globalThis.chrome = {
  runtime: {
    sendMessage,
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
  },
} as unknown as typeof chrome;

function seedApps(apps: OktaAppListItem[], origin = ORIGIN) {
  const table = new Map<string, any>();
  for (const entity of apps) {
    table.set(`${origin}::${entity.id}`, { origin, id: entity.id, entity, syncedAt: 1 });
  }
  idbTables.set('apps', table);
  idbTables.set(
    'syncMeta',
    new Map([
      [
        `${origin}::apps`,
        {
          origin,
          collection: 'apps',
          complete: true,
          lastFullWalkAt: 1,
          lastDeltaAt: null,
          watermark: null,
          itemCount: apps.length,
          cursor: null,
          walkStartedAt: null,
          deltaSupported: null,
        },
      ],
    ]),
  );
}

function syncCalls() {
  return sendMessage.mock.calls
    .map((call) => call[0])
    .filter((msg) => msg?.action === 'syncSnapshot');
}

const SAMPLE_APPS: OktaAppListItem[] = [
  {
    id: '0oaFAKE0001',
    name: 'salesforce',
    label: 'Salesforce',
    status: 'ACTIVE',
    signOnMode: 'SAML_2_0',
    created: '2026-01-15T00:00:00.000Z',
  },
  {
    id: '0oaFAKE0002',
    name: 'workday',
    label: 'Workday HR',
    status: 'INACTIVE',
    signOnMode: 'SAML_2_0',
    created: '2026-03-01T00:00:00.000Z',
  },
] as OktaAppListItem[];

beforeEach(() => {
  vi.clearAllMocks();
  idbTables.clear();
  selectionStore.clearAll();
  api.getAppAssignmentCounts.mockResolvedValue({ users: 12, groups: 3 });
  sendMessage.mockImplementation(async (msg: { action?: string; origin?: string }) => {
    if (msg?.action !== 'syncSnapshot') return undefined;
    seedApps(SAMPLE_APPS, msg.origin);
    return { success: true };
  });
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('AppsTab', () => {
  it('shows the loading state, then renders the loaded apps', async () => {
    const gate = deferred<{ success: boolean }>();
    sendMessage.mockReturnValue(gate.promise);

    render(<AppsTab targetTabId={1} oktaOrigin={ORIGIN} />);

    expect(await screen.findByText('Loading applications from Okta...')).toBeInTheDocument();

    seedApps(SAMPLE_APPS);
    gate.resolve({ success: true });

    expect(await screen.findByText('Salesforce')).toBeInTheDocument();
    expect(screen.getByText('Workday HR')).toBeInTheDocument();
    expect(syncCalls()).toHaveLength(1);
  });

  it('filters the list by the search query', async () => {
    const user = userEvent.setup();
    render(<AppsTab targetTabId={1} oktaOrigin={ORIGIN} />);

    expect(await screen.findByText('Salesforce')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Search applications'), 'workday');

    await waitFor(() => expect(screen.queryByText('Salesforce')).not.toBeInTheDocument());
    expect(screen.getByText('Workday HR')).toBeInTheDocument();
  });

  it('filters the list by the status bucket', async () => {
    const user = userEvent.setup();
    render(<AppsTab targetTabId={1} oktaOrigin={ORIGIN} />);

    expect(await screen.findByText('Salesforce')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    const statusGroup = screen.getByRole('group', { name: 'Filter by status' });
    await user.click(within(statusGroup).getByRole('button', { name: 'Inactive' }));

    await waitFor(() => expect(screen.queryByText('Salesforce')).not.toBeInTheDocument());
    expect(screen.getByText('Workday HR')).toBeInTheDocument();
  });

  it('shows the no-matches empty state and clears the filters', async () => {
    const user = userEvent.setup();
    render(<AppsTab targetTabId={1} oktaOrigin={ORIGIN} />);

    expect(await screen.findByText('Salesforce')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Search applications'), 'nothing-matches-this');

    expect(await screen.findByText('No applications match your filters')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(await screen.findByText('Salesforce')).toBeInTheDocument();
  });

  it('shows the nothing-loaded empty state for an org with no apps', async () => {
    sendMessage.mockResolvedValue({ success: true });

    render(<AppsTab targetTabId={1} oktaOrigin={ORIGIN} />);

    expect(await screen.findByText('No applications loaded')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Load applications' })).toBeInTheDocument();
  });

  it('banners a load failure as a dismissible danger alert', async () => {
    const user = userEvent.setup();
    sendMessage.mockResolvedValue({ success: false, error: 'Failed to fetch apps' });

    render(<AppsTab targetTabId={1} oktaOrigin={ORIGIN} />);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Failed to fetch apps')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Dismiss message' }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('does not load when no Okta tab is connected', async () => {
    render(<AppsTab targetTabId={null} oktaOrigin={ORIGIN} />);

    expect(await screen.findByText('No applications loaded')).toBeInTheDocument();
    expect(syncCalls()).toHaveLength(0);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Load applications' }));
    expect(syncCalls()).toHaveLength(0);
  });

  it('arrives at a deep-linked app with the list filtered to it, once', async () => {
    const onAppSelected = vi.fn();
    const { rerender } = render(
      <AppsTab
        targetTabId={1}
        oktaOrigin={ORIGIN}
        selectedAppId="0oaFAKE0002"
        onAppSelected={onAppSelected}
      />,
    );

    expect(await screen.findByText('Workday HR')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Salesforce')).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('Workday HR')).toBeInTheDocument();
    await waitFor(() => expect(onAppSelected).toHaveBeenCalledTimes(1));

    rerender(
      <AppsTab
        targetTabId={1}
        oktaOrigin={ORIGIN}
        selectedAppId="0oaFAKE0002"
        onAppSelected={onAppSelected}
      />,
    );
    expect(onAppSelected).toHaveBeenCalledTimes(1);
  });

  it('leaves the list alone when the deep-linked app is not in the inventory', async () => {
    const onAppSelected = vi.fn();
    render(
      <AppsTab
        targetTabId={1}
        oktaOrigin={ORIGIN}
        selectedAppId="0oaFAKENOSUCH"
        onAppSelected={onAppSelected}
      />,
    );

    expect(await screen.findByText('Salesforce')).toBeInTheDocument();
    expect(screen.getByText('Workday HR')).toBeInTheDocument();
    await waitFor(() => expect(onAppSelected).toHaveBeenCalledTimes(1));
  });

  it('defers the auto-load while the tab is mounted but not the visible one', async () => {
    const { rerender } = render(<AppsTab targetTabId={1} oktaOrigin={ORIGIN} isActive={false} />);

    await waitFor(() => expect(syncCalls()).toHaveLength(0));

    rerender(<AppsTab targetTabId={1} oktaOrigin={ORIGIN} isActive />);
    expect(await screen.findByText('Salesforce')).toBeInTheDocument();
    expect(syncCalls()).toHaveLength(1);
  });
});

describe("AppsTab's selection controls", () => {
  const checkbox = (label: string) => screen.getByRole('checkbox', { name: `Select ${label}` });

  it('takes the filtered apps, not the whole inventory', async () => {
    const user = userEvent.setup();
    render(<AppsTab targetTabId={1} oktaOrigin={ORIGIN} />);
    await screen.findByText('Salesforce');

    await user.type(screen.getByLabelText('Search applications'), 'workday');
    await waitFor(() => expect(screen.queryByText('Salesforce')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Select all' }));
    expect(checkbox('Workday HR')).toBeChecked();

    await user.clear(screen.getByLabelText('Search applications'));
    expect(await screen.findByText('Salesforce')).toBeInTheDocument();
    expect(checkbox('Workday HR')).toBeChecked();
    expect(checkbox('Salesforce')).not.toBeChecked();
  });

  it('disables select-all once it has nothing left to take, and deselect-all gives it back', async () => {
    const user = userEvent.setup();
    render(<AppsTab targetTabId={1} oktaOrigin={ORIGIN} />);
    await screen.findByText('Salesforce');

    const selectAll = () => screen.getByRole('button', { name: 'Select all' });
    expect(selectAll()).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Deselect all' })).not.toBeInTheDocument();

    await user.click(selectAll());
    expect(checkbox('Salesforce')).toBeChecked();
    expect(checkbox('Workday HR')).toBeChecked();
    await waitFor(() => expect(selectAll()).toBeDisabled());

    await user.click(screen.getByRole('button', { name: 'Deselect all' }));
    expect(checkbox('Salesforce')).not.toBeChecked();
    expect(checkbox('Workday HR')).not.toBeChecked();
    expect(selectAll()).toBeEnabled();
  });

  it('states the counts once, above the rows', async () => {
    const user = userEvent.setup();
    render(<AppsTab targetTabId={1} oktaOrigin={ORIGIN} />);
    await screen.findByText('Salesforce');

    const line = () => screen.getByTestId('apps-count-line');
    expect(line().textContent).toBe('Showing 2 of 2');

    await user.click(screen.getByRole('button', { name: 'Select all' }));
    expect(line().textContent).toBe('Showing 2 of 2 \u00b7 2 selected');

    for (const name of ['Select all', 'Deselect all']) {
      expect(screen.getByRole('button', { name }).textContent).toBe(name);
    }
  });
});
