import type { Meta, StoryObj } from '@storybook/react-vite';
import Skeleton from './Skeleton';

const meta = {
  title: 'Shared/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A shimmering placeholder for content whose shape is already known: `text` (a ' +
          'single line), `row` (a list-row block), `card` (a stat/summary block). `count` ' +
          'renders N repeats under one staggered entrance. The visual bones are ' +
          '`aria-hidden`; a single `role="status"` node carries the accessible name. For ' +
          'unknown-shape or unknown-duration work use `LoadingSpinner` instead.',
      },
    },
  },
  argTypes: {
    variant: { description: 'Placeholder shape. Defaults to `text`.' },
    size: {
      description: 'Line thickness (`text`) or block padding (`row`/`card`). Defaults to `md`.',
    },
    count: { description: 'Number of repeated blocks. Defaults to `1`.' },
    width: {
      description: 'Tailwind width class for the `text` line (e.g. `w-1/2`). Defaults to `w-full`.',
    },
    label: {
      description: 'Accessible name for the `role="status"` node. Defaults to `"Loading"`.',
    },
    className: { description: 'Extra classes merged onto the outer wrapper.' },
  },
  args: {
    variant: 'text',
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TextNarrow: Story = {
  args: { width: 'w-1/2' },
};

export const Row: Story = {
  args: { variant: 'row' },
  parameters: { layout: 'padded' },
};

export const RowCount: Story = {
  args: { variant: 'row', count: 3, label: 'Loading members' },
  parameters: { layout: 'padded', motion: 'on' },
};

export const Card: Story = {
  args: { variant: 'card' },
  parameters: { layout: 'padded' },
};

export const CardCount: Story = {
  args: { variant: 'card', count: 4, label: 'Loading stats' },
  parameters: { layout: 'padded', motion: 'on' },
};

export const Sizes: Story = {
  args: { variant: 'row' },
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="space-y-3">
      <Skeleton {...args} size="sm" />
      <Skeleton {...args} size="md" />
      <Skeleton {...args} size="lg" />
    </div>
  ),
};
