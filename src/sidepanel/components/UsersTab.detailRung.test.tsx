import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersTab from './UsersTab';
import { membershipSourceLine, sourceLineLabel } from '../../shared/membership/sourceLine';
import type { GroupMembership, OktaGroup, OktaUser } from '../../shared/types';

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

const schedulerEndpoints = (): string[] =>
  runtimeSendMessage.mock.calls.map((c) => c[0].endpoint).filter(Boolean);

const proofCalls = () =>
  schedulerEndpoints().filter((e) =>
    /^\/api\/v1\/groups\/[^/]+\/users\/[^/]+\/group-rules$/.test(e),
  );

const lifecycleCalls = () => schedulerEndpoints().filter((e) => e.includes('/lifecycle/'));

const ADA_ID = '00uFAKEada000001';

const ada = (over: Record<string, any> = {}): Record<string, any> => {
  const { profile, ...rest } = over;
  return {
    id: ADA_ID,
    status: 'ACTIVE',
    created: '2020-01-01T00:00:00.000Z',
    lastLogin: '2024-01-01T00:00:00.000Z',
    ...rest,
    profile: {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      login: 'ada@example.com',
      department: 'Engineering',
      ...(profile ?? {}),
    },
  };
};

const gRuleFed: OktaGroup = {
  id: '00gFAKEgroup0001',
  type: 'OKTA_GROUP',
  profile: { name: 'Engineering Staff', description: 'Eng team' },
};
const gDirect: OktaGroup = {
  id: '00gFAKEgroup0002',
  type: 'OKTA_GROUP',
  profile: { name: 'Ops Handbook' },
};
const gAppMastered: OktaGroup = {
  id: '00gFAKEgroup0003',
  type: 'APP_GROUP',
  profile: { name: 'Salesforce Users' },
};

const RULE = {
  id: '0prFAKErule00001',
  name: 'Engineering auto-assign',
  status: 'ACTIVE' as const,
  groupIds: [gRuleFed.id],
  conditions: {
    expression: { value: 'user.department == "Engineering"', type: 'urn:okta:expression:1.0' },
  },
};

const RAW_RULE = {
  id: RULE.id,
  name: RULE.name,
  status: RULE.status,
  type: 'group_rule',
  created: '2026-01-01T00:00:00.000Z',
  lastUpdated: '2026-01-01T00:00:00.000Z',
  conditions: RULE.conditions,
  actions: { assignUserToGroups: { groupIds: [gRuleFed.id] } },
};

const classified = (group: OktaGroup, over: Partial<GroupMembership> = {}): GroupMembership => ({
  group,
  membershipType: 'DIRECT',
  rules: [],
  attribution: 'exact',
  ...over,
});

const detail = () => within(screen.getByTestId('user-detail-view'));

async function loadDetectedUser(uev: ReturnType<typeof userEvent.setup>) {
  await uev.click(screen.getByRole('button', { name: 'Load' }));
  await screen.findByRole('heading', { level: 1, name: 'Ada Lovelace' });
}

function rowFor(groupName: string): HTMLElement {
  const scope = screen.getByTestId('user-detail-view');
  const headings = () => within(scope).getAllByRole('heading', { level: 4 });
  expect(headings().length).toBeGreaterThan(1); // otherwise the walk cannot terminate
  let el: HTMLElement = within(scope).getByRole('heading', { level: 4, name: groupName });
  while (
    el.parentElement &&
    el.parentElement !== scope &&
    within(el.parentElement).getAllByRole('heading', { level: 4 }).length === 1
  ) {
    el = el.parentElement;
  }
  return el;
}

