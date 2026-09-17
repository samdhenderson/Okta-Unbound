import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GroupsListActionBar from './GroupsListActionBar';

const meta = {
  title: 'Groups/GroupsListActionBar',
  component: GroupsListActionBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The groups-list rung's action bar: a page-scoped action row and a selection-scoped " +
          'register, which `ActionBar` renders as a recessed well one tonal step below the row. ' +
          '*Export list* acts on the filter and is present in every state; *Export* acts on ' +
          'the ticked rows and is gone the moment they are unticked.\n\n' +
          'The register is passed unconditionally, so ticking a row adds controls to a row that ' +
          'already exists and nothing below the band moves. Its first control is always the ' +
          'selection toggle, never a verb that writes. Selection-scoped verbs are omitted below ' +
          'their threshold rather than shipped disabled; *Export list* and *Select all* are ' +
          'the two that stay disabled instead, each carrying its reason in its accessible ' +
          'description.',
      },
    },
  },
  args: {
    selectedCount: 0,
    filteredCount: 42,
    onSelectAll: fn(),
    onDeselectAll: fn(),
    onCompare: fn(),
    onExportSelection: fn(),
    onExportGroupsList: fn(),
  },
  argTypes: {
    selectedCount: { description: 'Number of currently selected groups.' },
    filteredCount: { description: 'Number of groups after filtering.' },
    onSelectAll: { description: 'Selects every filtered group.' },
    onDeselectAll: { description: 'Clears the selection.' },
    onCompare: { description: 'Opens the comparison modal (offered only for 2–5 selections).' },
    onExportSelection: { description: 'Exports the selected groups.' },
    onExportGroupsList: { description: 'Exports the current (filtered) groups list.' },
  },
} satisfies Meta<typeof GroupsListActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', { name: 'Selection actions for the groups list' });

    await expect(within(register).getAllByRole('button')).toHaveLength(1);
    await expect(within(register).getByRole('button', { name: 'Select all' })).toBeEnabled();
    await expect(canvas.queryByRole('button', { name: 'Deselect all' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Compare/ })).not.toBeInTheDocument();

    await userEvent.click(within(register).getByRole('button', { name: 'Select all' }));
    await expect(args.onSelectAll).toHaveBeenCalledTimes(1);
  },
};

export const FirstRegisterControlIsAlwaysSelection: Story = {
  args: { selectedCount: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', { name: 'Selection actions for the groups list' });

    const first = within(register).getAllByRole('button')[0];
    await expect(first).toHaveAccessibleName('Deselect all');
    await expect(canvas.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    await expect(
      within(register).queryByRole('button', { name: 'Export' }),
    ).not.toBeInTheDocument();
  },
};

export const WithSelection: Story = {
  args: { selectedCount: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', { name: 'Selection actions for the groups list' });

    const first = within(register).getAllByRole('button')[0];
    await expect(first).toHaveAccessibleName('Deselect all');
    await expect(within(register).getByRole('button', { name: 'Select all' })).toBeEnabled();
    await expect(within(register).getByRole('button', { name: 'Compare' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  },
};

export const LargeSelection: Story = {
  args: { selectedCount: 12 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /^Compare/ })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  },
};

export const ExportListIsTheRungsPrimary: Story = {
  args: { selectedCount: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const exportList = canvas.getByRole('button', { name: 'Export list' });
    await expect(exportList).toBeEnabled();

    const register = canvas.getByRole('group', { name: 'Selection actions for the groups list' });
    await expect(
      within(register).queryByRole('button', { name: 'Export list' }),
    ).not.toBeInTheDocument();
  },
};

export const AllSelected: Story = {
  args: { selectedCount: 42 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', { name: 'Selection actions for the groups list' });
    await expect(within(register).getAllByRole('button')[0]).toHaveAccessibleName('Deselect all');

    const selectAll = canvas.getByRole('button', { name: 'Select all' });
    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription(
      'All 42 groups matching the filter are already selected',
    );
    await expect(canvas.getByRole('button', { name: 'Deselect all' })).toBeEnabled();
  },
};

export const NoFilteredGroups: Story = {
  args: { filteredCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const exportList = canvas.getByRole('button', { name: 'Export list' });
    await expect(exportList).toBeDisabled();
    await expect(exportList).toHaveAccessibleDescription(
      'No groups match the current filter, so there is nothing to export',
    );

    const selectAll = canvas.getByRole('button', { name: 'Select all' });
    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription('No groups match the current filter');
  },
};
