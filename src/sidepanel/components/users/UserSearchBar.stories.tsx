import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import UserSearchBar from './UserSearchBar';

const meta = {
  title: 'Users/UserSearchBar',
  component: UserSearchBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Controlled search input for user search. The parent owns the query; the bar shows ' +
          'an inline spinner while a search is in flight and a clear button that both clears ' +
          'the query and refocuses the input.',
      },
    },
  },
  args: {
    searchQuery: '',
    onSearchChange: fn(),
    onClear: fn(),
    isSearching: false,
    showClearButton: false,
  },
  argTypes: {
    searchQuery: { description: 'Current search text (controlled).' },
    onSearchChange: { description: 'Called with the new query on every keystroke.' },
    onClear: { description: 'Clears the query; also refocuses the input.' },
    isSearching: { description: 'When true, shows the inline loading spinner.' },
    showClearButton: { description: 'When true, shows the clear (×) button.' },
    placeholder: {
      description: 'Placeholder text; defaults to a generic email/name/login hint.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithQuery: Story = {
  args: { searchQuery: 'jane.doe@example.com', showClearButton: true },
};

export const Searching: Story = {
  args: { searchQuery: 'jane', showClearButton: true, isSearching: true },
};

export const CustomPlaceholder: Story = {
  args: { placeholder: 'Find a user by employee ID...' },
};

const LiveUserSearchBar = () => {
  const [query, setQuery] = useState('');
  return (
    <>
      <UserSearchBar
        searchQuery={query}
        onSearchChange={setQuery}
        onClear={() => setQuery('')}
        isSearching={false}
        showClearButton={query.length > 0}
      />
      <p className="mt-2 text-xs text-neutral-600">
        {query ? `Searching for ${query}` : 'No query'}
      </p>
    </>
  );
};

export const TypeThenClear: Story = {
  render: () => <LiveUserSearchBar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox');

    await expect(canvas.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();

    await userEvent.type(field, 'jane');
    await expect(canvas.getByText('Searching for jane')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(field).toHaveValue('');
    await expect(field).toHaveFocus();
    await expect(canvas.getByText('No query')).toBeInTheDocument();
  },
};
