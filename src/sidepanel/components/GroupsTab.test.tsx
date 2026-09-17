import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render as rtlRender,
  screen,
  within,
  act,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import GroupsTab from './GroupsTab';
import { useCurrentRefreshSubject } from '../hooks/useRefreshSubject';
import { ProgressProvider } from '../contexts/ProgressContext';
import { syncSnapshot } from '../../background/snapshotBridge';
import { selectionStore } from '../selection/selectionStore';

const render = (ui: ReactElement, options?: Parameters<typeof rtlRender>[1]) =>
  rtlRender(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <ProgressProvider>{children}</ProgressProvider>
    ),
    ...options,
  });

const captured = vi.hoisted(() => ({
  props: {} as Record<string, any>,
}));

vi.mock('./groups/GroupExportModal', () => ({
  default: (props: any) => {
    captured.props.GroupExportModal = props;
    return (
      <div data-testid="export-modal" data-open={String(props.isOpen)}>
        {props.groups.map((g: any) => (
          <span key={g.id} data-testid="export-modal-group">
            {g.name}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock('./groups/GroupComparisonModal', () => ({
  default: (props: any) => {
    captured.props.GroupComparisonModal = props;
    return <div data-testid="comparison-modal" data-open={String(props.isOpen)} />;
  },
}));

vi.mock('../../shared/undoManager', () => ({
  logAction: vi.fn(),
  logBulkRemoveAction: vi.fn(),
  logBulkAddAction: vi.fn(),
}));

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
const tabsSendMessage = vi.fn();
const storageGet = vi.fn();
const storageSet = vi.fn();
const tabsGet = vi.fn();

const ORIGIN = 'https://x.okta.com';

const runtimeListeners = new Set<(msg: any) => void>();

globalThis.chrome = {
  runtime: {
    sendMessage: runtimeSendMessage,
    getURL: (p: string) => p,
    onMessage: {
      addListener: (fn: any) => runtimeListeners.add(fn),
      removeListener: (fn: any) => runtimeListeners.delete(fn),
    },
  },
  tabs: { sendMessage: tabsSendMessage, get: tabsGet },
  storage: {
    local: { get: storageGet, set: storageSet, remove: vi.fn() },
    onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
  },
} as any;

type Route = [RegExp, (msg: any) => any];
let routes: Route[] = [];
function route(pattern: RegExp, respond: (msg: any) => any) {
  routes.push([pattern, respond]);
}

function schedulerCalls() {
  return runtimeSendMessage.mock.calls
    .map((c) => c[0])
    .filter((m: any) => m?.action === 'scheduleApiRequest');
}

const SEARCH_RE = /^\/api\/v1\/groups\?q=/;
function searchCalls() {
  return schedulerCalls().filter((m: any) => SEARCH_RE.test(m.endpoint));
}
function routeSearch(respond: (msg: any) => any) {
  route(SEARCH_RE, respond);
}

function routeSiblingCollections(rules: any[] = [], apps: any[] = []) {
  route(/^\/api\/v1\/groups\/rules\?limit=200$/, () => ({
    success: true,
    headers: {},
    data: rules,
  }));
  route(/^\/api\/v1\/apps\?limit=200$/, () => ({ success: true, headers: {}, data: apps }));
}

function rawGroup(over: Record<string, any> = {}) {
  return {
    id: 'g1',
    type: 'OKTA_GROUP',
    created: '2020-01-01T00:00:00.000Z',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    profile: { name: 'Engineering', description: 'Eng team' },
    _embedded: { stats: { usersCount: 10 } },
    ...over,
  };
}

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

function user(id: string, over: Record<string, any> = {}) {
  return {
    id,
    status: 'ACTIVE',
    profile: { firstName: 'A', lastName: id, email: `${id}@x.com`, login: `${id}@x.com` },
    ...over,
  };
}

function summaryToRaw(summary: Record<string, any>): Record<string, any> {
  const raw: Record<string, any> = {
    id: summary.id,
    type: summary.type ?? 'OKTA_GROUP',
    profile: { name: summary.name, description: summary.description ?? null },
    lastUpdated: summary.lastUpdated,
    created: summary.created,
    _embedded: { stats: { usersCount: summary.memberCount ?? 0 } },
  };
  if (summary.sourceAppId) {
    raw.source = { id: summary.sourceAppId, name: summary.sourceAppName };
  }
  return raw;
}

function seedSnapshot(
  collection: string,
  rows: Record<string, any>[],
  origin = ORIGIN,
  complete = true,
) {
  const table = new Map<string, any>();
  for (const entity of rows) {
    table.set(`${origin}::${entity.id}`, { origin, id: entity.id, entity, syncedAt: 1 });
  }
  idbTables.set(collection, table);
  idbTables.set(
    'syncMeta',
    new Map([
      [
        `${origin}::${collection}`,
        {
          origin,
          collection,
          complete,
          lastFullWalkAt: complete ? 1 : null,
          lastDeltaAt: null,
          watermark: null,
          itemCount: rows.length,
          cursor: null,
          walkStartedAt: null,
          deltaSupported: null,
        },
      ],
    ]),
  );
}

function RefreshHarness() {
  const subject = useCurrentRefreshSubject();
  if (!subject) return null;
  return (
    <button type="button" onClick={subject.run}>
      {`Refresh ${subject.name}`}
    </button>
  );
}

async function renderCached(groups: Record<string, any>[], props: Record<string, any> = {}) {
  seedSnapshot('groups', groups.map(summaryToRaw));
  seedPushEnrichment(groups);
  const result = render(
    <>
      <GroupsTab targetTabId={1} oktaOrigin={ORIGIN} {...props} />
      <RefreshHarness />
    </>,
  );
  await act(async () => {});
  return result;
}

function seedPushEnrichment(groups: Record<string, any>[]) {
  const assignments = new Map<string, any>();
  const apps = new Map<string, any>();

  const rememberApp = (appId: string, appName?: string) => {
    if (!appId || !appName) return;
    apps.set(`${ORIGIN}::${appId}`, {
      origin: ORIGIN,
      id: appId,
      entity: { id: appId, label: appName, features: ['GROUP_PUSH'] },
      syncedAt: 1,
    });
  };

  for (const group of groups) {
    rememberApp(group.sourceAppId, group.sourceAppName);
    for (const mapping of group.pushMappings ?? []) {
      const appId = mapping.appId ?? 'appFixture';
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
      rememberApp(appId, mapping.appName);
    }
  }

  if (assignments.size > 0) idbTables.set('appGroups', assignments);
  if (apps.size > 0) idbTables.set('apps', apps);
}

function renderedGroupNames() {
  return screen
    .queryAllByRole('checkbox')
    .map((c) => c.getAttribute('aria-label') ?? '')
    .filter((l) => l.startsWith('Select '))
    .map((l) => l.slice('Select '.length));
}

function countLine() {
  return screen.getByTestId('groups-count-line');
}

function section(label: string) {
  return within(screen.getByText(label).parentElement as HTMLElement);
}

function useDebounceTimers() {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
}

function typeInto(input: HTMLElement, text: string) {
  let acc = (input as HTMLInputElement).value;
  for (const ch of text) {
    acc += ch;
    fireEvent.change(input, { target: { value: acc } });
  }
}

function setValue(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

const liveInput = () => screen.getByPlaceholderText('Search groups by name...');

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const fakeScheduler = {
  scheduleRequest: async (endpoint: string) => {
    walkCalls.push(endpoint);
    for (const [pattern, respond] of routes) {
      if (pattern.test(endpoint)) return respond({ endpoint });
    }
    return { success: false, error: `unrouted endpoint: ${endpoint}` };
  },
} as any;

let walkCalls: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  selectionStore.clearAll();
  routes = [];
  walkCalls = [];
  captured.props = {};
  idbTables.clear();
  runtimeListeners.clear();
  storageGet.mockImplementation((_keys: string[], cb: (r: any) => void) => cb({}));
  tabsGet.mockImplementation(async (id: number) => ({ id, url: `${ORIGIN}/admin/groups` }));
  runtimeSendMessage.mockImplementation(async (msg: any) => {
    if (msg?.action === 'snapshotUpdated') {
      for (const listener of runtimeListeners) listener(msg);
      return undefined;
    }
    if (msg?.action === 'syncSnapshot') {
      try {
        const outcomes = await syncSnapshot(fakeScheduler, msg.origin, msg.tabId);
        const failed = outcomes.find((o) => !o.complete);
        return { success: !failed, error: failed?.error, outcomes };
      } catch (error: any) {
        return { success: false, error: error?.message };
      }
    }
    for (const [pattern, respond] of routes) {
      if (pattern.test(msg.endpoint)) return respond(msg);
    }
    return { success: false, error: `unrouted endpoint: ${msg.endpoint}` };
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('live search: debounce contract', () => {
  it('fires exactly one scheduler search 300ms after the last keystroke', async () => {
    useDebounceTimers();
    routeSearch(() => ({ success: true, data: [] }));

    render(<GroupsTab targetTabId={1} />);

    typeInto(liveInput(), 'eng');

    await advance(299);
    expect(searchCalls()).toHaveLength(0);

    await advance(1);
    expect(searchCalls()).toHaveLength(1);
    expect(searchCalls()[0]).toMatchObject({
      action: 'scheduleApiRequest',
      endpoint: '/api/v1/groups?q=eng&limit=20&expand=stats',
      tabId: 1,
      priority: 'interactive',
    });
  });

  it('restarts the 300ms window on every keystroke', async () => {
    useDebounceTimers();
    routeSearch(() => ({ success: true, data: [] }));

    render(<GroupsTab targetTabId={1} />);
    const input = liveInput();

    setValue(input, 'e');
    await advance(200);
    setValue(input, 'en');
    await advance(200);
    setValue(input, 'eng');
    await advance(200);
    expect(searchCalls()).toHaveLength(0);

    await advance(100);
    expect(searchCalls()).toHaveLength(1);
    expect(searchCalls()[0].endpoint).toBe('/api/v1/groups?q=eng&limit=20&expand=stats');
  });

  it('still fires exactly once when unrelated re-renders happen mid-debounce', async () => {
    useDebounceTimers();
    routeSearch(() => ({ success: true, data: [] }));

    const { rerender } = render(<GroupsTab targetTabId={1} oktaOrigin="https://a.okta.com" />);

    typeInto(liveInput(), 'eng');

    for (let i = 0; i < 5; i++) {
      rerender(<GroupsTab targetTabId={1} oktaOrigin={`https://a${i}.okta.com`} />);
      await advance(50);
    }
    await advance(300);

    expect(searchCalls()).toHaveLength(1);
    expect(searchCalls()[0].endpoint).toBe('/api/v1/groups?q=eng&limit=20&expand=stats');
  });

  it('re-fires the search when targetTabId changes', async () => {
    useDebounceTimers();
    routeSearch(() => ({ success: true, data: [] }));

    const { rerender } = render(<GroupsTab targetTabId={1} />);
    typeInto(liveInput(), 'eng');
    await advance(300);
    runtimeSendMessage.mockClear();

    rerender(<GroupsTab targetTabId={2} />);
    await advance(300);

    expect(searchCalls()).toHaveLength(1);
    expect(searchCalls()[0]).toMatchObject({ tabId: 2, priority: 'interactive' });
  });

  it('does not re-fire on a targetTabId change while the tab is hidden, and catches up on return', async () => {
    useDebounceTimers();
    routeSearch(() => ({ success: true, data: [] }));

    const { rerender } = render(<GroupsTab targetTabId={1} isActive />);
    typeInto(liveInput(), 'eng');
    await advance(300);
    runtimeSendMessage.mockClear();

    rerender(<GroupsTab targetTabId={2} isActive={false} />);
    await advance(300);
    expect(searchCalls()).toHaveLength(0);

    rerender(<GroupsTab targetTabId={2} isActive />);
    await advance(300);
    expect(searchCalls()).toHaveLength(1);
    expect(searchCalls()[0]).toMatchObject({ tabId: 2, priority: 'interactive' });
  });

  it('routes live search through the background scheduler, never a direct content call (§8)', async () => {
    useDebounceTimers();
    routeSearch(() => ({ success: true, data: [rawGroup()] }));

    render(<GroupsTab targetTabId={1} />);
    typeInto(liveInput(), 'eng');
    await advance(300);

    expect(searchCalls()).toHaveLength(1);
    expect(tabsSendMessage).not.toHaveBeenCalled();
  });

  it('renders mapped live results (memberCount from expand=stats)', async () => {
    useDebounceTimers();
    routeSearch(() => ({
      success: true,
      data: [rawGroup({ id: 'g1', profile: { name: 'Engineering' } })],
    }));

    render(<GroupsTab targetTabId={1} />);
    typeInto(liveInput(), 'eng');
    await advance(300);

    expect(renderedGroupNames()).toEqual(['Engineering']);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('members')).toBeInTheDocument();
  });
});

describe('live search: error paths', () => {
  it('with no targetTabId: banners "No Okta tab connected", sends nothing, shows no spinner', async () => {
    useDebounceTimers();

    render(<GroupsTab targetTabId={null} />);
    typeInto(liveInput(), 'eng');
    await advance(300);

    expect(screen.getByText('No Okta tab connected')).toBeInTheDocument();
    expect(searchCalls()).toHaveLength(0);
    expect(document.querySelector('.animate-spin')).toBeNull();
  });

  it('with a whitespace-only query: clears results, sends nothing, shows no spinner', async () => {
    useDebounceTimers();
    routeSearch(() => ({ success: true, data: [rawGroup()] }));

    render(<GroupsTab targetTabId={1} />);
    const input = liveInput();
    typeInto(input, 'eng');
    await advance(300);
    expect(renderedGroupNames()).toEqual(['Engineering']);
    runtimeSendMessage.mockClear();

    setValue(input, '   ');
    await advance(300);

    expect(searchCalls()).toHaveLength(0);
    expect(renderedGroupNames()).toEqual([]);
    expect(document.querySelector('.animate-spin')).toBeNull();
  });

  it('on response.success === false: banners response.error and clears results', async () => {
    useDebounceTimers();
    routeSearch(() => ({ success: false, error: 'Okta said no' }));

    render(<GroupsTab targetTabId={1} />);
    typeInto(liveInput(), 'eng');
    await advance(300);

    expect(screen.getByText('Okta said no')).toBeInTheDocument();
    expect(renderedGroupNames()).toEqual([]);
    expect(document.querySelector('.animate-spin')).toBeNull();
  });

  it('when the scheduler request rejects: banners the rejection message and clears results', async () => {
    useDebounceTimers();
    routeSearch(() => {
      throw new Error('Receiving end does not exist');
    });

    render(<GroupsTab targetTabId={1} />);
    typeInto(liveInput(), 'eng');
    await advance(300);
    await advance(250);
    await advance(500);

    expect(screen.getByText('Receiving end does not exist')).toBeInTheDocument();
    expect(renderedGroupNames()).toEqual([]);
    expect(document.querySelector('.animate-spin')).toBeNull();
  });

  it('the error banner is dismissible', async () => {
    useDebounceTimers();
    routeSearch(() => ({ success: false, error: 'Okta said no' }));

    render(<GroupsTab targetTabId={1} />);
    typeInto(liveInput(), 'eng');
    await advance(300);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(screen.queryByText('Okta said no')).not.toBeInTheDocument();
  });

  it('lets an out-of-order (older) response overwrite a newer one', async () => {
    useDebounceTimers();
    const first = deferred<any>();
    const second = deferred<any>();
    let call = 0;
    routeSearch(() => (call++ === 0 ? first.promise : second.promise));

    render(<GroupsTab targetTabId={1} />);
    const input = liveInput();

    setValue(input, 'a');
    await advance(300);
    setValue(input, 'ab');
    await advance(300);
    expect(searchCalls()).toHaveLength(2);

    await act(async () => {
      second.resolve({
        success: true,
        data: [rawGroup({ id: 'g2', profile: { name: 'SECOND' } })],
      });
      await Promise.resolve();
    });
    await act(async () => {
      first.resolve({ success: true, data: [rawGroup({ id: 'g1', profile: { name: 'FIRST' } })] });
      await Promise.resolve();
    });

    expect(renderedGroupNames()).toEqual(['FIRST']);
  });
});

describe('loadAllGroups', () => {
  it('maps, enriches with push mappings, caches, and flips to cached mode', async () => {
    const uev = userEvent.setup();
    routeSiblingCollections([], [{ id: 'app123', label: 'Slack', features: ['GROUP_PUSH'] }]);
    route(/^\/api\/v1\/groups\?limit=200&expand=stats&expand=app$/, () => ({
      success: true,
      headers: {},
      data: [
        rawGroup({ id: 'g1', profile: { name: 'Engineering', description: 'Eng' } }),
        rawGroup({
          id: 'g2',
          type: 'APP_GROUP',
          profile: { name: 'Slack Users' },
          _links: { apps: { href: 'https://x.okta.com/api/v1/apps/app123' } },
          _embedded: { stats: { usersCount: 3 } },
        }),
      ],
    }));
    route(/^\/api\/v1\/apps\/app123\/groups\?limit=200$/, () => ({
      success: true,
      headers: {},
      data: [
        {
          id: 'm1',
          priority: 0,
          profile: { name: 'slack-eng' },
          _links: { group: { href: 'https://x.okta.com/api/v1/groups/g1' } },
        },
      ],
    }));

    render(
      <>
        <GroupsTab targetTabId={1} oktaOrigin={ORIGIN} />
        <RefreshHarness />
      </>,
    );
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));

    await waitFor(() => expect(renderedGroupNames()).toEqual(['Engineering', 'Slack Users']));

    expect(screen.getByPlaceholderText('Search groups...')).toBeInTheDocument();
    expect(screen.getByText('2 Cached')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh the groups list' })).toBeInTheDocument();

    expect(screen.getByText('OKTA')).toBeInTheDocument();
    expect(screen.getByText('APP')).toBeInTheDocument();

    expect(screen.getByText('Slack')).toBeInTheDocument();

    const storedGroups = idbTables.get('groups')!;
    expect(storedGroups.size).toBe(2);
    const g1 = storedGroups.get(`${ORIGIN}::g1`).entity;
    expect(g1.lastUpdated).toBe('2024-01-01T00:00:00.000Z');
    expect(g1.created).toBe('2020-01-01T00:00:00.000Z');
    expect(g1._embedded.stats.usersCount).toBe(10);
    expect(idbTables.get('syncMeta')!.get(`${ORIGIN}::groups`).complete).toBe(true);
  });

  it('reads sourceAppId from group.source in preference to the _links.apps href', async () => {
    const uev = userEvent.setup();
    routeSiblingCollections();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats&expand=app$/, () => ({
      success: true,
      headers: {},
      data: [
        rawGroup({
          id: 'g2',
          type: 'APP_GROUP',
          profile: { name: 'Slack Users' },
          _links: { apps: { href: 'https://x.okta.com/api/v1/apps/fromLinks' } },
          source: { id: 'fromSource', name: 'Slack Prod' },
        }),
      ],
    }));
    route(/^\/api\/v1\/apps\/fromSource\/groups\?limit=200$/, () => ({
      success: true,
      headers: {},
      data: [],
    }));

    render(<GroupsTab targetTabId={1} oktaOrigin={ORIGIN} />);
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));
    await waitFor(() => expect(renderedGroupNames()).toEqual(['Slack Users']));

    expect(walkCalls).toContain('/api/v1/apps/fromSource/groups?limit=200');
    expect(walkCalls.some((e) => e.includes('fromLinks'))).toBe(false);
    expect(walkCalls).not.toContain('/api/v1/apps/fromSource');
    expect(screen.getByText('Slack Prod')).toBeInTheDocument();
  });

  it('keeps the pages it got when a later page fails, and captions the list as partial', async () => {
    const uev = userEvent.setup();
    routeSiblingCollections();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats&expand=app$/, () => ({
      success: true,
      headers: { link: '<https://x.okta.com/api/v1/groups?after=g1&limit=200>; rel="next"' },
      data: [rawGroup({ id: 'g1', profile: { name: 'Page One' } })],
    }));
    route(/after=g1/, () => ({ success: false, error: 'page two exploded' }));

    render(<GroupsTab targetTabId={1} oktaOrigin={ORIGIN} />);
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));

    await waitFor(() => expect(renderedGroupNames()).toEqual(['Page One']));
    expect(idbTables.get('syncMeta')!.get(`${ORIGIN}::groups`).complete).toBe(false);
    expect(screen.getByText(/did not finish/)).toBeInTheDocument();
  });

  it('on getAllGroups failure: banners the message, stops loading, writes no cache', async () => {
    const uev = userEvent.setup();
    routeSiblingCollections();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats&expand=app$/, () => ({
      success: false,
      error: 'Failed to fetch groups',
    }));

    render(<GroupsTab targetTabId={1} oktaOrigin={ORIGIN} />);
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));

    await waitFor(() => expect(screen.getByText('Failed to fetch groups')).toBeInTheDocument());
    expect(idbTables.get('groups')?.size ?? 0).toBe(0);
    expect(screen.getByRole('button', { name: 'Load All Groups' })).toBeEnabled();
  });

  it('on a failed push-mapping walk: no banner, groups still render, snapshot still written', async () => {
    const uev = userEvent.setup();
    routeSiblingCollections();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats&expand=app$/, () => ({
      success: true,
      headers: {},
      data: [
        rawGroup({
          id: 'g2',
          type: 'APP_GROUP',
          profile: { name: 'Slack Users' },
          source: { id: 'app123', name: 'Slack' },
        }),
      ],
    }));
    route(/^\/api\/v1\/apps\/app123\/groups\?limit=200$/, () => {
      throw new Error('push mapping exploded');
    });

    render(<GroupsTab targetTabId={1} oktaOrigin={ORIGIN} />);
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));

    await waitFor(() => expect(renderedGroupNames()).toEqual(['Slack Users']));
    expect(screen.queryByText('push mapping exploded')).not.toBeInTheDocument();
    expect(screen.getAllByText('APP')).toHaveLength(1);
    expect(idbTables.get('groups')!.size).toBe(1);
    expect(idbTables.get('syncMeta')!.get(`${ORIGIN}::appGroups`).complete).toBe(false);
  });

  it('clears live search state when a load succeeds', async () => {
    useDebounceTimers();
    routeSearch(() => ({
      success: true,
      data: [rawGroup({ id: 'gLive', profile: { name: 'Live Result' } })],
    }));
    routeSiblingCollections();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats&expand=app$/, () => ({
      success: true,
      headers: {},
      data: [rawGroup({ id: 'g1', profile: { name: 'Engineering' } })],
    }));

    render(<GroupsTab targetTabId={1} oktaOrigin={ORIGIN} />);
    typeInto(liveInput(), 'live');
    await advance(300);
    expect(renderedGroupNames()).toEqual(['Live Result']);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Load All Groups' }));
    });
    await advance(0);

    expect(renderedGroupNames()).toEqual(['Engineering']);
    expect(screen.getByPlaceholderText('Search groups...')).toHaveValue('');
  });
});

