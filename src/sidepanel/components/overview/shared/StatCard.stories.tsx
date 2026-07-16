import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import StatCard from './StatCard';

const meta = {
  title: 'Overview/Shared/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
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

export const Error: Story = {
  args: {
    color: 'error',
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
};

export const LargeNumber: Story = {
  args: {
    title: 'Total Records',
    value: 1234567,
    color: 'primary',
  },
};
