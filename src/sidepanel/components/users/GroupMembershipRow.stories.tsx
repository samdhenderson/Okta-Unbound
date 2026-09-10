import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GroupMembershipRow from './GroupMembershipRow';
import { NavigationProvider } from '../../contexts/NavigationContext';
import type { GroupMembership, MembershipRule, OktaUser } from '../../../shared/types';

const handlers = { rule: fn(), group: fn(), user: fn(), app: fn(), policy: fn() };

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

const longName: GroupMembership = {
  ...ruleAmbiguous,
  group: {
    id: '00gFAKE00000000000008',
    type: 'OKTA_GROUP',
    profile: { name: 'EMEA Engineering — Platform Infrastructure On-Call Escalation' },
  },
};

const proven: GroupMembership = {
  ...ruleAmbiguous,
  provenance: {
    source: 'okta',
    rules: [{ id: '0prFAKErule00003', name: 'Reviewers — by title' }],
  },
};

const meta = {
  title: 'Users/GroupMembershipRow',
  component: GroupMembershipRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One membership, reduced to two statements: a **verdict badge** (`Rule`, ' +
          '`Rule · n`, `Direct`, `App`, `Unresolved` — from `membershipVerdict`) and ' +
          'one **source line** worded by `shared/membership/sourceLine`.\n\n' +
          'The row this replaced stacked the raw membership enum, a second group-type badge, a ' +
          'qualified caption and a "Prove it" strip on top of each other, and left the reader to ' +
          'decide which to believe. Everything past the two statements now lives behind the ' +
          'disclosure, in one order: the full explanation, a card per attributed rule, any apps the ' +
          'group also grants, the **Ask Okta** proof action (ADR-0031), and the Okta deep link.\n\n' +
          'The disclosure is closed by default and held `inert` while closed, which is what keeps ' +
          'the proof action — one API call per press — off a row nobody has opened. Expansion is ' +
          'owned by the pane, not the row, so filtering the list cannot close a row the reader ' +
          'opened.\n\n' +
          '**Related internals:** [Components](?path=/docs/internals-components--docs)',
      },
    },
  },
  decorators: [
    (Story: () => React.ReactElement) => (
      <NavigationProvider handlers={handlers}>
        <div className="bg-canvas p-4">
          <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
            <Story />
          </div>
        </div>
      </NavigationProvider>
    ),
  ],
  args: {
    membership: ruleExact,
    user,
    isCurrentGroup: false,
    expanded: false,
    onToggle: fn(),
    oktaOrigin: 'https://example.okta.com',
    proofEnabled: false,
    onProve: fn(),
  },
  argTypes: {
    membership: { description: 'The membership this row is about, as the classifier produced it.' },
    user: {
      description:
        'The user it belongs to; supplied, each rule condition is explained clause by clause against them.',
    },
    isCurrentGroup: {
      description:
        'Whether this group is the one being browsed elsewhere in the panel — highlights the row and adds an "On page" badge.',
    },
    expanded: {
      description:
        'Whether the disclosure is open. Owned by the pane, so filtering cannot close a row.',
    },
    onToggle: { description: "Toggles this row's disclosure, by group id." },
    oktaOrigin: {
      description: 'Origin for the admin-console deep link; the link hides without it.',
    },
    flash: { description: 'One-shot success flash for a group that was just added this session.' },
    appNames: {
      description:
        'Apps this group also grants. **Absent is not empty** — the line is omitted rather than claiming the group grants none.',
    },
    proofEnabled: {
      description: 'Whether the surface can prove a membership at all (a resolver was supplied).',
    },
    proofOutcome: {
      description: "Where this row's proof request has got to, or `undefined` before anyone asked.",
    },
    onProve: {
      description: 'Asks Okta about this one membership — one API call, from a press only.',
    },
  },
} satisfies Meta<typeof GroupMembershipRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VerdictRule: Story = {};

export const VerdictRuleAmbiguous: Story = {
  args: { membership: ruleAmbiguous },
};

export const VerdictDirect: Story = {
  args: { membership: direct },
};

export const VerdictDirectDeduced: Story = {
  args: { membership: directDeduced },
};

export const VerdictAppMastered: Story = {
  args: { membership: appMastered },
};

export const VerdictUnresolved: Story = {
  args: { membership: unresolved },
};

export const VerdictProven: Story = {
  args: { membership: proven },
};

export const Collapsed: Story = {
  args: { expanded: false },
};

export const Expanded: Story = {
  args: { expanded: true },
};

export const CurrentGroupHighlighted: Story = {
  args: { isCurrentGroup: true },
};

export const RecentlyAddedFlash: Story = {
  args: { membership: direct, flash: true },
  parameters: { motion: 'on' },
};

export const WithAppGrants: Story = {
  args: { expanded: true, appNames: ['Salesforce', 'Figma'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Also grants:')).toBeInTheDocument();
  },
};

export const WithoutAppGrants: Story = {
  args: { expanded: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Also grants:')).toBeNull();
  },
};

export const ProofDisabled: Story = {
  args: { membership: ruleAmbiguous, expanded: true, proofEnabled: false },
};

export const ProofIdle: Story = {
  args: { membership: ruleAmbiguous, expanded: true, proofEnabled: true },
};

export const ProofPending: Story = {
  args: {
    membership: ruleAmbiguous,
    expanded: true,
    proofEnabled: true,
    proofOutcome: { status: 'pending' },
  },
};

export const ProofResolved: Story = {
  args: {
    membership: ruleAmbiguous,
    expanded: true,
    proofEnabled: true,
    proofOutcome: { status: 'proven', membership: proven },
  },
};

export const ProofUnanswered: Story = {
  args: {
    membership: ruleAmbiguous,
    expanded: true,
    proofEnabled: true,
    proofOutcome: { status: 'unanswered' },
  },
};

export const OpeningTheDisclosure: Story = {
  args: { expanded: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'Show how Engineering Staff was granted',
    });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(args.onToggle).toHaveBeenCalledWith(ruleExact.group.id);
  },
};

export const Compact: Story = {
  args: { membership: ruleAmbiguous, isCurrentGroup: true },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const LongGroupName: Story = {
  args: { membership: longName, isCurrentGroup: true },
  parameters: { viewport: { value: 'sidepanelCompact' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByText(longName.group.profile.name);
    await expect(name).toBeInTheDocument();
    await expect(name).toHaveAttribute('title', longName.group.profile.name);
    await expect(canvas.getByText('Rule · 2')).toBeInTheDocument();
    await expect(canvas.getByText('On page')).toBeInTheDocument();
  },
};
