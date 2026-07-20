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
import { ProgressProvider } from '../contexts/ProgressContext';

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

vi.mock('./groups/CrossGroupSearch', () => ({
  default: (props: any) => {
    captured.props.CrossGroupSearch = props;
    return <div data-testid="cross-group-search" />;
  },
}));

vi.mock('./groups/BulkOperationsPanel', () => ({
  default: (props: any) => {
    captured.props.BulkOperationsPanel = props;
    return <div data-testid="bulk-panel" />;
  },
}));

vi.mock('./groups/GroupCollections', () => ({
  default: (props: any) => {
    captured.props.GroupCollections = props;
    return <div data-testid="collections-panel" />;
  },
}));

vi.mock('../../shared/undoManager', () => ({
  logAction: vi.fn(),
  logBulkRemoveAction: vi.fn(),
  logBulkAddAction: vi.fn(),
}));

const runtimeSendMessage = vi.fn();
const tabsSendMessage = vi.fn();
const storageGet = vi.fn();
const storageSet = vi.fn();

const GROUPS_CACHE_KEY = 'okta_unbound_groups_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

globalThis.chrome = {
  runtime: {
    sendMessage: runtimeSendMessage,
    getURL: (p: string) => p,
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  tabs: { sendMessage: tabsSendMessage },
  storage: { local: { get: storageGet, set: storageSet, remove: vi.fn() } },
} as any;

type Route = [RegExp, (msg: any) => any];
let routes: Route[] = [];
function route(pattern: RegExp, respond: (msg: any) => any) {
  routes.push([pattern, respond]);
}

function schedulerCalls() {
  return runtimeSendMessage.mock.calls.map((c) => c[0]);
}

const SEARCH_RE = /^\/api\/v1\/groups\?q=/;
function searchCalls() {
  return schedulerCalls().filter((m: any) => SEARCH_RE.test(m.endpoint));
}
function routeSearch(respond: (msg: any) => any) {
  route(SEARCH_RE, respond);
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
    staleness: { score: 10, factors: [] },
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

function seedCache(groups: Record<string, any>[], ageMs = 0) {
  storageGet.mockImplementation((_keys: string[], cb: (r: any) => void) =>
    cb({ [GROUPS_CACHE_KEY]: JSON.stringify({ groups, timestamp: Date.now() - ageMs }) }),
  );
}

function renderCached(groups: Record<string, any>[], props: Record<string, any> = {}) {
  seedCache(groups);
  return render(<GroupsTab targetTabId={1} {...props} />);
}

function renderedGroupNames() {
  return screen
    .queryAllByRole('checkbox')
    .map((c) => c.getAttribute('aria-label') ?? '')
    .filter((l) => l.startsWith('Select '))
    .map((l) => l.slice('Select '.length));
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

beforeEach(() => {
  vi.clearAllMocks();
  routes = [];
  captured.props = {};
  storageGet.mockImplementation((_keys: string[], cb: (r: any) => void) => cb({}));
  runtimeSendMessage.mockImplementation(async (msg: any) => {
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
  it('maps, scores staleness, enriches with push mappings, caches, and flips to cached mode', async () => {
    const uev = userEvent.setup();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats$/, () => ({
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
    route(/^\/api\/v1\/apps\/app123$/, () => ({
      success: true,
      headers: {},
      data: { label: 'Slack' },
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

    render(<GroupsTab targetTabId={1} />);
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));

    await waitFor(() => expect(renderedGroupNames()).toEqual(['Engineering', 'Slack Users']));

    expect(
      screen.getByPlaceholderText('Search by name, description, or ID...'),
    ).toBeInTheDocument();
    expect(screen.getByText('2 Cached')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refresh/ })).toBeInTheDocument();

    expect(screen.getAllByText(/Healthy|Monitor|Stale|Very Stale/).length).toBeGreaterThanOrEqual(
      2,
    );

    expect(screen.getByText('Slack')).toBeInTheDocument();

    expect(storageSet).toHaveBeenCalledTimes(1);
    const written = JSON.parse(storageSet.mock.calls[0][0][GROUPS_CACHE_KEY]);
    expect(written.groups[0].lastUpdated).toBe('2024-01-01T00:00:00.000Z');
    expect(written.groups[0].created).toBe('2020-01-01T00:00:00.000Z');
    expect(typeof written.timestamp).toBe('number');
    expect(written.groups[0].staleness.score).toBeGreaterThan(0);
  });

  it('reads sourceAppId from group.source in preference to the _links.apps href', async () => {
    const uev = userEvent.setup();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats$/, () => ({
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
    route(/^\/api\/v1\/apps\/fromSource$/, () => ({ success: true, headers: {}, data: {} }));
    route(/^\/api\/v1\/apps\/fromSource\/groups\?limit=200$/, () => ({
      success: true,
      headers: {},
      data: [],
    }));

    render(<GroupsTab targetTabId={1} />);
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));
    await waitFor(() => expect(renderedGroupNames()).toEqual(['Slack Users']));

    const endpoints = schedulerCalls().map((m) => m.endpoint);
    expect(endpoints).toContain('/api/v1/apps/fromSource');
    expect(endpoints).not.toContain('/api/v1/apps/fromLinks');
    expect(screen.getByText('Slack Prod')).toBeInTheDocument();
  });

  it('pages via the link header and discards partial pages when a later page fails', async () => {
    const uev = userEvent.setup();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats$/, () => ({
      success: true,
      headers: { link: '<https://x.okta.com/api/v1/groups?after=g1&limit=200>; rel="next"' },
      data: [rawGroup({ id: 'g1', profile: { name: 'Page One' } })],
    }));
    route(/after=g1/, () => ({ success: false, error: 'page two exploded' }));

    render(<GroupsTab targetTabId={1} />);
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));

    await waitFor(() => expect(screen.getByText('page two exploded')).toBeInTheDocument());
    expect(renderedGroupNames()).toEqual([]);
    expect(storageSet).not.toHaveBeenCalled();
  });

  it('on getAllGroups failure: banners the message, stops loading, writes no cache', async () => {
    const uev = userEvent.setup();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats$/, () => ({
      success: false,
      error: 'Failed to fetch groups',
    }));

    render(<GroupsTab targetTabId={1} />);
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));

    await waitFor(() => expect(screen.getByText('Failed to fetch groups')).toBeInTheDocument());
    expect(storageSet).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Load All Groups' })).toBeEnabled();
  });

  it('on applyPushGroupMappings failure: no banner, groups still render, cache still written', async () => {
    const uev = userEvent.setup();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats$/, () => ({
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
    route(/^\/api\/v1\/apps\/app123$/, () => {
      throw new Error('push mapping exploded');
    });
    route(/^\/api\/v1\/apps\/app123\/groups\?limit=200$/, () => ({
      success: true,
      headers: {},
      data: [],
    }));

    render(<GroupsTab targetTabId={1} />);
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));

    await waitFor(() => expect(renderedGroupNames()).toEqual(['Slack Users']));
    expect(screen.queryByText('push mapping exploded')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Healthy|Monitor|Stale|Very Stale/).length).toBe(1);
    expect(storageSet).toHaveBeenCalledTimes(1);
  });

  it('clears live search state when a load succeeds', async () => {
    useDebounceTimers();
    routeSearch(() => ({
      success: true,
      data: [rawGroup({ id: 'gLive', profile: { name: 'Live Result' } })],
    }));
    route(/^\/api\/v1\/groups\?limit=200&expand=stats$/, () => ({
      success: true,
      headers: {},
      data: [rawGroup({ id: 'g1', profile: { name: 'Engineering' } })],
    }));

    render(<GroupsTab targetTabId={1} />);
    typeInto(liveInput(), 'live');
    await advance(300);
    expect(renderedGroupNames()).toEqual(['Live Result']);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Load All Groups' }));
    });
    await advance(0);

    expect(renderedGroupNames()).toEqual(['Engineering']);
    expect(screen.getByPlaceholderText('Search by name, description, or ID...')).toHaveValue('');
  });
});

