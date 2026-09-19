import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import UserQualificationSurface from './UserQualificationSurface';
import { NavigationProvider } from '../../contexts/NavigationContext';
import { assessGroupForUser } from '../../../shared/membership/qualification';
import type { FormattedRule, GroupMembership } from '../../../shared/types';
import {
  ENGINEERING,
  SECOPS,
  doesNotMatchVerdict,
  grantsVerdict,
  groupNames,
  rule,
  subject,
  user,
} from '../qualification/storyFixtures';

const memberships: GroupMembership[] = [
  {
    group: { id: ENGINEERING, type: 'OKTA_GROUP', profile: { name: 'Engineering' } },
    membershipType: 'DIRECT',
    rules: [],
    attribution: 'exact',
  },
];

const formatted = (over: Partial<FormattedRule> = {}): FormattedRule => ({
  ...rule(),
  groupIds: [SECOPS],
  condition: 'user.department == "Engineering"',
  userAttributes: ['department'],
  created: '2024-01-01T00:00:00.000Z',
  lastUpdated: '2025-01-01T00:00:00.000Z',
  ...over,
});

const secops = { id: SECOPS, name: 'SecOps', description: '', type: 'OKTA_GROUP' };

const meta = {
  title: 'Users/UserQualificationSurface',
  component: UserQualificationSurface,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "The user rung's answer to *Check rule* / *Check membership*: a `DetailSection` between the strip and the panes over the rung's own user, with its own Clear. `pending` states the input still loading and never a verdict.",
      },
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider handlers={{ group: fn() }}>
        <div className="max-w-md p-4">
          <Story />
        </div>
      </NavigationProvider>
    ),
  ],
  args: { user, memberships, onClear: fn() },
} satisfies Meta<typeof UserQualificationSurface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AgainstARule: Story = {
  args: { check: { kind: 'rule', rule: formatted(), verdict: grantsVerdict } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Against rule: Engineers into SecOps')).toBeInTheDocument();
    await expect(canvas.getByText('Qualifies')).toBeInTheDocument();
  },
};

export const RuleDoesNotMatch: Story = {
  args: { check: { kind: 'rule', rule: formatted(), verdict: doesNotMatchVerdict } },
};

export const WhyNotInAGroup: Story = {
  args: {
    check: {
      kind: 'group',
      group: secops,
      verdict: assessGroupForUser({
        group: secops,
        feedingRules: [rule()],
        subject,
        groupNames,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Membership of SecOps')).toBeInTheDocument();
    await expect(canvas.getByText(/An active rule qualifies this user/)).toBeInTheDocument();
  },
};

export const PendingMemberships: Story = {
  args: { check: { kind: 'pending', reason: 'memberships' }, memberships: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Waiting for the user's memberships/)).toBeInTheDocument();
    await expect(canvas.queryByText('Qualifies')).not.toBeInTheDocument();
  },
};
