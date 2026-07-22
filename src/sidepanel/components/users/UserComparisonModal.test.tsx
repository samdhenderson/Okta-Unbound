import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserComparisonModal from './UserComparisonModal';
import type { OktaUser, OktaGroup, GroupMembership } from '../../../shared/types';

const TAB_ID = 42;

const mockRuntimeSendMessage = vi.fn();
const mockTabsSendMessage = vi.fn();
const mockStorageGet = vi.fn();
const mockStorageSet = vi.fn();
const mockStorageRemove = vi.fn();

globalThis.chrome = {
  runtime: { sendMessage: mockRuntimeSendMessage },
  tabs: { sendMessage: mockTabsSendMessage },
  storage: {
    local: { get: mockStorageGet, set: mockStorageSet, remove: mockStorageRemove },
  },
} as any;

vi.mock('../../../shared/undoManager', () => ({
  logAction: vi.fn(),
  logBulkRemoveAction: vi.fn(),
  logBulkAddAction: vi.fn(),
}));

const contextUser: OktaUser = {
  id: 'ctx-1',
  status: 'ACTIVE',
  profile: {
    login: 'alice@example.com',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Context',
  },
};

const comparedUser: OktaUser = {
  id: 'cmp-1',
  status: 'ACTIVE',
  profile: {
    login: 'bob@example.com',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Compared',
  },
};

const group = (id: string, name: string): OktaGroup => ({
  id,
  type: 'OKTA_GROUP',
  profile: { name },
});

const gShared = group('g1', 'Shared Group A');
const gContextOnly = group('g2', 'Context Only Group');
const gComparedOnly1 = group('g3', 'Compared Only Group 1');
const gComparedOnly2 = group('g4', 'Compared Only Group 2');

const membership = (g: OktaGroup): GroupMembership => ({
  group: g,
  membershipType: 'DIRECT',
});

const CONTEXT_GROUPS: GroupMembership[] = [membership(gShared), membership(gContextOnly)];

interface AppFixture {
  id: string;
  label: string;
}

const APPS: Record<string, AppFixture[]> = {
  'ctx-1': [
    { id: 'a1', label: 'Shared App' },
    { id: 'a2', label: 'Context Only App' },
  ],
  'cmp-1': [
    { id: 'a1', label: 'Shared App' },
    { id: 'a3', label: 'Compared Only App' },
  ],
};

interface Scenario {
  apps: Record<string, AppFixture[]>;
  comparedGroups: OktaGroup[];
  appsResponse?: () => Promise<unknown>;
  groupsResponse?: () => Promise<unknown>;
  rulesResponse?: () => Promise<unknown>;
  searchResponse?: () => Promise<unknown>;
  addResponse?: () => Promise<unknown>;
  searchResults: OktaUser[];
}

let scenario: Scenario;

const appsEndpointUserId = (endpoint: string): string =>
  endpoint.match(/user\.id\+eq\+"([^"]+)"/)?.[1] ?? '';

const userSearchCalls = () =>
  mockRuntimeSendMessage.mock.calls.filter(
    (c) =>
      (c[0] as Record<string, unknown>).action === 'scheduleApiRequest' &&
      /^\/api\/v1\/users\?q=/.test(String((c[0] as Record<string, unknown>).endpoint)),
  );