describe('mount cache rehydrate', () => {
  it('a fresh entry rehydrates groups and flips to cached mode', () => {
    renderCached([cachedGroup({ id: 'g1', name: 'Engineering' })]);

    expect(renderedGroupNames()).toEqual(['Engineering']);
    expect(screen.getByText('1 Cached')).toBeInTheDocument();
  });

  it('revives lastUpdated/created into real Dates', async () => {
    const uev = userEvent.setup();
    renderCached([
      cachedGroup({ id: 'a', name: 'Older', lastUpdated: '2021-01-01T00:00:00.000Z' }),
      cachedGroup({ id: 'b', name: 'Newer', lastUpdated: '2024-01-01T00:00:00.000Z' }),
    ]);

    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
    await uev.click(section('Sort by').getByRole('button', { name: /^Last Updated/ }));

    expect(renderedGroupNames()).toEqual(['Newer', 'Older']);
  });

  it('an expired entry (age >= 24h) is ignored and the mode stays live', () => {
    seedCache([cachedGroup({ name: 'Engineering' })], CACHE_DURATION + 1000);
    render(<GroupsTab targetTabId={1} />);

    expect(renderedGroupNames()).toEqual([]);
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search groups by name...')).toBeInTheDocument();
    expect(storageSet).not.toHaveBeenCalled();
  });

  it('malformed cache JSON does not throw and leaves the mode live', () => {
    storageGet.mockImplementation((_k: string[], cb: (r: any) => void) =>
      cb({ [GROUPS_CACHE_KEY]: '{not json' }),
    );
    expect(() => render(<GroupsTab targetTabId={1} />)).not.toThrow();

    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(renderedGroupNames()).toEqual([]);
  });

  it('an absent cache entry leaves the mode live', () => {
    render(<GroupsTab targetTabId={1} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('a late storage callback overwrites freshly loaded groups (stale wins)', async () => {
    const uev = userEvent.setup();
    let storageCb: ((r: any) => void) | null = null;
    storageGet.mockImplementation((_k: string[], cb?: (r: any) => void) => {
      if (typeof cb === 'function') storageCb = cb;
    });
    route(/^\/api\/v1\/groups\?limit=200&expand=stats$/, () => ({
      success: true,
      headers: {},
      data: [rawGroup({ id: 'fresh', profile: { name: 'FRESH' } })],
    }));

    render(<GroupsTab targetTabId={1} />);
    await uev.click(screen.getByRole('button', { name: 'Load All Groups' }));
    await waitFor(() => expect(renderedGroupNames()).toEqual(['FRESH']));

    act(() => {
      storageCb!({
        [GROUPS_CACHE_KEY]: JSON.stringify({
          groups: [cachedGroup({ id: 'stale', name: 'STALE' })],
          timestamp: Date.now(),
        }),
      });
    });

    expect(renderedGroupNames()).toEqual(['STALE']);
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

  const stalenessFixtures = [
    cachedGroup({ id: 'a', name: 'Score25', staleness: { score: 25, factors: [] } }),
    cachedGroup({ id: 'b', name: 'Score26', staleness: { score: 26, factors: [] } }),
    cachedGroup({ id: 'c', name: 'Score50', staleness: { score: 50, factors: [] } }),
    cachedGroup({ id: 'd', name: 'Score51', staleness: { score: 51, factors: [] } }),
    cachedGroup({ id: 'e', name: 'Score75', staleness: { score: 75, factors: [] } }),
    cachedGroup({ id: 'f', name: 'Score76', staleness: { score: 76, factors: [] } }),
  ];

  async function openFilters(uev: ReturnType<typeof userEvent.setup>) {
    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
  }

  it('text search matches name, description, or id (case-insensitively)', async () => {
    const uev = userEvent.setup();
    renderCached([
      cachedGroup({ id: 'idmatch', name: 'Alpha', description: 'nope' }),
      cachedGroup({ id: 'b', name: 'ZebraTeam', description: 'nope' }),
      cachedGroup({ id: 'c', name: 'Gamma', description: 'A ZEBRA lives here' }),
    ]);
    const input = screen.getByPlaceholderText('Search by name, description, or ID...');

    await uev.type(input, 'zebra');
    expect(renderedGroupNames().sort()).toEqual(['Gamma', 'ZebraTeam']);

    await uev.clear(input);
    await uev.type(input, 'IDMATCH');
    expect(renderedGroupNames()).toEqual(['Alpha']);
  });

  it('type filter narrows to the chosen group type', async () => {
    const uev = userEvent.setup();
    renderCached([
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
    renderCached(sizeFixtures);
    await openFilters(uev);

    await uev.click(section('Group Size').getByRole('button', { name: label }));
    expect(renderedGroupNames().sort()).toEqual([...want].sort());
  });

  it.each([
    ['Healthy', ['Score25']],
    ['Monitor', ['Score26', 'Score50']],
    ['Stale', ['Score51', 'Score75']],
    ['Critical', ['Score76']],
  ])('health bucket %s selects exactly the right scores at its boundaries', async (label, want) => {
    const uev = userEvent.setup();
    renderCached(stalenessFixtures);
    await openFilters(uev);

    await uev.click(section('Group Health').getByRole('button', { name: label }));
    expect(renderedGroupNames().sort()).toEqual([...want].sort());
  });

  it('push status filter splits pushed from not-pushed', async () => {
    const uev = userEvent.setup();
    renderCached([
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
    renderCached([
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
    renderCached([
      cachedGroup({ id: 'a', name: 'Match', type: 'APP_GROUP', memberCount: 0 }),
      cachedGroup({ id: 'b', name: 'WrongType', type: 'OKTA_GROUP', memberCount: 0 }),
      cachedGroup({ id: 'c', name: 'WrongSize', type: 'APP_GROUP', memberCount: 10 }),
    ]);
    await openFilters(uev);

    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));
    await uev.click(section('Group Size').getByRole('button', { name: 'Empty' }));
    expect(renderedGroupNames()).toEqual(['Match']);
  });

  it('the Filters badge counts the 4 scalar filters plus one for any push-app selection', async () => {
    const uev = userEvent.setup();
    renderCached([
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
    const badge = () => screen.getByRole('button', { name: /^Filters/ }).textContent;
    await openFilters(uev);

    expect(badge()).toBe('Filters');

    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));
    expect(badge()).toBe('Filters1');

    await uev.click(section('Push Status').getByRole('button', { name: 'Pushed' }));
    expect(badge()).toBe('Filters2');

    await uev.click(section('Push Target App').getByRole('button', { name: 'Slack' }));
    await uev.click(section('Push Target App').getByRole('button', { name: 'Zoom' }));
    expect(badge()).toBe('Filters3');
  });

  it('a text query alone does not raise the Filters badge, but Clear all still wipes it', async () => {
    const uev = userEvent.setup();
    renderCached([cachedGroup({ id: 'a', name: 'Alpha', type: 'APP_GROUP' })]);
    const input = screen.getByPlaceholderText('Search by name, description, or ID...');

    await uev.type(input, 'alph');
    expect(screen.getByRole('button', { name: /^Filters/ }).textContent).toBe('Filters');

    await openFilters(uev);
    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));
    await uev.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(input).toHaveValue('');
    expect(screen.getByRole('button', { name: /^Filters/ }).textContent).toBe('Filters');
  });

  it('an individual filter chip removes only its own axis', async () => {
    const uev = userEvent.setup();
    renderCached([
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
      staleness: { score: 50, factors: [] },
    }),
    cachedGroup({
      id: 'a',
      name: 'Alpha',
      memberCount: 99,
      lastUpdated: '2021-01-01T00:00:00.000Z',
      staleness: { score: 10, factors: [] },
    }),
    cachedGroup({
      id: 'c',
      name: 'Gamma',
      memberCount: 1,
      lastUpdated: undefined,
      staleness: { score: 90, factors: [] },
    }),
  ];

  async function open(uev: ReturnType<typeof userEvent.setup>) {
    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
  }
  const sortBtn = (name: string) =>
    section('Sort by').getByRole('button', { name: new RegExp(`^${name}`) });

  it('defaults to name ascending', () => {
    renderCached(fixtures);
    expect(renderedGroupNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('re-clicking the active field flips the direction', async () => {
    const uev = userEvent.setup();
    renderCached(fixtures);
    await open(uev);

    await uev.click(sortBtn('Name'));
    expect(renderedGroupNames()).toEqual(['Gamma', 'Beta', 'Alpha']);

    await uev.click(sortBtn('Name'));
    expect(renderedGroupNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('switching to a numeric field defaults to descending; Name defaults to ascending', async () => {
    const uev = userEvent.setup();
    renderCached(fixtures);
    await open(uev);

    await uev.click(sortBtn('Size'));
    expect(renderedGroupNames()).toEqual(['Alpha', 'Beta', 'Gamma']); // 99, 5, 1 desc
    await uev.click(sortBtn('Size'));
    expect(renderedGroupNames()).toEqual(['Gamma', 'Beta', 'Alpha']);

    await uev.click(sortBtn('Staleness'));
    expect(renderedGroupNames()).toEqual(['Gamma', 'Beta', 'Alpha']); // 90, 50, 10 desc
    await uev.click(sortBtn('Staleness'));
    expect(renderedGroupNames()).toEqual(['Alpha', 'Beta', 'Gamma']);

    await uev.click(sortBtn('Name'));
    expect(renderedGroupNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('sorts null lastUpdated last in both directions', async () => {
    const uev = userEvent.setup();
    renderCached(fixtures);
    await open(uev);

    await uev.click(sortBtn('Last Updated'));
    expect(renderedGroupNames()).toEqual(['Gamma', 'Beta', 'Alpha']);

    await uev.click(sortBtn('Last Updated'));
    expect(renderedGroupNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });
});

describe('live mode isolation', () => {
  it('does not render the filter toggle, filter panel, or selection bar', () => {
    render(<GroupsTab targetTabId={1} />);
    expect(screen.queryByRole('button', { name: /^Filters/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Group Type')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Select All' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Export List/ })).not.toBeInTheDocument();
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
    renderCached(fixtures);

    for (const name of ['AppOne', 'OktaOne', 'OktaTwo']) {
      await uev.click(screen.getByRole('checkbox', { name: `Select ${name}` }));
    }
    expect(screen.getByText('3 of 3 selected')).toBeInTheDocument();
    expect(screen.getByText('3 Selected')).toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));

    expect(renderedGroupNames()).toEqual(['AppOne']);
    expect(screen.getByText('3 of 1 selected')).toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: /Export \(3\)/ }));
    expect(
      screen
        .getAllByTestId('export-modal-group')
        .map((n) => n.textContent)
        .sort(),
    ).toEqual(['AppOne', 'OktaOne', 'OktaTwo']);
  });

  it('survives a reload of the group list', async () => {
    const uev = userEvent.setup();
    route(/^\/api\/v1\/groups\?limit=200&expand=stats$/, () => ({
      success: true,
      headers: {},
      data: [
        rawGroup({ id: 'a', profile: { name: 'AppOne' } }),
        rawGroup({ id: 'b', profile: { name: 'OktaOne' } }),
      ],
    }));
    renderCached([
      cachedGroup({ id: 'a', name: 'AppOne' }),
      cachedGroup({ id: 'b', name: 'OktaOne' }),
    ]);

    await uev.click(screen.getByRole('checkbox', { name: 'Select AppOne' }));
    expect(screen.getByText('1 Selected')).toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: /Refresh/ }));

    await waitFor(() => expect(storageSet).toHaveBeenCalled());
    expect(screen.getByText('1 Selected')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select AppOne' })).toBeChecked();
  });

  it('Select All selects only the filtered groups; Deselect All clears everything', async () => {
    const uev = userEvent.setup();
    renderCached(fixtures);
    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
    await uev.click(section('Group Type').getByRole('button', { name: 'Okta' }));

    await uev.click(screen.getByRole('button', { name: 'Select All' }));
    expect(screen.getByText('2 of 2 selected')).toBeInTheDocument();

    await uev.click(section('Group Type').getByRole('button', { name: 'All' }));
    expect(screen.getByText('2 of 3 selected')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select AppOne' })).not.toBeChecked();

    await uev.click(screen.getByRole('button', { name: 'Deselect All' }));
    expect(screen.getByText('0 of 3 selected')).toBeInTheDocument();
  });

  it('loading a collection replaces the selection wholesale', async () => {
    const uev = userEvent.setup();
    renderCached(fixtures);
    await uev.click(screen.getByRole('checkbox', { name: 'Select AppOne' }));
    await uev.click(screen.getByRole('button', { name: /Collections/ }));

    act(() => captured.props.GroupCollections.onLoadCollection(['b', 'c']));

    expect(screen.getByRole('checkbox', { name: 'Select AppOne' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select OktaOne' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select OktaTwo' })).toBeChecked();
  });

  it('shows Compare only for 2-5 selections and Bulk Actions only above 0', async () => {
    const uev = userEvent.setup();
    renderCached(fixtures);
    const compare = () => screen.queryByRole('button', { name: /^Compare/ });

    expect(compare()).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Bulk Actions' })).not.toBeInTheDocument();

    await uev.click(screen.getByRole('checkbox', { name: 'Select AppOne' }));
    expect(compare()).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bulk Actions' })).toBeInTheDocument();

    await uev.click(screen.getByRole('checkbox', { name: 'Select OktaOne' }));
    expect(compare()).toHaveTextContent('Compare (2)');
  });
});

describe('Export List CSV', () => {
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
    renderCached([
      cachedGroup({
        id: 'a',
        name: 'Say "hi"',
        description: 'has, comma',
        type: 'OKTA_GROUP',
        memberCount: 7,
        staleness: { score: 42, factors: [] },
        pushMappings: [{ mappingId: 'm', appId: 'app1', appName: 'Slack', status: 'ACTIVE' }],
      }),
      cachedGroup({
        id: 'b',
        name: 'Plain',
        description: undefined,
        memberCount: 0,
        staleness: undefined,
      }),
    ]);

    await uev.click(screen.getByRole('button', { name: /Export List/ }));

    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe('text/csv');
    expect(blobs[0].text.split('\n')).toEqual([
      '"ID","Name","Description","Type","Member Count","Staleness Score","Push Status"',
      '"b","Plain","","OKTA_GROUP","0","","Not Pushed"',
      '"a","Say ""hi""","has, comma","OKTA_GROUP","7","42","Pushed (1)"',
    ]);

    const anchor = clickSpy.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('okta_groups_2026-07-14.csv');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    vi.useRealTimers();
  });

  it('exports the filtered subset, not the whole cache, and disables at zero rows', async () => {
    const uev = userEvent.setup();
    renderCached([
      cachedGroup({ id: 'a', name: 'AppOne', type: 'APP_GROUP' }),
      cachedGroup({ id: 'b', name: 'OktaOne', type: 'OKTA_GROUP' }),
    ]);
    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));

    await uev.click(screen.getByRole('button', { name: /Export List/ }));
    expect(blobs[0].text).toContain('"AppOne"');
    expect(blobs[0].text).not.toContain('"OktaOne"');

    await uev.click(section('Group Type').getByRole('button', { name: 'Built-in' }));
    expect(screen.getByRole('button', { name: /Export List/ })).toBeDisabled();
  });
});

describe('prop brokering', () => {
  it('keeps both modals mounted with isOpen=false on first render', () => {
    renderCached([cachedGroup()]);
    expect(screen.getByTestId('export-modal')).toHaveAttribute('data-open', 'false');
    expect(screen.getByTestId('comparison-modal')).toHaveAttribute('data-open', 'false');
  });

  it('keeps onFetchMembers and onToggleSelect Object.is-stable across re-renders', async () => {
    const uev = userEvent.setup();
    seedCache([cachedGroup({ id: 'a', name: 'Alpha' })]);
    const { rerender } = render(<GroupsTab targetTabId={1} />);
    const fetchMembers = captured.props.GroupExportModal.onFetchMembers;

    for (let i = 0; i < 3; i++) {
      rerender(<GroupsTab targetTabId={1} oktaOrigin={`https://a${i}.okta.com`} />);
    }
    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));

    expect(Object.is(captured.props.GroupExportModal.onFetchMembers, fetchMembers)).toBe(true);
  });

  it('keeps onRemoveUserFromGroups Object.is-stable across re-renders', async () => {
    const uev = userEvent.setup();
    renderCached([cachedGroup({ id: 'a', name: 'Alpha' })]);
    await uev.click(screen.getByRole('button', { name: /Cross-Search/ }));
    const remove = captured.props.CrossGroupSearch.onRemoveUserFromGroups;

    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));

    expect(Object.is(captured.props.CrossGroupSearch.onRemoveUserFromGroups, remove)).toBe(true);
  });

  it('onFetchMembers uses the current targetTabId even though it is memoized on []', async () => {
    route(/^\/api\/v1\/groups\/g1\/users\?limit=200$/, () => ({
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
      expect.objectContaining({ endpoint: '/api/v1/groups/g1/users?limit=200', tabId: 5 }),
    );
  });

  it('freezes the export modal group list at click time', async () => {
    const uev = userEvent.setup();
    renderCached([
      cachedGroup({ id: 'a', name: 'Alpha' }),
      cachedGroup({ id: 'b', name: 'Beta' }),
      cachedGroup({ id: 'c', name: 'Gamma' }),
    ]);
    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    await uev.click(screen.getByRole('checkbox', { name: 'Select Beta' }));
    await uev.click(screen.getByRole('button', { name: /Export \(2\)/ }));

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
    renderCached([cachedGroup({ id: 'a', name: 'Alpha' }), cachedGroup({ id: 'b', name: 'Beta' })]);
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
  it('onFetchMembers populates the cache immutably and the Cross-Search badge reflects it', async () => {
    route(/^\/api\/v1\/groups\/a\/users\?limit=200$/, () => ({
      success: true,
      headers: {},
      data: [user('u1')],
    }));
    renderCached([cachedGroup({ id: 'a', name: 'Alpha' })]);
    const crossSearch = () => screen.getByRole('button', { name: /Cross-Search/ }).textContent;

    expect(crossSearch()).toBe('Cross-Search');

    await act(async () => {
      await captured.props.GroupExportModal.onFetchMembers('a');
    });

    expect(crossSearch()).toBe('Cross-Search1');
  });

  it('compareGroups mutates the cache Map in place: no refetch, and no badge update', async () => {
    const uev = userEvent.setup();
    let memberFetches = 0;
    route(/^\/api\/v1\/groups\/[ab]\/users\?limit=200$/, () => {
      memberFetches++;
      return { success: true, headers: {}, data: [user('u1'), user('u2')] };
    });
    renderCached([cachedGroup({ id: 'a', name: 'Alpha' }), cachedGroup({ id: 'b', name: 'Beta' })]);
    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    await uev.click(screen.getByRole('checkbox', { name: 'Select Beta' }));

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

    expect(screen.getByRole('button', { name: /Cross-Search/ }).textContent).toBe('Cross-Search');
  });

  it('passes the raw (uncloned) cache Map to both the comparison modal and cross-search', async () => {
    const uev = userEvent.setup();
    renderCached([cachedGroup({ id: 'a', name: 'Alpha' })]);
    await uev.click(screen.getByRole('button', { name: /Cross-Search/ }));

    expect(
      Object.is(
        captured.props.GroupComparisonModal.memberCache,
        captured.props.CrossGroupSearch.groupMembersCache,
      ),
    ).toBe(true);
  });

  it('builds groupNames from every cached group, not just the selected ones', async () => {
    const uev = userEvent.setup();
    renderCached([cachedGroup({ id: 'a', name: 'Alpha' }), cachedGroup({ id: 'b', name: 'Beta' })]);
    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    await uev.click(screen.getByRole('button', { name: /Cross-Search/ }));

    expect([...captured.props.CrossGroupSearch.groupNames.entries()]).toEqual([
      ['a', 'Alpha'],
      ['b', 'Beta'],
    ]);
  });
});

describe('handleRemoveUserFromGroups', () => {
  async function openCrossSearch() {
    const uev = userEvent.setup();
    renderCached([cachedGroup({ id: 'a', name: 'Alpha' })]);
    await uev.click(screen.getByRole('button', { name: /Cross-Search/ }));
    return captured.props.CrossGroupSearch.onRemoveUserFromGroups;
  }

  it('issues one DELETE per group, sequentially, in the given order', async () => {
    const order: string[] = [];
    route(/^\/api\/v1\/groups\/.*\/users\/u1$/, (msg) => {
      order.push(msg.endpoint);
      return { success: true };
    });
    const remove = await openCrossSearch();

    await act(async () => {
      await remove('u1', ['g1', 'g2', 'g3']);
    });

    expect(order).toEqual([
      '/api/v1/groups/g1/users/u1',
      '/api/v1/groups/g2/users/u1',
      '/api/v1/groups/g3/users/u1',
    ]);
    expect(schedulerCalls().every((m) => m.method === 'DELETE' || m.method === 'GET')).toBe(true);
  });

  it('aborts the remaining groups when a DELETE rejects, and propagates', async () => {
    const attempted: string[] = [];
    route(/^\/api\/v1\/groups\/.*\/users\/u1$/, (msg) => {
      attempted.push(msg.endpoint);
      if (msg.endpoint.includes('/g2/')) throw new Error('boom');
      return { success: true };
    });
    const remove = await openCrossSearch();

    await expect(remove('u1', ['g1', 'g2', 'g3'])).rejects.toThrow('boom');
    expect(attempted).toEqual(['/api/v1/groups/g1/users/u1', '/api/v1/groups/g2/users/u1']);
  });

  it('treats a success:false response as a success and keeps going', async () => {
    const attempted: string[] = [];
    route(/^\/api\/v1\/groups\/.*\/users\/u1$/, (msg) => {
      attempted.push(msg.endpoint);
      return { success: false, error: 'nope' };
    });
    const remove = await openCrossSearch();

    await act(async () => {
      await expect(remove('u1', ['g1', 'g2'])).resolves.toBeUndefined();
    });
    expect(attempted).toHaveLength(2);
  });
});

describe('inline panels', () => {
  const fixtures = [cachedGroup({ id: 'a', name: 'Alpha' })];

  it('are mutually exclusive and toggle off on a second click', async () => {
    const uev = userEvent.setup();
    renderCached(fixtures);

    await uev.click(screen.getByRole('button', { name: /Cross-Search/ }));
    expect(screen.getByTestId('cross-group-search')).toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: /Collections/ }));
    expect(screen.queryByTestId('cross-group-search')).not.toBeInTheDocument();
    expect(screen.getByTestId('collections-panel')).toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: /Collections/ }));
    expect(screen.queryByTestId('collections-panel')).not.toBeInTheDocument();
  });

  it('closes via the child onClose callback', async () => {
    const uev = userEvent.setup();
    renderCached(fixtures);
    await uev.click(screen.getByRole('button', { name: /Cross-Search/ }));

    act(() => captured.props.CrossGroupSearch.onClose());

    expect(screen.queryByTestId('cross-group-search')).not.toBeInTheDocument();
  });

  it('drops the bulk panel the moment the selection empties', async () => {
    const uev = userEvent.setup();
    renderCached(fixtures);
    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    await uev.click(screen.getByRole('button', { name: 'Bulk Actions' }));
    expect(screen.getByTestId('bulk-panel')).toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: 'Deselect All' }));

    expect(screen.queryByTestId('bulk-panel')).not.toBeInTheDocument();
  });

  it('lets the bulk panel trigger the export modal', async () => {
    const uev = userEvent.setup();
    renderCached(fixtures);
    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    await uev.click(screen.getByRole('button', { name: 'Bulk Actions' }));

    await act(async () => captured.props.BulkOperationsPanel.onExportSelection());

    expect(screen.getByTestId('export-modal')).toHaveAttribute('data-open', 'true');
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
    renderCached([cachedGroup({ id: 'a', name: 'Alpha', type: 'OKTA_GROUP' })]);

    await uev.type(screen.getByPlaceholderText('Search by name, description, or ID...'), 'zzz');
    expect(screen.getByText('No groups match your filters')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear Filters' })).not.toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: /^Filters/ }));
    await uev.click(section('Group Type').getByRole('button', { name: 'App' }));
    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();

    await uev.click(screen.getByRole('button', { name: 'Clear Filters' }));
    expect(renderedGroupNames()).toEqual(['Alpha']);
  });

  it('cached with an empty cache: renders no empty state', () => {
    renderCached([]);
    expect(screen.queryByText(/No groups/)).not.toBeInTheDocument();
  });
});

describe('page header', () => {
  it('prefers the selection badge over the cached-count badge', async () => {
    const uev = userEvent.setup();
    renderCached([cachedGroup({ id: 'a', name: 'Alpha' })]);
    expect(screen.getByText('1 Cached')).toBeInTheDocument();

    await uev.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));

    expect(screen.getByText('1 Selected')).toBeInTheDocument();
    expect(screen.queryByText('1 Cached')).not.toBeInTheDocument();
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
    route(/^\/api\/v1\/groups\?limit=200&expand=stats$/, () => pending.promise);

    render(<GroupsTab targetTabId={1} />);
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
    renderCached(
      [cachedGroup({ id: 'g1', name: 'Engineering' }), cachedGroup({ id: 'g2', name: 'Sales' })],
      { selectedGroupId: 'g1', onGroupSelected: () => {} },
    );
    await waitFor(() => expect(screen.getByText('Engineering')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Group ID')).toBeInTheDocument());
    expect(screen.getAllByText('Group ID')).toHaveLength(1);
  });
});
