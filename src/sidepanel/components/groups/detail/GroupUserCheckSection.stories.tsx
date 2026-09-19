import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import GroupUserCheckSection from './GroupUserCheckSection';
import { NavigationProvider } from '../../../contexts/NavigationContext';
import { assessGroupForUser } from '../../../../shared/membership/qualification';
import {
  SECOPS,
  groupContext,
  groupNames,
  resolveGroupName,
  rule,
  subject,
  user,
} from '../../qualification/storyFixtures';

const loaded = { status: 'loaded', userId: user.id, user, groups: [], groupContext } as const;

const verdict = assessGroupForUser({
  group: { id: SECOPS, type: 'OKTA_GROUP' },
  feedingRules: [
    rule({ id: '0prFAKEGRANT01', name: 'Engineers into SecOps' }),
    rule({
      id: '0prFAKEBLOCK01',
      name: 'Directors into SecOps',
      conditionExpression: 'user.title == "Director"',
    }),
  ],
  subject,
  groupNames,
});

const meta = {
  title: 'Groups/GroupUserCheckSection',
  component: GroupUserCheckSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The group rung\'s answer to "why isn\'t X a member?": a `DetailSection` naming the subject, holding the load status, the wait for the feeding rules, or the `GroupUserReport`, with its own Clear. Mounted between the strip and the tabs so it survives a tab switch.',
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
  args: { groupName: 'SecOps', onClear: fn(), resolveGroupName },
} satisfies Meta<typeof GroupUserCheckSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { subject: { status: 'loading', userId: user.id }, check: { kind: 'none' } },
};

export const WaitingForRules: Story = {
  args: { subject: loaded, check: { kind: 'pending' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Waiting for the feeding rules/)).toBeInTheDocument();
    await expect(canvas.queryByRole('article')).not.toBeInTheDocument();
  },
};

export const Verdict: Story = {
  args: { subject: loaded, check: { kind: 'verdict', verdict } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ada Lovelace · ada@example.com')).toBeInTheDocument();
    await expect(canvas.getByText(/An active rule qualifies this user/)).toBeInTheDocument();
    await expect(canvas.getAllByRole('article')).toHaveLength(2);
  },
};

export const Failed: Story = {
  args: {
    subject: { status: 'failed', userId: user.id, reason: 'user-not-found' },
    check: { kind: 'none' },
  },
};
