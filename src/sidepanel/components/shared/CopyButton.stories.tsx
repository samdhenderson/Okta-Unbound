import type { Meta, StoryObj } from '@storybook/react-vite';
import CopyButton from './CopyButton';

const meta = {
  title: 'Shared/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    getText: () => 'user1@example.com\nuser2@example.com\nuser3@example.com',
    label: 'Copy emails',
  },
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const CustomCopiedLabel: Story = {
  args: {
    copiedLabel: 'Copied to clipboard!',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Copy all selected user emails',
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <CopyButton {...args} size="sm" label="Small" />
      <CopyButton {...args} size="md" label="Medium" />
      <CopyButton {...args} size="lg" label="Large" />
    </div>
  ),
  args: {
    variant: 'primary',
  },
};
