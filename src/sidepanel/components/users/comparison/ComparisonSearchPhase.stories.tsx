import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ComparisonSearchPhase from './ComparisonSearchPhase';
import { mockUsers } from '../../../../test/mocks/handlers';

const contextUser = mockUsers[0];

const meta = {
  title: 'Users/Comparison/ComparisonSearchPhase',
  component: ComparisonSearchPhase,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    contextUser,
    contextName: 'First1 Last1',
    searchQuery: '',
    setSearchQuery: fn(),
    isSearching: false,
    searchResults: [],
    onSelectUser: fn(),
  },
} satisfies Meta<typeof ComparisonSearchPhase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Searching: Story = {
  args: { searchQuery: 'smith', isSearching: true },
};

export const WithResults: Story = {
  args: {
    searchQuery: 'user',
    searchResults: mockUsers.slice(0, 8),
  },
};

export const NoResults: Story = {
  args: {
    searchQuery: 'zzzznomatch',
    searchResults: [],
  },
};
