import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import RulesListActionBar from './RulesListActionBar';
import RulesSearchRow from './RulesSearchRow';

const meta = {
  title: 'Rules/RulesListActionBar',
  component: RulesListActionBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Rules rung was the last major list rung with no `ActionBar`. It stacked four ' +
          'always-on cards between the header and the first rule, then a toolbar card, then the ' +
          'list — and nothing docked, so all of it scrolled away together. The three analysis ' +
          'cards are now panels this strip toggles, the search field is its `subRow`, and the ' +
          'filter chips live behind that field.\n\n' +
          '**Where `primary` goes (ADR-0061).** ADR-0051 spends `primary` on which inline panel ' +
          'is open, reasoning that a list rung has no page-level verb. This rung is the ' +
          'counter-example: rules do not load on mount, so **Load rules** / **Refresh** is the ' +
          'one thing that has to happen before the rung means anything. It takes `primary` here, ' +
          'and the open panel states itself in its own **label** (`Duplicates (3)` → `Hide ' +
          'duplicates`) rather than in a colour a screen reader cannot read.\n\n' +
          '**All three panel toggles start behind More**, on frequency — the bounded second ' +
          'reason ADR-0051 §2 allows, which may move a verb down but never up. Nothing on this ' +
          'strip fails the consequence test.\n\n' +
          '**No verb without an object.** No duplicate clusters, no *Duplicates*; no loaded ' +
          'rules, no *Stats*. *This group* is the careful case: its object is the **detected ' +
          'group**, not the relation count, because "no loaded rule assigns users to this group" ' +
          'is the most interesting answer the panel gives — so the verb appears whenever a group ' +
          'is in context, and the count rides the label only when there is one.',
      },
    },
  },
  args: {
    hasRules: true,
    isLoading: false,
    onLoad: fn(),
    duplicateClusterCount: 3,
    hasCurrentGroup: true,
    currentGroupRelationCount: 2,
    activePanel: 'none',
    onTogglePanel: fn(),
    onExportRules: fn(),
    search: (
      <RulesSearchRow
        searchQuery=""
        onSearchChange={fn()}
        filtersOpen={false}
        onToggleFilters={fn()}
        activeFilterCount={0}
      />
    ),
  },
  argTypes: {
    hasRules: { description: 'Whether any rules are loaded — decides Load rules vs Refresh.' },
    isLoading: { description: 'Whether a load is in flight.' },
    onLoad: { description: 'Loads (or reloads) the rules.' },
    duplicateClusterCount: { description: 'Duplicate-condition clusters found. 0 omits the verb.' },
    hasCurrentGroup: { description: 'Whether a group is detected — what This group acts on.' },
    currentGroupRelationCount: { description: 'Distinct related rules. Rides the label above 0.' },
    activePanel: { description: 'Which panel is open; its trigger says Hide … and is pinned.' },
    onTogglePanel: { description: 'Toggles the given panel open/closed.' },
    onExportRules: { description: 'Opens the Export tab on the Group Rules descriptor.' },
    search: { description: "The rung's search row, rendered inside the band beneath the verbs." },
  },
} satisfies Meta<typeof RulesListActionBar>;

const openTier = async (canvas: ReturnType<typeof within>): Promise<void> => {
  const more = canvas.queryByRole('button', { name: 'More' });
  if (more && more.getAttribute('aria-expanded') !== 'true') await userEvent.click(more);
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Export rules' })).toBeInTheDocument();
  },
};

export const NothingLoaded: Story = {
  args: {
    hasRules: false,
    duplicateClusterCount: 0,
    currentGroupRelationCount: 0,
    search: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Load rules' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Stats/ })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Duplicates/ })).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const TheOpenPanelSaysSo: Story = {
  args: { activePanel: 'duplicates' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Hide duplicates' })).toBeInTheDocument();
    await openTier(canvas);
    await expect(canvas.queryByRole('button', { name: /^Duplicates/ })).not.toBeInTheDocument();
  },
};

export const CurrentGroupPanelOpen: Story = {
  args: { activePanel: 'currentGroup' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Hide this group' })).toBeInTheDocument();
  },
};

export const StatsPanelOpen: Story = {
  args: { activePanel: 'stats' },
};

export const NoDuplicates: Story = {
  args: { duplicateClusterCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openTier(canvas);
    await expect(canvas.queryByRole('button', { name: /^Duplicates/ })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /^This group/ })).toBeInTheDocument();
  },
};

export const CurrentGroupWithNoRelations: Story = {
  args: { currentGroupRelationCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openTier(canvas);
    await expect(canvas.getByRole('button', { name: 'This group' })).toBeInTheDocument();
  },
};

export const NoCurrentGroup: Story = {
  args: { hasCurrentGroup: false, currentGroupRelationCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openTier(canvas);
    await expect(canvas.queryByRole('button', { name: /This group/ })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /^Duplicates/ })).toBeInTheDocument();
  },
};

export const WithoutExport: Story = {
  args: { onExportRules: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Export rules' })).not.toBeInTheDocument();
  },
};

export const AtPanelWidth: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