describe('mount snapshot rehydrate', () => {
  it('a seeded snapshot rehydrates groups and flips to cached mode', async () => {
    await renderCached([cachedGroup({ id: 'g1', name: 'Engineering' })]);

    expect(renderedGroupNames()).toEqual(['Engineering']);
    expect(screen.getByText('1 Cached')).toBeInTheDocument();
  });

  it('maps lastUpdated/created into real Dates', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({ id: 'a', name: 'Older', lastUpdated: '2021-01-01T00:00:00.000Z' }),
      cachedGroup({ id: 'b', name: 'Newer', lastUpdated: '2024-01-01T00:00:00.000Z' }),
    ]);

    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
    await uev.click(section('Sort by').getByRole('button', { name: /^Profile Updated/ }));

    expect(renderedGroupNames()).toEqual(['Newer', 'Older']);
  });

  it('an empty snapshot leaves the mode live', async () => {
    render(<GroupsTab targetTabId={1} oktaOrigin={ORIGIN} />);
    await act(async () => {});
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(renderedGroupNames()).toEqual([]);
  });
});

describe('filter pipeline (cached mode)', () => {
  const sizeFixtures = [
    cachedGroup({ id: 'a', name: 'Size0', memberCount: 0 }),
    cachedGroup({ id: 'b', name: 'Size49', memberCount: 49 }),
    cachedGroup({ id: 'c', name: 'Size50', memberCount: 50 }),
    cachedGroup({ id: 'd', name: 'Size199', memberCount: 199 }),
    cachedGroup({ id: 'e', name: 'Size200', memberCount: 200 }),
    cachedGroup({ id: 'f', name: 'Size999', memberCount: 999 }),
    cachedGroup({ id: 'g', name: 'Size1000', memberCount: 1000 }),
  ];

  async function openFilters(uev: ReturnType<typeof userEvent.setup>) {
    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
  }

  it('text search matches name, description, or id (case-insensitively)', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({ id: 'idmatch', name: 'Alpha', description: 'nope' }),
      cachedGroup({ id: 'b', name: 'ZebraTeam', description: 'nope' }),
      cachedGroup({ id: 'c', name: 'Gamma', description: 'A ZEBRA lives here' }),
    ]);
    const input = screen.getByPlaceholderText('Search groups...');

    await uev.type(input, 'zebra');
    expect(renderedGroupNames().sort()).toEqual(['Gamma', 'ZebraTeam']);

    await uev.clear(input);
    await uev.type(input, 'IDMATCH');
    expect(renderedGroupNames()).toEqual(['Alpha']);
  });

  it('type filter narrows to the chosen group type', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({ id: 'a', name: 'OktaOne', type: 'OKTA_GROUP' }),
      cachedGroup({ id: 'b', name: 'AppOne', type: 'APP_GROUP' }),
      cachedGroup({ id: 'c', name: 'BuiltOne', type: 'BUILT_IN' }),
    ]);
    await openFilters(uev);

    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));
    expect(renderedGroupNames()).toEqual(['AppOne']);

    await uev.click(section('Group Type').getByRole('button', { name: 'Built-in' }));
    expect(renderedGroupNames()).toEqual(['BuiltOne']);

    await uev.click(section('Group Type').getByRole('button', { name: 'All' }));
    expect(renderedGroupNames().sort()).toEqual(['AppOne', 'BuiltOne', 'OktaOne']);
  });

  it.each([
    ['Empty', ['Size0']],
    ['1-50', ['Size49']],
    ['50-200', ['Size199', 'Size50']],
    ['200-1K', ['Size200', 'Size999']],
    ['1K+', ['Size1000']],
  ])('size bucket %s selects exactly the right members at its boundaries', async (label, want) => {
    const uev = userEvent.setup();
    await renderCached(sizeFixtures);
    await openFilters(uev);

    await uev.click(section('Group Size').getByRole('button', { name: label }));
    expect(renderedGroupNames().sort()).toEqual([...want].sort());
  });

  it('push status filter splits pushed from not-pushed', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({
        id: 'a',
        name: 'Pushed',
        pushMappings: [{ mappingId: 'm', appId: 'app1', appName: 'Slack', status: 'ACTIVE' }],
      }),
      cachedGroup({ id: 'b', name: 'NotPushed' }),
      cachedGroup({ id: 'c', name: 'EmptyMappings', pushMappings: [] }),
    ]);
    await openFilters(uev);

    await uev.click(section('Push Status').getByRole('button', { name: 'Pushed' }));
    expect(renderedGroupNames()).toEqual(['Pushed']);

    await uev.click(section('Push Status').getByRole('button', { name: 'Not Pushed' }));
    expect(renderedGroupNames().sort()).toEqual(['EmptyMappings', 'NotPushed']);
  });

  it('push target app filter is a multi-select OR across apps', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({
        id: 'a',
        name: 'SlackOnly',
        pushMappings: [{ mappingId: 'm1', appId: 'app1', appName: 'Slack', status: 'ACTIVE' }],
      }),
      cachedGroup({
        id: 'b',
        name: 'ZoomOnly',
        pushMappings: [{ mappingId: 'm2', appId: 'app2', appName: 'Zoom', status: 'ACTIVE' }],
      }),
      cachedGroup({ id: 'c', name: 'NoPush' }),
    ]);
    await openFilters(uev);
    const apps = section('Push Target App');

    await uev.click(apps.getByRole('button', { name: 'Slack' }));
    expect(renderedGroupNames()).toEqual(['SlackOnly']);

    await uev.click(apps.getByRole('button', { name: 'Zoom' }));
    expect(renderedGroupNames().sort()).toEqual(['SlackOnly', 'ZoomOnly']);

    await uev.click(apps.getByRole('button', { name: 'Slack' }));
    expect(renderedGroupNames()).toEqual(['ZoomOnly']);
  });

  it('composes multiple axes conjunctively', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({ id: 'a', name: 'Match', type: 'APP_GROUP', memberCount: 0 }),
      cachedGroup({ id: 'b', name: 'WrongType', type: 'OKTA_GROUP', memberCount: 0 }),
      cachedGroup({ id: 'c', name: 'WrongSize', type: 'APP_GROUP', memberCount: 10 }),
    ]);
    await openFilters(uev);

    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));
    await uev.click(section('Group Size').getByRole('button', { name: 'Empty' }));
    expect(renderedGroupNames()).toEqual(['Match']);
  });

  it('the Filters badge counts the 3 scalar filters plus one for any push-app selection', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({
        id: 'a',
        name: 'A',
        type: 'APP_GROUP',
        pushMappings: [
          { mappingId: 'm1', appId: 'app1', appName: 'Slack', status: 'ACTIVE' },
          { mappingId: 'm2', appId: 'app2', appName: 'Zoom', status: 'ACTIVE' },
        ],
      }),
    ]);
    const badge = () => screen.getByRole('button', { name: /^Filters/ }).getAttribute('aria-label');
    await openFilters(uev);

    expect(badge()).toBe('Filters');

    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));
    expect(badge()).toBe('Filters, 1 applied');

    await uev.click(section('Push Status').getByRole('button', { name: 'Pushed' }));
    expect(badge()).toBe('Filters, 2 applied');

    await uev.click(section('Push Target App').getByRole('button', { name: 'Slack' }));
    await uev.click(section('Push Target App').getByRole('button', { name: 'Zoom' }));
    expect(badge()).toBe('Filters, 3 applied');
  });

  it('a text query alone does not raise the Filters badge, but Clear all still wipes it', async () => {
    const uev = userEvent.setup();
    await renderCached([cachedGroup({ id: 'a', name: 'Alpha', type: 'APP_GROUP' })]);
    const input = screen.getByPlaceholderText('Search groups...');

    await uev.type(input, 'alph');
    expect(screen.getByRole('button', { name: /^Filters/ })).toHaveAccessibleName('Filters');

    await openFilters(uev);
    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));
    await uev.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(input).toHaveValue('');
    expect(screen.getByRole('button', { name: /^Filters/ })).toHaveAccessibleName('Filters');
  });

  it('an individual filter chip removes only its own axis', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({ id: 'a', name: 'AppEmpty', type: 'APP_GROUP', memberCount: 0 }),
      cachedGroup({ id: 'b', name: 'AppBig', type: 'APP_GROUP', memberCount: 10 }),
    ]);
    await openFilters(uev);
    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));
    await uev.click(section('Group Size').getByRole('button', { name: 'Empty' }));
    expect(renderedGroupNames()).toEqual(['AppEmpty']);

    const chip = screen.getByText('Size: empty').closest('span') as HTMLElement;
    await uev.click(within(chip).getByRole('button'));

    expect(renderedGroupNames().sort()).toEqual(['AppBig', 'AppEmpty']);
    expect(screen.getByText('Type: APP GROUP')).toBeInTheDocument();
  });
});

