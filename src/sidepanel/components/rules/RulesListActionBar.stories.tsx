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
          '**Where `primary` goes (ADR-0068 §2).** This strip used to open with a **Load rules** ' +
          '/ **Refresh** descriptor, which ADR-0061 made *the* reference example of a list ' +
          "rung's `primary`. ADR-0069 deleted it — the tab fetches on open, and one chrome " +
          'control beside the Pin re-fetches whatever the panel is showing — and ADR-0068 §2 ' +
          'then excluded a fetch from `primary` absolutely. Enumerating what is left ' +
          '(see the comment above the descriptor array) finds **no acting verb** on this rung, ' +
          "so rule 2 applies and the rung's one whole-rung export, **Export rules**, holds " +
          '`primary` and stays in the row. A host that does not wire the export gets rule 3: no ' +
          '`primary` at all.\n\n' +
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
    hasRules: { description: 'Whether any rules are loaded — gates Stats.' },
    duplicateClusterCount: { description: 'Duplicate-condition clusters found. 0 omits the verb.' },
    hasCurrentGroup: { description: 'Whether a group is detected — what This group acts on.' },
    currentGroupRelationCount: { description: 'Distinct related rules. Rides the label above 0.' },
    activePanel: { description: 'Which panel is open; its trigger says Hide … and is pinned.' },
    onTogglePanel: { description: 'Toggles the given panel open/closed.' },
    onExportRules: { description: "Opens the Export tab. This rung's `primary` when wired." },
    search: { description: "The rung's search row, rendered inside the band beneath the verbs." },
  },
} satisfies Meta<typeof RulesListActionBar>;

const openTier = async (canvas: ReturnType<typeof within>): Promise<void> => {
  const more = canvas.queryByRole('button', { name: 'More' });
  if (more && more.getAttribute('aria-expanded') !== 'true') await userEvent.click(more);
};

const tierRegion = (canvasElement: HTMLElement): HTMLElement | null => {
  const more = within(canvasElement).queryByRole('button', { name: 'More' });
  const id = more?.getAttribute('aria-controls');
  return id ? canvasElement.ownerDocument.getElementById(id) : null;
};

const expectNoFetchVerb = async (canvas: ReturnType<typeof within>): Promise<void> => {
  await expect(canvas.queryByRole('button', { name: /refresh/i })).not.toBeInTheDocument();
  await expect(canvas.queryByRole('button', { name: /^load/i })).not.toBeInTheDocument();
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Export rules' })).toBeInTheDocument();
    await expectNoFetchVerb(canvas);
  },
};

export const TheRungsPrimaryIsItsExport: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openTier(canvas);

    const exportVerb = canvas.getByRole('button', { name: 'Export rules' });
    const tier = tierRegion(canvasElement);
    await expect(tier).not.toBeNull();
    await expect(tier?.contains(canvas.getByRole('button', { name: /^Duplicates/ }))).toBe(true);
    await expect(tier?.contains(exportVerb)).toBe(false);

    await expectNoFetchVerb(canvas);
  },
};

export const NothingLoaded: Story = {
  args: {
    hasRules: false,
    duplicateClusterCount: 0,
    hasCurrentGroup: false,
    currentGroupRelationCount: 0,
    search: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Export rules' })).toBeInTheDocument();
    await expectNoFetchVerb(canvas);
    await expect(canvas.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Stats/ })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Duplicates/ })).not.toBeInTheDocument();
  },
};

export const NothingLoadedWithGroupInContext: Story = {
  args: {
    hasRules: false,
    duplicateClusterCount: 0,
    currentGroupRelationCount: 0,
    search: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openTier(canvas);
    await expect(canvas.getByRole('button', { name: 'This group' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Stats/ })).not.toBeInTheDocument();
  },
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
    await openTier(canvas);
    await expectNoFetchVerb(canvas);
    await expect(canvas.getByRole('button', { name: /^Duplicates/ })).toBeInTheDocument();
  },
};

export const AtPanelWidth: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
