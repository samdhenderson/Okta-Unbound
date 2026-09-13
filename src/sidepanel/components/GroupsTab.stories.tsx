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
          'Groups tab shell: browse, search, filter, and select Okta groups. ' +
          'It starts in live-search mode and switches to cached mode once all groups are loaded. ' +
          'With no connected Okta tab (`targetTabId` null) every API-backed action is disabled.',
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
