import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import UserSearchBar from './UserSearchBar';

const meta = {
  title: 'Users/UserSearchBar',
  component: UserSearchBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    searchQuery: '',
    onSearchChange: fn(),
    onClear: fn(),
    isSearching: false,
    showClearButton: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithQuery: Story = {
  args: { searchQuery: 'jane.doe@example.com', showClearButton: true },
};

export const Searching: Story = {
  args: { searchQuery: 'jane', showClearButton: true, isSearching: true },
};

export const CustomPlaceholder: Story = {
  args: { placeholder: 'Find a user by employee ID...' },
};
