import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import AppsListActionBar from './AppsListActionBar';
import AppsToolbar from './AppsToolbar';

const meta = {
  title: 'Apps/AppsListActionBar',
  component: AppsListActionBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The applications rung is read-only, so it has no page verbs at all — its `actions` ' +
          'array is empty by declaration, and `ActionBar` draws no row rather than a band of ' +
          'padding above nothing. It passes no selection `register` either: `Select all` and ' +
          '`Deselect all` are furniture, not verbs, and they live on `AppsListPanel`’s ' +
          '`ListCountRow` beside the figures they act on. A register with nothing in it would ' +
          'be a reserved row of padding, and there is no selection verb here for it to keep ' +
          'from popping into the band.\n\n' +
          'What is left is the search row as the band’s sub-row, so the controls and the list ' +
          'dock as one surface. No control here states a count: `AppsListPanel`’s ' +
          '`ListCountRow`, directly above the rows, is the rung’s one statement of how many ' +
          'matched and how many are ticked.',
      },
    },
  },
  argTypes: {
    search: {
      description: 'The rung’s search and filter disclosure, rendered as the band’s sub-row.',
    },
  },
} satisfies Meta<typeof AppsListActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const band = canvas.getByRole('group', { name: 'Actions for the applications list' });

    await expect(canvas.queryByTestId('action-bar-register')).not.toBeInTheDocument();
    await expect(within(band).queryAllByRole('button')).toHaveLength(0);
  },
};

export const WithSearch: Story = {
  args: {
    search: (
      <AppsToolbar
        searchQuery=""
        onSearchQueryChange={fn()}
        filtersOpen={false}
        onToggleFilters={fn()}
        activeFilterCount={0}
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const band = canvas.getByRole('group', { name: 'Actions for the applications list' });

    await expect(within(band).getByLabelText('Search applications')).toBeInTheDocument();
    await expect(within(band).getByRole('button', { name: 'Filters' })).toBeInTheDocument();

    await expect(canvas.queryByTestId('action-bar-register')).not.toBeInTheDocument();
    for (const name of ['Select all', 'Deselect all']) {
      await expect(canvas.queryByRole('button', { name })).not.toBeInTheDocument();
    }
  },
};
