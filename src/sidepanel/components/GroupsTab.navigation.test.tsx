import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as rtlRender, screen, act, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import GroupsTab from './GroupsTab';
import { ProgressProvider } from '../contexts/ProgressContext';

const render = (ui: ReactElement) =>
  rtlRender(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <ProgressProvider>{children}</ProgressProvider>
    ),
  });

const { fakeDB, idbTables } = vi.hoisted(() => {
  const idbTables = new Map<string, Map<string, any>>();
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
    getAllFromIndex: async (name: string, _i: string, origin: string) =>
      [...table(name).values()].filter((v) => v.origin === origin),
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
  return { fakeDB, idbTables };
});

vi.mock('idb', () => ({ openDB: vi.fn(async () => fakeDB) }));

const runtimeSendMessage = vi.fn();
const storageGet = vi.fn();
const storageSet = vi.fn();

const ORIGIN = 'https://x.okta.com';

globalThis.chrome = {
  runtime: {
    sendMessage: runtimeSendMessage,
    getURL: (p: string) => p,
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  tabs: { sendMessage: vi.fn(), get: vi.fn() },
  storage: { local: { get: storageGet, set: storageSet, remove: vi.fn() } },
} as any;

function cachedGroup(over: Record<string, any> = {}) {
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

function summaryToRaw(summary: Record<string, any>): Record<string, any> {
  return {
    id: summary.id,
    type: summary.type ?? 'OKTA_GROUP',
    profile: { name: summary.name, description: summary.description ?? null },
    lastUpdated: summary.lastUpdated,
    created: summary.created,
    _embedded: { stats: { usersCount: summary.memberCount ?? 0 } },
  };
}

function seedCache(groups: Record<string, any>[]) {
  const table = new Map<string, any>();
  for (const entity of groups.map(summaryToRaw)) {
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

  const assignments = new Map<string, any>();
  const apps = new Map<string, any>();
  for (const group of groups) {
    for (const mapping of group.pushMappings ?? []) {
      const appId = mapping.appId ?? 'appFixture';
      if (mapping.appName) {
        apps.set(`${ORIGIN}::${appId}`, {
          origin: ORIGIN,
          id: appId,
          entity: { id: appId, label: mapping.appName, features: ['GROUP_PUSH'] },
          syncedAt: 1,
        });
      }
      const id = `${appId}::${group.id}`;
      assignments.set(`${ORIGIN}::${id}`, {
        origin: ORIGIN,
        id,
        entity: {
          id: group.id,
          priority: mapping.priority,
          profile: { name: mapping.targetGroupName ?? group.name },
          _links: { group: { href: `${ORIGIN}/api/v1/groups/${group.id}` } },
        },
        syncedAt: 1,
      });
    }
  }
  if (assignments.size > 0) idbTables.set('appGroups', assignments);
  if (apps.size > 0) idbTables.set('apps', apps);
}

async function renderCached(groups: Record<string, any>[], props: Record<string, any> = {}) {
  seedCache(groups);
  const result = render(<GroupsTab targetTabId={1} oktaOrigin={ORIGIN} {...props} />);
  await act(async () => {});
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
  idbTables.clear();
  storageGet.mockImplementation((_keys: any, cb?: (r: any) => void) =>
    typeof cb === 'function' ? cb({}) : Promise.resolve({}),
  );
  runtimeSendMessage.mockImplementation(async (msg: any) => {
    if (/^\/api\/v1\/groups\/rules/.test(msg.endpoint)) return { success: true, data: [] };
    return { success: true, data: [] };
  });
});

async function expandRow(uev: ReturnType<typeof userEvent.setup>, name: string) {
  const row = screen.getByLabelText(`Select ${name}`).closest('[data-group-id]') as HTMLElement;
  await uev.click(within(row).getByRole('button', { name: 'Expand' }));
}

async function drillInto(uev: ReturnType<typeof userEvent.setup>, name: string) {
  await expandRow(uev, name);
  const row = screen.getByLabelText(`Select ${name}`).closest('[data-group-id]') as HTMLElement;
  const trigger = within(row).getByRole('button', { name: 'View group details' });
  await uev.click(trigger);
  return trigger;
}

describe('GroupsTab sub-navigation', () => {
  it('pushes a detail view and swaps the single header in place', async () => {
    const uev = userEvent.setup();
    await renderCached([cachedGroup()]);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Groups');

    await drillInto(uev, 'Engineering');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Engineering');
    expect(screen.getByTestId('group-detail-view')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('renders a breadcrumb trail back to the list', async () => {
    const uev = userEvent.setup();
    await renderCached([cachedGroup()]);
    await drillInto(uev, 'Engineering');

    const trail = within(screen.getByRole('navigation', { name: 'Breadcrumb' }));
    expect(trail.getByRole('button', { name: 'Groups' })).toBeInTheDocument();
    expect(trail.getByText('Engineering')).toHaveAttribute('aria-current', 'page');

    await uev.click(trail.getByRole('button', { name: 'Groups' }));
    expect(screen.queryByTestId('group-detail-view')).not.toBeInTheDocument();
  });

  it('hides the list without unmounting it, so its state survives', async () => {
    const uev = userEvent.setup();
    await renderCached([cachedGroup()]);

    await uev.click(screen.getByLabelText('Select Engineering'));
    await drillInto(uev, 'Engineering');

    const checkbox = screen.getByLabelText('Select Engineering');
    expect(checkbox).toBeChecked();
    expect(checkbox.closest('div.hidden')).not.toBeNull();

    await uev.click(screen.getByRole('button', { name: 'Back to groups' }));

    expect(screen.getByLabelText('Select Engineering')).toBeChecked();
    expect(screen.getByRole('button', { name: 'View group details' })).toBeInTheDocument();
    expect(screen.getByLabelText('Select Engineering').closest('div.hidden')).toBeNull();
  });

  it('keeps the filter query and its result set across a push/pop round trip', async () => {
    const uev = userEvent.setup();
    await renderCached([cachedGroup(), cachedGroup({ id: 'g2', name: 'Design' })]);

    const search = screen.getByPlaceholderText('Search by name, description, ID — or /regex/');
    await uev.type(search, 'Engin');
    expect(screen.queryByLabelText('Select Design')).not.toBeInTheDocument();

    await drillInto(uev, 'Engineering');
    await uev.click(screen.getByRole('button', { name: 'Back to groups' }));

    expect(screen.getByPlaceholderText('Search by name, description, ID — or /regex/')).toHaveValue(
      'Engin',
    );
    expect(screen.queryByLabelText('Select Design')).not.toBeInTheDocument();
  });

  it('moves focus into the pushed view and restores it to the row that opened it', async () => {
    const uev = userEvent.setup();
    await renderCached([cachedGroup()]);

    const trigger = await drillInto(uev, 'Engineering');

    const detail = screen.getByTestId('group-detail-view');
    expect(detail.parentElement?.contains(document.activeElement)).toBe(true);

    await uev.click(screen.getByRole('button', { name: 'Back to groups' }));
    expect(document.activeElement).toBe(trigger);
  });

  it('restores the list scroll offset that display:none destroyed', async () => {
    const uev = userEvent.setup();
    const { container } = await renderCached([cachedGroup()]);

    const scrollBox = container.querySelector('.scrollable-list') as HTMLElement;
    Object.defineProperty(scrollBox, 'scrollTop', { value: 0, writable: true });
    scrollBox.scrollTop = 240;

    await drillInto(uev, 'Engineering');
    scrollBox.scrollTop = 0; // what hiding the box does

    await uev.click(screen.getByRole('button', { name: 'Back to groups' }));
    expect(scrollBox.scrollTop).toBe(240);
  });

  it('pops back to the list when a cross-tab deep-link arrives', async () => {
    const uev = userEvent.setup();
    seedCache([cachedGroup()]);
    const onGroupSelected = vi.fn();
    const { rerender } = render(
      <GroupsTab targetTabId={1} oktaOrigin={ORIGIN} onGroupSelected={onGroupSelected} />,
    );
    await act(async () => {});

    await drillInto(uev, 'Engineering');
    expect(screen.getByTestId('group-detail-view')).toBeInTheDocument();

    rerender(
      <GroupsTab
        targetTabId={1}
        oktaOrigin={ORIGIN}
        selectedGroupId="g1"
        onGroupSelected={onGroupSelected}
      />,
    );

    expect(screen.queryByTestId('group-detail-view')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Select Engineering').closest('div.hidden')).toBeNull();
  });

  it('shows the group id, dates and push state in the detail view', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({
        pushMappings: [
          {
            mappingId: 'm1',
            sourceUserGroupId: 'g1',
            targetGroupName: 'Engineering (Slack)',
            priority: 2,
            appId: 'app1',
            appName: 'Slack',
          },
        ],
      }),
    ]);

    await drillInto(uev, 'Engineering');

    const detail = within(screen.getByTestId('group-detail-view'));

    expect(detail.getByText('g1')).toBeInTheDocument();
    expect(detail.getByRole('button', { name: 'Copy ID' })).toBeInTheDocument();

    await waitFor(() =>
      expect(
        within(screen.getByTestId('group-detail-view')).getByText('Slack'),
      ).toBeInTheDocument(),
    );
    expect(detail.getByText('Target group: Engineering (Slack)')).toBeInTheDocument();
    expect(detail.getByText('Priority 2')).toBeInTheDocument();
    expect(detail.queryByText('ACTIVE')).not.toBeInTheDocument();
  });

  it("runs the analysis straight away when the push came from a row's analyze action", async () => {
    const uev = userEvent.setup();
    await renderCached([cachedGroup()]);

    const row = screen
      .getByLabelText('Select Engineering')
      .closest('[data-group-id]') as HTMLElement;
    await uev.click(within(row).getByRole('button', { name: 'Analyze member source' }));

    const detail = within(screen.getByTestId('group-detail-view'));
    await waitFor(() =>
      expect(detail.queryByRole('button', { name: 'Analyze' })).not.toBeInTheDocument(),
    );
    expect(detail.getByText('No members to attribute.')).toBeInTheDocument();
  });

  it('does not analyze on a plain drill-in', async () => {
    const uev = userEvent.setup();
    await renderCached([cachedGroup()]);

    await drillInto(uev, 'Engineering');

    const detail = within(screen.getByTestId('group-detail-view'));
    expect(detail.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
  });
});
