import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import AppsListActionBar from './AppsListActionBar';
import Input from '../shared/Input';
import Icon from '../shared/Icon';

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
          'padding above nothing. What is left is the search as the sub-row and the selection ' +
          'furniture in the register, ranged right.\n\n' +
          'No control here states a count. `AppsListPanel`’s `ListCountLine`, directly above the ' +
          'rows, is the rung’s one statement of how many matched and how many are ticked; what a ' +
          'control would take is named in its `title`, which is also its accessible description.',
      },
    },
  },
  args: {
    selectedCount: 0,
    filteredCount: 42,
    allFilteredSelected: false,
    onSelectAll: fn(),
    onDeselectAll: fn(),
  },
  argTypes: {
    search: { description: 'The rung’s search, filters and sort, rendered as the band’s sub-row.' },
    selectedCount: {
      description: 'How many apps are in the basket, including picks made elsewhere.',
    },
    filteredCount: { description: 'How many apps the search and filters match.' },
    allFilteredSelected: {
      description: 'Whether every filtered app is already picked — passed, never derived.',
    },
    onSelectAll: { description: 'Replaces the app selection with every filtered app.' },
    onDeselectAll: { description: 'Empties the app partition.' },
  },
} satisfies Meta<typeof AppsListActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', {
      name: 'Selection actions for the applications list',
    });

    await expect(within(register).getAllByRole('button')).toHaveLength(1);
    await expect(within(register).getByRole('button', { name: 'Select all' })).toBeEnabled();
    await expect(canvas.queryByRole('button', { name: 'Deselect all' })).not.toBeInTheDocument();

    await userEvent.click(within(register).getByRole('button', { name: 'Select all' }));
    await expect(args.onSelectAll).toHaveBeenCalledTimes(1);
  },
};

export const NoActionRowIsDrawn: Story = {
  args: { selectedCount: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const band = canvas.getByTestId('apps-list-action-bar');
    const register = canvas.getByTestId('action-bar-register');

    await expect(band.children[0]).toBe(register);
    await expect(within(register).getAllByRole('button').length).toBeGreaterThan(0);
    await expect(canvas.getAllByRole('button')).toHaveLength(
      within(register).getAllByRole('button').length,
    );
  },
};

export const WithSelection: Story = {
  args: { selectedCount: 3 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', {
      name: 'Selection actions for the applications list',
    });

    await expect(within(register).getAllByRole('button')[0]).toHaveAccessibleName('Deselect all');
    await expect(within(register).getByRole('button', { name: 'Select all' })).toBeEnabled();

    await userEvent.click(within(register).getByRole('button', { name: 'Deselect all' }));
    await expect(args.onDeselectAll).toHaveBeenCalledTimes(1);
  },
};

export const AllSelected: Story = {
  args: { selectedCount: 42, allFilteredSelected: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole('button', { name: 'Select all' });

    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription(
      'All 42 apps matching the current search and filters are already selected',
    );
    await expect(canvas.getByRole('button', { name: 'Deselect all' })).toBeEnabled();
  },
};

export const NoFilteredApps: Story = {
  args: { filteredCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole('button', { name: 'Select all' });

    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription(
      'No applications match the current search and filters',
    );
  },
};

export const WithSearch: Story = {
  args: {
    selectedCount: 2,
    search: (
      <Input
        type="search"
        value=""
        onChange={fn()}
        ariaLabel="Search applications"
        placeholder="Search..."
        icon={<Icon type="search" size="md" />}
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const band = canvas.getByTestId('apps-list-action-bar');
    await expect(within(band).getByLabelText('Search applications')).toBeInTheDocument();
  },
};
