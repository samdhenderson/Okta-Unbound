import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import RuleUserCheckSection from './RuleUserCheckSection';
import { NavigationProvider } from '../../contexts/NavigationContext';
import {
  excludedByUserVerdict,
  grantsVerdict,
  groupContext,
  resolveGroupName,
  user,
} from '../qualification/storyFixtures';

const loaded = { status: 'loaded', userId: user.id, user, groups: [], groupContext } as const;

const meta = {
  title: 'Rules/RuleUserCheckSection',
  component: RuleUserCheckSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The rule rung\'s answer to "does this user qualify?": a `DetailSection` naming the subject, holding the load status or the `RuleUserReport`, with its own Clear. Mounted only while a subject is in scope.',
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
  args: { onClear: fn(), resolveGroupName },
} satisfies Meta<typeof RuleUserCheckSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { subject: { status: 'loading', userId: user.id }, verdict: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Reading the user/)).toBeInTheDocument();
    await expect(canvas.queryByText('Qualifies')).not.toBeInTheDocument();
  },
};

export const Failed: Story = {
  args: { subject: { status: 'failed', userId: user.id, reason: 'groups-failed' }, verdict: null },
};

export const Qualifies: Story = {
  args: { subject: loaded, verdict: grantsVerdict },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ada Lovelace · ada@example.com')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  },
};

export const Excluded: Story = {
  args: { subject: loaded, verdict: excludedByUserVerdict },
};
