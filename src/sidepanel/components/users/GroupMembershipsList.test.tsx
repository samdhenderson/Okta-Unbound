import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupMembershipsList from './GroupMembershipsList';
import { selectionStore } from '../../selection/selectionStore';
import type { MemberRuleAttribution } from '../../../shared/membership/memberRuleAttribution';
import type { GroupMembership, OktaUser } from '../../../shared/types';

beforeEach(() => {
  selectionStore.clearAll();
});

const user: OktaUser = {
  id: '00uFAKE1',
  status: 'ACTIVE',
  profile: {
    login: 'ada@example.com',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
    title: 'Intern',
  },
};

const formattedRuleMembership: GroupMembership = {
  group: {
    id: '00gFAKE1',
    type: 'OKTA_GROUP',
    profile: { name: 'Engineering' },
  },
  membershipType: 'RULE_BASED',
  attribution: 'exact',
  rules: [
    {
      id: '0prFAKE1',
      name: 'Auto-add Engineers',
      status: 'ACTIVE',
      conditionExpression: 'user.department == "Engineering"',
    },
  ],
};

const base = { memberships: [formattedRuleMembership], isLoading: false };

const openRow = (groupName: string) =>
  userEvent.click(screen.getByRole('button', { name: `Show how ${groupName} was granted` }));

