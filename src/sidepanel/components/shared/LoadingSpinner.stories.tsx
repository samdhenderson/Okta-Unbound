import type { Meta, StoryObj } from '@storybook/react-vite';
import LoadingSpinner from './LoadingSpinner';

const meta = {
  title: 'Shared/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Medium: Story = {
  args: { size: 'md' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const WithMessage: Story = {
  args: { message: 'Loading data…' },
};

export const Centered: Story = {
  args: { centered: true },
};

export const CenteredWithMessage: Story = {
  args: { size: 'lg', message: 'Please wait…', centered: true },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <LoadingSpinner {...args} size="sm" />
      <LoadingSpinner {...args} size="md" />
      <LoadingSpinner {...args} size="lg" />
    </div>
  ),
};
