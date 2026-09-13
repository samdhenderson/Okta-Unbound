import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
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
          'Replaces `GroupSelectionBar`, which laid ten buttons and an `N of M selected` readout ' +
          'out by hand on a `bg-neutral-50` card. That row could not overflow — it wrapped to ' +
          'three lines at 360px, giving *Cleanup* the same standing as *Compare* — and grey is ' +
          "the panel's inert wash, so a slab of controls above a white list read as switched " +
          'off.\n\n' +
          '**Two rows, because there were always two kinds of verb.** The strip declares a ' +
          'page-scoped action row and a selection-scoped `register`, and `ActionBar` renders the ' +
          'second as a recessed well one tonal step below the first — no border, no rule, no ' +
          'divider between them. *Export list* acts on the filter and is present in every state; ' +
          '*Export (3)* acts on the ticked rows and is gone the moment they are unticked. ' +
          'Sharing one row, those two were indistinguishable.\n\n' +
          '**The register shares its space, it does not stack.** It is passed unconditionally, so ' +
          'at rest it still holds *Select all (M)* and is still a row: ticking the first checkbox ' +
          'adds controls to a row that already exists and nothing below the band moves. A ' +
          'register that appeared on the first tick would push the list down under the pointer ' +
          'that was ticking it.\n\n' +
          '**Position one of the register is a safety property.** Every other control there ' +
          'appears and disappears with the selection size, so whatever sits first changes as you ' +
          'tick rows — and the first cut of this strip put its destructive verb there, under the ' +
          'pointer that had just been pressing *Select all*. It is *Deselect all* the moment ' +
          'anything is ' +
          'ticked and *Select all* when nothing is, both `pinned` (ADR-0051 §2, untouched by ' +
          'ADR-0061 and ADR-0068).\n\n' +
          '*Export (N)* sits behind **More** under ADR-0068 §2’s flat rule: an export ' +
          'descriptor forwards to the Export tab rather than producing a file in place, so it ' +
          'is never in the row. ADR-0039’s other reason for that tier — consequence — has no ' +
          'occupant since *Merge* was retired; the rule still governs where a future ' +
          'destructive verb starts.\n\n' +
          'Selection-scoped verbs are **omitted** below their threshold rather than shipped ' +
          'disabled: *Compare* appears for 2–5 selected, *Export (N)* above 0.\n\n' +
          '**Two controls are deliberately disabled instead, and each says why.** *Export list* ' +
          'acts on the filter, so at zero filtered rows it is a live verb with an empty result. ' +
          '*Select all (M)* stays visible and disabled at a full selection: it does not swap to ' +
          '*Deselect all* and it does not vanish, because a control that disappears at the ' +
          'boundary makes the boundary unreadable and `(M)` is the strip’s only statement of how ' +
          'many rows the filter matches. Both carry the reason in the button’s accessible ' +
          'description rather than restating the label.\n\n' +
          '**The blue button is still *Export list* (ADR-0068 §2, softened).** `primary` marks a ' +
          'verb that *acts* — opens a modal or performs the operation — and this rung has none: ' +
          'every verb that writes is selection-scoped. The softened rule admits an export as ' +
          '`primary` on exactly that rung, and only there; a refresh never qualifies, and every ' +
          'other export in the app is `tier`.\n\n' +
          '**The strip opens no inline panel, and writes nothing.** *Cross-search* and *Bulk ' +
          'actions* were its two ' +
          '`ghost` panel toggles and both have been retired, so every control here navigates, ' +
          'opens a modal, or performs an operation. The toggle rules themselves are asserted on ' +
          '`RulesListActionBar`, which is now the only strip with a panel to open.',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', { name: 'Selection actions for the groups list' });

    await expect(within(register).getAllByRole('button')).toHaveLength(1);
    await expect(within(register).getByRole('button', { name: 'Select all (42)' })).toBeEnabled();
    await expect(canvas.queryByRole('button', { name: 'Deselect all' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Compare/ })).not.toBeInTheDocument();
  },
};

export const FirstRegisterControlIsAlwaysSelection: Story = {
  args: { selectedCount: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', { name: 'Selection actions for the groups list' });

    const first = within(register).getAllByRole('button')[0];
    await expect(first).toHaveAccessibleName('Deselect all');
    await expect(canvas.getByRole('button', { name: 'Export (3)' })).toBeInTheDocument();
    await expect(
      within(register).queryByRole('button', { name: 'Export (3)' }),
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
    await expect(within(register).getByRole('button', { name: 'Select all (42)' })).toBeEnabled();
    await expect(within(register).getByRole('button', { name: 'Compare (3)' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Export (3)' })).toBeInTheDocument();
  },
};

export const LargeSelection: Story = {
  args: { selectedCount: 12 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /^Compare/ })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Export (12)' })).toBeInTheDocument();
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

    const selectAll = canvas.getByRole('button', { name: 'Select all (42)' });
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

    const selectAll = canvas.getByRole('button', { name: 'Select all (0)' });
    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription('No groups match the current filter');
  },
};
