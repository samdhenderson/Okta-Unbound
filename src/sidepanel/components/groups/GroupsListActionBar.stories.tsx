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
          'tick rows — and the first cut of this strip put *Merge* there, under the pointer that ' +
          'had just been pressing *Select all*. It is *Deselect all* the moment anything is ' +
          'ticked and *Select all* when nothing is, both `pinned` (ADR-0051 §2, untouched by ' +
          'ADR-0061 and ADR-0068).\n\n' +
          '*Merge* and *Bulk actions* start behind **More** on consequence (ADR-0039) — the ' +
          'first empties the source groups, the second deletes memberships across the selection. ' +
          '*Collections* and *Cleanup* are there on frequency alone. *Export (N)* is there under ' +
          'ADR-0068 §2’s flat rule: an export descriptor forwards to the Export tab rather than ' +
          'producing a file in place, so it is never in the row.\n\n' +
          'Selection-scoped verbs are **omitted** below their threshold rather than shipped ' +
          'disabled: *Compare* appears for 2–5 selected, *Export (N)* / *Merge* / *Bulk actions* ' +
          'above 0.\n\n' +
          '**Two controls are deliberately disabled instead, and each says why.** *Export list* ' +
          'acts on the filter, so at zero filtered rows it is a live verb with an empty result. ' +
          '*Select all (M)* stays visible and disabled at a full selection: it does not swap to ' +
          '*Deselect all* and it does not vanish, because a control that disappears at the ' +
          'boundary makes the boundary unreadable and `(M)` is the strip’s only statement of how ' +
          'many rows the filter matches. Both carry the reason in the button’s accessible ' +
          'description rather than restating the label.\n\n' +
          '**The blue button is still *Export list* (ADR-0068 §2, softened).** `primary` marks a ' +
          'verb that *acts* — opens a modal or performs the operation — and this rung has none: ' +
          'the panel toggles are read-only and every verb that writes is selection-scoped. The ' +
          'softened rule admits an export as `primary` on exactly that rung, and only there; a ' +
          'refresh never qualifies, and every other export in the app is `tier`.\n\n' +
          '**A panel toggle is not a verb.** *Cross-search*, *Collections*, *Cleanup* and *Bulk ' +
          'actions* are `ghost` — chromeless beside the bordered `secondary` of a verb — and ' +
          'state themselves in their **label** (*Cross-search (5)* → *Hide cross-search*), never ' +
          'in a colour, an `aria-pressed` or a `className` a descriptor may not carry. An open ' +
          "trigger keeps `priority: 'pinned'` explicitly, which is the half that matters for " +
          'safety: the control that closes a panel must never be the one hiding behind **More**.',
      },
    },
  },
  args: {
    selectedCount: 0,
    filteredCount: 42,
    activePanel: 'none',
    crossSearchBadge: 0,
    onSelectAll: fn(),
    onDeselectAll: fn(),
    onCompare: fn(),
    onMerge: fn(),
    onTogglePanel: fn(),
    onExportSelection: fn(),
    onExportGroupsList: fn(),
  },
  argTypes: {
    selectedCount: { description: 'Number of currently selected groups.' },
    filteredCount: { description: 'Number of groups after filtering.' },
    activePanel: {
      description:
        'Which inline panel is open; its trigger names the way back and is pinned into the row.',
    },
    crossSearchBadge: {
      description: 'Cached-members count — appended to the Cross-search label when above zero.',
    },
    onSelectAll: { description: 'Selects every filtered group.' },
    onDeselectAll: { description: 'Clears the selection.' },
    onCompare: { description: 'Opens the comparison modal (offered only for 2–5 selections).' },
    onMerge: { description: 'Opens the merge wizard (offered for 2+ selections).' },
    onTogglePanel: { description: 'Toggles the given inline panel open/closed.' },
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
    await expect(canvas.getByRole('button', { name: /^Merge/ })).toBeInTheDocument();
    await expect(
      within(register).queryByRole('button', { name: /^Merge/ }),
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
    await expect(canvas.getByRole('button', { name: 'Merge (12)' })).toBeInTheDocument();
  },
};

export const WithCachedCrossSearch: Story = {
  args: { selectedCount: 3, crossSearchBadge: 5 },
};

export const BulkPanelOpen: Story = {
  args: { selectedCount: 4, activePanel: 'bulk' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Hide bulk actions' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Bulk actions' })).not.toBeInTheDocument();
  },
};

export const TheOpenPanelSaysSo: Story = {
  args: { activePanel: 'crossSearch', crossSearchBadge: 5 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Hide cross-search' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Cross-search/ })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Export list' })).toBeInTheDocument();
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

export const CleanupPanelOpen: Story = {
  args: { activePanel: 'cleanup' },
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
