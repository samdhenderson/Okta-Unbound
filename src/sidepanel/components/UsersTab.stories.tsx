import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import UsersTab from './UsersTab';

const meta = {
  title: 'Components/UsersTab',
  component: UsersTab,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    targetTabId: 1,
    currentGroupId: undefined,
    onNavigateToRule: fn(),
  },
} satisfies Meta<typeof UsersTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disconnected: Story = {
  args: { targetTabId: undefined },
};

export const WithCurrentGroup: Story = {
  args: { currentGroupId: 'group123' },
};
