import type { Meta, StoryObj } from '@storybook/react-vite';
import UsersTab from './UsersTab';

const meta = {
  title: 'Users/UsersTab',
  component: UsersTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'The tab shell composing the user search bar, results, detected-user banner, profile ' +
          'card, membership list, and the lifecycle/add-to-group/comparison modals. Results come ' +
          'from live Okta search, so with no query the shell starts empty and with no connected ' +
          'tab search and lifecycle actions are unavailable.',
      },
    },
  },
  args: {
    targetTabId: 1,
    currentGroupId: undefined,
  },
  argTypes: {
    targetTabId: {
      description:
        'Chrome tab id of the connected Okta tab; required for all user/group API calls.',
    },
    currentGroupId: {
      description:
        'Id of the currently detected group; highlights that group in the membership list.',
    },
    selectedUserId: {
      description:
        'One-shot request to open a specific user (e.g. from the Overview\'s "View all groups").',
    },
    onUserSelected: {
      description: 'Invoked once `selectedUserId` has been consumed.',
    },
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
