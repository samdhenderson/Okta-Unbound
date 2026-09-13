/**
 * Push/pop sub-navigation tests for UsersTab (ADR-0016), mirroring
 * `GroupsTab.navigation.test.tsx`.
 *
 * These pin the contract the pushed comparison view depends on: the search +
 * profile body is **hidden, never unmounted**, the comparison renders as its
 * sibling, focus moves in and comes back to the Compare button, and the cross-tab
 * deep-link still lands on a profile rather than being swallowed by a pushed view.
 *
 * Three of the cases below exist for one reason each — they are the load-bearing
 * quirks of moving this surface off `Modal`, and each was a silent regression
 * waiting to happen:
 *
 * 1. **The reset.** `useUserComparison`'s reset effect used to key on the dialog's
 *    `isOpen`. A pushed view has no `isOpen`, and both hosts keep the hook mounted
 *    while the surface is away, so that effect is still the *only* thing stopping a
 *    finished comparison from reappearing. It is now keyed on `isActive`, which the
 *    Users tab feeds from `!nav.isRoot`.
 * 2. **The search gate.** A mounted-but-popped comparison must issue nothing
 *    (ADR-0018). `useUserSearch`'s debounce is the one thing in it that reaches Okta
 *    without a click, so it is gated on `searchEnabled` — pushed *and* the tab shown.
 * 3. **The dep arrays.** `useUserComparison`'s membership load and
 *    `useComparisonApps`' app load are keyed on `[comparedUser]` only, behind
 *    load-bearing eslint-disables. A pushed view re-renders on every `nav` change,
 *    which a dialog did not; widening those deps would turn each into a fan-out.
 *
 * Message passing is chrome-based (not fetch), so MSW does not apply — the chrome
 * messaging surface is mocked exactly as `UsersTab.test.tsx` does, which keeps the
 * whole `useOktaApi` → scheduler stack real.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const rulesCacheGet = vi.hoisted(() => vi.fn());
const rulesCacheSet = vi.hoisted(() => vi.fn());
vi.mock('../../shared/rulesCache', () => ({
  RulesCache: { get: rulesCacheGet, set: rulesCacheSet },
}));

vi.mock('../../shared/undoManager', () => ({
  logAction: vi.fn(),
  logBulkRemoveAction: vi.fn(),
  logBulkAddAction: vi.fn(),
}));

const runtimeSendMessage = vi.fn();

globalThis.chrome = {
  runtime: {
    sendMessage: runtimeSendMessage,
    getURL: (p: string) => p,
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  tabs: { sendMessage: vi.fn().mockResolvedValue({ success: false }) },
  storage: { local: { get: vi.fn(), set: vi.fn(), remove: vi.fn() } },
} as any;

type Route = [RegExp, (msg: any) => any];
let routes: Route[] = [];
function route(pattern: RegExp, respond: (msg: any) => any) {
  routes.push([pattern, respond]);
}

const schedulerEndpoints = () =>
  runtimeSendMessage.mock.calls.map((c) => c[0].endpoint).filter(Boolean);

const userSearchCalls = () => schedulerEndpoints().filter((e) => /^\/api\/v1\/users\?q=/.test(e));
const userGroupsCalls = () =>
  schedulerEndpoints().filter((e) => /^\/api\/v1\/users\/[^/?]+\/groups/.test(e));
const userAppsCalls = () => schedulerEndpoints().filter((e) => e.startsWith('/api/v1/apps'));

const ADA = {
  id: 'u1',
  status: 'ACTIVE',
  created: '2020-01-01T00:00:00.000Z',
  lastLogin: '2024-01-01T00:00:00.000Z',
  profile: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    login: 'ada@example.com',
    department: 'Engineering',
  },
};

const BOB = {
  id: 'u2',
  status: 'ACTIVE',
  profile: {
    firstName: 'Bob',
    lastName: 'Compared',
    email: 'bob@example.com',
    login: 'bob@example.com',
  },
};

const gEngineering = { id: 'g1', type: 'OKTA_GROUP', profile: { name: 'Engineering' } };
const gDesign = { id: 'g2', type: 'OKTA_GROUP', profile: { name: 'Design' } };

beforeEach(() => {
  vi.clearAllMocks();
  routes = [];
  userContext.current = {
    userInfo: { userId: 'u1', userName: 'Ada Lovelace', userStatus: 'ACTIVE' },
    isLoading: false,
    oktaOrigin: null,
  };

  route(/^\/api\/v1\/users\?/, () => ({ success: true, data: [BOB, ADA] }));
  route(/^\/api\/v1\/users\/u1$/, () => ({ success: true, data: ADA }));
  route(/^\/api\/v1\/users\/u1\/groups/, () => ({ success: true, data: [gEngineering] }));
  route(/^\/api\/v1\/users\/u2\/groups/, () => ({ success: true, data: [gEngineering, gDesign] }));
  route(/^\/api\/v1\/groups\/rules/, () => ({ success: true, data: [] }));
  route(/^\/api\/v1\/apps/, () => ({ success: true, data: [], headers: {} }));

  rulesCacheGet.mockResolvedValue(null);
  rulesCacheSet.mockResolvedValue(undefined);

  runtimeSendMessage.mockImplementation(async (msg: any) => {
    if (msg.action !== 'scheduleApiRequest') return { success: false };
    for (let i = routes.length - 1; i >= 0; i--) {
      const [pattern, respond] = routes[i];
      if (pattern.test(msg.endpoint)) return respond(msg);
    }
    return { success: false, error: `unrouted endpoint: ${msg.endpoint}` };
  });
});

const tabSearchInput = () => {
  const outside = screen
    .getAllByPlaceholderText('Search users...')
    .filter((el) => !el.closest('[data-testid="user-comparison-view"]'));
  if (outside.length !== 1) {
    throw new Error(`expected exactly one Users tab search box, found ${outside.length}`);
  }
  return outside[0] as HTMLElement;
};
const compareSearchInput = () => compareView().getByPlaceholderText('Search users...');

const compareView = () => within(screen.getByTestId('user-comparison-view'));

async function selectAda(uev: ReturnType<typeof userEvent.setup>) {
  await uev.type(tabSearchInput(), 'ada');
  await uev.click(
    await screen.findByRole(
      'button',
      { name: 'View user details', description: 'Ada Lovelace' },
      { timeout: 3000 },
    ),
  );
  await screen.findByRole('heading', { name: 'Ada Lovelace' });
}

async function pushCompare(uev: ReturnType<typeof userEvent.setup>) {
  const trigger = screen.getByRole('button', { name: /Compare/ });
  await uev.click(trigger);
  await screen.findByRole('button', { name: 'Back to user' });
  return trigger;
}

async function chooseComparedUser(uev: ReturnType<typeof userEvent.setup>) {
  await uev.type(compareSearchInput(), 'bob');
  await uev.click(
    await screen.findByRole(
      'button',
      { name: 'Compare with this user', description: 'Bob Compared' },
      { timeout: 3000 },
    ),
  );
  await waitFor(() =>
    expect(screen.queryByText('Crunching memberships and assignments…')).not.toBeInTheDocument(),
  );
}

async function renderWithAda(uev: ReturnType<typeof userEvent.setup>, props: any = {}) {
  const result = render(<UsersTab targetTabId={1} {...props} />);
  await selectAda(uev);
  return result;
}

describe('UsersTab sub-navigation', () => {
  it('pushes the comparison view and swaps the single header in place', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ada Lovelace');
    expect(screen.getByRole('button', { name: 'Back to search' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back to user' })).not.toBeInTheDocument();

    await pushCompare(uev);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Compare users');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('swaps the visibility class wholesale and keeps the tab body container', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);

    const view = screen.getByTestId('user-comparison-view');
    const detail = screen.getByTestId('user-detail-view');

    expect(detail.parentElement).toBe(view.parentElement);
    expect(detail).toContainElement(screen.getByRole('button', { name: /Compare/ }));

    expect(detail.className).toBe('space-y-(--sp-rung) focus:outline-none');
    expect(view.className).toBe('hidden');

    await pushCompare(uev);

    expect(detail.className).toBe('hidden');
    expect(view.className).toBe('space-y-(--sp-rung) focus:outline-none');
  });

  it('renders a breadcrumb trail back to the profile', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);
    await pushCompare(uev);

    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(trail).toHaveTextContent('User Search');
    expect(trail).toHaveTextContent('Compare users');

    await uev.click(screen.getByRole('button', { name: 'User Search' }));
    expect(screen.queryByRole('button', { name: 'Back to user' })).not.toBeInTheDocument();
  });

  it('titles the pushed view with the live selected user, not the push-time snapshot', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);
    await pushCompare(uev);

    expect(screen.getByText('Ada Lovelace vs. another user')).toBeInTheDocument();
  });

  it('hides the profile body without unmounting it, so its state survives', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);

    expect(tabSearchInput()).toHaveValue('ada');
    const trigger = await pushCompare(uev);

    expect(trigger).toBeInTheDocument();
    expect(trigger.closest('div.hidden')).not.toBeNull();

    await uev.click(screen.getByRole('button', { name: 'Back to user' }));

    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(tabSearchInput()).toHaveValue('ada');
    expect(screen.getByRole('button', { name: /Compare/ }).closest('div.hidden')).toBeNull();
  });

  it('does not let a debounce armed before a push fire after it and clear the user the push opened', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);

    await uev.type(tabSearchInput(), 'ada');
    await pushCompare(uev);

    await new Promise((resolve) => setTimeout(resolve, 900));

    expect(screen.getByTestId('user-comparison-view')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to user' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Compare users');
  });

  it('moves focus into the pushed view and restores it to the Compare button on pop', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);

    const trigger = await pushCompare(uev);

    expect(document.activeElement).toBe(compareSearchInput());

    await uev.click(screen.getByRole('button', { name: 'Back to user' }));
    expect(document.activeElement).toBe(trigger);
  });

  it('does not trap focus: the pushed view is not a dialog and the body stays in the DOM', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);
    await pushCompare(uev);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.querySelector('[aria-modal]')).toBeNull();
    expect(screen.getByRole('button', { name: /Compare/ })).toBeInTheDocument();
  });

  it('resets a finished comparison on pop, so re-entering starts pristine', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);
    await pushCompare(uev);
    await chooseComparedUser(uev);

    expect(compareView().getByRole('tablist')).toBeInTheDocument();
    await uev.click(compareView().getByRole('tab', { name: /^Groups/ }));
    expect(compareView().getByRole('tab', { name: /^Groups/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await uev.click(screen.getByRole('button', { name: 'Back to user' }));

    expect(compareView().queryByRole('tablist')).not.toBeInTheDocument();

    await pushCompare(uev);

    expect(compareSearchInput()).toHaveValue('');
    expect(compareView().queryByText('Bob Compared')).not.toBeInTheDocument();
    expect(compareView().queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('issues ZERO requests while the comparison is mounted but popped', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);

    expect(compareSearchInput()).toBeInTheDocument();
    expect(compareSearchInput().closest('div.hidden')).not.toBeNull();

    runtimeSendMessage.mockClear();
    await new Promise((r) => setTimeout(r, 1200));

    expect(runtimeSendMessage).not.toHaveBeenCalled();
  });

  it('suspends the comparison search while the tab is hidden, and re-arms it on return', async () => {
    const uev = userEvent.setup();
    const { rerender } = await renderWithAda(uev);
    await pushCompare(uev);

    await uev.type(compareSearchInput(), 'bob');
    await screen.findByText('Bob Compared', {}, { timeout: 3000 });

    runtimeSendMessage.mockClear();
    rerender(<UsersTab targetTabId={2} isActive={false} />);
    await new Promise((r) => setTimeout(r, 1200));
    expect(userSearchCalls()).toHaveLength(0);

    rerender(<UsersTab targetTabId={2} isActive />);
    await waitFor(() => expect(userSearchCalls()).toHaveLength(1), { timeout: 3000 });
    expect(runtimeSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: '/api/v1/users?q=bob&limit=20', tabId: 2 }),
    );
  });

  it('loads the compared user exactly once and is immune to nav-driven re-renders', async () => {
    const uev = userEvent.setup();
    const { rerender } = await renderWithAda(uev);
    await pushCompare(uev);
    await chooseComparedUser(uev);

    expect(userAppsCalls()).toHaveLength(2); // both users, one pass
    const groupsBefore = userGroupsCalls().length;

    for (let i = 0; i < 3; i++) {
      rerender(<UsersTab targetTabId={1} currentGroupId={`g${i}`} />);
    }
    await new Promise((r) => setTimeout(r, 200));

    expect(userAppsCalls()).toHaveLength(2);
    expect(userGroupsCalls()).toHaveLength(groupsBefore);
  });

  it('pops back to the profile when a cross-tab deep-link arrives', async () => {
    const uev = userEvent.setup();
    const onUserSelected = vi.fn();
    const { rerender } = render(<UsersTab targetTabId={1} onUserSelected={onUserSelected} />);
    await selectAda(uev);
    await pushCompare(uev);

    rerender(<UsersTab targetTabId={1} selectedUserId="u1" onUserSelected={onUserSelected} />);

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Back to user' })).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ada Lovelace'),
    );
    expect(screen.getByRole('button', { name: /Compare/ }).closest('div.hidden')).toBeNull();
  });

  it('pops the stack when the selection is cleared, so no view outlives its host', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);
    await pushCompare(uev);

    await uev.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(screen.queryByRole('button', { name: 'Back to user' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('User Search');
    expect(screen.queryByRole('heading', { name: 'Ada Lovelace' })).not.toBeInTheDocument();
  });

  const adaGroupsCalls = () =>
    schedulerEndpoints().filter((e) => /^\/api\/v1\/users\/u1\/groups/.test(e));

  it('re-opens the same user from the search results without re-walking their memberships', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);

    expect(adaGroupsCalls()).toHaveLength(1);
    expect(userAppsCalls()).toHaveLength(0);

    await uev.click(screen.getByRole('button', { name: 'Back to search' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('User Search');

    await uev.type(tabSearchInput(), 'ada');
    await uev.click(
      await screen.findByRole(
        'button',
        { name: 'View user details', description: 'Ada Lovelace' },
        { timeout: 3000 },
      ),
    );
    await screen.findByRole('button', { name: 'Back to search' });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ada Lovelace');
    expect(adaGroupsCalls()).toHaveLength(1);
    expect(userAppsCalls()).toHaveLength(0);
  });

  it('pops back from a finished comparison without re-walking the anchor user', async () => {
    const uev = userEvent.setup();
    await renderWithAda(uev);
    await pushCompare(uev);
    await chooseComparedUser(uev);

    const groupsBefore = adaGroupsCalls().length;
    const appsBefore = userAppsCalls().length;

    await uev.click(screen.getByRole('button', { name: 'Back to user' }));
    await screen.findByRole('button', { name: 'Back to search' });
    await new Promise((r) => setTimeout(r, 700));

    expect(adaGroupsCalls()).toHaveLength(groupsBefore);
    expect(userAppsCalls()).toHaveLength(appsBefore);
  });
});