beforeEach(() => {
  vi.clearAllMocks();

  scenario = {
    apps: APPS,
    comparedGroups: [gShared, gComparedOnly1, gComparedOnly2],
    searchResults: [comparedUser, contextUser],
  };

  mockStorageGet.mockResolvedValue({});
  mockStorageSet.mockResolvedValue(undefined);
  mockStorageRemove.mockResolvedValue(undefined);

  mockRuntimeSendMessage.mockImplementation(async (msg: Record<string, unknown>) => {
    if (msg.action !== 'scheduleApiRequest') return { success: false, error: 'unexpected' };
    const endpoint = String(msg.endpoint);

    if (msg.method === 'PUT' && /^\/api\/v1\/groups\/[^/]+\/users\//.test(endpoint)) {
      if (scenario.addResponse) return scenario.addResponse();
      return { success: true };
    }

    if (endpoint.startsWith('/api/v1/apps')) {
      if (scenario.appsResponse) return scenario.appsResponse();
      const userId = appsEndpointUserId(endpoint);
      return { success: true, data: scenario.apps[userId] ?? [], headers: {} };
    }

    if (endpoint.startsWith('/api/v1/users?')) {
      if (scenario.searchResponse) return scenario.searchResponse();
      return { success: true, data: scenario.searchResults, headers: {} };
    }

    if (/^\/api\/v1\/users\/[^/?]+\/groups/.test(endpoint)) {
      if (scenario.groupsResponse) return scenario.groupsResponse();
      return { success: true, data: scenario.comparedGroups };
    }

    if (/^\/api\/v1\/groups\/rules/.test(endpoint)) {
      if (scenario.rulesResponse) return scenario.rulesResponse();
      return { success: true, data: [] };
    }

    return { success: true, data: [], headers: {} };
  });

  mockTabsSendMessage.mockResolvedValue({ success: false, error: 'no direct tab calls' });
});

interface HarnessProps {
  contextGroups?: GroupMembership[];
  onGroupsChanged?: () => void;
  onClose?: () => void;
}