describe('sorting (cached mode)', () => {
  const fixtures = [
    cachedGroup({
      id: 'b',
      name: 'Beta',
      memberCount: 5,
      lastUpdated: '2023-01-01T00:00:00.000Z',
    }),
    cachedGroup({
      id: 'a',
      name: 'Alpha',
      memberCount: 99,
      lastUpdated: '2021-01-01T00:00:00.000Z',
    }),
    cachedGroup({
      id: 'c',
      name: 'Gamma',
      memberCount: 1,
      lastUpdated: undefined,
    }),
  ];

  async function open(uev: ReturnType<typeof userEvent.setup>) {
    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
  }
  const sortBtn = (name: string) =>
    section('Sort by').getByRole('button', { name: new RegExp(`^${name}`) });

  it('defaults to name ascending', async () => {
    await renderCached(fixtures);
    expect(renderedGroupNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('re-clicking the active field flips the direction', async () => {
    const uev = userEvent.setup();
    await renderCached(fixtures);
    await open(uev);

    await uev.click(sortBtn('Name'));
    expect(renderedGroupNames()).toEqual(['Gamma', 'Beta', 'Alpha']);

    await uev.click(sortBtn('Name'));
    expect(renderedGroupNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('switching to a numeric field defaults to descending; Name defaults to ascending', async () => {
    const uev = userEvent.setup();
    await renderCached(fixtures);
    await open(uev);

    await uev.click(sortBtn('Size'));
    expect(renderedGroupNames()).toEqual(['Alpha', 'Beta', 'Gamma']); // 99, 5, 1 desc
    await uev.click(sortBtn('Size'));
    expect(renderedGroupNames()).toEqual(['Gamma', 'Beta', 'Alpha']);

    await uev.click(sortBtn('Name'));
    expect(renderedGroupNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('sorts null lastUpdated last in both directions', async () => {
    const uev = userEvent.setup();
    await renderCached(fixtures);
    await open(uev);

    await uev.click(sortBtn('Profile Updated'));
    expect(renderedGroupNames()).toEqual(['Gamma', 'Beta', 'Alpha']);

    await uev.click(sortBtn('Profile Updated'));
    expect(renderedGroupNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });
});

describe('live mode isolation', () => {
  it('does not render the filter toggle, filter panel, or selection bar', () => {
    render(<GroupsTab targetTabId={1} />);
    expect(screen.queryByRole('button', { name: /^Filters/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Group Type')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Select all/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export list' })).not.toBeInTheDocument();
  });

  it('returns live results in the response order — never filtered or sorted', async () => {
    useDebounceTimers();
    routeSearch(() => ({
      success: true,
      data: [
        rawGroup({ id: 'z', profile: { name: 'Zulu' }, _embedded: { stats: { usersCount: 1 } } }),
        rawGroup({ id: 'a', profile: { name: 'Alpha' }, _embedded: { stats: { usersCount: 99 } } }),
        rawGroup({ id: 'm', profile: { name: 'Mike' }, _embedded: { stats: { usersCount: 50 } } }),
      ],
    }));

    render(<GroupsTab targetTabId={1} />);
    typeInto(liveInput(), 'x');
    await advance(300);

    expect(renderedGroupNames()).toEqual(['Zulu', 'Alpha', 'Mike']);
  });
});

describe('selection', () => {
  const fixtures = [
    cachedGroup({ id: 'a', name: 'AppOne', type: 'APP_GROUP' }),
    cachedGroup({ id: 'b', name: 'OktaOne', type: 'OKTA_GROUP' }),
    cachedGroup({ id: 'c', name: 'OktaTwo', type: 'OKTA_GROUP' }),
  ];

  it('survives filtering: the bar counts selected-vs-filtered and hidden picks stay selected', async () => {
    const uev = userEvent.setup();
    await renderCached(fixtures);

    for (const name of ['AppOne', 'OktaOne', 'OktaTwo']) {
      await uev.click(screen.getByRole('checkbox', { name: `Select ${name}` }));
    }
    expect(screen.getByRole('button', { name: 'Select all' })).toBeInTheDocument();
    expect(countLine()).toHaveTextContent('Showing 3 of 3 · 3 selected');

    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));

    expect(renderedGroupNames()).toEqual(['AppOne']);
    expect(screen.getByRole('button', { name: 'Select all' })).toBeInTheDocument();
    expect(countLine()).toHaveTextContent('Showing 1 of 1 · 3 selected');

    await uev.click(screen.getByRole('button', { name: 'Export' }));
    expect(
      screen
        .getAllByTestId('export-modal-group')
        .map((n) => n.textContent)
        .sort(),
    ).toEqual(['AppOne', 'OktaOne', 'OktaTwo']);
  });

  it('survives a reload of the group list', async () => {
    const uev = userEvent.setup();
    routeSiblingCollections();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats&expand=app$/, () => ({
      success: true,
      headers: {},
      data: [
        rawGroup({ id: 'a', profile: { name: 'AppOne' } }),
        rawGroup({ id: 'b', profile: { name: 'OktaOne' } }),
      ],
    }));
    await renderCached([
      cachedGroup({ id: 'a', name: 'AppOne' }),
      cachedGroup({ id: 'b', name: 'OktaOne' }),
    ]);

    await uev.click(screen.getByRole('checkbox', { name: 'Select AppOne' }));
    expect(screen.getByText(/· 1 selected/)).toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: /Refresh/ }));

    await waitFor(() =>
      expect(idbTables.get('syncMeta')!.get(`${ORIGIN}::groups`).lastFullWalkAt).toBeGreaterThan(1),
    );
    expect(screen.getByText(/· 1 selected/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select AppOne' })).toBeChecked();
  });

  it('Select all selects only the filtered groups; Deselect clears everything', async () => {
    const uev = userEvent.setup();
    await renderCached(fixtures);
    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
    await uev.click(section('Group Type').getByRole('button', { name: 'Okta' }));

    await uev.click(screen.getByRole('button', { name: 'Select all' }));
    expect(countLine()).toHaveTextContent('Showing 2 of 2 · 2 selected');

    await uev.click(section('Group Type').getByRole('button', { name: 'All' }));
    expect(screen.getByRole('button', { name: 'Select all' })).toBeInTheDocument();
    expect(countLine()).toHaveTextContent('Showing 3 of 3 · 2 selected');
    expect(screen.getByRole('checkbox', { name: 'Select AppOne' })).not.toBeChecked();

    await uev.click(screen.getByRole('button', { name: 'Deselect all' }));
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
    expect(countLine().textContent).toBe('Showing 3 of 3');
    expect(screen.getByRole('button', { name: 'Select all' })).toBeEnabled();
  });

  it('shows Compare only for 2-5 selections', async () => {
    const uev = userEvent.setup();
    await renderCached(fixtures);
    const compare = () => screen.queryByRole('button', { name: /^Compare/ });

    expect(compare()).not.toBeInTheDocument();

    await uev.click(screen.getByRole('checkbox', { name: 'Select AppOne' }));
    expect(compare()).not.toBeInTheDocument();

    await uev.click(screen.getByRole('checkbox', { name: 'Select OktaOne' }));
    expect(compare()).toHaveAccessibleDescription('Compare the 2 selected groups');
  });
});

describe('Export list CSV', () => {
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.spyOn>;
  let blobs: Array<{ text: string; type: string | undefined }>;
  const RealBlob = globalThis.Blob;

  beforeEach(() => {
    blobs = [];
    globalThis.Blob = class extends RealBlob {
      constructor(parts: any[], options?: BlobPropertyBag) {
        super(parts, options);
        blobs.push({ text: parts.join(''), type: options?.type });
      }
    } as any;
    revokeObjectURL = vi.fn();
    (globalThis.URL as any).createObjectURL = vi.fn(() => 'blob:mock-url');
    (globalThis.URL as any).revokeObjectURL = revokeObjectURL;
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.Blob = RealBlob;
    clickSpy.mockRestore();
  });

  it('emits an unconditionally-quoted CSV of the filtered list with the expected header', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-07-14T12:00:00.000Z'));
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({
        id: 'a',
        name: 'Say "hi"',
        description: 'has, comma',
        type: 'OKTA_GROUP',
        memberCount: 7,
        pushMappings: [{ mappingId: 'm', appId: 'app1', appName: 'Slack', status: 'ACTIVE' }],
      }),
      cachedGroup({
        id: 'b',
        name: 'Plain',
        description: undefined,
        memberCount: 0,
      }),
    ]);

    await uev.click(screen.getByRole('button', { name: 'Export list' }));

    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe('text/csv');
    expect(blobs[0].text.split('\n')).toEqual([
      '"ID","Name","Description","Type","Member Count","Push Status"',
      '"b","Plain","","OKTA_GROUP","0","Not Pushed"',
      '"a","Say ""hi""","has, comma","OKTA_GROUP","7","Pushed (1)"',
    ]);

    const anchor = clickSpy.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('okta_groups_2026-07-14.csv');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    vi.useRealTimers();
  });

  it('exports the filtered subset, not the whole cache, and disables at zero rows', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({ id: 'a', name: 'AppOne', type: 'APP_GROUP' }),
      cachedGroup({ id: 'b', name: 'OktaOne', type: 'OKTA_GROUP' }),
    ]);
    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));

    await uev.click(screen.getByRole('button', { name: 'Export list' }));
    expect(blobs[0].text).toContain('"AppOne"');
    expect(blobs[0].text).not.toContain('"OktaOne"');

    await uev.click(section('Group Type').getByRole('button', { name: 'Built-in' }));
    expect(screen.getByRole('button', { name: 'Export list' })).toBeDisabled();
  });
});

