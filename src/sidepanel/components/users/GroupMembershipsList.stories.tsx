import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import GroupMembershipsList from './GroupMembershipsList';
import { selectionStore } from '../../selection/selectionStore';
import type { GroupMembership, MembershipRule, OktaUser } from '../../../shared/types';

const user: OktaUser = {
  id: '00uFAKE00000000000001',
  status: 'ACTIVE',
  profile: {
    login: 'user@example.com',
    email: 'user@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
    title: 'Intern',
  },
};

const rule = (id: string, name: string, conditionExpression: string): MembershipRule => ({
  id,
  name,
  status: 'ACTIVE',
  conditionExpression,
});

const ruleExact: GroupMembership = {
  group: {
    id: '00gFAKE00000000000001',
    type: 'OKTA_GROUP',
    profile: { name: 'Engineering Staff', description: 'All engineering employees' },
  },
  membershipType: 'RULE_BASED',
  attribution: 'exact',
  rules: [rule('0prFAKErule00001', 'Auto-add Engineers', 'user.department == "Engineering"')],
};

const ruleInferred: GroupMembership = {
  group: {
    id: '00gFAKE00000000000002',
    type: 'OKTA_GROUP',
    profile: { name: 'Platform On-call' },
  },
  membershipType: 'RULE_BASED',
  attribution: 'inferred',
  rules: [
    rule(
      '0prFAKErule00002',
      'On-call rotation',
      'user.department == "Engineering" && isMemberOfGroup("00gFAKE00000000000009")',
    ),
  ],
};

const ruleAmbiguous: GroupMembership = {
  group: {
    id: '00gFAKE00000000000003',
    type: 'OKTA_GROUP',
    profile: { name: 'Security Reviewers' },
  },
  membershipType: 'RULE_BASED',
  attribution: 'ambiguous',
  rules: [
    rule('0prFAKErule00003', 'Reviewers — by title', 'user.title == "Intern"'),
    rule('0prFAKErule00004', 'Reviewers — by group', 'isMemberOfGroup("00gFAKE00000000000009")'),
  ],
};

const direct: GroupMembership = {
  group: { id: '00gFAKE00000000000004', type: 'OKTA_GROUP', profile: { name: 'Ops Handbook' } },
  membershipType: 'DIRECT',
  attribution: 'exact',
  rules: [],
};

const directDeduced: GroupMembership = {
  group: { id: '00gFAKE00000000000005', type: 'OKTA_GROUP', profile: { name: 'Travel Policy' } },
  membershipType: 'DIRECT',
  attribution: 'inferred',
  rules: [],
};

const appMastered: GroupMembership = {
  group: { id: '00gFAKE00000000000006', type: 'APP_GROUP', profile: { name: 'Salesforce Users' } },
  membershipType: 'RULE_BASED',
  attribution: 'exact',
  rules: [],
};

const unresolved: GroupMembership = {
  group: { id: '00gFAKE00000000000007', type: 'OKTA_GROUP', profile: { name: 'Finance Readers' } },
  membershipType: 'UNKNOWN',
  attribution: 'ambiguous',
  rules: [],
};

const proven: GroupMembership = {
  group: { id: '00gFAKE00000000000008', type: 'OKTA_GROUP', profile: { name: 'VPN Access' } },
  membershipType: 'RULE_BASED',
  attribution: 'ambiguous',
  rules: [
    rule('0prFAKErule00005', 'Contractors → VPN', 'user.userType == "Contractor"'),
    rule('0prFAKErule00006', 'Engineers → VPN', 'user.department == "Engineering"'),
  ],
  provenance: { source: 'okta', rules: [{ id: '0prFAKErule00006', name: 'Engineers → VPN' }] },
};

const everyVerdict = [
  ruleExact,
  ruleInferred,
  ruleAmbiguous,
  direct,
  directDeduced,
  appMastered,
  unresolved,
  proven,
];

