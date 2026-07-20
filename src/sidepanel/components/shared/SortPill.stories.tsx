import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import SortPill from './SortPill';

const meta = {
  title: 'Shared/SortPill',
  component: SortPill,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    field: 'name',
    label: 'Name',
    onToggle: fn(),
  },
} satisfies Meta<typeof SortPill<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {
  args: { activeField: 'status', descending: false },
};

export const ActiveAscending: Story = {
  args: { activeField: 'name', descending: false },
};

export const ActiveDescending: Story = {
  args: { activeField: 'name', descending: true },
};

export const Row: Story = {
  args: { activeField: 'name', descending: false },
  render: (args) => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <SortPill {...args} field="name" label="Name" />
      <SortPill {...args} field="status" label="Status" />
      <SortPill {...args} field="factors" label="Factor count" />
    </div>
  ),
};
