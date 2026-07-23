import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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
          'Users tab: search users and analyse their group memberships.\n\n' +
          'The tab shell that composes the search bar, results, detected-user banner, profile card, membership list, and the lifecycle/add-to-group/comparison modals. Search results and the selected user come from live Okta search via the scheduler path, so with no query the shell starts empty; when no Okta tab is connected, search and lifecycle actions are unavailable.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), [Scheduler & messaging](?path=/docs/internals-scheduler-messaging--docs)',
      },
    },
  },
  args: {
    targetTabId: 1,
    currentGroupId: undefined,
    onNavigateToRule: fn(),
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
    onNavigateToRule: {
      description: 'Navigates to the Rules tab and deep-links to the rule that added a membership.',
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
