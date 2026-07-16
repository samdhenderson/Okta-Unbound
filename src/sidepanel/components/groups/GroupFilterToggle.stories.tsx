import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupFilterToggle from './GroupFilterToggle';

const meta = {
  title: 'Groups/GroupFilterToggle',
  component: GroupFilterToggle,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    showFilters: false,
    activeFilterCount: 0,
    onToggle: fn(),
  },
} satisfies Meta<typeof GroupFilterToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = {
  args: { showFilters: true },
};

export const WithActiveFilters: Story = {
  args: { activeFilterCount: 4 },
};

export const ExpandedWithActiveFilters: Story = {
  args: { showFilters: true, activeFilterCount: 2 },
};
