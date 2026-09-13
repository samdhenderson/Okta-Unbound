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
          'The verb strip for the rules-list rung: the three analysis surfaces are panels this bar toggles, and the search row rides beneath it as the `subRow`. **Export rules** holds `primary`; no verb here fetches, and a host that leaves the export unwired gets no `primary` at all.\n\n' +
          'No verb is ever shipped without an object — no duplicate clusters means no *Duplicates*, no loaded rules means no *Stats*. *This group* is gated on a **detected group** rather than on the relation count, because “no loaded rule assigns users to this group” is itself a finding.',
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
