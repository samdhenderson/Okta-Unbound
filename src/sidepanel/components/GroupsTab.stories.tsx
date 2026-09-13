import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupsTab from './GroupsTab';

const meta = {
  title: 'Groups/GroupsTab',
  component: GroupsTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Groups tab shell: browse, search, filter, and select Okta groups.\n\n' +
          'Orchestrates the search bar, filter panel, selection bar, and list, plus the ' +
          'export, comparison, source, and collections surfaces it opens. ' +
          'Starts in live-search mode; loading all groups switches to ' +
          'cached mode. With no connected Okta tab (`targetTabId` null) the API-backed ' +
          'actions are disabled.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), ' +
          '[Scheduler & messaging](?path=/docs/internals-scheduler-messaging--docs), ' +
          '[Shared utilities](?path=/docs/internals-shared-utilities--docs)',
      },
    },
  },
  argTypes: {
    targetTabId: {
      description:
        'Chrome tab id of the connected Okta tab; API/search actions are disabled when null.',
    },
    oktaOrigin: { description: 'Okta org origin used to build deep links to group admin pages.' },
    onNavigateToRule: { description: 'Deep-link to a rule in the Rules tab from a feeding rule.' },
    selectedGroupId: { description: 'Group id to scroll to and highlight (from the Rules tab).' },
    onGroupSelected: { description: 'Fired once the highlighted group has been shown.' },
  },
  args: {
    targetTabId: 42,
    oktaOrigin: 'https://example.okta.com',
    onNavigateToRule: fn(),
    onGroupSelected: fn(),
  },
} satisfies Meta<typeof GroupsTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disconnected: Story = {
  args: { targetTabId: null },
};
