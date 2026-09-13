import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import WorkingSetRow from './WorkingSetRow';

const DAY = 24 * 60 * 60 * 1000;

const meta = {
  title: 'Home/WorkingSetRow',
  component: WorkingSetRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One entity in the Home tab’s working set. The row opens the entity and carries its own ' +
          'drop control, so it uses the shared `StretchedButton` overlay rather than ' +
          '`ListRow as="button"` — nesting a button inside a button is an axe ' +
          '`nested-interactive` violation.\n\n' +
          'The secondary line names the pane you left off on only when the rung reported one; a ' +
          'rung with no pane shows its kind alone rather than an invented location. The age is ' +
          'omitted for anything seen today.',
      },
    },
  },
  argTypes: {
    entry: { description: 'The remembered entity.' },
    onOpen: { description: 'Open it on its owning tab.' },
    pinned: { description: 'Whether this is a pin — changes the drop verb from Forget to Unpin.' },
    onDrop: { description: 'Release a pin, or forget a recent.' },
  },
  args: {
    onOpen: fn(),
    onDrop: fn(),
    pinned: true,
    entry: {
      kind: 'group',
      id: '00gFAKE0000000000001',
      name: 'Engineering',
      lastPane: 'Members',
      lastSeenAt: Date.now(),
    },
  },
} satisfies Meta<typeof WorkingSetRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PinnedGroup: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open group' }));
    await expect(args.onOpen).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByRole('button', { name: 'Unpin Engineering' }));
    await expect(args.onDrop).toHaveBeenCalledTimes(1);
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
  },
};

export const RecentUser: Story = {
  args: {
    pinned: false,
    entry: {
      kind: 'user',
      id: '00uFAKE0000000000001',
      name: 'Ada Lovelace',
      lastPane: 'Profile',
      lastSeenAt: Date.now() - 3 * DAY,
    },
  },
};

export const NoPane: Story = {
  args: {
    entry: {
      kind: 'group',
      id: '00gFAKE0000000000002',
      name: 'Contractors',
      lastSeenAt: Date.now() - 8 * DAY,
    },
  },
};

export const LongName: Story = {
  args: {
    entry: {
      kind: 'group',
      id: '00gFAKE0000000000003',
      name: 'Engineering — Platform — Identity and Access Management — On-call rotation',
      lastPane: 'Insights',
      lastSeenAt: Date.now() - DAY,
    },
  },
};