const meta = {
  title: 'Users/GroupMembershipsList',
  component: GroupMembershipsList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'The **Groups pane** of the user-detail rung: every group the user is in, what put them ' +
          'there, and how much that answer is worth.\n\n' +
          'The pane follows the rung’s shared spine — summary line → filter → source pills → rows → ' +
          'empty state. The summary names every bucket that has rows in it and omits the ones that ' +
          'do not; dropping a category silently would be worse than showing no summary at all.\n\n' +
          'A row says exactly two things: one **verdict badge** (`Rule`, `Rule · n`, ' +
          '`Direct`, `App`, `Unresolved` — see `membershipVerdict`) and one **source ' +
          'line** worded by `shared/membership/sourceLine`. The raw membership enum and the second ' +
          'group-type badge are gone: group type only matters when it explains the source, which ' +
          'the `App` verdict already does.\n\n' +
          'Everything else is behind the row’s disclosure, in one order: the full explanation, a card per ' +
          'attributed rule (the rule, the profile attributes its condition **reads**, and the ' +
          'condition explained clause by clause against the user), any apps the group also grants, ' +
          'the **Ask Okta** proof action (ADR-0031 — one API call, and never on a collapsed row; ' +
          'the pane also fires it automatically for anything it could not settle itself, which is ' +
          'the last rung of ADR-0001’s certainty ladder), ' +
          'and the Okta deep link.\n\n' +
          'Every badge here is a *deduction*: `GET /api/v1/users/{id}/groups` carries no attribution ' +
          'embed (ADR-0020). A row carrying `provenance` is the exception — that is Okta’s own ' +
          'answer, and it is the only way a deduced row becomes a proven one.',
      },
    },
  },
  decorators: [
    (Story: () => React.ReactElement) => (
      <div className="bg-canvas p-4">
        <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    memberships: [ruleExact, direct, appMastered],
    user,
    isLoading: false,
  },
  beforeEach: () => {
    selectionStore.clearAll();
    return () => selectionStore.clearAll();
  },
  argTypes: {
    memberships: {
      description: "The user's group memberships, each already classified as direct or rule-based.",
    },
    user: {
      description:
        'The user the memberships belong to; enables the per-clause explanation of each rule condition.',
    },
    isLoading: { description: 'When true, shows row skeletons instead of the list.' },
    currentGroupId: {
      description:
        'Group id to mark as the group being browsed elsewhere in the panel — the row is highlighted and carries an "On page" badge.',
    },
    oktaOrigin: {
      description:
        'Okta origin used to build admin-console deep links; the disclosure’s "Open in Okta" link hides when absent.',
    },
    recentlyAddedGroupId: {
      description:
        'Id of a group just successfully added this session; its row plays a one-shot `animate-affirm-flash` success flash.',
    },
    appsByGroupId: {
      description:
        'Applications each group grants, keyed by group id. **Absent is not empty** — a group with no entry renders no "Also grants" line rather than claiming it grants none.',
    },
    onProveMembershipSource: {
      description:
        'Asks Okta which rules manage one membership (`GET /api/v1/groups/{groupId}/users/{userId}/group-rules`). Supplied, each opened row gains an "Ask Okta" action, **and** the pane asks automatically for every row whose `attribution` is not `exact` — the backstop rung of ADR-0001’s certainty ladder. **One API call per row**, once per row, and never for a membership already settled.',
    },
  },
} satisfies Meta<typeof GroupMembershipsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVerdicts: Story = {
  args: { memberships: everyVerdict },
};

export const OpenDisclosure: Story = {
  args: {
    memberships: [ruleExact, direct],
    oktaOrigin: 'https://example.okta.com',
    onProveMembershipSource: async () => ({ state: 'no-rules' }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show how Engineering Staff was granted' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Hide how Engineering Staff was granted' }),
    ).toHaveAttribute('aria-expanded', 'true');
  },
};

export const GroupClauseResolvedFromMemberships: Story = {
  args: {
    memberships: [
      {
        ...ruleExact,
        rules: [
          rule(
            '0prFAKErule00007',
            'Handbook readers → Engineering',
            'isMemberOfAnyGroup("00gFAKE00000000000004")',
          ),
        ],
      },
      direct,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show how Engineering Staff was granted' }),
    );
    await expect(canvas.getByText('Rule matches this user')).toBeInTheDocument();
    await expect(canvas.queryByText('Cannot be determined')).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { memberships: [], isLoading: true },
};

export const Empty: Story = {
  args: { memberships: [] },
};

export const FilteredToNothing: Story = {
  args: { memberships: everyVerdict },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Filter group memberships'), 'no-such-group');
    await expect(await canvas.findByText('No memberships match')).toBeInTheDocument();
  },
};

