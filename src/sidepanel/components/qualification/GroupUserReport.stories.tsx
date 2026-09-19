import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import GroupUserReport from './GroupUserReport';
import { NavigationProvider } from '../../contexts/NavigationContext';
import { assessGroupForUser } from '../../../shared/membership/qualification';
import {
  ENGINEERING,
  SECOPS,
  USER_ID,
  groupContext,
  groupNames,
  resolveGroupName,
  rule,
  subject,
  user,
} from './storyFixtures';

const secops = { id: SECOPS, type: 'OKTA_GROUP' };
const grants = rule({ id: '0prFAKEGRANT01', name: 'Engineers into SecOps' });
const blocks = rule({
  id: '0prFAKEBLOCK01',
  name: 'Directors into SecOps',
  conditionExpression: 'user.title == "Director"',
});
const undecided = rule({
  id: '0prFAKEUNDEC01',
  name: 'Senior staff into SecOps',
  conditionExpression: 'user.employeeNumber > 5',
});
const excludes = rule({
  id: '0prFAKEEXCL01',
  name: 'Everyone but Ada',
  excludedUserIds: [USER_ID],
});

const verdictOf = (feedingRules: Parameters<typeof assessGroupForUser>[0]['feedingRules']) =>
  assessGroupForUser({ group: secops, feedingRules, subject, groupNames });

const meta = {
  title: 'Qualification/GroupUserReport',
  component: GroupUserReport,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One group × one user: the provenance-first verdict as a mark and a sentence, then every rule feeding the group as a compact `RuleUserReport`, granting rules first.\n\n' +
          'The kinds that carry no rules — app-managed, inventory unavailable, no feeding rule — render the sentence alone: the absence is the answer.',
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
  args: { groupName: 'SecOps', user, groupContext, resolveGroupName },
} satisfies Meta<typeof GroupUserReport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WouldBeAdded: Story = {
  args: { verdict: verdictOf([blocks, grants]) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/An active rule qualifies this user/)).toBeInTheDocument();
    const names = canvas.getAllByRole('article').map((a) => a.getAttribute('aria-label'));
    await expect(names).toEqual(['Engineers into SecOps', 'Directors into SecOps']);
  },
};

export const NotQualified: Story = {
  args: { verdict: verdictOf([blocks, excludes]) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Not qualified')).toBeInTheDocument();
  },
};

export const Undetermined: Story = {
  args: { verdict: verdictOf([undecided, blocks]) },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(/at least one could not be determined/),
    ).toBeInTheDocument();
  },
};

export const AlreadyMember: Story = {
  args: {
    verdict: assessGroupForUser({
      group: { id: ENGINEERING, type: 'OKTA_GROUP' },
      feedingRules: [rule({ groupIds: [ENGINEERING] })],
      subject,
      groupNames,
    }),
    groupName: 'Engineering',
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('This user is a member of Engineering today.'),
    ).toBeInTheDocument();
  },
};

export const AppManaged: Story = {
  args: { verdict: { kind: 'app-managed' }, groupName: 'Salesforce Users' },
};

export const InventoryUnavailable: Story = {
  args: { verdict: { kind: 'inventory-unavailable' } },
};

export const NoFeedingRule: Story = {
  args: { verdict: { kind: 'no-feeding-rule' } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('article')).not.toBeInTheDocument();
  },
};