describe('prop brokering', () => {
  it('keeps both modals mounted with isOpen=false on first render', async () => {
    await renderCached([cachedGroup()]);
    expect(screen.getByTestId('export-modal')).toHaveAttribute('data-open', 'false');
    expect(screen.getByTestId('comparison-modal')).toHaveAttribute('data-open', 'false');
  });

  it('keeps onFetchMembers and onToggleSelect Object.is-stable across re-renders', async () => {
    const uev = userEvent.setup();
    const { rerender } = await renderCached([cachedGroup({ id: 'a', name: 'Alpha' })]);
    const fetchMembers = captured.props.GroupExportModal.onFetchMembers;

    for (let i = 0; i < 3; i++) {
      rerender(
        <GroupsTab
          targetTabId={1}
          oktaOrigin={ORIGIN}
          onNavigateToRule={() => {
            void i;
          }}
        />,
      );
    }
    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));

    expect(Object.is(captured.props.GroupExportModal.onFetchMembers, fetchMembers)).toBe(true);
  });

  it('onFetchMembers uses the current targetTabId even though it is memoized on []', async () => {
    route(/^\/api\/v1\/groups\/g1\/users\?limit=200&expand=group-rules$/, () => ({
      success: true,
      headers: {},
      data: [user('u1')],
    }));
    const { rerender } = render(<GroupsTab targetTabId={null} />);
    const fetchMembers = captured.props.GroupExportModal.onFetchMembers;

    rerender(<GroupsTab targetTabId={5} />);
    expect(Object.is(captured.props.GroupExportModal.onFetchMembers, fetchMembers)).toBe(true);

    await act(async () => {
      await captured.props.GroupExportModal.onFetchMembers('g1');
    });

    expect(runtimeSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/api/v1/groups/g1/users?limit=200&expand=group-rules',
        tabId: 5,
      }),
    );
  });

  it('freezes the export modal group list at click time', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({ id: 'a', name: 'Alpha' }),
      cachedGroup({ id: 'b', name: 'Beta' }),
      cachedGroup({ id: 'c', name: 'Gamma' }),
    ]);
    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    await uev.click(screen.getByRole('checkbox', { name: 'Select Beta' }));
    await uev.click(screen.getByRole('button', { name: 'Export' }));

    expect(screen.getAllByTestId('export-modal-group')).toHaveLength(2);

    await uev.click(screen.getByRole('checkbox', { name: 'Select Gamma' }));

    expect(screen.getByTestId('export-modal')).toHaveAttribute('data-open', 'true');
    expect(screen.getAllByTestId('export-modal-group').map((n) => n.textContent)).toEqual([
      'Alpha',
      'Beta',
    ]);
  });

  it('feeds the comparison modal the LIVE selection (unlike export)', async () => {
    const uev = userEvent.setup();
    await renderCached([
      cachedGroup({ id: 'a', name: 'Alpha' }),
      cachedGroup({ id: 'b', name: 'Beta' }),
    ]);
    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    await uev.click(screen.getByRole('checkbox', { name: 'Select Beta' }));
    await uev.click(screen.getByRole('button', { name: /^Compare/ }));
    expect(captured.props.GroupComparisonModal.groups).toHaveLength(2);

    await uev.click(screen.getByRole('checkbox', { name: 'Select Beta' }));

    expect(screen.getByTestId('comparison-modal')).toHaveAttribute('data-open', 'true');
    expect(captured.props.GroupComparisonModal.groups.map((g: any) => g.name)).toEqual(['Alpha']);
  });
});