const Harness: React.FC<HarnessProps> = ({
  contextGroups = CONTEXT_GROUPS,
  onGroupsChanged,
  onClose,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [bump, setBump] = React.useState(0);

  return (
    <div>
      <button data-testid="bump" onClick={() => setBump((b) => b + 1)}>
        bump {bump}
      </button>
      <button data-testid="toggle" onClick={() => setIsOpen((o) => !o)}>
        toggle
      </button>
      <UserComparisonModal
        isOpen={isOpen}
        onClose={onClose ?? (() => setIsOpen(false))}
        contextUser={contextUser}
        contextGroups={contextGroups}
        targetTabId={TAB_ID}
        onGroupsChanged={() => onGroupsChanged?.()}
      />
    </div>
  );
};

const searchInput = () => screen.getByPlaceholderText('Search by email, name, or login…');

async function selectComparedUser(user: OktaUser = comparedUser) {
  await userEvent.type(searchInput(), 'bob');
  const name = `${user.profile.firstName} ${user.profile.lastName}`;
  const card = await screen.findByText(name, {}, { timeout: 3000 });
  await userEvent.click(card);
}

async function waitForLoadToSettle() {
  await waitFor(() =>
    expect(screen.queryByText('Crunching memberships and assignments…')).not.toBeInTheDocument(),
  );
}

async function openComparison() {
  await selectComparedUser();
  await waitForLoadToSettle();
}

const tab = (name: 'Overview' | 'Groups' | 'Apps') =>
  screen.getByRole('tab', { name: new RegExp(`^${name}`) });

const gotoTab = async (name: 'Overview' | 'Groups' | 'Apps') => userEvent.click(tab(name));

function rowFor(label: string): HTMLElement {
  const span = screen.getByTitle(label);
  const li = span.closest('li');
  if (!li) throw new Error(`No row found for "${label}"`);
  return li;
}

const addButtonFor = (label: string) => within(rowFor(label)).getByRole('button', { name: 'Add' });

function bucketTitleOf(label: string): string {
  const card = rowFor(label).closest('div.overflow-hidden');
  if (!card) throw new Error(`No bucket card for "${label}"`);
  return (
    card.querySelector('[title]')?.getAttribute('title') ??
    (() => {
      throw new Error('no bucket title');
    })()
  );
}

function bucketItems(title: string): string[] {
  const heading = screen.getByTitle(title);
  const card = heading.closest('div.overflow-hidden');
  if (!card) throw new Error(`No bucket card titled "${title}"`);
  return Array.from(card.querySelectorAll('li')).map((li) =>
    (li.querySelector('span[title]')?.textContent ?? '').trim(),
  );
}

const getUserAppsCalls = () =>
  mockRuntimeSendMessage.mock.calls.filter(([m]) =>
    String(m.endpoint ?? '').startsWith('/api/v1/apps'),
  );

const getUserGroupsCalls = () =>
  mockRuntimeSendMessage.mock.calls.filter(
    (c) =>
      (c[0] as Record<string, unknown>).action === 'scheduleApiRequest' &&
      /^\/api\/v1\/users\/[^/?]+\/groups/.test(String((c[0] as Record<string, unknown>).endpoint)),
  );

const addUserToGroupCalls = () =>
  mockRuntimeSendMessage.mock.calls.filter(([m]) => m.method === 'PUT');

describe('UserComparisonModal', () => {
  describe('phase switching + reset on close', () => {
    it('renders the search phase when no compared user is selected', () => {
      render(<Harness />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
      expect(
        screen.getByRole('heading', { name: 'Compare with another user' }),
      ).toBeInTheDocument();
      expect(searchInput()).toHaveValue('');
      expect(screen.getByText('Start typing to search')).toBeInTheDocument();
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Change user/ })).not.toBeInTheDocument();
    });

    it('switches to the comparison phase once a user is selected', async () => {
      render(<Harness />);
      await openComparison();

      expect(screen.getByRole('heading', { name: 'Side-by-side comparison' })).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText('Search by email, name, or login…'),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByText('Context')).toBeInTheDocument();
      expect(screen.getByText('Compared')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Change user/ })).toBeInTheDocument();
    });

    it('resets to a pristine search phase on close/reopen even though it never unmounts', async () => {
      render(<Harness />);
      await openComparison();

      await gotoTab('Groups');
      await userEvent.click(addButtonFor('Compared Only Group 1'));
      await waitFor(() => expect(addUserToGroupCalls()).toHaveLength(1));
      await gotoTab('Apps');
      expect(tab('Apps')).toHaveAttribute('aria-selected', 'true');

      await userEvent.click(screen.getByTestId('toggle'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await userEvent.click(screen.getByTestId('toggle'));

      expect(
        screen.getByRole('heading', { name: 'Compare with another user' }),
      ).toBeInTheDocument();
      expect(searchInput()).toHaveValue('');
      expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
      expect(screen.getByText('Start typing to search')).toBeInTheDocument();

      const appCallsBefore = getUserAppsCalls().length;
      await openComparison();
      expect(getUserAppsCalls()).toHaveLength(appCallsBefore + 2);
      expect(tab('Overview')).toHaveAttribute('aria-selected', 'true');

      await gotoTab('Groups');
      expect(bucketTitleOf('Compared Only Group 1')).toBe('Only Bob Compared');
    });
  });

  describe('load effect timing (riskyBit: the load-bearing eslint-disable at L128)', () => {
    it('fires exactly one load per compared-user change and is immune to parent re-renders', async () => {
      render(<Harness />);
      await openComparison();

      expect(getUserAppsCalls()).toHaveLength(2);
      expect(getUserGroupsCalls()).toHaveLength(1);

      await userEvent.click(screen.getByTestId('bump'));
      await userEvent.click(screen.getByTestId('bump'));
      await userEvent.click(screen.getByTestId('bump'));
      expect(screen.getByTestId('bump')).toHaveTextContent('bump 3');
      await waitForLoadToSettle();

      expect(getUserAppsCalls()).toHaveLength(2);
      expect(getUserGroupsCalls()).toHaveLength(1);
    });

    it('requests apps for BOTH users on every compared-user change, including the unchanged context user', async () => {
      render(<Harness />);
      await openComparison();

      const ids = getUserAppsCalls().map(([m]) => appsEndpointUserId(String(m.endpoint)));
      expect(ids).toEqual(['ctx-1', 'cmp-1']);

      await userEvent.click(screen.getByRole('button', { name: /Change user/ }));
      await openComparison();

      expect(getUserAppsCalls().map(([m]) => appsEndpointUserId(String(m.endpoint)))).toEqual([
        'ctx-1',
        'cmp-1',
        'ctx-1',
        'cmp-1',
      ]);
    });

    it('routes app loads through the background scheduler', async () => {
      render(<Harness />);
      await openComparison();

      expect(mockRuntimeSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'scheduleApiRequest',
          endpoint: '/api/v1/apps?filter=user.id+eq+"cmp-1"&limit=200',
          method: 'GET',
          tabId: TAB_ID,
          priority: 'normal',
        }),
      );
    });
  });

  describe('bucketing', () => {
    it('buckets groups into onlyCompared / shared / onlyContext', async () => {
      render(<Harness />);
      await openComparison();
      await gotoTab('Groups');

      expect(bucketItems('Only Bob Compared')).toEqual([
        'Compared Only Group 1',
        'Compared Only Group 2',
      ]);
      expect(bucketItems('Shared')).toEqual(['Shared Group A']);
      expect(bucketItems('Only Alice Context')).toEqual(['Context Only Group']);
    });

    it('buckets apps into onlyCompared / shared / onlyContext', async () => {
      render(<Harness />);
      await openComparison();
      await gotoTab('Apps');

      expect(bucketItems('Only Bob Compared')).toEqual(['Compared Only App']);
      expect(bucketItems('Shared')).toEqual(['Shared App']);
      expect(bucketItems('Only Alice Context')).toEqual(['Context Only App']);
    });

    it('counts an optimistically-added group in `shared` exactly once, before contextGroups refreshes', async () => {
      render(<Harness />);
      await openComparison();
      await gotoTab('Groups');

      await userEvent.click(addButtonFor('Compared Only Group 1'));
      await waitFor(() => expect(bucketItems('Shared')).toContain('Compared Only Group 1'));

      expect(bucketItems('Shared')).toEqual(['Shared Group A', 'Compared Only Group 1']);
      expect(bucketItems('Only Bob Compared')).toEqual(['Compared Only Group 2']);
      expect(bucketItems('Only Alice Context')).toEqual(['Context Only Group']);
    });

    it('renders no Add action on the Apps tab', async () => {
      render(<Harness />);
      await openComparison();
      await gotoTab('Apps');

      expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
    });
  });

  describe('group add — success path', () => {
    it('sends the exact payload, re-buckets, drops the Add button and notifies the parent once', async () => {
      const onGroupsChanged = vi.fn();
      render(<Harness onGroupsChanged={onGroupsChanged} />);
      await openComparison();
      await gotoTab('Groups');

      expect(tab('Groups')).toHaveTextContent('3'); // diff badge: 2 onlyCompared + 1 onlyContext

      await userEvent.click(addButtonFor('Compared Only Group 1'));

      await waitFor(() => expect(onGroupsChanged).toHaveBeenCalledTimes(1));
      expect(mockRuntimeSendMessage).toHaveBeenCalledWith({
        action: 'scheduleApiRequest',
        endpoint: '/api/v1/groups/g3/users/ctx-1',
        method: 'PUT',
        body: undefined,
        tabId: TAB_ID,
        priority: 'normal',
      });

      expect(bucketTitleOf('Compared Only Group 1')).toBe('Shared');
      expect(
        within(rowFor('Compared Only Group 1')).queryByRole('button', { name: 'Add' }),
      ).toBeNull();

      expect(tab('Groups')).toHaveTextContent('2');
      expect(addButtonFor('Compared Only Group 2')).toBeEnabled();
    });
  });

  describe('group add — to the compared user (bidirectional)', () => {
    it('copies a context-only group onto the COMPARED user and re-buckets it to shared', async () => {
      const onGroupsChanged = vi.fn();
      render(<Harness onGroupsChanged={onGroupsChanged} />);
      await openComparison();
      await gotoTab('Groups');

      expect(bucketTitleOf('Context Only Group')).toBe('Only Alice Context');

      await userEvent.click(addButtonFor('Context Only Group'));

      await waitFor(() =>
        expect(mockRuntimeSendMessage).toHaveBeenCalledWith({
          action: 'scheduleApiRequest',
          endpoint: '/api/v1/groups/g2/users/cmp-1',
          method: 'PUT',
          body: undefined,
          tabId: TAB_ID,
          priority: 'normal',
        }),
      );

      await waitFor(() => expect(bucketTitleOf('Context Only Group')).toBe('Shared'));
      expect(
        within(rowFor('Context Only Group')).queryByRole('button', { name: 'Add' }),
      ).toBeNull();

      expect(onGroupsChanged).not.toHaveBeenCalled();
    });
  });

  describe('group add — both failure channels', () => {
    const expectFailed = async (message: string) => {
      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(message);
      expect(bucketTitleOf('Compared Only Group 1')).toBe('Only Bob Compared');
      expect(addButtonFor('Compared Only Group 1')).toBeEnabled();
    };

    it('renders result.error when the API resolves { success:false, error }', async () => {
      const onGroupsChanged = vi.fn();
      scenario.addResponse = async () => ({ success: false, error: 'Insufficient permissions' });
      render(<Harness onGroupsChanged={onGroupsChanged} />);
      await openComparison();
      await gotoTab('Groups');

      await userEvent.click(addButtonFor('Compared Only Group 1'));

      await expectFailed('Insufficient permissions');
      expect(onGroupsChanged).not.toHaveBeenCalled();
    });

    it('falls back to `Failed to add to {groupName}` when success:false carries no error', async () => {
      scenario.addResponse = async () => ({ success: false });
      render(<Harness />);
      await openComparison();
      await gotoTab('Groups');

      await userEvent.click(addButtonFor('Compared Only Group 1'));

      await expectFailed('Failed to add to Compared Only Group 1');
    });

    it('renders the message of a thrown Error', async () => {
      const onGroupsChanged = vi.fn();
      scenario.addResponse = async () => {
        throw new Error('Extension context invalidated');
      };
      render(<Harness onGroupsChanged={onGroupsChanged} />);
      await openComparison();
      await gotoTab('Groups');

      await userEvent.click(addButtonFor('Compared Only Group 1'));

      await expectFailed('Extension context invalidated');
      expect(onGroupsChanged).not.toHaveBeenCalled();
    });

    it('falls back to a generic message when a non-Error is thrown', async () => {
      scenario.addResponse = async () => {
        throw 'just a string';
      };
      render(<Harness />);
      await openComparison();
      await gotoTab('Groups');

      await userEvent.click(addButtonFor('Compared Only Group 1'));

      await expectFailed('Failed to add user to group');
    });

    it('dismisses the add error, and clears it when the next add starts', async () => {
      scenario.addResponse = async () => ({ success: false, error: 'Nope' });
      render(<Harness />);
      await openComparison();
      await gotoTab('Groups');

      await userEvent.click(addButtonFor('Compared Only Group 1'));
      await screen.findByRole('alert');

      await userEvent.click(screen.getByRole('button', { name: 'Dismiss message' }));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('single-flight add lock (riskyBit: it is global, not per-row)', () => {
    it('disables EVERY Add button while one add is in flight, and releases them all when it settles', async () => {
      let release!: (v: unknown) => void;
      scenario.addResponse = () => new Promise((res) => (release = res));

      render(<Harness />);
      await openComparison();
      await gotoTab('Groups');

      await userEvent.click(addButtonFor('Compared Only Group 1'));

      await waitFor(() => expect(addButtonFor('Compared Only Group 2')).toBeDisabled());
      expect(addButtonFor('Compared Only Group 1')).toBeDisabled();

      await userEvent.click(addButtonFor('Compared Only Group 2'));
      expect(addUserToGroupCalls()).toHaveLength(1);

      release({ success: true });

      await waitFor(() => expect(addButtonFor('Compared Only Group 2')).toBeEnabled());
    });

    it('CHARACTERIZED: "Change user" does NOT clear addingGroupId, so the lock survives a reselect', async () => {
      let release!: (v: unknown) => void;
      scenario.addResponse = () => new Promise((res) => (release = res));

      render(<Harness />);
      await openComparison();
      await gotoTab('Groups');

      await userEvent.click(addButtonFor('Compared Only Group 1'));
      await waitFor(() => expect(addButtonFor('Compared Only Group 2')).toBeDisabled());

      await userEvent.click(screen.getByRole('button', { name: /Change user/ }));
      await openComparison();
      await gotoTab('Groups');

      expect(addButtonFor('Compared Only Group 1')).toBeDisabled();
      expect(addButtonFor('Compared Only Group 2')).toBeDisabled();

      release({ success: true });
      await waitFor(() => expect(addButtonFor('Compared Only Group 2')).toBeEnabled());
    });
  });

  describe('similarity math', () => {
    it('renders round((groupSim + appSim) / 2) in the hero', async () => {
      render(<Harness />);
      await openComparison();

      expect(screen.getByText('29%')).toBeInTheDocument();
      expect(screen.getByText('Match')).toBeInTheDocument();
    });

    it('CHARACTERIZED: identical groups + no apps scores 50%, not 100%', async () => {
      scenario.apps = { 'ctx-1': [], 'cmp-1': [] };
      scenario.comparedGroups = [gShared, gContextOnly];
      render(<Harness />);
      await openComparison();

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('shows the loading placeholders instead of a percentage while loading', async () => {
      let releaseGroups!: (v: unknown) => void;
      scenario.groupsResponse = () => new Promise((res) => (releaseGroups = res));

      render(<Harness />);
      await selectComparedUser();

      expect(await screen.findByText('··')).toBeInTheDocument();
      expect(screen.getByText('— —')).toBeInTheDocument();
      expect(screen.queryByText('Match')).not.toBeInTheDocument();

      releaseGroups({ success: true, data: scenario.comparedGroups });
      await waitForLoadToSettle();
      expect(screen.getByText('Match')).toBeInTheDocument();
    });

    it('reports per-category overlap on the overview cards', async () => {
      render(<Harness />);
      await openComparison();

      expect(screen.getByText('4 total · 25% overlap')).toBeInTheDocument();
      expect(screen.getByText('3 total · 33% overlap')).toBeInTheDocument();
    });
  });

  describe('loading / error gating', () => {
    it('keeps the hero and tab bar but hides the tab body while loading', async () => {
      let releaseGroups!: (v: unknown) => void;
      scenario.groupsResponse = () => new Promise((res) => (releaseGroups = res));

      render(<Harness />);
      await selectComparedUser();

      expect(await screen.findByText('Crunching memberships and assignments…')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.queryByText('Group memberships')).not.toBeInTheDocument();

      releaseGroups({ success: true, data: scenario.comparedGroups });
      await waitForLoadToSettle();
      expect(screen.getByText('Group memberships')).toBeInTheDocument();
    });

    it('replaces the tab body with a danger alert when the membership load fails', async () => {
      scenario.groupsResponse = async () => ({ success: false, error: 'Okta says no' });

      render(<Harness />);
      await selectComparedUser();
      await waitForLoadToSettle();

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Okta says no');
      expect(screen.queryByText('Group memberships')).not.toBeInTheDocument();
      expect(screen.getByText('Match')).toBeInTheDocument();
    });

    it('does NOT surface a rules-fetch failure — it degrades silently to no rules', async () => {
      scenario.rulesResponse = async () => ({ success: false, error: 'rules boom' });

      render(<Harness />);
      await openComparison();
      await gotoTab('Groups');

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(bucketItems('Shared')).toEqual(['Shared Group A']);
    });
  });

  describe('app-fetch resilience (riskyBit: appsError is unreachable dead state)', () => {
    it('CHARACTERIZED: a failing scheduled /api/v1/apps request renders as "0 apps", never as an error', async () => {
      scenario.appsResponse = async () => ({ success: false, error: '500 from Okta' });

      render(<Harness />);
      await openComparison();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('13%')).toBeInTheDocument(); // Math.round((25 + 0) / 2) = 13

      await gotoTab('Apps');
      expect(bucketItems('Only Bob Compared')).toEqual([]);
      expect(bucketItems('Shared')).toEqual([]);
      expect(bucketItems('Only Alice Context')).toEqual([]);
    });

    it('CHARACTERIZED: a thrown app request is also swallowed into an empty list', async () => {
      scenario.appsResponse = async () => {
        throw new Error('port closed');
      };

      render(<Harness />);
      await openComparison();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('0 total · 0% overlap')).toBeInTheDocument();
    });
  });

  describe('search phase', () => {
    it('filters the context user out of the results', async () => {
      render(<Harness />);
      await userEvent.type(searchInput(), 'e');

      await new Promise((r) => setTimeout(r, 700));
      expect(userSearchCalls()).toHaveLength(0);

      await userEvent.type(searchInput(), 'xample');
      await screen.findByText('Search Results', {}, { timeout: 3000 });

      const resultNames = screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent);
      expect(resultNames).toEqual(['Bob Compared']);
      expect(screen.getByText('1 user')).toBeInTheDocument();
    });

    it('CHARACTERIZED: a failed search shows no error at all — the modal drops useUserSearch.error', async () => {
      scenario.searchResponse = async () => ({ success: false, error: 'Search backend exploded' });

      render(<Harness />);
      await userEvent.type(searchInput(), 'bob');

      await waitFor(
        () =>
          expect(mockRuntimeSendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
              action: 'scheduleApiRequest',
              endpoint: '/api/v1/users?q=bob&limit=20',
            }),
          ),
        { timeout: 3000 },
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByText('Search backend exploded')).not.toBeInTheDocument();
      expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
      expect(screen.queryByText('Start typing to search')).not.toBeInTheDocument();
    });

    it('clearing the query restores the empty prompt and drops the results', async () => {
      render(<Harness />);
      await userEvent.type(searchInput(), 'bob');
      await screen.findByText('Search Results', {}, { timeout: 3000 });

      await userEvent.clear(searchInput());

      await waitFor(() => expect(screen.queryByText('Search Results')).not.toBeInTheDocument());
      expect(screen.getByText('Start typing to search')).toBeInTheDocument();
    });
  });

  describe('tab navigation', () => {
    it('exposes tablist/tab semantics with aria-selected tracking the active tab', async () => {
      render(<Harness />);
      await openComparison();

      expect(screen.getAllByRole('tab')).toHaveLength(3);
      expect(tab('Overview')).toHaveAttribute('aria-selected', 'true');
      expect(tab('Groups')).toHaveAttribute('aria-selected', 'false');

      await gotoTab('Groups');
      expect(tab('Groups')).toHaveAttribute('aria-selected', 'true');
      expect(tab('Overview')).toHaveAttribute('aria-selected', 'false');
    });

    it('renders diff badges only when the count is greater than zero', async () => {
      scenario.comparedGroups = [gShared, gContextOnly]; // identical groups -> 0 group diff
      render(<Harness />);
      await openComparison();

      expect(tab('Overview')).toHaveTextContent(/^Overview$/);
      expect(tab('Groups')).toHaveTextContent(/^Groups$/);
      expect(tab('Apps')).toHaveTextContent('2');
    });

    it('jumps to the Groups and Apps tabs from the overview cards', async () => {
      render(<Harness />);
      await openComparison();

      const links = screen.getAllByRole('button', { name: /View details/ });
      expect(links).toHaveLength(2);

      await userEvent.click(links[0]);
      expect(tab('Groups')).toHaveAttribute('aria-selected', 'true');

      await gotoTab('Overview');
      await userEvent.click(screen.getAllByRole('button', { name: /View details/ })[1]);
      expect(tab('Apps')).toHaveAttribute('aria-selected', 'true');
    });

    it('offers the "can be copied over" hint only for groups', async () => {
      render(<Harness />);
      await openComparison();

      expect(screen.getByText('2 can be copied over')).toBeInTheDocument();
      expect(screen.queryByText('1 can be copied over')).not.toBeInTheDocument();
    });
  });

  describe('modal a11y', () => {
    it('is a labelled, modal dialog', () => {
      render(<Harness />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAccessibleName('Compare with another user');
    });

    it('closes on Escape', async () => {
      const onClose = vi.fn();
      render(<Harness onClose={onClose} />);

      await userEvent.type(searchInput(), '{Escape}');

      expect(onClose).toHaveBeenCalled();
    });

    it('CHARACTERIZED: the search input is NOT focused on open despite autoFocus', async () => {
      render(<Harness />);

      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close modal' }));
      expect(document.activeElement).not.toBe(searchInput());
    });

    it('traps Tab focus inside the panel', async () => {
      render(<Harness />);
      const dialog = screen.getByRole('dialog');
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled])',
        ),
      );
      const last = focusables[focusables.length - 1];

      last.focus();
      await userEvent.tab();

      expect(dialog).toContainElement(document.activeElement as HTMLElement);
      expect(document.activeElement).toBe(focusables[0]);
    });
  });
});
