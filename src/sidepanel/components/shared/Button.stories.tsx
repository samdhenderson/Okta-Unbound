import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Button from './Button';

const meta = {
  title: 'Shared/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    children: 'Add group',
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: { variant: 'primary', icon: 'plus' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Remove members' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { variant: 'primary', loading: true },
};

export const WithBadge: Story = {
  args: { variant: 'primary', badge: '3' },
};

export const Hover: Story = {
  args: { variant: 'primary' },
  parameters: { pseudo: { hover: true } },
};

export const Focus: Story = {
  args: { variant: 'primary' },
  parameters: { pseudo: { focusVisible: true } },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
  args: { variant: 'primary' },
};
