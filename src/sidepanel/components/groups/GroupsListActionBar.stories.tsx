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
          "register, rendered as the band's last row on the band's own surface. *Export list* " +
          'acts on the filter and is present in every state; *Export* acts on the ticked rows ' +
          'and is gone the moment they are unticked.\n\n' +
          '`Select all` and `Deselect all` are **not here**. They are furniture rather than ' +
          "verbs, and they live on the rung's count row (`shared/ListCountRow`, rendered by " +
          '`GroupsListPanel`) beside the numbers they act on. What is left in the register acts ' +
          'on the selection: *Compare* in the row, *Export* in the tier.\n\n' +
          'The register is still passed in every state, empty included, so ticking a row adds ' +
          'controls to a row that already exists and nothing below the band moves. Its leading ' +
          "control is never the export: the register's contents change as rows are ticked, so " +
          'whatever leads it must cost at worst another click.',
      },
    },
  },
  args: {
    selectedCount: 0,
    filteredCount: 42,
    onCompare: fn(),
    onExportSelection: fn(),
    onExportGroupsList: fn(),
  },
  argTypes: {
    selectedCount: { description: 'Number of currently selected groups.' },
    filteredCount: { description: 'Number of groups after filtering.' },
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

    await expect(within(register).queryAllByRole('button')).toHaveLength(0);
    await expect(canvas.queryByRole('button', { name: 'Select all' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Deselect all' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Compare/ })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Export list' }));
    await expect(args.onExportGroupsList).toHaveBeenCalledTimes(1);
  },
};

export const FirstRegisterControlNeverLeavesTheRung: Story = {
  args: { selectedCount: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', { name: 'Selection actions for the groups list' });

    const first = within(register).getAllByRole('button')[0];
    await expect(first).toHaveAccessibleName('Compare');
    await expect(canvas.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    await expect(
      within(register).queryByRole('button', { name: 'Export' }),
    ).not.toBeInTheDocument();
  },
};

export const WithSelection: Story = {
  args: { selectedCount: 3 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', { name: 'Selection actions for the groups list' });

    await expect(
      within(register)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Compare']);

    const compare = canvas.getByRole('button', { name: 'Compare' });
    await expect(compare).toHaveAccessibleDescription('Compare the 3 selected groups');
    await expect(canvas.getByRole('button', { name: 'Export' })).toHaveAccessibleDescription(
      'Export the 3 selected groups',
    );

    await userEvent.click(compare);
    await expect(args.onCompare).toHaveBeenCalledTimes(1);
  },
};

export const LargeSelection: Story = {
  args: { selectedCount: 12 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', { name: 'Selection actions for the groups list' });

    await expect(canvas.queryByRole('button', { name: /^Compare/ })).not.toBeInTheDocument();
    await expect(within(register).queryAllByRole('button')).toHaveLength(0);
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

export const NoFilteredGroups: Story = {
  args: { filteredCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const exportList = canvas.getByRole('button', { name: 'Export list' });
    await expect(exportList).toBeDisabled();
    await expect(exportList).toHaveAccessibleDescription(
      'No groups match the current filter, so there is nothing to export',
    );
  },
};
