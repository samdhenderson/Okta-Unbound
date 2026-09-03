import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import OrgSnapshotCard from './OrgSnapshotCard';
import { buildBox, buildFigure, buildSubCount, type FigureSource } from './orgFigures';

const NOW = Date.now();

const read = (over: Partial<FigureSource> = {}): FigureSource => ({
  isReading: false,
  complete: true,
  lastFullWalkAt: NOW - 20 * 60 * 1000,
  count: 0,
  error: null,
  ...over,
});

interface Slices {
  paused: number;
  emptyUnfilled: number;
}

const NO_SLICES: Slices = { paused: 0, emptyUnfilled: 0 };

const boxes = (groups: FigureSource, rules: FigureSource, slices: Slices = NO_SLICES) => {
  const groupsNamed = { source: groups, noun: 'groups' };
  const rulesNamed = { source: rules, noun: 'group rules' };

  return [
    buildBox(buildFigure('rules', 'Group rules', 'bolt', rules), 'rules', 'group rules', [
      buildSubCount({
        key: 'rules-paused',
        label: 'Group rules paused',
        icon: 'pause',
        counted: rulesNamed,
        count: slices.paused,
        request: { tab: 'rules', view: 'paused' },
      }),
    ]),
    buildBox(buildFigure('groups', 'Groups', 'users', groups), 'groups', 'groups', [
      buildSubCount({
        key: 'groups-empty-unfilled',
        label: 'Groups with no members that no rule fills',
        icon: 'users',
        counted: groupsNamed,
        gates: [rulesNamed],
        count: slices.emptyUnfilled,
        request: { tab: 'groups', view: 'empty-no-rules' },
      }),
    ]),
  ];
};

const meta = {
  title: 'Home/OrgSnapshotCard',
  component: OrgSnapshotCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'What is worth fixing in this org, as a findings list two rows long. Each row is one ' +
          'actionable count — *4 group rules paused* — and pressing it opens that tab with the ' +
          'matching filter already applied. The collection totals are a caption underneath, ' +
          'because `214 groups` is trivia and the slice of it that needs work is not.\n\n' +
          'All of it is read from the background-owned org snapshot (ADR-0040), so a warm org ' +
          'renders the whole card at **zero requests** — and that is exactly why there are two ' +
          'rows. A row has to cost no walk of its own, name a subject, have a verb at the end of ' +
          'it, and not be a superset of a sharper row. Every app-derived finding failed the ' +
          'first test: an apps walk plus a per-app assignment read is the tightest rate budget ' +
          'in the org, and it must never be spent because a tab opened.\n\n' +
          'The row anatomy is inverted from what it was: a 20px glyph leads, then the finding as ' +
          'a sentence, then the count at the trailing edge, then the chevron. The count used to ' +
          'be a `text-3xl` number on the left, which made the card a wall of digits you read ' +
          'twice — once to see the number, once to find out what it counted. It still holds the ' +
          'darkest ink and the heaviest weight in a fixed `3ch` right-aligned slot; it is simply ' +
          'no longer the biggest thing anywhere. The glyph lead matches `WorkingSetRow`’s ' +
          'exactly, so the entity rows above and the findings below read as one column.\n\n' +
          'Row 2 is computed by *subtraction* — it removes the groups some rule fills — and is ' +
          'held to a stricter bar because of it. A rule list missing half its pages does not ' +
          'under-report it; it reports every group those missing rules fill as unfilled. So the ' +
          'number is suppressed rather than published wrong, and the row keeps its place with an ' +
          'em dash and a sentence naming the missing read.\n\n' +
          'The four states below are the deliverable. `rows.length === 0` is ambiguous three ' +
          'ways at once — an empty org, a read that has not happened, and a read that failed all ' +
          'produce it — so a figure is a number **only** when its collection’s last walk ' +
          'actually finished. Everything else gets its own copy: a skeleton while reading, a ' +
          'floor when the walk was interrupted (ADR-0040 §7 forbids serving a partial as ' +
          'complete), and a recessed row with an em dash when nothing was read. Only the first ' +
          'is ever a control.\n\n' +
          'The footnote is not decoration either. A cached number with no stated age *is* a ' +
          'cached number presented as current, so the card quotes the oldest walk behind it — ' +
          'oldest, not newest, or one refreshed corner would date the whole card. With any ' +
          'collection unwalked there is no honest age, and the line says so rather than guessing.',
      },
    },
  },
  argTypes: {
    boxes: { description: 'One entry per collection: its total, and the findings drawn from it.' },
    readAt: { description: 'Oldest finished walk, or null when there is none.' },
    onRefresh: { description: 'Force a full walk of every collection behind the card.' },
    canRefresh: { description: 'False with no connected Okta tab.' },
    onOpenTab: { description: 'Open a tab unfiltered — what a total in the caption does.' },
    onOpenListView: { description: 'Open a tab filtered — what a finding does.' },
  },
  args: {
    onRefresh: fn(),
    onOpenTab: fn(),
    onOpenListView: fn(),
    isRefreshing: false,
    canRefresh: true,
    readAt: NOW - 20 * 60 * 1000,
    boxes: boxes(read({ count: 412 }), read({ count: 38 }), { paused: 4, emptyUnfilled: 31 }),
  },
} satisfies Meta<typeof OrgSnapshotCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Group rules paused — 4' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Groups with no members that no rule fills — 31' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText(/Counts as Okta reports them/)).toBeInTheDocument();
  },
};