describe('groupMembersCache', () => {
  it('onFetchMembers populates the cache immutably, and the new Map reaches the comparison modal', async () => {
    route(/^\/api\/v1\/groups\/a\/users\?limit=200&expand=group-rules$/, () => ({
      success: true,
      headers: {},
      data: [user('u1')],
    }));
    await renderCached([cachedGroup({ id: 'a', name: 'Alpha' })]);
    const before = captured.props.GroupComparisonModal.memberCache;
    expect(before.size).toBe(0);

    await act(async () => {
      await captured.props.GroupExportModal.onFetchMembers('a');
    });

    const after = captured.props.GroupComparisonModal.memberCache;
    expect(Object.is(after, before)).toBe(false);
    expect([...after.keys()]).toEqual(['a']);
    expect(after.get('a')).toHaveLength(1);
  });

  it('compareGroups mutates the cache Map in place: no refetch, and no state update', async () => {
    const uev = userEvent.setup();
    let memberFetches = 0;
    route(/^\/api\/v1\/groups\/[ab]\/users\?limit=200&expand=group-rules$/, () => {
      memberFetches++;
      return { success: true, headers: {}, data: [user('u1'), user('u2')] };
    });
    await renderCached([
      cachedGroup({ id: 'a', name: 'Alpha' }),
      cachedGroup({ id: 'b', name: 'Beta' }),
    ]);
    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    await uev.click(screen.getByRole('checkbox', { name: 'Select Beta' }));
    const cacheBefore = captured.props.GroupComparisonModal.memberCache;

    const runCompare = async () => {
      const p = captured.props.GroupComparisonModal;
      await act(async () => {
        await p.compareGroups(
          p.groups.map((g: any) => ({ id: g.id, name: g.name })),
          undefined,
          p.memberCache,
        );
      });
    };

    await runCompare();
    expect(memberFetches).toBe(2);

    await runCompare();
    expect(memberFetches).toBe(2);

    expect(cacheBefore.size).toBe(2);
    expect(Object.is(captured.props.GroupComparisonModal.memberCache, cacheBefore)).toBe(true);
  });
});

