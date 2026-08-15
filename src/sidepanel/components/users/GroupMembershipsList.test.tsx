import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupMembershipsList from './GroupMembershipsList';
import type { MemberRuleAttribution } from '../../../shared/membership/memberRuleAttribution';
import type { GroupMembership, OktaUser } from '../../../shared/types';

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

describe('GroupMembershipsList', () => {
  it('renders the condition of a rule that only carries `conditionExpression`', () => {
    render(<GroupMembershipsList {...base} user={user} />);

    expect(screen.getByText('user.department == "Engineering"')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
  });

  it('explains an unevaluable condition neutrally rather than as a failure', () => {
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
                conditionExpression: 'isMemberOfGroup("00gFAKE2")',
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText('Not evaluated')).toBeInTheDocument();
    expect(screen.queryByText('Fail')).not.toBeInTheDocument();
  });

  it('states the answer on the row and keeps the evidence collapsed until asked', async () => {
    render(<GroupMembershipsList {...base} user={user} />);

    expect(screen.getByText('Added by Rule:')).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'Check the condition' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);

    expect(screen.getByRole('button', { name: 'Hide the condition' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('falls back to the raw condition when no user is supplied to explain it against', () => {
    render(<GroupMembershipsList {...base} />);

    expect(screen.getByText('user.department == "Engineering"')).toBeInTheDocument();
    expect(screen.queryByText('Pass')).not.toBeInTheDocument();
  });

  it('still reads a raw Okta rule shape, which nests the expression under `conditions`', () => {
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

    expect(screen.getByText('user.title == "Intern"')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
  });

  it('explains every attributed rule, and never captions a guess as the answer', () => {
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
                conditionExpression: 'isMemberOfGroup("00gFAKE2")',
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText('Possible rule:')).toBeInTheDocument();
    expect(screen.queryByText('Added by Rule:')).not.toBeInTheDocument();
    expect(screen.getByText(/Auto-add Engineers, On-call rotation/)).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('Not evaluated')).toBeInTheDocument();
  });

  it('says a rule carries no condition instead of implying it matches nothing', () => {
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

    expect(screen.getByText(/carries no condition expression/)).toBeInTheDocument();
    expect(screen.queryByText('Fail')).not.toBeInTheDocument();
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
  });

  it('softens a direct membership the classifier only deduced', () => {
    withSource({ membershipType: 'DIRECT', rules: [], attribution: 'inferred' });

    expect(screen.getByText('Likely added directly')).toBeInTheDocument();
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
      />,
    );

  const proveIt = () => screen.getAllByRole('button', { name: /Prove it/ });

  it('offers no action at all unless a resolver is supplied — it is never free', () => {
    render(<GroupMembershipsList {...base} user={user} />);

    expect(screen.queryByRole('button', { name: /Prove it/ })).not.toBeInTheDocument();
  });

  it('asks about one group only when clicked, and only that group', async () => {
    const onProve = vi.fn().mockResolvedValue({ state: 'no-rules' as const });
    withProof(onProve, [guessed, { ...guessed, group: { ...guessed.group, id: '00gFAKE2' } }]);

    expect(proveIt()).toHaveLength(2);
    expect(onProve).not.toHaveBeenCalled();

    await userEvent.click(proveIt()[0]);

    expect(onProve).toHaveBeenCalledTimes(1);
    expect(onProve).toHaveBeenCalledWith(guessed.group.id);
  });

  it('states Okta’s named rule as a fact once proven', async () => {
    withProof(() =>
      Promise.resolve({ state: 'rules', rules: [{ id: '0prFAKEhr', name: 'HR sync' }] }),
    );

    await userEvent.click(proveIt()[0]);

    expect(await screen.findByText(/Okta confirms: added by rule: HR sync/)).toBeInTheDocument();
  });

  it('states an Okta "no rule" answer as an authoritative manual add', async () => {
    withProof(() => Promise.resolve({ state: 'no-rules' }));

    await userEvent.click(proveIt()[0]);

    expect(await screen.findByText('Okta confirms: added directly')).toBeInTheDocument();
  });

  it('never turns "Okta said nothing" into "Okta says no rule"', async () => {
    withProof(() => Promise.resolve({ state: 'unknown' }));

    await userEvent.click(proveIt()[0]);

    expect(await screen.findByText(/Okta did not answer/)).toBeInTheDocument();
    expect(screen.queryByText(/Okta confirms/)).not.toBeInTheDocument();
  });

  it('treats a failed request the same way — no answer, not an answer', async () => {
    withProof(() => Promise.reject(new Error('rate limited')));

    await userEvent.click(proveIt()[0]);

    expect(await screen.findByText(/Okta did not answer/)).toBeInTheDocument();
    expect(screen.queryByText(/Okta confirms/)).not.toBeInTheDocument();
    expect(screen.getAllByText('Possible rule:')).toHaveLength(1);
  });

  it('leaves the per-rule explanation standing beside Okta’s answer', async () => {
    withProof(() =>
      Promise.resolve({ state: 'rules', rules: [{ id: '0prFAKEhr', name: 'HR sync' }] }),
    );

    await userEvent.click(proveIt()[0]);
    await screen.findByText(/Okta confirms/);

    expect(screen.getByText('user.department == "Engineering"')).toBeInTheDocument();
    expect(screen.getByText('Possible rule:')).toBeInTheDocument();
  });

  it('carries the full caveat about whose answer it is on hover', async () => {
    withProof(() => Promise.resolve({ state: 'no-rules' }));

    await userEvent.click(proveIt()[0]);

    expect(
      await screen.findByTitle(/Okta answering rather than the classifier/),
    ).toBeInTheDocument();
  });
});
