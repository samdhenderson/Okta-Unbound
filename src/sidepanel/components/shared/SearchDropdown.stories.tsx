import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import SearchDropdown from './SearchDropdown';
import Modal from './Modal';
import type { OktaUser } from '../../../shared/types';
import { mockUsers } from '../../../test/mocks/fixtures';

const asUser = (item: unknown) => item as OktaUser;

const meta = {
  title: 'Shared/SearchDropdown',
  component: SearchDropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Generic search input with a live results dropdown and a selected-item summary ' +
          'state. Fully controlled: the caller owns the query, the in-flight flag, and the ' +
          'results array — `renderResult` / `renderSelected` project each item to UI.',
      },
    },
  },
  argTypes: {
    placeholder: { description: 'Placeholder text for the search input.' },
    query: { description: 'Controlled query text.' },
    onQueryChange: { description: 'Called with the new query on each keystroke.' },
    isSearching: { description: 'When true, shows a spinner in the field (search in flight).' },
    results: { description: 'Result items to render in the dropdown.' },
    showDropdown: {
      description: 'Whether the results dropdown is visible (also requires non-empty `results`).',
    },
    onSelect: { description: 'Called when a result is clicked.' },
    renderResult: { description: 'Renders a single result row.' },
    selectedItem: {
      description:
        'Currently selected item; when set (with `renderSelected`) the picker shows its summary state instead of the input.',
    },
    renderSelected: {
      description: 'Renders the selected item’s summary; required to show the selected state.',
    },
    onClear: {
      description: 'Clears the query or selection; renders the clear affordance when provided.',
    },
    disabled: { description: 'Disables the input.' },
    label: { description: 'Optional field label.' },
    hint: { description: 'Optional helper text below the field.' },
    getKey: { description: 'Stable React key for a result; defaults to the array index.' },
    error: { description: 'Inline danger alert for a failed search, shown under the field.' },
  },
  args: {
    placeholder: 'Search users...',
    query: '',
    onQueryChange: fn(),
    isSearching: false,
    results: [],
    showDropdown: false,
    onSelect: fn(),
    onClear: fn(),
    renderResult: (item: unknown) => {
      const user = asUser(item);
      return (
        <div>
          <div className="font-medium text-sm">
            {user.profile.firstName} {user.profile.lastName}
          </div>
          <div className="text-xs text-neutral-500">{user.profile.email}</div>
        </div>
      );
    },
  },
} satisfies Meta<typeof SearchDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Source User',
    hint: 'Search by name or email',
  },
};

export const Searching: Story = {
  args: {
    query: 'john',
    isSearching: true,
  },
};

export const WithResults: Story = {
  args: {
    query: 'john',
    showDropdown: true,
    results: mockUsers.slice(0, 5),
  },
};

export const ManyResults: Story = {
  args: {
    query: 'a',
    showDropdown: true,
    results: mockUsers,
  },
};

export const SearchError: Story = {
  args: {
    query: 'john',
    error: 'Search failed: the Okta tab is no longer signed in.',
  },
};

export const InsideModal: Story = {
  args: {
    label: 'Search for a user',
    query: 'john',
    showDropdown: true,
    results: mockUsers.slice(0, 6),
  },
  render: (args) => (
    <div className="w-[400px]">
      <Modal isOpen onClose={fn()} title="Add member to Engineering">
        <SearchDropdown {...args} />
      </Modal>
    </div>
  ),
};

export const WithQuery: Story = {
  args: {
    query: 'jane',
    showDropdown: false,
    results: [],
  },
};

export const Selected: Story = {
  args: {
    selectedItem: mockUsers[0],
    renderSelected: (item: unknown) => {
      const user = asUser(item);
      return (
        <div className="flex items-center gap-2">
          <div>
            <div className="text-sm font-medium">
              {user.profile.firstName} {user.profile.lastName}
            </div>
            <div className="text-xs text-neutral-600">{user.profile.email}</div>
          </div>
        </div>
      );
    },
  },
};

export const SelectedWithLabel: Story = {
  args: {
    label: 'Source User',
    selectedItem: mockUsers[0],
    renderSelected: (item: unknown) => {
      const user = asUser(item);
      return (
        <div className="flex items-center gap-2">
          <div>
            <div className="text-sm font-medium">
              {user.profile.firstName} {user.profile.lastName}
            </div>
            <div className="text-xs text-neutral-600">{user.profile.email}</div>
          </div>
        </div>
      );
    },
  },
};

export const Interactive: Story = {
  render: function InteractiveSearch(args) {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<OktaUser | null>(null);
    const results = query
      ? mockUsers.filter((user) => user.profile.email.includes(query.toLowerCase())).slice(0, 5)
      : [];

    return (
      <div className="w-[360px]">
        <SearchDropdown
          {...args}
          label="Source user"
          query={query}
          onQueryChange={setQuery}
          results={results}
          showDropdown={results.length > 0}
          onSelect={(item) => {
            setSelected(asUser(item));
            setQuery('');
          }}
          selectedItem={selected ?? undefined}
          renderSelected={(item) => <div className="text-sm">{asUser(item).profile.email}</div>}
          onClear={() => {
            setSelected(null);
            setQuery('');
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('textbox'), 'user12@');
    const hit = await canvas.findByText('user12@example.com');
    await userEvent.click(hit);

    await expect(canvas.getByRole('button', { name: 'Clear selection' })).toBeInTheDocument();
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }));
    await expect(canvas.getByRole('textbox')).toHaveValue('');
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Source User',
  },
};
