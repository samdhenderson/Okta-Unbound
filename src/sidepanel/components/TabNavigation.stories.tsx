import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import TabNavigation from './TabNavigation';

const meta = {
  title: 'Sidepanel/TabNavigation',
  component: TabNavigation,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    activeTab: 'overview',
    onTabChange: fn(),
  },
} satisfies Meta<typeof TabNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UsersActive: Story = {
  args: { activeTab: 'users' },
};

export const GroupsActive: Story = {
  args: { activeTab: 'groups' },
};

export const RulesActive: Story = {
  args: { activeTab: 'rules' },
};

export const HistoryActive: Story = {
  args: { activeTab: 'history' },
};
