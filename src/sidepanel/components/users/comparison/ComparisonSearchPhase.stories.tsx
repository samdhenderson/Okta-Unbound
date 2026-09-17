import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ComparisonSearchPhase from './ComparisonSearchPhase';
import { mockUsers } from '../../../../test/mocks/fixtures';

const contextUser = mockUsers[0];

const meta = {
  title: 'Users/Comparison/ComparisonSearchPhase',
  component: ComparisonSearchPhase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Phase 1 of the comparison modal: a controlled search box and its matching results, ' +
          'with the context user filtered out so nobody can compare with themselves. It shows ' +
          'a "Searching directory…" indicator while a search is in flight and an empty state ' +
          'when a query returns no matches. Fully prop-driven; the parent hook owns the search.',
      },
    },
  },
  args: {
    contextUser,
    searchQuery: '',
    setSearchQuery: fn(),
    isSearching: false,
    searchResults: [],
    resultsTruncated: false,
    onSelectUser: fn(),
  },
  argTypes: {
    resultsTruncated: {
      description:
        'Whether Okta held matches back from `searchResults`. It describes the page the search returned, so filtering the context user out of it does not change the answer.',
    },
    contextUser: {
      description:
        "The context user; excluded from results so users can't compare with themselves.",
    },
    searchQuery: { description: 'Current search text (controlled).' },
    setSearchQuery: { description: 'Updates the search text.' },
    isSearching: { description: 'When true, shows the "Searching directory…" indicator.' },
    searchResults: {
      description: 'Raw search results; the context user is filtered out before rendering.',
    },
    onSelectUser: { description: 'Invoked with the chosen user to enter the comparison phase.' },
  },
} satisfies Meta<typeof ComparisonSearchPhase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Searching: Story = {
  args: { searchQuery: 'smith', isSearching: true },
};

export const WithResults: Story = {
  args: {
    searchQuery: 'user',
    searchResults: mockUsers.slice(0, 8),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText('First1 Last1')).toBeNull();
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Compare with this user',
        description: /First2 Last2/,
      }),
    );
    await expect(args.onSelectUser).toHaveBeenCalledWith(mockUsers[1]);
  },
};

export const Empty: Story = {
  args: {
    searchQuery: 'zzzznomatch',
    searchResults: [],
  },
};
