import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RulesToolbar from './RulesToolbar';

const meta = {
  title: 'Rules/RulesToolbar',
  component: RulesToolbar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    searchQuery: '',
    onSearchChange: fn(),
    activeFilter: 'all',
    onFilterChange: fn(),
    conflictsCount: 0,
    showCurrentGroup: false,
    sortMode: 'default',
    onSortChange: fn(),
  },
} satisfies Meta<typeof RulesToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSearchQuery: Story = {
  args: { searchQuery: 'Engineering' },
};

export const ActiveFilterSelected: Story = {
  args: { activeFilter: 'active' },
};

export const WithConflicts: Story = {
  args: { conflictsCount: 5 },
};

export const ConflictsFilterSelected: Story = {
  args: { activeFilter: 'conflicts', conflictsCount: 5 },
};

export const WithCurrentGroupChip: Story = {
  args: { showCurrentGroup: true, activeFilter: 'current-group' },
};

export const SortedBySimilarity: Story = {
  args: { sortMode: 'similarity' },
};
