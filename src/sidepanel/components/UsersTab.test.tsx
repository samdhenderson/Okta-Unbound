import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent, within } from '@testing-library/react';
import UsersTab from './UsersTab';

const userContext = vi.hoisted(() => ({
  current: { userInfo: null, isLoading: false, oktaOrigin: null } as {
    userInfo: { userId: string; userName: string; userStatus?: string } | null;
    isLoading: boolean;
    oktaOrigin: string | null;
  },
}));

vi.mock('../hooks/useUserContext', () => ({
  useUserContext: () => userContext.current,
}));

vi.mock('../../shared/rulesCache', () => ({
  RulesCache: { get: vi.fn().mockResolvedValue(null), set: vi.fn() },
}));

vi.mock('../../shared/undoManager', () => ({
  logAction: vi.fn(),
  logBulkRemoveAction: vi.fn(),
  logBulkAddAction: vi.fn(),
}));

const runtimeSendMessage = vi.fn();
const tabsSendMessage = vi.fn();

globalThis.chrome = {
  runtime: {
    sendMessage: runtimeSendMessage,
    getURL: (p: string) => p,
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  tabs: { sendMessage: tabsSendMessage },
  storage: { local: { get: vi.fn(), set: vi.fn(), remove: vi.fn() } },
} as any;

type Route = [RegExp, (msg: any) => any];
let routes: Route[] = [];
function route(pattern: RegExp, respond: (msg: any) => any) {
  routes.push([pattern, respond]);
}

function tabCalls(action?: string) {
  return tabsSendMessage.mock.calls
    .map((c) => c[1])
    .filter((m) => (action ? m.action === action : true));
}

function schedulerEndpoints() {
  return runtimeSendMessage.mock.calls.map((c) => c[0].endpoint).filter(Boolean);
}

function userDetailCalls() {
  return schedulerEndpoints().filter((e) => /^\/api\/v1\/users\/[^/?]+$/.test(e));
}

function userSearchCalls() {
  return schedulerEndpoints().filter((e) => /^\/api\/v1\/users\?q=/.test(e));
}

const USER_GROUPS = /^\/api\/v1\/users\/[^/?]+\/groups/;
function userGroupsCalls() {
  return schedulerEndpoints().filter((e) => USER_GROUPS.test(e));
}

const GROUP_RULES = /^\/api\/v1\/groups\/rules/;

function oktaUser(over: Record<string, any> = {}) {
  const { profile, ...rest } = over;
  return {
    id: 'u1',
    status: 'ACTIVE',
    created: '2020-01-01T00:00:00.000Z',
    lastLogin: '2024-01-01T00:00:00.000Z',
    ...rest,
    profile: {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@x.com',
      login: 'ada@x.com',
      department: 'Engineering',
      ...(profile ?? {}),
    },
  };
}

function rawGroup(over: Record<string, any> = {}) {
  return {
    id: 'g1',
    type: 'OKTA_GROUP',
    profile: { name: 'Engineering', description: 'Eng team' },
    ...over,
  };
}

function activeRule(over: Record<string, any> = {}) {
  return {
    id: 'r1',
    name: 'Eng auto-assign',
    status: 'ACTIVE',
    type: 'group_rule',
    created: '2026-01-01T00:00:00.000Z',
    lastUpdated: '2026-01-01T00:00:00.000Z',
    conditions: { expression: { value: 'user.department == "Engineering"' } },
    actions: { assignUserToGroups: { groupIds: ['g1'] } },
    ...over,
  };
}

function useDebounceTimers() {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
}

function setValue(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
}

function typeInto(input: HTMLElement, text: string) {
  let acc = (input as HTMLInputElement).value;
  for (const ch of text) {
    acc += ch;
    fireEvent.change(input, { target: { value: acc } });
  }
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

const userSearchInput = () => screen.getByPlaceholderText('Search by email, name, or login...');
const groupSearchInput = () => screen.getByPlaceholderText('Type to search by group name...');

const MEMBERSHIP_ROW_TIMEOUT_MS = 5000;

async function membershipRow(groupName: string): Promise<HTMLElement> {
  const heading = await screen.findByRole(
    'heading',
    { level: 4, name: groupName },
    { timeout: MEMBERSHIP_ROW_TIMEOUT_MS },
  );
  const row = heading.closest('[data-group-id]');
  expect(row).not.toBeNull();
  return row as HTMLElement;
}

beforeEach(() => {
  vi.clearAllMocks();
  routes = [];
  userContext.current = { userInfo: null, isLoading: false, oktaOrigin: null };

  route(/^\/api\/v1\/users\?/, () => ({ success: true, data: [] }));
  route(USER_GROUPS, () => ({ success: true, data: [] }));
  route(GROUP_RULES, () => ({ success: true, data: [] }));

  tabsSendMessage.mockResolvedValue({ success: false, error: 'no direct tab calls' });

  runtimeSendMessage.mockImplementation(async (msg: any) => {
    if (msg.action !== 'scheduleApiRequest') return { success: false };
    for (let i = routes.length - 1; i >= 0; i--) {
      const [pattern, respond] = routes[i];
      if (pattern.test(msg.endpoint)) return respond(msg);
    }
    return { success: false, error: `unrouted endpoint: ${msg.endpoint}` };
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('user search: 600ms debounce contract', () => {
  it('fires exactly one scheduler user search 600ms after the last keystroke', async () => {
    useDebounceTimers();
    render(<UsersTab targetTabId={1} />);
    runtimeSendMessage.mockClear();

    typeInto(userSearchInput(), 'ada');

    await advance(599);
    expect(userSearchCalls()).toHaveLength(0);

    await advance(1);
    expect(userSearchCalls()).toEqual(['/api/v1/users?q=ada&limit=20']);
  });

  it('restarts the 600ms window on every keystroke (only one call fires)', async () => {
    useDebounceTimers();
    render(<UsersTab targetTabId={1} />);
    runtimeSendMessage.mockClear();
    const input = userSearchInput();

    setValue(input, 'ad');
    await advance(500);
    setValue(input, 'ada');
    await advance(500);
    expect(userSearchCalls()).toHaveLength(0);

    await advance(100);
    expect(userSearchCalls()).toEqual(['/api/v1/users?q=ada&limit=20']);
  });

  it('does not search for queries shorter than 2 characters', async () => {
    useDebounceTimers();
    render(<UsersTab targetTabId={1} />);
    runtimeSendMessage.mockClear();

    typeInto(userSearchInput(), 'a');
    await advance(1000);

    expect(userSearchCalls()).toHaveLength(0);
  });

  it('still fires exactly once when unrelated re-renders happen mid-debounce', async () => {
    useDebounceTimers();
    const { rerender } = render(<UsersTab targetTabId={1} currentGroupId="x0" />);
    runtimeSendMessage.mockClear();

    typeInto(userSearchInput(), 'ada');

    for (let i = 0; i < 5; i++) {
      rerender(<UsersTab targetTabId={1} currentGroupId={`x${i}`} />);
      await advance(50);
    }
    await advance(600);

    expect(userSearchCalls()).toEqual(['/api/v1/users?q=ada&limit=20']);
  });

  it('re-searches when targetTabId changes', async () => {
    useDebounceTimers();
    const { rerender } = render(<UsersTab targetTabId={1} />);
    typeInto(userSearchInput(), 'ada');
    await advance(600);
    runtimeSendMessage.mockClear();

    rerender(<UsersTab targetTabId={2} />);
    await advance(600);

    expect(userSearchCalls()).toHaveLength(1);
    expect(runtimeSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: '/api/v1/users?q=ada&limit=20', tabId: 2 }),
    );
  });

  it('CHARACTERIZED (quirk): backspacing to 1 char leaves stale results on screen', async () => {
    useDebounceTimers();
    route(/^\/api\/v1\/users\?q=/, () => ({
      success: true,
      data: [oktaUser({ id: 'u9', profile: { firstName: 'Grace', lastName: 'Hopper' } })],
    }));
    render(<UsersTab targetTabId={1} />);
    const input = userSearchInput();

    typeInto(input, 'gra');
    await advance(600);
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();

    runtimeSendMessage.mockClear();
    setValue(input, 'g'); // <2 chars: early-returns WITHOUT clearing searchResults
    await advance(1000);

    expect(userSearchCalls()).toHaveLength(0);
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();

    setValue(input, ''); // only reaching 0 chars clears the results
    await advance(0);
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument();
  });

  it('routes user search through the background scheduler, never a direct content call (§8)', async () => {
    useDebounceTimers();
    render(<UsersTab targetTabId={1} />);
    runtimeSendMessage.mockClear();

    typeInto(userSearchInput(), 'ada');
    await advance(600);

    expect(userSearchCalls()).toHaveLength(1);
    expect(tabCalls('searchUsers')).toHaveLength(0);
  });
});

describe('admin navigation never hijacks the tab', () => {
  const detected = {
    userInfo: { userId: 'u1', userName: 'Ada Lovelace', userStatus: 'ACTIVE' },
    isLoading: false,
    oktaOrigin: null,
  };

  it('does NOT auto-fetch on detection, and loads only when asked', async () => {
    userContext.current = { ...detected };
    route(/^\/api\/v1\/users\/u1$/, () => ({ success: true, data: oktaUser() }));
    const { rerender } = render(<UsersTab targetTabId={1} />);

    expect(userDetailCalls()).toHaveLength(0);

    rerender(<UsersTab targetTabId={1} selectedUserId="u1" />);

    expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(userDetailCalls()).toEqual(['/api/v1/users/u1']);
    expect(userGroupsCalls()).toHaveLength(1);
  });

  it('never auto-fetches across parent re-renders', async () => {
    userContext.current = { ...detected };
    const { rerender } = render(<UsersTab targetTabId={1} currentGroupId="a" />);

    for (let i = 0; i < 3; i++) {
      rerender(<UsersTab targetTabId={1} currentGroupId={`b${i}`} />);
      await flush();
    }

    expect(userDetailCalls()).toHaveLength(0);
  });

  it('surfaces an error when the requested load fails', async () => {
    userContext.current = {
      userInfo: { userId: 'u1', userName: 'Ada Lovelace' },
      isLoading: false,
      oktaOrigin: null,
    };
    route(/^\/api\/v1\/users\/u1$/, () => ({ success: false, error: 'boom' }));
    render(<UsersTab targetTabId={1} selectedUserId="u1" />);

    expect(await screen.findByText('boom')).toBeInTheDocument();
  });
});

describe('membership classification (in-file heuristic)', () => {
  beforeEach(() => {
    route(/^\/api\/v1\/users\?q=/, () => ({ success: true, data: [oktaUser()] }));
  });

  it('classifies an APP_GROUP as RULE_BASED regardless of rules', async () => {
    route(USER_GROUPS, () => ({
      success: true,
      data: [rawGroup({ id: 'g2', type: 'APP_GROUP', profile: { name: 'Salesforce' } })],
    }));

    render(<UsersTab targetTabId={1} />);
    fireEvent.change(userSearchInput(), { target: { value: 'ada' } });
    const card = await screen.findByText('Ada Lovelace', {}, { timeout: 2000 });
    fireEvent.click(card);

    const salesforce = await membershipRow('Salesforce');
    expect(within(salesforce).getByText('App')).toBeInTheDocument();
    expect(within(salesforce).queryByText(/^Direct/)).not.toBeInTheDocument();
  });

  it('classifies a group with a matching ACTIVE rule as RULE_BASED and shows the rule', async () => {
    route(USER_GROUPS, () => ({ success: true, data: [rawGroup()] }));
    route(GROUP_RULES, () => ({ success: true, data: [activeRule()] }));

    render(<UsersTab targetTabId={1} />);
    fireEvent.change(userSearchInput(), { target: { value: 'ada' } });
    fireEvent.click(await screen.findByText('Ada Lovelace', {}, { timeout: 2000 }));

    expect(within(await membershipRow('Engineering')).getByText('Rule')).toBeInTheDocument();
    expect(screen.getAllByText(/Eng auto-assign/).length).toBeGreaterThan(0);
  });

  it('classifies a group with no active rules as DIRECT', async () => {
    route(USER_GROUPS, () => ({ success: true, data: [rawGroup()] }));

    render(<UsersTab targetTabId={1} />);
    fireEvent.change(userSearchInput(), { target: { value: 'ada' } });
    fireEvent.click(await screen.findByText('Ada Lovelace', {}, { timeout: 2000 }));

    expect(within(await membershipRow('Engineering')).getByText('Direct')).toBeInTheDocument();
    expect(screen.getByText('Added directly')).toBeInTheDocument();
  });

  it('classifies an excluded user as Direct even when an active rule targets the group', async () => {
    route(USER_GROUPS, () => ({ success: true, data: [rawGroup()] }));
    route(GROUP_RULES, () => ({
      success: true,
      data: [activeRule({ conditions: { people: { users: { exclude: ['u1'] } } } })],
    }));

    render(<UsersTab targetTabId={1} />);
    fireEvent.change(userSearchInput(), { target: { value: 'ada' } });
    fireEvent.click(await screen.findByText('Ada Lovelace', {}, { timeout: 2000 }));

    const engineering = await membershipRow('Engineering');
    expect(within(engineering).getByText('Direct')).toBeInTheDocument();
    expect(within(engineering).queryByText('Rule?')).not.toBeInTheDocument();
  });

  it('reports memberships as UNKNOWN, not a confident DIRECT, when rules cannot be fetched', async () => {
    route(USER_GROUPS, () => ({ success: true, data: [rawGroup()] }));
    route(GROUP_RULES, () => ({ success: false, error: 'nope' }));

    render(<UsersTab targetTabId={1} />);
    fireEvent.change(userSearchInput(), { target: { value: 'ada' } });
    fireEvent.click(await screen.findByText('Ada Lovelace', {}, { timeout: 2000 }));

    const engineering = await membershipRow('Engineering');
    expect(within(engineering).getByText('Unresolved')).toBeInTheDocument();
    expect(within(engineering).queryByText(/^Direct/)).not.toBeInTheDocument();
    expect(within(engineering).queryByText(/added directly/i)).not.toBeInTheDocument();
    expect(screen.queryByText('nope')).not.toBeInTheDocument();
  });
});

describe('compare entry point', () => {
  async function renderWithSelectedUser() {
    userContext.current = {
      userInfo: { userId: 'u1', userName: 'Ada Lovelace', userStatus: 'ACTIVE' },
      isLoading: false,
      oktaOrigin: null,
    };
    route(USER_GROUPS, () => ({ success: true, data: [] }));
    route(/^\/api\/v1\/users\/u1$/, () => ({ success: true, data: oktaUser() }));
    render(<UsersTab targetTabId={1} selectedUserId="u1" />);
    await screen.findByRole('heading', { name: 'Ada Lovelace' });
  }

  it('pushes the comparison view from the Compare action', async () => {
    await renderWithSelectedUser();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ada Lovelace');
    expect(screen.queryByRole('button', { name: 'Back to user' })).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Compare/ }));
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Compare users');
    expect(screen.getByRole('button', { name: 'Back to user' })).toBeInTheDocument();
  });
});

describe('lifecycle actions', () => {
  async function renderWithActiveUser() {
    userContext.current = {
      userInfo: { userId: 'u1', userName: 'Ada Lovelace', userStatus: 'ACTIVE' },
      isLoading: false,
      oktaOrigin: null,
    };
    route(USER_GROUPS, () => ({ success: true, data: [] }));
    route(/^\/api\/v1\/users\/u1$/, () => ({ success: true, data: oktaUser() }));
    render(<UsersTab targetTabId={1} selectedUserId="u1" />);
    await screen.findByRole('heading', { name: 'Ada Lovelace' });
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    runtimeSendMessage.mockClear();
  }

  it('suspends an ACTIVE user: exact copy, one getUserById refresh, badge flips, profile kept', async () => {
    route(/\/lifecycle\/suspend/, () => ({ success: true }));
    await renderWithActiveUser();
    route(/^\/api\/v1\/users\/u1$/, () => ({
      success: true,
      data: { id: 'u1', status: 'SUSPENDED', profile: { firstName: 'Ada', lastName: 'Lovelace' } },
    }));

    fireEvent.click(screen.getByRole('button', { name: 'Suspend user' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Suspend' }));
    });
    await flush();

    expect(
      await screen.findByText('User suspended successfully. They can no longer sign in.'),
    ).toBeInTheDocument();
    expect(schedulerEndpoints().filter((e) => e === '/api/v1/users/u1')).toHaveLength(1);
    expect(screen.getAllByText('SUSPENDED').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('tab', { name: /^Profile/ }));
    expect(await screen.findByText('Engineering')).toBeInTheDocument();
  });

  it('resetPassword skips the getUserById refresh and reloads no memberships', async () => {
    route(/\/lifecycle\/reset_password/, () => ({ success: true }));
    await renderWithActiveUser();
    tabsSendMessage.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Email' }));
    });
    await flush();

    expect(await screen.findByText('Password reset email sent successfully.')).toBeInTheDocument();
    expect(schedulerEndpoints()).not.toContain('/api/v1/users/u1');
    expect(userGroupsCalls()).toHaveLength(0);
  });

  it('shows a danger result message when the lifecycle call fails', async () => {
    route(/\/lifecycle\/suspend/, () => ({ success: false, error: 'cannot suspend' }));
    await renderWithActiveUser();

    fireEvent.click(screen.getByRole('button', { name: 'Suspend user' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Suspend' }));
    });
    await flush();

    expect(await screen.findByText('cannot suspend')).toBeInTheDocument();
  });
});

describe('add-to-group: 300ms group search (memoized searchGroups)', () => {
  async function openModal() {
    userContext.current = {
      userInfo: { userId: 'u1', userName: 'Ada Lovelace', userStatus: 'ACTIVE' },
      isLoading: false,
      oktaOrigin: null,
    };
    route(USER_GROUPS, () => ({ success: true, data: [] }));
    route(/^\/api\/v1\/users\/u1$/, () => ({ success: true, data: oktaUser() }));
    render(<UsersTab targetTabId={1} selectedUserId="u1" />);
    await screen.findByRole('heading', { name: 'Ada Lovelace' });
    runtimeSendMessage.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Add group' }));
  }

  it('fires exactly one /api/v1/groups search 300ms after typing and does NOT loop', async () => {
    route(/\/api\/v1\/groups\?q=/, () => ({
      success: true,
      data: [rawGroup({ id: 'g5', profile: { name: 'Design', description: '' } })],
    }));
    await openModal();
    runtimeSendMessage.mockClear();

    useDebounceTimers();
    setValue(groupSearchInput(), 'des');

    await advance(299);
    expect(schedulerEndpoints().filter((e) => e.startsWith('/api/v1/groups?q='))).toHaveLength(0);

    await advance(1);
    let groupSearches = schedulerEndpoints().filter((e) => e.startsWith('/api/v1/groups?q='));
    expect(groupSearches).toHaveLength(1);

    await advance(3000);
    groupSearches = schedulerEndpoints().filter((e) => e.startsWith('/api/v1/groups?q='));
    expect(groupSearches).toHaveLength(1);
    expect(groupSearches[0]).toBe('/api/v1/groups?q=des&limit=20');
  });

  it('does not search group queries shorter than 2 characters', async () => {
    route(/\/api\/v1\/groups\?q=/, () => ({ success: true, data: [] }));
    await openModal();
    runtimeSendMessage.mockClear();

    useDebounceTimers();
    setValue(groupSearchInput(), 'd');
    await advance(1000);

    expect(schedulerEndpoints().filter((e) => e.startsWith('/api/v1/groups?q='))).toHaveLength(0);
  });
});
