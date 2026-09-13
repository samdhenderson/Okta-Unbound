import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import MemberFilterDrawer, { type MemberFilterDrawerProps } from './MemberFilterDrawer';
import { useMemberFilters } from '../../hooks/useMemberFilters';
import { computeDimensionBreakdown, discoverAttributeBreakdowns } from './memberAnalytics';
import { toMemberSourceSegments } from '../groups/memberSourceBuckets';
import { buildMemberSourceIndex } from '../../../shared/membership/memberSourceIndex';
import MemberSourceNotes from '../groups/detail/MemberSourceNotes';
import type { OktaUser } from '../../../shared/types';
import type { MemberSourceBreakdown } from '../../../shared/membership/groupSource';

const members: OktaUser[] = Array.from({ length: 30 }, (_, i) => ({
  id: `00uFAKE${i + 1}`,
  status: i < 4 ? 'SUSPENDED' : 'ACTIVE',
  profile: {
    login: `member${i + 1}@example.com`,
    email: `member${i + 1}@example.com`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    department: ['Engineering', 'Support', 'Finance'][i % 3],
    title: i % 2 === 0 ? 'Manager' : 'Individual Contributor',
  },
}));

const breakdown: MemberSourceBreakdown = {
  total: 30,
  direct: 30,
  ruleBased: 0,
  unattributed: 0,
  byRule: [],
};

const memberSource = {
  index: buildMemberSourceIndex(
    { id: '00gFAKE1', name: 'Engineering', type: 'OKTA_GROUP' },
    members,
    [],
  ),
  segments: toMemberSourceSegments(breakdown),
};

const MemberFilterDrawerWithState = (props: Omit<MemberFilterDrawerProps, 'memberFilters'>) => {
  const memberFilters = useMemberFilters();
  return <MemberFilterDrawer {...props} memberFilters={memberFilters} />;
};

const meta = {
  title: 'Members/MemberFilterDrawer',
  component: MemberFilterDrawerWithState,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every member control the explorer has, behind one disclosure: the ' +
          'membership-source strip and its notes, the status/MFA/sort panel, the routes into ' +
          'each profile attribute, and a pointer to the Insights tab. The contents stay ' +
          'mounted while closed — and `inert`, so they leave the tab order and the accessible ' +
          'tree — which is the contract these stories assert, since the headless runner loads ' +
          'no Tailwind and so cannot observe the collapsed height.',
      },
    },
  },
  args: {
    id: 'member-filter-drawer',
    open: true,
    memberSource,
    sourceDetail: <MemberSourceNotes breakdown={breakdown} />,
    statusRows: computeDimensionBreakdown(members, 'status'),
    mfaResults: null,
    factorLabels: [],
    memberCount: members.length,
    scanStatus: 'idle',
    onRunScanClick: fn(),
    sortBy: 'name',
    sortDesc: false,
    onToggleSort: fn(),
    attributes: discoverAttributeBreakdowns(members),
    filteredDimensions: new Set<string>(),
    onSelectAttribute: fn(),
  },
} satisfies Meta<typeof MemberFilterDrawerWithState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ args, canvas }) => {
    await expect(canvas.getByText('Source')).toBeVisible();
    await expect(canvas.getByText('Profile attributes')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Title: choose a value to filter by' }),
    );
    await expect(args.onSelectAttribute).toHaveBeenCalledWith('title');
  },
};

export const Closed: Story = {
  args: { open: false },
  play: async ({ canvasElement }) => {
    const region = canvasElement.ownerDocument.getElementById('member-filter-drawer');
    await expect(region).toHaveAttribute('inert');
  },
};

export const WithoutSourceAnalysis: Story = {
  args: { memberSource: undefined, sourceDetail: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Source')).toBeNull();
    await expect(canvas.getByText('Profile attributes')).toBeVisible();
  },
};

export const WithInsightsPointer: Story = {
  args: { onOpenInsights: fn() },
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open Insights' }));
    await expect(args.onOpenInsights).toHaveBeenCalledTimes(1);
  },
};
