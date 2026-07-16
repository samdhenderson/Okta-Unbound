import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import CopyMembersModal from './CopyMembersModal';
import { mockUsers } from '../../../../test/mocks/handlers';

const meta = {
  title: 'Overview/Members/CopyMembersModal',
  component: CopyMembersModal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    isOpen: true,
    onClose: fn(),
    members: mockUsers.slice(0, 20),
  },
} satisfies Meta<typeof CopyMembersModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongList: Story = {
  args: { members: mockUsers },
};

export const Empty: Story = {
  args: { members: [] },
};

export const Closed: Story = {
  args: { isOpen: false },
};
