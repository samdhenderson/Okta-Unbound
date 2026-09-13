import type { Meta, StoryObj } from '@storybook/react-vite';
import Badge from './Badge';

const meta = {
  title: 'Shared/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A small status or type mark. Variants follow the shared status vocabulary ' +
          '(`success | warning | danger | info`, never `error`), plus `neutral` for an ' +
          'uncolored mark and `primary` for entity type/identity. A badge is a label, not a ' +
          'control — if it needs a click handler, use `FilterPill` or `Button`.',
      },
    },
  },
  argTypes: {
    children: {
      description: 'Badge label — a word or two.',
    },
    variant: {
      description: 'Colour treatment. Defaults to `neutral`.',
    },
    solid: {
      description: 'Render the filled treatment instead of the tinted one.',
    },
    title: { description: 'Native `title` tooltip.' },
    className: { description: 'Extra classes merged after the variant classes.' },
    testId: { description: 'Optional test handle.' },
  },
  args: {
    children: 'Active',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: 'neutral', children: 'Okta group' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="neutral">Built-in</Badge>
      <Badge variant="primary">Okta group</Badge>
      <Badge variant="info">Rule</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Suspended</Badge>
      <Badge variant="danger">Deprovisioned</Badge>
    </div>
  ),
};

export const Solid: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="primary" solid>
        Current group
      </Badge>
      <Badge variant="primary">Okta group</Badge>
      <Badge variant="neutral">412 members</Badge>
    </div>
  ),
};

export const WithTooltip: Story = {
  args: {
    variant: 'warning',
    children: 'App group',
    title: 'Mastered by an application, which manages its own members.',
  },
};
