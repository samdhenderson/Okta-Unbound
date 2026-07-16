import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import SearchDropdown from './SearchDropdown';
import type { OktaUser } from '../../../shared/types';
import { mockUsers } from '../../../test/mocks/handlers';

const asUser = (item: unknown) => item as OktaUser;

const meta = {
  title: 'Shared/SearchDropdown',
  component: SearchDropdown,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    placeholder: 'Search users...',
    query: '',
    onQueryChange: fn(),
    isSearching: false,
    results: [],
    showDropdown: false,
    onSelect: fn(),
    onClear: fn(),
    renderResult: (item: unknown) => {
      const user = asUser(item);
      return (
        <div>
          <div className="font-medium text-sm">
            {user.profile.firstName} {user.profile.lastName}
          </div>
          <div className="text-xs text-neutral-500">{user.profile.email}</div>
        </div>
      );
    },
  },
} satisfies Meta<typeof SearchDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Source User',
    hint: 'Search by name or email',
  },
};

export const Searching: Story = {
  args: {
    query: 'john',
    isSearching: true,
  },
};

export const WithResults: Story = {
  args: {
    query: 'john',
    showDropdown: true,
    results: mockUsers.slice(0, 5),
  },
};

export const WithQuery: Story = {
  args: {
    query: 'jane',
    showDropdown: false,
    results: [],
  },
};

export const Selected: Story = {
  args: {
    selectedItem: mockUsers[0],
    renderSelected: (item: unknown) => {
      const user = asUser(item);
      return (
        <div className="flex items-center gap-2">
          <div>
            <div className="text-sm font-medium">
              {user.profile.firstName} {user.profile.lastName}
            </div>
            <div className="text-xs text-neutral-600">{user.profile.email}</div>
          </div>
        </div>
      );
    },
  },
};

export const SelectedWithLabel: Story = {
  args: {
    label: 'Source User',
    selectedItem: mockUsers[0],
    renderSelected: (item: unknown) => {
      const user = asUser(item);
      return (
        <div className="flex items-center gap-2">
          <div>
            <div className="text-sm font-medium">
              {user.profile.firstName} {user.profile.lastName}
            </div>
            <div className="text-xs text-neutral-600">{user.profile.email}</div>
          </div>
        </div>
      );
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Source User',
  },
};