describe('empty states', () => {
  it('live + query + not searching: offers Load All Groups', async () => {
    useDebounceTimers();
    routeSearch(() => ({ success: true, data: [] }));

    render(<GroupsTab targetTabId={1} />);
    typeInto(liveInput(), 'zzz');
    await advance(300);

    expect(screen.getByText('No groups found matching "zzz"')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Load All Groups' })).toHaveLength(2);
  });

  it('live with no query: renders no empty state at all', () => {
    render(<GroupsTab targetTabId={1} />);
    expect(screen.queryByText(/No groups/)).not.toBeInTheDocument();
  });

  it('live while searching: suppresses the empty state', async () => {
    useDebounceTimers();
    const pending = deferred<any>();
    routeSearch(() => pending.promise);

    render(<GroupsTab targetTabId={1} />);
    typeInto(liveInput(), 'zzz');
    await advance(300);

    expect(screen.queryByText('No groups found matching "zzz"')).not.toBeInTheDocument();

    await act(async () => {
      pending.resolve({ success: true, data: [] });
      await Promise.resolve();
    });
    expect(screen.getByText('No groups found matching "zzz"')).toBeInTheDocument();
  });

  it('cached with groups but none matching: Clear Filters appears only when a scalar filter is set', async () => {
    const uev = userEvent.setup();
    await renderCached([cachedGroup({ id: 'a', name: 'Alpha', type: 'OKTA_GROUP' })]);

    await uev.type(screen.getByPlaceholderText('Search groups...'), 'zzz');
    expect(screen.getByText('No groups match your filters')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear Filters' })).not.toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));
    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: 'Clear Filters' }));
    expect(renderedGroupNames()).toEqual(['Alpha']);
  });

  it('cached with an empty cache: renders no empty state', async () => {
    await renderCached([]);
    expect(screen.queryByText(/No groups/)).not.toBeInTheDocument();
  });
});

