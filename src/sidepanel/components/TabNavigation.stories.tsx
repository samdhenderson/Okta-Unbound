import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import TabNavigation from './TabNavigation';

const meta = {
  title: 'Sidepanel/TabNavigation',
  component: TabNavigation,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Sticky top tab bar for switching between the side panel's main views.\n\n" +
          'Renders the Overview / Users / Groups / Rules / Export / History tabs and highlights the active one with an underline. Selection is reported via `onTabChange`; which tab is active is owned by the caller.',
      },
    },
  },
  argTypes: {
    activeTab: {
      description: 'Currently selected tab, rendered with the active styling and underline.',
    },
    onTabChange: { description: 'Called with the chosen tab id when a tab is clicked.' },
  },
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
