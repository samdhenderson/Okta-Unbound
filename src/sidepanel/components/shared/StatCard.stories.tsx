import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import StatCard from './StatCard';
import Button from './Button';

const meta = {
  title: 'Shared/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Single metric tile — an uppercase title, a large value, and an optional top-right ' +
          'icon — used to build the Overview stat grids. Numeric values are localized with ' +
          'thousands separators; `color` selects the semantic icon/border token set; passing ' +
          '`onClick` turns the whole card into a real button (a tab stop, Enter/Space).\n\n' +
          '`countUp` interpolates a numeric value up to its figure when it resolves or ' +
          'changes, and tints the settled figure for a beat — it never fires on an incidental ' +
          're-render and is instant under `prefers-reduced-motion`.',
      },
    },
  },
  argTypes: {
    title: { description: 'Uppercase label above the value.' },
    value: { description: 'The metric; numbers are rendered with thousands separators.' },
    color: {
      description:
        'Semantic color, selecting the icon and border token set; defaults to `neutral`.',
    },
    icon: { description: 'Optional icon shown at the top-right.' },
    subtitle: { description: 'Optional caption below the value.' },
    onClick: { description: 'When provided, makes the card a clickable button.' },
    countUp: {
      description:
        'Count a numeric value up to its figure over `--dur-tell` when it resolves or changes. Ignored for string values; instant under reduced motion.',
    },
  },
  args: {
    title: 'Active Users',
    value: 1250,
    onClick: fn(),
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const StringValue: Story = {
  args: {
    value: 'N/A',
  },
};

export const WithSubtitle: Story = {
  args: {
    subtitle: 'Last updated today',
  },
};

export const WithIcon: Story = {
  args: {
    icon: 'users',
  },
};

export const Primary: Story = {
  args: {
    color: 'primary',
    icon: 'bolt',
  },
};

export const Success: Story = {
  args: {
    color: 'success',
    title: 'Completed Tasks',
    value: 42,
    icon: 'check',
  },
};

export const Warning: Story = {
  args: {
    color: 'warning',
    title: 'Pending Reviews',
    value: 8,
    icon: 'alert',
  },
};

export const ErrorState: Story = {
  args: {
    color: 'danger',
    title: 'Failed Requests',
    value: 3,
    icon: 'alert',
  },
};

export const Clickable: Story = {
  args: {
    title: 'Click me',
    value: 999,
    icon: 'chart',
  },
  play: async ({ args, canvasElement }) => {
    const card = within(canvasElement).getByRole('button', { name: /Click me/ });

    await userEvent.click(card);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    card.focus();
    await expect(card).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const ClickableHover: Story = {
  ...Clickable,
  play: undefined,
  parameters: { pseudo: { hover: true } },
};

export const ClickableFocus: Story = {
  ...Clickable,
  play: undefined,
  parameters: { pseudo: { focusVisible: true } },
};

export const ClickablePressed: Story = {
  ...Clickable,
  play: undefined,
  parameters: { pseudo: { active: true } },
};

export const LargeNumber: Story = {
  args: {
    title: 'Total Records',
    value: 1234567,
    color: 'primary',
  },
};

export const CountUp: Story = {
  parameters: { motion: 'on' },
  args: {
    title: 'Total Members',
    value: 4820,
    color: 'primary',
    icon: 'users',
    countUp: true,
  },
};

const RefreshDemo: React.FC<React.ComponentProps<typeof StatCard>> = (args) => {
  const [value, setValue] = useState(4820);
  return (
    <div className="flex flex-col items-start gap-3">
      <StatCard {...args} value={value} />
      <Button size="sm" onClick={() => setValue((v) => v + 137)}>
        Refresh
      </Button>
    </div>
  );
};

export const Refreshed: Story = {
  parameters: { motion: 'on' },
  render: (args) => <RefreshDemo {...args} />,
  args: {
    title: 'Total Members',
    color: 'primary',
    icon: 'users',
    countUp: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(canvas.getByText('4,957')).toBeInTheDocument());
  },
};

export const CountUpReducedMotion: Story = {
  args: {
    title: 'Total Members',
    value: 4820,
    color: 'primary',
    icon: 'users',
    countUp: true,
  },
};