export const EmptyOrg: Story = {
  args: { boxes: boxes(read(), read()) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('0')).toHaveLength(2);
    await expect(
      canvas.queryByRole('button', { name: /Group rules paused/ }),
    ).not.toBeInTheDocument();
  },
};

export const SingleItemOrg: Story = {
  args: {
    boxes: boxes(read({ count: 1 }), read({ count: 1 }), { paused: 1, emptyUnfilled: 1 }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('of 1 group')).toBeInTheDocument();
    await expect(canvas.getByText('of 1 group rule')).toBeInTheDocument();
    await expect(canvas.queryByText(/of 1 \w+s\b/)).not.toBeInTheDocument();
  },
};

export const Reading: Story = {
  args: {
    readAt: null,
    boxes: boxes(read({ isReading: true }), read({ isReading: true })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status', { name: 'Reading Group rules paused' })).toBeVisible();
    await expect(canvas.queryByText('0')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /paused/ })).not.toBeInTheDocument();
  },
};

export const NeverRead: Story = {
  args: {
    readAt: null,
    boxes: boxes(
      read({ complete: false, lastFullWalkAt: null }),
      read({ complete: false, lastFullWalkAt: null }),
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Group rules have not been read yet.')).toBeInTheDocument();
    await expect(canvas.getByText(/No age stated/)).toBeInTheDocument();
    await expect(canvas.queryByText(/ago/)).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /groups$/ })).not.toBeInTheDocument();
  },
};

export const UnavailableRowIsNotAControl: Story = {
  args: {
    readAt: null,
    boxes: boxes(
      read({ complete: false, lastFullWalkAt: null }),
      read({ complete: false, lastFullWalkAt: null }),
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByText('Group rules paused').closest('li');
    await expect(row).not.toBeNull();
    await expect(within(row as HTMLElement).queryByRole('button')).not.toBeInTheDocument();

    await userEvent.click(row as HTMLElement);
    await expect(args.onOpenListView).not.toHaveBeenCalled();
  },
};

export const PartialWalk: Story = {
  args: {
    boxes: boxes(read({ count: 120, complete: false }), read({ count: 38 }), {
      paused: 4,
      emptyUnfilled: 31,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('At least — the last read of groups did not finish.'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Groups with no members that no rule fills — 31' }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'at least 120 groups' })).toBeInTheDocument();
  },
};

export const CrossCollectionSuppressed: Story = {
  args: {
    readAt: null,
    boxes: boxes(read({ count: 412 }), read({ complete: false, lastFullWalkAt: null }), {
      paused: 0,
      emptyUnfilled: 412,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('412')).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: /Groups with no members/ }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByText('Needs group rules, which have not been read.'),
    ).toBeInTheDocument();
  },
};

export const FindingOpensTheList: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Groups with no members that no rule fills — 31' }),
    );
    await expect(args.onOpenListView).toHaveBeenCalledWith({
      tab: 'groups',
      view: 'empty-no-rules',
    });
  },
};

export const TotalOpensTheTab: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '412 groups' }));
    await expect(args.onOpenTab).toHaveBeenCalledWith('groups');
  },
};

export const ReadFailed: Story = {
  args: {
    readAt: null,
    boxes: boxes(
      read({ count: 412 }),
      read({ complete: false, lastFullWalkAt: null, error: 'Failed to load from Okta' }),
      { paused: 0, emptyUnfilled: 0 },
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Group rules have not been read yet.')).toBeInTheDocument();
    await expect(canvas.queryByText(/403/)).not.toBeInTheDocument();
  },
};

export const Refreshing: Story = {
  args: { isRefreshing: true },
};

export const Disconnected: Story = {
  args: { canRefresh: false },
};
