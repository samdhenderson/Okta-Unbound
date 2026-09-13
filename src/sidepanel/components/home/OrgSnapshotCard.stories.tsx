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
          'What is worth fixing in this org, as a findings list two rows long. Each row is one actionable count — *4 group rules paused* — and pressing it opens that tab with the matching filter applied; the collection totals sit underneath as a caption. Everything is read from the background-owned org snapshot, so a warm org renders the whole card at zero requests.\n\n' +
          'A figure is a number **only** when its collection’s last walk finished. Anything else gets its own copy — a skeleton while reading, a floor when the walk was interrupted, an em dash and a sentence naming the missing read when nothing was read — and only a finished figure is ever a control. The footnote quotes the **oldest** walk behind the card, and says so rather than guessing when any collection is unwalked.',
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
