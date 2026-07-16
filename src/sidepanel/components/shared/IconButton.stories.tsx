import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Icon from '../overview/shared/Icon';
import IconButton from './IconButton';

const meta = {
  title: 'Shared/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    label: 'Close',
    onClick: fn(),
    children: <Icon type="trash" />,
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: 'ghost' },
};

export const Subtle: Story = {
  args: { variant: 'subtle' },
};

export const Danger: Story = {
  args: { variant: 'danger', label: 'Delete' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Active: Story = {
  args: { active: true, label: 'Settings active' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Medium: Story = {
  args: { size: 'md' },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <IconButton {...args} size="sm" label="Small">
        <Icon type="trash" size="sm" />
      </IconButton>
      <IconButton {...args} size="md" label="Medium">
        <Icon type="trash" />
      </IconButton>
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <IconButton {...args} variant="ghost" label="Ghost">
        <Icon type="trash" />
      </IconButton>
      <IconButton {...args} variant="subtle" label="Subtle">
        <Icon type="trash" />
      </IconButton>
      <IconButton {...args} variant="danger" label="Delete">
        <Icon type="trash" />
      </IconButton>
    </div>
  ),
};

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

export const Focus: Story = {
  parameters: { pseudo: { focusVisible: true } },
};
