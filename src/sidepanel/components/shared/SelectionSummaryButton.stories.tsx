import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import SelectionSummaryButton from './SelectionSummaryButton';

const meta = {
  title: 'Shared/SelectionSummaryButton',
  component: SelectionSummaryButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Reports the size of the current selection with one glyph and one total, and opens the ' +
          'surface that manages it.\n\n' +
          '**Nothing to act on is nothing shown.** At a total of zero this renders `null` — never a ' +
          'disabled control, never a `(0)` — because the basket is in-memory and so is never merely ' +
          '"not yet read" (`docs/claims.md`).\n\n' +
          '**The breakdown is a convenience, never load-bearing.** The accessible name states the ' +
          'whole breakdown as a sentence — `"3 users, 1 group and 1 rule selected"` — at rest. Hovering ' +
          'or focusing the control discloses the same breakdown visually, per kind, growing leftward ' +
          'out of flow so it can cover the subject beside it without moving the Refresh control on its ' +
          'other side or changing the row height.',
      },
    },
  },
  argTypes: {
    counts: {
      description:
        'One entry per **non-empty** kind. A kind with nothing selected is absent from this object — never present holding `0`.',
    },
    total: {
      description: 'How many entities are ticked across every kind. Zero renders nothing.',
    },
    onOpen: { description: 'Open the surface that manages the selection.' },
  },
  args: {
    onOpen: fn(),
  },
} satisfies Meta<typeof SelectionSummaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NothingSelected: Story = {
  args: { counts: {}, total: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const OneKind: Story = {
  args: { counts: { user: 3 }, total: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '3 users selected' })).toBeInTheDocument();
  },
};

export const TwoKinds: Story = {
  args: { counts: { user: 3, group: 1 }, total: 4 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: '3 users and 1 group selected' }),
    ).toBeInTheDocument();
  },
};

export const AllKinds: Story = {
  args: {
    counts: { user: 3, group: 1, app: 2, rule: 1, policy: 1 },
    total: 8,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', {
        name: '3 users, 1 group, 2 apps, 1 rule and 1 policy selected',
      }),
    ).toBeInTheDocument();
  },
};

export const LargeCount: Story = {
  args: { counts: { user: 1204 }, total: 1204 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: '1,204 users selected' });
    await expect(button).toBeInTheDocument();
    await expect(within(button).getByText('1,204')).toBeInTheDocument();
  },
};

export const NarrowPanel: Story = {
  args: {
    counts: { user: 3, group: 1, app: 2, rule: 1, policy: 1 },
    total: 8,
  },
  decorators: [
    (Story) => (
      <div className="flex w-[360px] justify-end border border-neutral-200 p-2">
        <Story />
      </div>
    ),
  ],
};
