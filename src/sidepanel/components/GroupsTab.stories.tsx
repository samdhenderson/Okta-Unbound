import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupsTab from './GroupsTab';

const meta = {
  title: 'Components/GroupsTab',
  component: GroupsTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Groups tab shell: browse, search, filter, and bulk-manage Okta groups.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), ' +
          '[Scheduler & messaging](?path=/docs/internals-scheduler-messaging--docs), ' +
          '[Shared utilities](?path=/docs/internals-shared-utilities--docs)',
      },
    },
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
