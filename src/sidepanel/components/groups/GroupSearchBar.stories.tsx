import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupSearchBar from './GroupSearchBar';

const meta = {
  title: 'Groups/GroupSearchBar',
  component: GroupSearchBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    searchMode: 'cached',
    liveSearchQuery: '',
    onLiveSearchQueryChange: fn(),
    searchQuery: '',
    onSearchQueryChange: fn(),
    isLiveSearching: false,
  },
} satisfies Meta<typeof GroupSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 360 }}>
      <GroupSearchBar {...args} />
    </div>
  ),
};

export const CachedWithQuery: Story = {
  args: { searchQuery: 'engineering' },
  render: Default.render,
};

export const LiveMode: Story = {
  args: { searchMode: 'live' },
  render: Default.render,
};

export const LiveSearching: Story = {
  args: { searchMode: 'live', liveSearchQuery: 'admins', isLiveSearching: true },
  render: Default.render,
};
