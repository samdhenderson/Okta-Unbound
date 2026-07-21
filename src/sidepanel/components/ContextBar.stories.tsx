import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ContextBar from './ContextBar';

const meta = {
  title: 'Components/ContextBar',
  component: ContextBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Slim, merged context header: entity identity + connection + refresh + pin.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), ' +
          '[Shared utilities](?path=/docs/internals-shared-utilities--docs)',
      },
    },
  },
  args: {
    pageType: 'group',
    entityName: 'Engineering Team',
    entityId: '00g1abcd2345EFGH6789',
    connectionStatus: 'connected',
    isLoading: false,
    error: null,
    isPinned: false,
    canPin: true,
    onTogglePin: fn(),
    onRefresh: fn(),
    onReconnect: fn(),
  },
} satisfies Meta<typeof ContextBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UserPage: Story = {
  args: {
    pageType: 'user',
    entityName: 'Jordan Rivera',
    entityId: '00u9zyxw8765MNOP4321',
  },
};

export const Pinned: Story = {
  args: { isPinned: true },
};

export const PinnedLiveChanged: Story = {
  args: { isPinned: true, liveContextChanged: true, liveEntityName: 'Finance Team' },
};

export const NotPinnable: Story = {
  args: {
    pageType: 'admin',
    entityName: undefined,
    entityId: undefined,
    canPin: false,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    connectionStatus: 'connecting',
    entityName: undefined,
    entityId: undefined,
    canPin: false,
  },
};

export const WithError: Story = {
  args: {
    entityName: undefined,
    entityId: undefined,
    error: 'Can’t reach the Okta tab — reload it to reconnect.',
    canPin: false,
  },
};