function sourceSentence(caption: string): string {
  const captionEl = detail().getByText(caption);
  return (captionEl.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

beforeEach(() => {
  vi.clearAllMocks();
  routes = [];
  userContext.current = {
    userInfo: { userId: ADA_ID, userName: 'Ada Lovelace', userStatus: 'ACTIVE' },
    isLoading: false,
    oktaOrigin: null,
  };

  route(/^\/api\/v1\/users\?/, () => ({ success: true, data: [] }));
  route(new RegExp(`^/api/v1/users/${ADA_ID}$`), () => ({ success: true, data: ada() }));
  route(new RegExp(`^/api/v1/users/${ADA_ID}/groups`), () => ({ success: true, data: [] }));
  route(/^\/api\/v1\/groups\/rules/, () => ({ success: true, data: [RAW_RULE] }));
  route(/^\/api\/v1\/apps/, () => ({ success: true, data: [], headers: {} }));

  runtimeSendMessage.mockImplementation(async (msg: any) => {
    if (msg.action !== 'scheduleApiRequest') return { success: false };
    for (let i = routes.length - 1; i >= 0; i--) {
      const [pattern, respond] = routes[i];
      if (pattern.test(msg.endpoint)) return respond(msg);
    }
    return { success: false, error: `unrouted endpoint: ${msg.endpoint}` };
  });
});

describe('detail rung: memberships render with their source line', () => {
  it('words a rule-attributed, a direct and an app-mastered membership as `membershipSourceLine` does', async () => {
    const uev = userEvent.setup();
    route(new RegExp(`^/api/v1/users/${ADA_ID}/groups`), () => ({
      success: true,
      data: [gRuleFed, gDirect, gAppMastered],
    }));

    render(<UsersTab targetTabId={1} />);
    await loadDetectedUser(uev);
    await detail().findByRole('heading', { level: 4, name: 'Engineering Staff' });

    const ruleFed = membershipSourceLine(
      classified(gRuleFed, { membershipType: 'RULE_BASED', rules: [RULE] }),
    );
    const direct = membershipSourceLine(classified(gDirect));
    const appMastered = membershipSourceLine(
      classified(gAppMastered, { membershipType: 'RULE_BASED' }),
    );

    expect(sourceSentence(ruleFed.caption)).toBe(sourceLineLabel(ruleFed));
    expect(sourceSentence(direct.caption)).toBe(sourceLineLabel(direct));
    expect(sourceSentence(appMastered.caption)).toBe(sourceLineLabel(appMastered));

    expect(within(rowFor('Engineering Staff')).getByText(ruleFed.caption)).toBeInTheDocument();
    expect(within(rowFor('Ops Handbook')).getByText(direct.caption)).toBeInTheDocument();
    expect(within(rowFor('Salesforce Users')).getByText(appMastered.caption)).toBeInTheDocument();
  });

  it('says an UNKNOWN membership was never classified rather than showing nothing', async () => {
    const uev = userEvent.setup();
    route(/^\/api\/v1\/groups\/rules/, () => ({ success: false, error: 'rules unavailable' }));
    route(new RegExp(`^/api/v1/users/${ADA_ID}/groups`), () => ({
      success: true,
      data: [gRuleFed],
    }));

    render(<UsersTab targetTabId={1} />);
    await loadDetectedUser(uev);
    await detail().findByRole('heading', { level: 4, name: 'Engineering Staff' });

    const unknown = membershipSourceLine(
      classified(gRuleFed, { membershipType: 'UNKNOWN', attribution: 'ambiguous' }),
    );
    expect(sourceSentence(unknown.caption)).toBe(sourceLineLabel(unknown));
    expect(screen.queryByText('rules unavailable')).not.toBeInTheDocument();
    expect(detail().queryByText('Added directly')).not.toBeInTheDocument();
  });
});

describe('detail rung: lifecycle verbs are gated by status', () => {
  const ALL_VERBS = ['Suspend user', 'Unsuspend user', 'Reset password'] as const;

  const offeredVerbs = () =>
    ALL_VERBS.filter((name) => detail().queryByRole('button', { name }) !== null);

  async function openManageBand(uev: ReturnType<typeof userEvent.setup>) {
    await uev.click(detail().getByRole('button', { name: 'More' }));
  }

  async function renderWithStatus(
    uev: ReturnType<typeof userEvent.setup>,
    status: OktaUser['status'],
  ) {
    userContext.current = {
      userInfo: { userId: ADA_ID, userName: 'Ada Lovelace', userStatus: status },
      isLoading: false,
      oktaOrigin: null,
    };
    route(new RegExp(`^/api/v1/users/${ADA_ID}$`), () => ({
      success: true,
      data: ada({ status }),
    }));
    render(<UsersTab targetTabId={1} />);
    await loadDetectedUser(uev);
    await openManageBand(uev);
  }

  it('offers suspend and reset-password — and not unsuspend — for an ACTIVE user', async () => {
    const uev = userEvent.setup();
    await renderWithStatus(uev, 'ACTIVE');

    expect(offeredVerbs()).toEqual(['Suspend user', 'Reset password']);
  });

  it('offers unsuspend only for a SUSPENDED user', async () => {
    const uev = userEvent.setup();
    await renderWithStatus(uev, 'SUSPENDED');

    expect(offeredVerbs()).toEqual(['Unsuspend user']);
  });

  it('offers nothing for a DEPROVISIONED user, and says so instead of rendering an empty card', async () => {
    const uev = userEvent.setup();
    await renderWithStatus(uev, 'DEPROVISIONED');

    expect(offeredVerbs()).toEqual([]);
    expect(
      detail().getByText('No lifecycle actions are available for deprovisioned users.'),
    ).toBeInTheDocument();
  });

  it.each([
    {
      status: 'ACTIVE' as const,
      verb: 'Suspend user',
      dialogTitle: 'Suspend User',
      confirm: 'Suspend',
      endpoint: `/api/v1/users/${ADA_ID}/lifecycle/suspend`,
    },
    {
      status: 'ACTIVE' as const,
      verb: 'Reset password',
      dialogTitle: 'Reset Password',
      confirm: 'Send Reset Email',
      endpoint: `/api/v1/users/${ADA_ID}/lifecycle/reset_password?sendEmail=true`,
    },
    {
      status: 'SUSPENDED' as const,
      verb: 'Unsuspend user',
      dialogTitle: 'Unsuspend User',
      confirm: 'Unsuspend',
      endpoint: `/api/v1/users/${ADA_ID}/lifecycle/unsuspend`,
    },
  ])('confirms before acting: $verb', async ({ status, verb, dialogTitle, confirm, endpoint }) => {
    const uev = userEvent.setup();
    route(/\/lifecycle\//, () => ({ success: true }));
    await renderWithStatus(uev, status);

    await uev.click(detail().getByRole('button', { name: verb }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: dialogTitle })).toBeInTheDocument();
    expect(lifecycleCalls()).toEqual([]);

    await uev.click(within(dialog).getByRole('button', { name: confirm }));

    await waitFor(() => expect(lifecycleCalls()).toEqual([endpoint]));
  });

  it('cancelling the confirm dialog issues nothing at all', async () => {
    const uev = userEvent.setup();
    route(/\/lifecycle\//, () => ({ success: true }));
    await renderWithStatus(uev, 'ACTIVE');

    await uev.click(detail().getByRole('button', { name: 'Suspend user' }));
    await uev.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(lifecycleCalls()).toEqual([]);
    expect(offeredVerbs()).toEqual(['Suspend user', 'Reset password']);
  });
});

describe('detail rung: proving one membership costs exactly one request', () => {
  const proofEndpoint = (group: OktaGroup) =>
    `/api/v1/groups/${group.id}/users/${ADA_ID}/group-rules`;

  async function openRow(uev: ReturnType<typeof userEvent.setup>, groupName: string) {
    await uev.click(
      within(rowFor(groupName)).getByRole('button', {
        name: `Show how ${groupName} was granted`,
      }),
    );
  }

  const proofAction = (groupName: string) =>
    within(rowFor(groupName)).getByRole('button', { name: 'Ask Okta' });

  async function renderWithTwoGroups(uev: ReturnType<typeof userEvent.setup>) {
    route(new RegExp(`^/api/v1/users/${ADA_ID}/groups`), () => ({
      success: true,
      data: [gRuleFed, gDirect],
    }));
    render(<UsersTab targetTabId={1} />);
    await loadDetectedUser(uev);
    await detail().findByRole('heading', { level: 4, name: 'Engineering Staff' });
  }

  it('asks nothing on mount, then exactly once for the row that was pressed', async () => {
    const uev = userEvent.setup();
    route(/\/group-rules$/, () => ({ success: true, data: [] }));
    await renderWithTwoGroups(uev);

    expect(proofCalls()).toEqual([]);

    await openRow(uev, 'Engineering Staff');
    await openRow(uev, 'Ops Handbook');

    expect(proofCalls()).toEqual([]);
    expect(detail().getAllByRole('button', { name: 'Ask Okta' })).toHaveLength(2);

    await uev.click(proofAction('Engineering Staff'));

    await waitFor(() => expect(proofCalls()).toEqual([proofEndpoint(gRuleFed)]));

    await uev.click(proofAction('Ops Handbook'));

    await waitFor(() =>
      expect(proofCalls()).toEqual([proofEndpoint(gRuleFed), proofEndpoint(gDirect)]),
    );
  });

  it("replaces that one row's deduction with Okta's answer, and leaves every other row hedged", async () => {
    const uev = userEvent.setup();
    route(/\/group-rules$/, () => ({
      success: true,
      data: [{ id: RULE.id, name: RULE.name }],
    }));
    await renderWithTwoGroups(uev);

    const deduced = membershipSourceLine(
      classified(gRuleFed, { membershipType: 'RULE_BASED', rules: [RULE] }),
    );
    const proven = membershipSourceLine(
      classified(gRuleFed, {
        membershipType: 'RULE_BASED',
        rules: [RULE],
        provenance: { source: 'okta', rules: [{ id: RULE.id, name: RULE.name }] },
      }),
    );
    const otherRow = membershipSourceLine(classified(gDirect));

    await openRow(uev, 'Engineering Staff');
    await uev.click(proofAction('Engineering Staff'));

    expect(await detail().findByText(sourceLineLabel(proven))).toBeInTheDocument();
    expect(sourceSentence(deduced.caption)).toBe(sourceLineLabel(deduced));
    expect(sourceSentence(otherRow.caption)).toBe(sourceLineLabel(otherRow));
    await openRow(uev, 'Ops Handbook');
    expect(proofAction('Ops Handbook')).toBeInTheDocument();
  });

  it('reports a failed proof as no answer rather than as an answer', async () => {
    const uev = userEvent.setup();
    route(/\/group-rules$/, () => ({ success: false, error: 'nope' }));
    await renderWithTwoGroups(uev);

    await openRow(uev, 'Engineering Staff');
    await uev.click(proofAction('Engineering Staff'));

    expect(
      await detail().findByText(/Okta did not answer for this membership/),
    ).toBeInTheDocument();
    expect(proofCalls()).toEqual([proofEndpoint(gRuleFed)]);
    expect(detail().queryByText(/^Okta confirms/)).not.toBeInTheDocument();
    expect(screen.queryByText('nope')).not.toBeInTheDocument();
  });
});

describe('detail rung: profile attributes are reachable and filterable', () => {
  async function openAttributeSurface(uev: ReturnType<typeof userEvent.setup>) {
    await uev.click(detail().getByRole('tab', { name: /^Profile/ }));
    return detail().getByLabelText('Filter attributes');
  }

  async function renderWithProfile(uev: ReturnType<typeof userEvent.setup>) {
    route(new RegExp(`^/api/v1/users/${ADA_ID}$`), () => ({
      success: true,
      data: ada({ profile: { title: 'Countess of Lovelace' } }),
    }));
    render(<UsersTab targetTabId={1} />);
    await loadDetectedUser(uev);
  }

  it('exposes a named attribute and its value', async () => {
    const uev = userEvent.setup();
    await renderWithProfile(uev);
    await openAttributeSurface(uev);

    expect(detail().getByText('Title')).toBeInTheDocument();
    expect(detail().getByText('Countess of Lovelace')).toBeInTheDocument();
    expect(detail().getByText('Login')).toBeInTheDocument();
  });

  it('narrows the attribute list to a subset when filtered', async () => {
    const uev = userEvent.setup();
    await renderWithProfile(uev);
    const filter = await openAttributeSurface(uev);

    await uev.type(filter, 'countess');

    expect(detail().getByText('Title')).toBeInTheDocument();
    expect(detail().getByText('Countess of Lovelace')).toBeInTheDocument();
    expect(detail().queryByText('Login')).not.toBeInTheDocument();

    await uev.clear(filter);
    await uev.type(filter, 'no-such-attribute');

    expect(detail().getByText('No attributes match')).toBeInTheDocument();
    expect(detail().queryByText('Title')).not.toBeInTheDocument();
  });
});
