import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GroupSearchBar from './GroupSearchBar';

const meta = {
  title: 'Groups/GroupSearchBar',
  component: GroupSearchBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The groups search input row. It binds to a different query depending on the search mode: `live` queries Okta directly and shows a trailing spinner while a request is in flight, while `cached` filters the already-loaded list client-side.',
      },
    },
  },
  argTypes: {
    searchMode: {
      description: '`live` queries Okta directly; `cached` filters the loaded list.',
    },
    liveSearchQuery: { description: 'Query bound in live mode.' },
    onLiveSearchQueryChange: { description: 'Fired as the live-mode query changes.' },
    searchQuery: { description: 'Query bound in cached mode.' },
    onSearchQueryChange: { description: 'Fired as the cached-mode query changes.' },
    isLiveSearching: {
      description: 'Whether a live search is in flight (shows the trailing spinner).',
    },
  },
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

const SearchHarness = (args: React.ComponentProps<typeof GroupSearchBar>) => {
  const [cached, setCached] = useState('');
  const [live, setLive] = useState('');
  return (
    <div style={{ width: 360 }}>
      <GroupSearchBar
        {...args}
        searchQuery={cached}
        onSearchQueryChange={setCached}
        liveSearchQuery={live}
        onLiveSearchQueryChange={setLive}
      />
    </div>
  );
};

export const TypingACachedQuery: Story = {
  render: (args) => <SearchHarness {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Filter loaded groups' });
    await userEvent.type(field, 'engineering');
    await expect(field).toHaveValue('engineering');
  },
};

export const TypingALiveQuery: Story = {
  args: { searchMode: 'live' },
  render: (args) => <SearchHarness {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Search all groups in Okta' });
    await userEvent.type(field, 'admins');
    await expect(field).toHaveValue('admins');
  },
};
