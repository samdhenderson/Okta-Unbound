import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ComparisonOverviewTab from './ComparisonOverviewTab';
import { mockGroup } from '../../../../test/mocks/fixtures';
import type { GroupMembership } from '../../../../shared/types';
import type { AppEntry, GroupBuckets } from './comparisonAnalytics';
import type { AccessCause } from './accessCause';

const makeMembership = (id: string, name: string): GroupMembership => ({
  group: { ...mockGroup, id, profile: { ...mockGroup.profile, name } },
  membershipType: 'DIRECT',
  rules: [],
  attribution: 'exact',
});

const groupBuckets: GroupBuckets = {
  onlyCompared: [
    makeMembership('g1', 'Engineering - Platform'),
    makeMembership('g2', 'VPN Access'),
  ],
  shared: [makeMembership('g3', 'All Employees')],
  onlyContext: [makeMembership('g4', 'Finance Approvers')],
};

const appBuckets: {
  onlyCompared: AppEntry[];
  shared: AppEntry[];
  onlyContext: AppEntry[];
} = {
  onlyCompared: [{ id: 'a1', label: 'Salesforce' }],
  shared: [
    { id: 'a2', label: 'Slack' },
    { id: 'a3', label: 'Google Workspace' },
  ],
  onlyContext: [],
};

const causes: AccessCause[] = [
  {
    groupId: '00gFAKE001',
    groupName: 'Engineering - Platform',
    remedy: 'blocked-by-attribute',
    ruleId: '0prFAKE001',
    ruleName: 'Platform engineers',
    failingClauses: [
      { expressionText: 'user.department == "Platform"', resolvedValue: 'Support', status: 'fail' },
    ],
  },
  {
    groupId: '00gFAKE002',
    groupName: 'VPN Access',
    remedy: 'cannot-determine',
    undeterminedReason: 'needs-group-context',
    failingClauses: [],
  },
];

const meta = {
  title: 'Users/Comparison/ComparisonOverviewTab',
  component: ComparisonOverviewTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Summary tab of the comparison modal: two proportion cards (groups + apps) with jump-to-detail links, followed by the cause worklist.\n\n' +
          'Each card visualizes the shared vs unique split for one dimension and shows its whole-percent overlap; the links jump to the corresponding Groups or Apps detail tab. Prop-driven from pre-bucketed data, so it renders full-overlap, no-overlap, and fully-empty states purely from its inputs.\n\n' +
          'The `causes` prop is optional on purpose: absent means *not computed* and reads differently from an empty array, which means *computed, nothing found*.',
      },
    },
  },
  args: {
    contextName: 'Jane Doe',
    comparedName: 'John Smith',
    groupBuckets,
    appBuckets,
    groupSimilarity: 33,
    appSimilarity: 67,
    onJumpToGroups: fn(),
    onJumpToApps: fn(),
    causes,
    onViewClauses: fn(),
  },
  argTypes: {
    contextName: { description: 'Display name for the context user.' },
    comparedName: { description: 'Display name for the compared user.' },
    groupBuckets: {
      description: 'Bucketed group memberships (only-compared / shared / only-context).',
    },
    appBuckets: {
      description: 'Bucketed app assignments (only-compared / shared / only-context).',
    },
    groupSimilarity: { description: 'Group overlap as a whole percent (0–100).' },
    appSimilarity: {
      description:
        'App overlap as a whole percent (0–100), or `null` when the assignments could not be fully read — the card reports "overlap unavailable" rather than a percentage it cannot stand behind.',
    },
    onJumpToGroups: { description: 'Jumps to the Groups detail tab.' },
    onJumpToApps: { description: 'Jumps to the Apps detail tab.' },
    causes: {
      description:
        'Access differences classified by remedy. Absent means "not computed"; empty means "computed, none found".',
    },
    onViewClauses: { description: 'Opens the full clause checklist for one cause.' },
  },
} satisfies Meta<typeof ComparisonOverviewTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FullOverlap: Story = {
  args: {
    groupBuckets: { onlyCompared: [], shared: groupBuckets.shared, onlyContext: [] },
    appBuckets: { onlyCompared: [], shared: appBuckets.shared, onlyContext: [] },
    groupSimilarity: 100,
    appSimilarity: 100,
    causes: [],
  },
};

export const NoOverlap: Story = {
  args: {
    groupBuckets: {
      onlyCompared: groupBuckets.onlyCompared,
      shared: [],
      onlyContext: groupBuckets.onlyContext,
    },
    appBuckets: { onlyCompared: appBuckets.onlyCompared, shared: [], onlyContext: [] },
    groupSimilarity: 0,
    appSimilarity: 0,
  },
};

export const AppOverlapUnavailable: Story = {
  args: {
    appBuckets: { onlyCompared: [], shared: [], onlyContext: [] },
    appSimilarity: null,
  },
};

export const Empty: Story = {
  args: {
    groupBuckets: { onlyCompared: [], shared: [], onlyContext: [] },
    appBuckets: { onlyCompared: [], shared: [], onlyContext: [] },
    groupSimilarity: 0,
    appSimilarity: 0,
    causes: [],
  },
};

export const CausesNotComputed: Story = {
  args: { causes: undefined },
};
