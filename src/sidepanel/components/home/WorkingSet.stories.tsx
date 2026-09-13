import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import WorkingSet from './WorkingSet';
import type { WorkingSetRef } from '../../../shared/storage/workingSetStore';

const DAY = 24 * 60 * 60 * 1000;

const PINS: WorkingSetRef[] = [
  {
    kind: 'group',
    id: '00gFAKE0000000000001',
    name: 'Engineering',
    lastPane: 'Members',
    lastSeenAt: Date.now(),
  },
  {
    kind: 'user',
    id: '00uFAKE0000000000001',
    name: 'Ada Lovelace',
    lastPane: 'Profile',
    lastSeenAt: Date.now() - 2 * DAY,
  },
];

const RECENTS: WorkingSetRef[] = [
  {
    kind: 'group',
    id: '00gFAKE0000000000002',
    name: 'Contractors',
    lastSeenAt: Date.now() - DAY,
  },
  {
    kind: 'user',
    id: '00uFAKE0000000000002',
    name: 'Grace Hopper',
    lastPane: 'Groups',
    lastSeenAt: Date.now() - 4 * DAY,
  },
];

const meta = {
  title: 'Home/WorkingSet',
  component: WorkingSet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          "The Home tab's second region: what you pinned, and what you were just looking at.\n\n" +
          'An empty *Pinned* list still renders and says how to fill it — it is the only surface that teaches the pin affordance. *Recent* is absent until it has rows, because it needs no teaching.',
      },
    },
  },
  argTypes: {
    pinned: { description: 'Entities the reader chose to keep.' },
    recent: { description: 'Entities recently opened, most recent first.' },
    onOpen: { description: 'Open one on its owning tab.' },
    onUnpin: { description: 'Release a pin.' },
    onForget: { description: 'Drop a recent.' },
  },
  args: { pinned: PINS, recent: RECENTS, onOpen: fn(), onUnpin: fn(), onForget: fn() },
} satisfies Meta<typeof WorkingSet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OpeningAndUnpinning: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getAllByRole('button', { name: 'Open group' })[0]);
    await expect(args.onOpen).toHaveBeenCalledWith(PINS[0]);

    await userEvent.click(canvas.getByRole('button', { name: 'Unpin Engineering' }));
    await expect(args.onUnpin).toHaveBeenCalledWith(PINS[0]);
  },
};

export const ForgettingARecent: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Forget Contractors' }));
    await expect(args.onForget).toHaveBeenCalledWith(RECENTS[0]);
  },
};

export const ColdStart: Story = {
  args: { pinned: [], recent: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Nothing pinned yet/)).toBeInTheDocument();
    await expect(canvas.queryByText('Recent')).not.toBeInTheDocument();
  },
};

export const RecentsOnly: Story = {
  args: { pinned: [] },
};

export const PinsOnly: Story = {
  args: { recent: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText('Recent')).not.toBeInTheDocument();
  },
};
