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
          'A shimmering placeholder for content whose shape is already known.\n\n' +
          'Three shapes — `text` (a single line), `row` (a list-row block matching ' +
          '`GroupListItem`/`MemberRow`), and `card` (a stat/summary card block). The ' +
          '`count` prop renders N repeated blocks without a loop at the call site; ' +
          'repeats share a staggered `.rise-in-stagger` entrance (capped at the 8th) ' +
          'rather than each animating independently. The visual bones are ' +
          '`aria-hidden`; one hidden `role="status"` node carries the accessible name.',
      },
    },
  },
  argTypes: {
    variant: { description: 'Placeholder shape. Defaults to `text`.' },
    size: {
      description:
        'Size scale — controls line thickness (`text`) or block padding (`row`/`card`). Defaults to `md`.',
    },
    count: {
      description:
        'Number of repeated blocks to render, staggered via `.rise-in-stagger`. Defaults to `1`.',
    },
    width: {
      description:
        'Tailwind width class for the `text` variant’s line (e.g. `w-1/2`). Ignored for `row`/`card`. Defaults to `w-full`.',
    },
    label: {
      description:
        'Accessible name for the single `role="status"` node announced to assistive tech. Defaults to `"Loading"`.',
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
