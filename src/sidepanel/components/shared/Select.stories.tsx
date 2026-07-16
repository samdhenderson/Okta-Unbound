import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Select from './Select';

const meta = {
  title: 'Shared/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    value: 'ACTIVE',
    onChange: fn(),
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'STAGED', label: 'Staged' },
      { value: 'PROVISIONED', label: 'Provisioned' },
      { value: 'SUSPENDED', label: 'Suspended' },
      { value: 'DEPROVISIONED', label: 'Deprovisioned' },
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'User Status',
  },
};

export const WithAriaLabel: Story = {
  args: {
    ariaLabel: 'User status selector',
  },
};

export const WithError: Story = {
  args: {
    label: 'User Status',
    error: 'This field is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'User Status',
    disabled: true,
  },
};

export const NotFullWidth: Story = {
  args: {
    label: 'Status',
    fullWidth: false,
  },
};

export const Suspended: Story = {
  args: {
    label: 'User Status',
    value: 'SUSPENDED',
  },
};
