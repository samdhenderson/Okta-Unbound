import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import UserSearchPanel from './UserSearchPanel';
import AlertMessage from '../shared/AlertMessage';
import { selectionStore } from '../../selection/selectionStore';
import { mockUsers } from '../../../test/mocks/fixtures';

const meta = {
  title: 'Users/UserSearchPanel',
  component: UserSearchPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Users tab\'s "find a user" surface: the search box, the detected-user banner, the ' +
          'search results and the pre-search empty state. The debounced query, the banner and the ' +
          'results belong to `useUsersTabState`, so this panel renders without touching Okta, and ' +
          "the `alerts` slot carries the tab's banners between the box and the results.\n\n" +
          "The panel owns this rung's tie to the selection basket (`useRungSelection`), which backs " +
          'the checkbox column. A search returns at most twenty rows, so a cohort is assembled ' +
          'across searches: nothing clears the basket when a new query replaces the rows, and the ' +
          'readout counts the basket rather than the ticked rows on screen.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <Story />
      </div>
    ),
  ],
  args: {
    searchQuery: '',
    onSearchQueryChange: fn(),
    onClearSearch: fn(),
    isSearching: false,
    searchResults: [],
    resultsTruncated: false,
    onSelectUser: fn(),
    hasSelectedUser: false,
    hasError: false,
  },
  argTypes: {
    searchQuery: { description: 'Current search box value.' },
    resultsTruncated: {
      description:
        'Whether Okta held matches back from `searchResults`; forwarded to the results list so one capped page is never rendered as a total.',
    },
    onSearchQueryChange: {
      description: "Invoked on every keystroke; the caller's debounce decides when to search.",
    },
    onClearSearch: {
      description: "Clears the search, selection and banners (the search box's clear button).",
    },
    isSearching: { description: 'True while a debounced search is in flight.' },
    searchResults: {
      description: 'Latest committed search results; an empty array renders no results block.',
    },
    onSelectUser: { description: 'Invoked with the chosen user when a result row is clicked.' },
    hasSelectedUser: {
      description: 'Whether a user is selected — hides the results and the empty state.',
    },
    hasError: { description: 'Whether the tab is showing an error — suppresses the empty state.' },
    alerts: {
      description:
        "The tab's merged error / result banners, rendered between the search box and the results.",
    },
  },
} satisfies Meta<typeof UserSearchPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Searching: Story = {
  args: { searchQuery: 'ada', isSearching: true },
};

export const WithResults: Story = {
  args: { searchQuery: 'ada', searchResults: mockUsers.slice(10, 14) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'View user details', description: /First11 Last11/ }),
    );
    await expect(args.onSelectUser).toHaveBeenCalledWith(mockUsers[10]);
  },
};

export const WithError: Story = {
  args: {
    searchQuery: 'ada',
    hasError: true,
    alerts: <AlertMessage message={{ text: 'Failed to search users', type: 'danger' }} />,
  },
};

export const UserSelected: Story = {
  args: { hasSelectedUser: true, searchResults: mockUsers.slice(10, 14) },
};

export const Compact360: Story = {
  args: {
    searchQuery: 'ada',
    searchResults: mockUsers.slice(10, 14),
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const SelectionCarriedAcrossSearches: Story = {
  args: { searchQuery: 'first1', searchResults: mockUsers.slice(10, 14) },
  beforeEach: () => {
    selectionStore.clearAll();
    selectionStore.toggle({ kind: 'user', id: 'user11', name: 'First11 Last11' });
    selectionStore.toggle({ kind: 'user', id: '00uFAKE0002', name: 'Dana Example' });
    selectionStore.toggle({ kind: 'user', id: '00uFAKE0003', name: 'Rowan Example' });
    return () => selectionStore.clearAll();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3 users selected')).toBeInTheDocument();
    await expect(canvas.getByRole('checkbox', { name: 'Select First11 Last11' })).toBeChecked();
  },
};

export const NoMatchesWithACohortHeld: Story = {
  args: { searchQuery: 'nobody', searchResults: [] },
  beforeEach: () => {
    selectionStore.clearAll();
    selectionStore.toggle({ kind: 'user', id: '00uFAKE0001', name: 'Dana Example' });
    return () => selectionStore.clearAll();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('1 user selected')).toBeInTheDocument();
  },
};

export const TickingAResult: Story = {
  args: { searchQuery: 'first1', searchResults: mockUsers.slice(10, 13) },
  beforeEach: () => {
    selectionStore.clearAll();
    return () => selectionStore.clearAll();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/selected/)).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select First11 Last11' }));

    await expect(canvas.getByText('1 user selected')).toBeInTheDocument();
  },
};