export const FilteredByRuleName: Story = {
  args: { memberships: everyVerdict },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Filter group memberships'), 'auto-add');
    await expect(canvas.getByRole('heading', { name: 'Engineering Staff' })).toBeInTheDocument();
    await expect(canvas.queryByRole('heading', { name: 'Ops Handbook' })).not.toBeInTheDocument();
  },
};

export const FilteredToOneBucket: Story = {
  args: { memberships: everyVerdict },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Direct' }));
    await expect(canvas.getByRole('heading', { name: 'Ops Handbook' })).toBeInTheDocument();
  },
};

export const CurrentGroupHighlighted: Story = {
  args: { memberships: everyVerdict, currentGroupId: ruleExact.group.id },
};

export const WithOktaOriginLinks: Story = {
  args: { oktaOrigin: 'https://example.okta.com' },
};

export const WithAppGrants: Story = {
  args: {
    memberships: [ruleExact, direct],
    appsByGroupId: { [ruleExact.group.id]: ['Salesforce', 'Figma'] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show how Engineering Staff was granted' }),
    );
    await expect(canvas.getByText(/Salesforce, Figma/)).toBeInTheDocument();
  },
};

export const ProvableAgainstOkta: Story = {
  args: {
    isActive: false,
    memberships: [ruleAmbiguous, direct],
    onProveMembershipSource: async () => ({
      state: 'rules',
      rules: [{ id: '0prFAKErule00003', name: 'Reviewers — by title' }],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show how Security Reviewers was granted' }),
    );
    const rowElement = canvas
      .getByRole('heading', { name: 'Security Reviewers' })
      .closest('[data-group-id]') as HTMLElement;
    const row = within(rowElement);
    await userEvent.click(row.getByRole('button', { name: /Ask Okta/ }));
    await expect(await row.findByText(/Okta confirms/)).toBeInTheDocument();
  },
};

export const ProvenManualAdd: Story = {
  args: {
    isActive: false,
    memberships: [ruleAmbiguous],
    onProveMembershipSource: async () => ({ state: 'no-rules' }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show how Security Reviewers was granted' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: /Ask Okta/ }));
    await expect(await canvas.findByText('Okta confirms: added directly')).toBeInTheDocument();
  },
};

export const ProofUnanswered: Story = {
  args: {
    isActive: false,
    memberships: [ruleAmbiguous],
    onProveMembershipSource: async () => ({ state: 'unknown' }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show how Security Reviewers was granted' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: /Ask Okta/ }));
    await expect(await canvas.findByText(/Okta did not answer/)).toBeInTheDocument();
  },
};

export const AskedAutomatically: Story = {
  args: {
    memberships: [ruleAmbiguous, ruleExact],
    onProveMembershipSource: async () => ({
      state: 'rules',
      rules: [{ id: '0prFAKErule00003', name: 'Reviewers — by title' }],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show how Security Reviewers was granted' }),
    );
    await expect(await canvas.findByText(/Okta confirms/)).toBeInTheDocument();
  },
};

export const WithoutUser: Story = {
  args: { memberships: [ruleExact], user: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show how Engineering Staff was granted' }),
    );
    await expect(canvas.getByText('user.department == "Engineering"')).toBeInTheDocument();
  },
};

export const RecentlyAddedGroupFlash: Story = {
  args: { recentlyAddedGroupId: direct.group.id },
  parameters: { motion: 'on' },
};

export const Selectable: Story = {
  args: { memberships: [ruleExact, direct] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', { name: 'Select Engineering Staff' });
    await expect(box).not.toBeChecked();

    await userEvent.click(box);
    await expect(box).toBeChecked();
  },
};

export const Compact: Story = {
  args: { memberships: everyVerdict, currentGroupId: ruleAmbiguous.group.id },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