describe('page header', () => {
  it('keeps the cached-count badge when rows are selected, and states the selection on the list', async () => {
    const uev = userEvent.setup();
    await renderCached([cachedGroup({ id: 'a', name: 'Alpha' })]);
    expect(screen.getByText('1 Cached')).toBeInTheDocument();

    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));

    expect(screen.getByText('1 Cached')).toBeInTheDocument();
    expect(screen.queryByText('1 Selected')).not.toBeInTheDocument();
    expect(countLine()).toHaveTextContent('Showing 1 of 1 · 1 selected');
  });

  it('shows the Live badge in live mode', () => {
    render(<GroupsTab targetTabId={1} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('disables Load All Groups without a target tab', () => {
    render(<GroupsTab targetTabId={null} />);
    expect(screen.getByRole('button', { name: 'Load All Groups' })).toBeDisabled();
  });

  it('disables Load All Groups while loading, and shows the list spinner', async () => {
    const uev = userEvent.setup();
    const pending = deferred<any>();
    routeSiblingCollections();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats&expand=app$/, () => pending.promise);

    render(<GroupsTab targetTabId={1} oktaOrigin={ORIGIN} />);
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));

    expect(screen.getByRole('button', { name: 'Load All Groups' })).toBeDisabled();
    expect(screen.getByText('Loading groups from Okta...')).toBeInTheDocument();

    await act(async () => {
      pending.resolve({ success: true, headers: {}, data: [] });
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(screen.queryByText('Loading groups from Okta...')).not.toBeInTheDocument(),
    );
  });
});