const clauseSentences = (): string[] =>
  Array.from(document.querySelectorAll('b')).map((bold) =>
    (bold.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim(),
  );

const readsSection = (): HTMLElement => {
  const section = screen.getByText('Reads').parentElement;
  if (!section) throw new Error('no Reads section rendered');
  return section;
};

const rowFor = (groupId: string): HTMLElement => {
  const row = document.querySelector<HTMLElement>(`[data-group-id="${groupId}"]`);
  if (!row) throw new Error(`no row rendered for group ${groupId}`);
  return row;
};

describe('GroupMembershipsList', () => {
  it('renders the condition of a rule that only carries `conditionExpression`', async () => {
    render(<GroupMembershipsList {...base} user={user} />);
    await openRow('Engineering');

    expect(clauseSentences()).toContain('department equals "Engineering"');
    expect(screen.getByText('Pass')).toBeInTheDocument();
  });

  it('names the profile attributes a condition reads, from the parsed condition', async () => {
    render(<GroupMembershipsList {...base} user={user} />);
    await openRow('Engineering');

    expect(screen.getByText('Reads')).toBeInTheDocument();
    expect(within(readsSection()).getByText('department')).toBeInTheDocument();
  });

  it('reads an attribute named inside a string literal as text, not as an attribute', async () => {
    render(
      <GroupMembershipsList
        {...base}
        user={user}
        memberships={[
          {
            ...formattedRuleMembership,
            rules: [
              {
                ...formattedRuleMembership.rules[0],
                conditionExpression: 'user.department == "user.title"',
              },
            ],
          },
        ]}
      />,
    );
    await openRow('Engineering');

    expect(within(readsSection()).getByText('department')).toBeInTheDocument();
    expect(within(readsSection()).queryByText('title')).not.toBeInTheDocument();
    expect(clauseSentences()).toContain('department equals "user.title"');
  });

  it('explains an unevaluable condition neutrally rather than as a failure', async () => {
    render(
      <GroupMembershipsList
        {...base}
        user={user}
        memberships={[
          {
            ...formattedRuleMembership,
            rules: [
              {
                ...formattedRuleMembership.rules[0],
                conditionExpression: 'isMemberOfGroupNameRegex("(?=Eng)Eng.*")',
              },
            ],
          },
        ]}
      />,
    );
    await openRow('Engineering');

    expect(screen.getByText('Not evaluated')).toBeInTheDocument();
    expect(screen.queryByText('Fail')).not.toBeInTheDocument();
  });

  it('states the answer on the row and keeps the evidence collapsed until asked', async () => {
    render(<GroupMembershipsList {...base} user={user} />);

    expect(screen.getByText('Added by Rule:')).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'Show how Engineering was granted' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);

    expect(
      screen.getByRole('button', { name: 'Hide how Engineering was granted' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('falls back to the raw condition when no user is supplied to explain it against', async () => {
    render(<GroupMembershipsList {...base} />);
    await openRow('Engineering');

    expect(screen.getByText('user.department == "Engineering"')).toBeInTheDocument();
    expect(screen.queryByText('Pass')).not.toBeInTheDocument();
  });

  it('still reads a raw Okta rule shape, which nests the expression under `conditions`', async () => {
    render(
      <GroupMembershipsList
        {...base}
        user={user}
        memberships={[
          {
            ...formattedRuleMembership,
            rules: [
              {
                id: '0prFAKE1',
                name: 'Auto-add Engineers',
                status: 'ACTIVE',
                conditions: {
                  expression: { value: 'user.title == "Intern"', type: 'urn:okta:expression:1.0' },
                },
              },
            ],
          },
        ]}
      />,
    );
    await openRow('Engineering');

    expect(clauseSentences()).toContain('title equals "Intern"');
    expect(screen.getByText('Pass')).toBeInTheDocument();
  });

  it('explains every attributed rule, and never captions a guess as the answer', async () => {
    render(
      <GroupMembershipsList
        {...base}
        user={user}
        memberships={[
          {
            ...formattedRuleMembership,
            attribution: 'ambiguous',
            rules: [
              {
                id: '0prFAKE1',
                name: 'Auto-add Engineers',
                status: 'ACTIVE',
                conditionExpression: 'user.department == "Engineering"',
              },
              {
                id: '0prFAKE2',
                name: 'On-call rotation',
                status: 'ACTIVE',
                conditionExpression: 'isMemberOfGroupNameRegex("(?=On-call).*")',
              },
            ],
          },
        ]}
      />,
    );
    await openRow('Engineering');

    expect(screen.getByText('Rule:')).toBeInTheDocument();
    expect(screen.queryByText('Added by Rule:')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Auto-add Engineers, On-call rotation \(2 candidates, unresolved\)/),
    ).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('Not evaluated')).toBeInTheDocument();
  });

  it('says a rule carries no condition instead of implying it matches nothing', async () => {
    render(
      <GroupMembershipsList
        {...base}
        user={user}
        memberships={[
          {
            ...formattedRuleMembership,
            rules: [{ id: '0prFAKE1', name: 'Auto-add Engineers', status: 'ACTIVE' }],
          },
        ]}
      />,
    );
    await openRow('Engineering');

    expect(screen.getByText(/carries no condition expression/)).toBeInTheDocument();
    expect(screen.queryByText('Fail')).not.toBeInTheDocument();
  });
});

describe('GroupMembershipsList — isMemberOf* resolves against the loaded memberships', () => {
  const gatedByPeerGroup: GroupMembership = {
    ...formattedRuleMembership,
    rules: [
      {
        ...formattedRuleMembership.rules[0],
        conditionExpression: 'isMemberOfAnyGroup("00gFAKE2")',
      },
    ],
  };

  const peerGroup: GroupMembership = {
    group: { id: '00gFAKE2', type: 'OKTA_GROUP', profile: { name: 'Ops Handbook' } },
    membershipType: 'DIRECT',
    rules: [],
    attribution: 'exact',
  };

  const renderPane = (memberships: GroupMembership[]) =>
    render(<GroupMembershipsList {...base} user={user} memberships={memberships} />);

  it('resolves a clause about a group the user is in, instead of declining to answer', async () => {
    renderPane([gatedByPeerGroup, peerGroup]);
    await openRow('Engineering');

    const row = within(rowFor('00gFAKE1'));
    expect(row.getByText('Pass')).toBeInTheDocument();
    expect(row.getByText('Rule matches this user')).toBeInTheDocument();
    expect(row.queryByText('Cannot be determined')).not.toBeInTheDocument();
    expect(row.queryByText('Not evaluated')).not.toBeInTheDocument();
  });

  it('reports a group the user is genuinely not in as a fail, not as unknown', async () => {
    renderPane([
      {
        ...formattedRuleMembership,
        rules: [
          {
            ...formattedRuleMembership.rules[0],
            conditionExpression: 'isMemberOfAnyGroup("00gFAKEabsent")',
          },
        ],
      },
      peerGroup,
    ]);
    await openRow('Engineering');

    const row = within(rowFor('00gFAKE1'));
    expect(row.getByText('Fail')).toBeInTheDocument();
    expect(row.getByText('Rule does not match')).toBeInTheDocument();
  });

  it('does not narrow the context when a filter hides the group a clause asks about', async () => {
    renderPane([gatedByPeerGroup, peerGroup]);

    await userEvent.type(screen.getByLabelText('Filter group memberships'), 'engineering');
    expect(screen.queryByRole('heading', { name: 'Ops Handbook' })).not.toBeInTheDocument();

    await openRow('Engineering');

    expect(within(rowFor('00gFAKE1')).getByText('Pass')).toBeInTheDocument();
  });

  it('does not narrow the context when a bucket pill hides that group', async () => {
    renderPane([gatedByPeerGroup, peerGroup]);

    await userEvent.click(screen.getByRole('button', { name: 'Rule' }));
    expect(screen.queryByRole('heading', { name: 'Ops Handbook' })).not.toBeInTheDocument();

    await openRow('Engineering');

    expect(within(rowFor('00gFAKE1')).getByText('Pass')).toBeInTheDocument();
  });

  it('still declines a clause no group list could answer', async () => {
    renderPane([
      {
        ...formattedRuleMembership,
        rules: [
          {
            ...formattedRuleMembership.rules[0],
            conditionExpression: 'isMemberOfGroupNameRegex("(?=Ops).*")',
          },
        ],
      },
      peerGroup,
    ]);
    await openRow('Engineering');

    const row = within(rowFor('00gFAKE1'));
    expect(row.getByText('Not evaluated')).toBeInTheDocument();
    expect(row.getByText('Cannot be determined')).toBeInTheDocument();
    expect(row.queryByText('Fail')).not.toBeInTheDocument();
  });
});

describe('GroupMembershipsList — the row says one thing about provenance', () => {
  it('wears one verdict badge for the membership', () => {
    render(<GroupMembershipsList {...base} user={user} />);

    expect(within(rowFor('00gFAKE1')).getByText('Rule')).toBeInTheDocument();
  });

  it('never shows the raw membership enum or a second group-type badge', () => {
    render(
      <GroupMembershipsList
        {...base}
        user={user}
        memberships={[
          {
            ...formattedRuleMembership,
            group: { id: '00gFAKE9', type: 'APP_GROUP', profile: { name: 'Salesforce Users' } },
            rules: [],
          },
        ]}
      />,
    );

    const row = within(rowFor('00gFAKE9'));
    expect(row.queryByText('RULE BASED')).not.toBeInTheDocument();
    expect(row.queryByText('APP_GROUP')).not.toBeInTheDocument();
    expect(row.getByText('App')).toBeInTheDocument();
  });

  it('marks the group being browsed elsewhere rather than repeating its name', () => {
    render(
      <GroupMembershipsList
        {...base}
        user={user}
        currentGroupId={formattedRuleMembership.group.id}
      />,
    );

    expect(screen.getByText('On page')).toBeInTheDocument();
  });
});

describe('GroupMembershipsList — the pane header', () => {
  const memberships: GroupMembership[] = [
    formattedRuleMembership,
    {
      group: { id: '00gFAKE2', type: 'OKTA_GROUP', profile: { name: 'Ops Handbook' } },
      membershipType: 'DIRECT',
      rules: [],
      attribution: 'exact',
    },
    {
      group: { id: '00gFAKE3', type: 'APP_GROUP', profile: { name: 'Salesforce Users' } },
      membershipType: 'RULE_BASED',
      rules: [],
      attribution: 'exact',
    },
    {
      group: { id: '00gFAKE4', type: 'OKTA_GROUP', profile: { name: 'Finance Readers' } },
      membershipType: 'UNKNOWN',
      rules: [],
      attribution: 'ambiguous',
    },
  ];

  it('names every non-zero bucket, so no membership goes unaccounted for', () => {
    render(<GroupMembershipsList {...base} user={user} memberships={memberships} />);

    expect(
      screen.getByText('1 by rule · 1 direct · 1 app-mastered · 1 unresolved'),
    ).toBeInTheDocument();
  });

  it('omits a bucket with no rows rather than printing a zero', () => {
    render(<GroupMembershipsList {...base} user={user} />);

    expect(screen.getByText('1 by rule')).toBeInTheDocument();
  });

  it('filters on the group name', async () => {
    render(<GroupMembershipsList {...base} user={user} memberships={memberships} />);

    await userEvent.type(screen.getByLabelText('Filter group memberships'), 'ops');

    expect(screen.getByRole('heading', { name: 'Ops Handbook' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Engineering' })).not.toBeInTheDocument();
  });

  it('filters on the rule that granted the membership, not just the group name', async () => {
    render(<GroupMembershipsList {...base} user={user} memberships={memberships} />);

    await userEvent.type(screen.getByLabelText('Filter group memberships'), 'auto-add');

    expect(screen.getByRole('heading', { name: 'Engineering' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ops Handbook' })).not.toBeInTheDocument();
  });

  it('narrows to one source bucket when a pill is pressed', async () => {
    render(<GroupMembershipsList {...base} user={user} memberships={memberships} />);

    await userEvent.click(screen.getByRole('button', { name: 'Direct' }));

    expect(screen.getByRole('heading', { name: 'Ops Handbook' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Engineering' })).not.toBeInTheDocument();
  });

  it('offers the way back when a filter matches nothing', async () => {
    render(<GroupMembershipsList {...base} user={user} memberships={memberships} />);

    await userEvent.type(screen.getByLabelText('Filter group memberships'), 'no-such-group');
    expect(screen.getByText('No memberships match')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByRole('heading', { name: 'Engineering' })).toBeInTheDocument();
  });

  it('says the user is in no groups at all, which is not the same as a filter matching nothing', () => {
    render(<GroupMembershipsList {...base} user={user} memberships={[]} />);

    expect(screen.getByText('This user is not a member of any groups')).toBeInTheDocument();
    expect(screen.queryByText('No memberships match')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Filter group memberships')).not.toBeInTheDocument();
  });

  it('keeps a row open across a filter change', async () => {
    render(<GroupMembershipsList {...base} user={user} memberships={memberships} />);

    await openRow('Engineering');
    await userEvent.type(screen.getByLabelText('Filter group memberships'), 'engineering');

    expect(
      screen.getByRole('button', { name: 'Hide how Engineering was granted' }),
    ).toBeInTheDocument();
  });
});

describe('GroupMembershipsList — memberships with no rule to name', () => {
  const withSource = (over: Partial<GroupMembership>) =>
    render(
      <GroupMembershipsList
        {...base}
        user={user}
        memberships={[{ ...formattedRuleMembership, ...over }]}
      />,
    );

  it('says the source was never determined rather than showing nothing', () => {
    withSource({ membershipType: 'UNKNOWN', rules: [], attribution: 'ambiguous' });

    expect(screen.getByText('Source not determined')).toBeInTheDocument();
  });

  it('never calls an unclassified membership a manual add', () => {
    withSource({ membershipType: 'UNKNOWN', rules: [], attribution: 'ambiguous' });

    expect(screen.queryByText(/added directly/i)).not.toBeInTheDocument();
  });

  it('names an app-mastered group as application-managed', () => {
    withSource({
      group: { id: '00gFAKE9', type: 'APP_GROUP', profile: { name: 'Salesforce Users' } },
      rules: [],
    });

    expect(screen.getByText('Managed by app')).toBeInTheDocument();
  });

  it('admits when a rule-managed membership has no rule attributed to it', () => {
    withSource({ rules: [] });

    expect(screen.getByText('Rule-managed, rule not identified')).toBeInTheDocument();
  });

  it('explains a direct membership in the shared wording', () => {
    withSource({ membershipType: 'DIRECT', rules: [] });

    expect(screen.getByText('Added directly')).toBeInTheDocument();
    expect(screen.queryByTitle(/not every rule condition could be evaluated/i)).toBeNull();
  });

  it('discloses that a direct membership the classifier only deduced was not fully evaluated', () => {
    withSource({ membershipType: 'DIRECT', rules: [], attribution: 'inferred' });

    expect(screen.getByText('Added directly')).toBeInTheDocument();
    expect(screen.getByTitle(/not every rule condition could be evaluated/i)).toBeInTheDocument();
  });

  it('carries the full caveat on hover', () => {
    withSource({ membershipType: 'UNKNOWN', rules: [], attribution: 'ambiguous' });

    expect(screen.getByTitle(/the answer is missing/i)).toBeInTheDocument();
  });
});

describe('GroupMembershipsList — proving one membership against Okta', () => {
  const guessed: GroupMembership = {
    ...formattedRuleMembership,
    attribution: 'ambiguous',
  };
  const withProof = (
    onProveMembershipSource: (groupId: string) => Promise<MemberRuleAttribution>,
    memberships: GroupMembership[] = [guessed],
  ) =>
    render(
      <GroupMembershipsList
        {...base}
        user={user}
        memberships={memberships}
        onProveMembershipSource={onProveMembershipSource}
        isActive={false}
      />,
    );

  const askOkta = () => screen.getAllByRole('button', { name: /Ask Okta/ });

  it('offers no action at all unless a resolver is supplied — it is never free', async () => {
    render(<GroupMembershipsList {...base} user={user} />);
    await openRow('Engineering');

    expect(screen.queryByRole('button', { name: /Ask Okta/ })).not.toBeInTheDocument();
  });

  it('is unreachable until the row is opened', async () => {
    withProof(vi.fn().mockResolvedValue({ state: 'no-rules' as const }));

    expect(askOkta()[0].closest('[inert]')).not.toBeNull();

    await openRow('Engineering');

    expect(askOkta()[0].closest('[inert]')).toBeNull();
  });

  it('asks about one group only when clicked, and only that group', async () => {
    const onProve = vi.fn().mockResolvedValue({ state: 'no-rules' as const });
    withProof(onProve, [
      guessed,
      {
        ...guessed,
        group: { ...guessed.group, id: '00gFAKE2', profile: { name: 'Ops Handbook' } },
      },
    ]);

    expect(askOkta()).toHaveLength(2);
    expect(onProve).not.toHaveBeenCalled();

    await openRow('Engineering');
    await userEvent.click(within(rowFor('00gFAKE1')).getByRole('button', { name: /Ask Okta/ }));

    expect(onProve).toHaveBeenCalledTimes(1);
    expect(onProve).toHaveBeenCalledWith(guessed.group.id);
  });

  it('states Okta’s named rule as a fact once proven', async () => {
    withProof(() =>
      Promise.resolve({ state: 'rules', rules: [{ id: '0prFAKEhr', name: 'HR sync' }] }),
    );

    await openRow('Engineering');
    await userEvent.click(askOkta()[0]);

    expect(await screen.findByText(/Okta confirms: added by rule: HR sync/)).toBeInTheDocument();
  });

  it('states an Okta "no rule" answer as an authoritative manual add', async () => {
    withProof(() => Promise.resolve({ state: 'no-rules' }));

    await openRow('Engineering');
    await userEvent.click(askOkta()[0]);

    expect(await screen.findByText('Okta confirms: added directly')).toBeInTheDocument();
  });

  it('never turns "Okta said nothing" into "Okta says no rule"', async () => {
    withProof(() => Promise.resolve({ state: 'unknown' }));

    await openRow('Engineering');
    await userEvent.click(askOkta()[0]);

    expect(await screen.findByText(/Okta did not answer/)).toBeInTheDocument();
    expect(screen.queryByText(/Okta confirms/)).not.toBeInTheDocument();
  });

  it('treats a failed request the same way — no answer, not an answer', async () => {
    withProof(() => Promise.reject(new Error('rate limited')));

    await openRow('Engineering');
    await userEvent.click(askOkta()[0]);

    expect(await screen.findByText(/Okta did not answer/)).toBeInTheDocument();
    expect(screen.queryByText(/Okta confirms/)).not.toBeInTheDocument();
    expect(screen.getAllByText('Rule:')).toHaveLength(1);
  });

  it('leaves the per-rule explanation standing beside Okta’s answer', async () => {
    withProof(() =>
      Promise.resolve({ state: 'rules', rules: [{ id: '0prFAKEhr', name: 'HR sync' }] }),
    );

    await openRow('Engineering');
    await userEvent.click(askOkta()[0]);
    await screen.findByText(/Okta confirms/);

    expect(clauseSentences()).toContain('department equals "Engineering"');
    expect(screen.getByText('Rule:')).toBeInTheDocument();
  });

  it('carries the full caveat about whose answer it is on hover', async () => {
    withProof(() => Promise.resolve({ state: 'no-rules' }));

    await openRow('Engineering');
    await userEvent.click(askOkta()[0]);

    expect(
      await screen.findByTitle(/Okta answering rather than the classifier/),
    ).toBeInTheDocument();
  });
});

describe('GroupMembershipsList — asking Okta about what it could not settle', () => {
  const unsettled: GroupMembership = { ...formattedRuleMembership, attribution: 'ambiguous' };
  const settled: GroupMembership = { ...formattedRuleMembership, attribution: 'exact' };

  const renderList = (
    onProveMembershipSource: (groupId: string) => Promise<MemberRuleAttribution>,
    memberships: GroupMembership[],
    extra: Record<string, unknown> = {},
  ) =>
    render(
      <GroupMembershipsList
        {...base}
        user={user}
        memberships={memberships}
        onProveMembershipSource={onProveMembershipSource}
        {...extra}
      />,
    );

  it('asks about a membership it could not settle, with no click at all', async () => {
    const onProve = vi
      .fn()
      .mockResolvedValue({ state: 'rules', rules: [{ id: '0prX', name: 'HR sync' }] });
    renderList(onProve, [unsettled]);

    await waitFor(() => expect(onProve).toHaveBeenCalledWith(unsettled.group.id));
    await openRow('Engineering');
    expect(await screen.findByText(/Okta confirms: added by rule: HR sync/)).toBeInTheDocument();
  });

  it('never spends a request on a membership it already proved', async () => {
    const onProve = vi.fn().mockResolvedValue({ state: 'no-rules' as const });
    renderList(onProve, [settled]);

    await openRow('Engineering');
    expect(onProve).not.toHaveBeenCalled();
  });

  it('asks once per row, however many times the list re-renders', async () => {
    const onProve = vi.fn().mockResolvedValue({ state: 'unknown' as const });
    const { rerender } = renderList(onProve, [unsettled]);

    await waitFor(() => expect(onProve).toHaveBeenCalledTimes(1));

    rerender(
      <GroupMembershipsList
        {...base}
        user={user}
        memberships={[unsettled]}
        onProveMembershipSource={onProve}
      />,
    );
    await openRow('Engineering');
    expect(onProve).toHaveBeenCalledTimes(1);
  });

  it('issues nothing while the pane is off screen', async () => {
    const onProve = vi.fn().mockResolvedValue({ state: 'no-rules' as const });
    renderList(onProve, [unsettled], { isActive: false });

    await openRow('Engineering');
    expect(onProve).not.toHaveBeenCalled();
  });

  it('issues nothing until the membership list has finished loading', async () => {
    const onProve = vi.fn().mockResolvedValue({ state: 'no-rules' as const });
    renderList(onProve, [unsettled], { isLoading: true });

    expect(onProve).not.toHaveBeenCalled();
  });
});

describe('GroupMembershipsList selection', () => {
  const secondMembership: GroupMembership = {
    group: { id: '00gFAKE2', type: 'OKTA_GROUP', profile: { name: 'Ops Handbook' } },
    membershipType: 'DIRECT',
    rules: [],
    attribution: 'exact',
  };

  it('ticks and unticks one group from its own row', async () => {
    const user2 = userEvent.setup();
    render(<GroupMembershipsList {...base} user={user} />);

    const box = screen.getByRole('checkbox', { name: 'Select Engineering' });
    await user2.click(box);
    expect(screen.getByRole('checkbox', { name: 'Select Engineering' })).toBeChecked();

    await user2.click(screen.getByRole('checkbox', { name: 'Select Engineering' }));
    expect(screen.getByRole('checkbox', { name: 'Select Engineering' })).not.toBeChecked();
  });

  it('keeps a pick that the filter has since hidden', async () => {
    const user2 = userEvent.setup();
    render(
      <GroupMembershipsList
        {...base}
        user={user}
        memberships={[formattedRuleMembership, secondMembership]}
      />,
    );

    await user2.click(screen.getByRole('checkbox', { name: 'Select Ops Handbook' }));
    expect(screen.getByRole('checkbox', { name: 'Select Ops Handbook' })).toBeChecked();

    await user2.type(screen.getByLabelText('Filter group memberships'), 'engineering');
    expect(screen.queryByRole('heading', { name: 'Ops Handbook' })).not.toBeInTheDocument();

    await user2.clear(screen.getByLabelText('Filter group memberships'));
    expect(screen.getByRole('checkbox', { name: 'Select Ops Handbook' })).toBeChecked();
  });
});

describe('GroupMembershipsList — an unread list is not an empty one', () => {
  it('says the groups could not be read rather than that there are none', () => {
    render(<GroupMembershipsList {...base} memberships={undefined} user={user} />);

    expect(screen.getByText('This user’s groups could not be read')).toBeInTheDocument();
    expect(screen.queryByText('This user is not a member of any groups')).not.toBeInTheDocument();
  });

  it('still says "not a member of any groups" for a list that was read and is empty', () => {
    render(<GroupMembershipsList {...base} memberships={[]} user={user} />);

    expect(screen.getByText('This user is not a member of any groups')).toBeInTheDocument();
    expect(screen.queryByText('This user’s groups could not be read')).not.toBeInTheDocument();
  });
});
