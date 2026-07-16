import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import SelectionChips from './SelectionChips';
import type { OktaUser } from '../../../shared/types';
import { mockUsers } from '../../../test/mocks/handlers';

const asUser = (item: unknown) => item as OktaUser;

const meta = {
  title: 'Shared/SelectionChips',
  component: SelectionChips,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    items: [],
    getKey: (item: unknown) => asUser(item).id,
    getLabel: (item: unknown) => {
      const user = asUser(item);
      return `${user.profile.firstName} ${user.profile.lastName}`;
    },
    onRemove: fn(),
  },
} satisfies Meta<typeof SelectionChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const EmptyWithMessage: Story = {
  args: {
    emptyMessage: 'No users assigned',
  },
};

export const SingleItem: Story = {
  args: {
    items: [mockUsers[0]],
  },
};

export const MultipleItems: Story = {
  args: {
    items: mockUsers.slice(0, 3),
  },
};

export const WithClearAll: Story = {
  args: {
    items: mockUsers.slice(0, 5),
    onClearAll: fn(),
  },
};

export const SingleNoHiddenClearAll: Story = {
  args: {
    items: [mockUsers[0]],
    onClearAll: fn(),
  },
};

export const ManyItems: Story = {
  args: {
    items: mockUsers.slice(0, 10),
    onClearAll: fn(),
  },
};
