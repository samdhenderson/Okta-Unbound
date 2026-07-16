import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import UserSearchResults from './UserSearchResults';
import { mockUsers } from '../../../test/mocks/handlers';

const meta = {
  title: 'Users/UserSearchResults',
  component: UserSearchResults,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    results: mockUsers.slice(10, 15),
    onSelectUser: fn(),
  },
} satisfies Meta<typeof UserSearchResults>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleResult: Story = {
  args: { results: mockUsers.slice(10, 11) },
};

export const MixedStatuses: Story = {
  args: { results: [mockUsers[0], mockUsers[6], mockUsers[15]] },
};

export const Empty: Story = {
  args: { results: [] },
};

export const ManyResults: Story = {
  args: { results: mockUsers.slice(0, 25) },
};
