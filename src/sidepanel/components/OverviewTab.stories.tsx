import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import OverviewTab from './OverviewTab';

const meta = {
  title: 'Overview/OverviewTab',
  component: OverviewTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Context-aware landing tab that adapts to the detected Okta page.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs)',
      },
    },
  },
  args: {
    onTabChange: fn(),
    pageType: 'admin',
    groupInfo: null,
    userInfo: null,
    connectionStatus: 'connected',
    targetTabId: 1,
    error: null,
    isLoading: false,
    oktaOrigin: 'https://example.okta.com',
    onRetry: fn(),
    onViewAllGroups: fn(),
  },
} satisfies Meta<typeof OverviewTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WaitingForContext: Story = {};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Disconnected: Story = {
  args: {
    connectionStatus: 'error',
    error: 'Please open an Okta admin page in this window',
  },
};