describe('deep-link from the Rules tab', () => {
  it('highlights and auto-expands the navigated group row', async () => {
    await renderCached(
      [cachedGroup({ id: 'g1', name: 'Engineering' }), cachedGroup({ id: 'g2', name: 'Sales' })],
      { selectedGroupId: 'g1', onGroupSelected: () => {} },
    );
    await waitFor(() => expect(screen.getByText('Engineering')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Group ID')).toBeInTheDocument());
    expect(screen.getAllByText('Group ID')).toHaveLength(1);
  });

  it('loads the group list on demand when the target is not cached, then highlights it', async () => {
    routeSiblingCollections();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats&expand=app$/, () => ({
      success: true,
      headers: {},
      data: [
        rawGroup({ id: 'g1', profile: { name: 'Engineering' } }),
        rawGroup({ id: 'g2', profile: { name: 'Sales' } }),
      ],
    }));

    render(
      <GroupsTab
        targetTabId={1}
        oktaOrigin={ORIGIN}
        selectedGroupId="g1"
        onGroupSelected={() => {}}
      />,
    );

    await waitFor(() => expect(renderedGroupNames()).toContain('Engineering'));
    expect(
      walkCalls.filter((e) => /^\/api\/v1\/groups\?limit=200&expand=stats&expand=app$/.test(e)),
    ).toHaveLength(1);
    await waitFor(() => expect(screen.getByText('Group ID')).toBeInTheDocument());
    expect(screen.getAllByText('Group ID')).toHaveLength(1);
  });
});

describe('a filtered view requested from Home', () => {
  it('applies the one filter, clears the rest, and leaves the panel closed', async () => {
    const onListViewConsumed = vi.fn();
    await renderCached(
      [
        cachedGroup({ id: 'a', name: 'Empty one', memberCount: 0 }),
        cachedGroup({ id: 'b', name: 'Populated', memberCount: 12 }),
      ],
      { listView: 'empty', onListViewConsumed },
    );

    await waitFor(() => expect(renderedGroupNames()).toEqual(['Empty one']));
    expect(screen.getByRole('button', { name: /^Filters/ })).toHaveAccessibleName(
      'Filters, 1 applied',
    );
    expect(screen.queryByText('Sort by')).not.toBeInTheDocument();
    expect(onListViewConsumed).toHaveBeenCalledTimes(1);
  });

  it('switches to cached mode, so a local filter has rows to apply to', async () => {
    await renderCached([cachedGroup({ id: 'a', name: 'Empty one', memberCount: 0 })], {
      listView: 'no-rules',
      onListViewConsumed: () => {},
    });
    await waitFor(() => expect(screen.getByText('1 Cached')).toBeInTheDocument());
  });
});
