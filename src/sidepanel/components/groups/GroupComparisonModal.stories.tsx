import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import GroupComparisonModal from './GroupComparisonModal';
import { mockGroup, mockUsers } from '../../../test/mocks/fixtures';
import type { GroupSummary, GroupComparisonResult, OktaUser } from '../../../shared/types';

function makeGroup(id: string, name: string, memberCount: number): GroupSummary {
  return {
    id,
    name,
    type: mockGroup.type,
    memberCount,
    hasRules: false,
    ruleCount: 0,
  };
}

const twoGroups: GroupSummary[] = [
  makeGroup('g1', 'Engineering', 60),
  makeGroup('g2', 'Product', 45),
];

const threeGroups: GroupSummary[] = [...twoGroups, makeGroup('g3', 'Design', 20)];

const twoGroupCache = new Map<string, OktaUser[]>([
  ['g1', mockUsers.slice(0, 60)],
  ['g2', mockUsers.slice(30, 75)],
]);

const threeGroupCache = new Map<string, OktaUser[]>([
  ...twoGroupCache,
  ['g3', mockUsers.slice(60, 80)],
]);

const twoGroupResult: GroupComparisonResult = {
  groups: [
    { id: 'g1', name: 'Engineering', memberCount: 60 },
    { id: 'g2', name: 'Product', memberCount: 45 },
  ],
  intersection: mockUsers.slice(30, 60).map((u) => u.id),
  uniqueMembers: {
    g1: mockUsers.slice(0, 30).map((u) => u.id),
    g2: mockUsers.slice(60, 75).map((u) => u.id),
  },
  totalUniqueUsers: 75,
};

const threeGroupResult: GroupComparisonResult = {
  groups: [
    { id: 'g1', name: 'Engineering', memberCount: 60 },
    { id: 'g2', name: 'Product', memberCount: 45 },
    { id: 'g3', name: 'Design', memberCount: 20 },
  ],
  intersection: [],
  uniqueMembers: {
    g1: mockUsers.slice(0, 30).map((u) => u.id),
    g2: [],
    g3: mockUsers.slice(75, 80).map((u) => u.id),
  },
  totalUniqueUsers: 80,
};

const meta = {
  title: 'Groups/GroupComparisonModal',
  component: GroupComparisonModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'Modal comparing membership overlap across 2–5 selected groups. Opening triggers ' +
          'the comparison: it fetches members (reusing the passed cache where it can) and ' +
          'renders the shared intersection, each group’s unique members, and — for 3+ groups ' +
          '— a pairwise overlap matrix. It renders nothing when closed.',
      },
    },
  },
  argTypes: {
    isOpen: { description: 'Whether the modal is visible; opening triggers the comparison.' },
    onClose: { description: 'Closes the modal.' },
    groups: { description: 'Groups to compare (expects 2–5).' },
    compareGroups: {
      description: 'Fetches members and computes the comparison result, reporting progress.',
    },
    memberCache: {
      description: 'Cached members keyed by group id; also used to build the pairwise matrix.',
    },
  },
  args: {
    isOpen: true,
    onClose: fn(),
    groups: twoGroups,
    compareGroups: fn(async () => twoGroupResult),
    memberCache: twoGroupCache,
  },
} satisfies Meta<typeof GroupComparisonModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args }) => {
    const dialog = within(await within(document.body).findByRole('dialog'));

    await expect(await dialog.findByText('Total Unique Users')).toBeVisible();
    await expect(dialog.getByText('In All Groups')).toBeVisible();
    await expect(args.compareGroups).toHaveBeenCalled();
  },
};

export const ThreeGroups: Story = {
  args: {
    groups: threeGroups,
    compareGroups: fn(async () => threeGroupResult),
    memberCache: threeGroupCache,
  },
};

export const Loading: Story = {
  args: {
    compareGroups: fn(() => new Promise<GroupComparisonResult>(() => {})),
  },
};

export const ErrorState: Story = {
  args: {
    compareGroups: fn(async () => {
      throw new Error('Comparison failed: rate limited');
    }),
  },
};

export const Closed: Story = {
  args: { isOpen: false },
};
