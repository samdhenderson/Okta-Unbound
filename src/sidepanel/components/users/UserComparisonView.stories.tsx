import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import UserComparisonView from './UserComparisonView';
import { mockUsers, mockGroup } from '../../../test/mocks/fixtures';
import { classifyAccessCauses } from './comparison/accessCause';
import type { UserComparisonState } from '../../hooks/useUserComparison';
import type { FormattedRule, GroupMembership } from '../../../shared/types';

const contextUser = mockUsers[10];
const comparedUser = mockUsers[11];

const vpnRule: FormattedRule = {
  id: '0prFAKErule00001',
  name: 'Contractors → VPN Access',
  status: 'ACTIVE',
  condition: 'user.userType == "Contractor"',
  conditionExpression: 'user.userType == "Contractor"',
  groupIds: ['group456'],
  userAttributes: ['userType'],
  created: '2026-01-01T00:00:00.000Z',
  lastUpdated: '2026-01-01T00:00:00.000Z',
};

const membership = (
  id: string,
  name: string,
  over: Partial<GroupMembership> = {},
): GroupMembership => ({
  group: { ...mockGroup, id, profile: { name, description: '' } },
  membershipType: 'DIRECT',
  rules: [],
  attribution: 'exact',
  ...over,
});

const gShared = membership('group123', 'Engineering');
const gOnlyCompared = membership('group456', 'VPN Access', {
  membershipType: 'RULE_BASED',
  rules: [vpnRule],
  attribution: 'exact',
});
const gOnlyContext = membership('group789', 'Design Review');

const comparison = (over: Partial<UserComparisonState> = {}): UserComparisonState => ({
  comparedUser: null,
  searchQuery: '',
  setSearchQuery: fn(),
  searchResults: [],
  isSearching: false,
  activeTab: 'overview',
  setActiveTab: fn(),
  groupBuckets: { onlyCompared: [], shared: [], onlyContext: [] },
  appBuckets: { onlyCompared: [], shared: [], onlyContext: [] },
  causes: undefined,
  groupDiffCount: 0,
  appDiffCount: 0,
  groupSimilarity: 0,
  appSimilarity: 0,
  overallSimilarity: 0,
  isLoading: false,
  loadError: null,
  addingGroupId: null,
  addError: null,
  setAddError: fn(),
  addToContext: fn(),
  addToCompared: fn(),
  contextName: 'First11 Last11',
  resolveGroupName: () => undefined,
  comparedName: '',
  selectUser: fn(),
  changeUser: fn(),
  ...over,
});

const loaded = (over: Partial<UserComparisonState> = {}): UserComparisonState =>
  comparison({
    comparedUser,
    comparedName: 'First12 Last12',
    groupBuckets: {
      onlyCompared: [gOnlyCompared],
      shared: [gShared],
      onlyContext: [gOnlyContext],
    },
    appBuckets: {
      onlyCompared: [
        { id: 'app2', label: 'Salesforce', scope: 'USER' },
        { id: 'app4', label: 'Zoom' },
      ],
      shared: [{ id: 'app1', label: 'Slack', scope: 'USER' }],
      onlyContext: [{ id: 'app3', label: 'Figma', scope: 'GROUP' }],
    },
    causes: classifyAccessCauses({
      onlyCompared: [gOnlyCompared],
      contextUser,
      rules: [vpnRule],
    }),
    groupDiffCount: 2,
    appDiffCount: 2,
    groupSimilarity: 33,
    appSimilarity: 33,
    overallSimilarity: 33,
    ...over,
  });

const meta = {
  title: 'Users/UserComparisonView',
  component: UserComparisonView,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The two-user comparison surface itself, independent of how it is shown.\n\n' +
          'Purely presentational: every piece of state (search, load, bucketing, similarity, ' +
          'optimistic group-copy) is owned by `useUserComparison` and handed in whole as the ' +
          '`comparison` prop. The hook is instantiated by the **host**, not here, because both ' +
          'hosts must keep the comparison alive while its surface is hidden — so that the ' +
          "hook's reset effect, not an unmount, is what clears a finished comparison.\n\n" +
          "Two hosts render this: `UserComparisonModal` (the Overview tab's dialog) and " +
          '`UserComparisonPanel` (the Users tab\'s pushed view, ADR-0016). "Change user" is ' +
          'rendered here rather than by a host, because the dialog has a footer and the pushed ' +
          'view does not.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), ' +
          '[Types](?path=/docs/internals-types--docs)',
      },
    },
  },
  args: {
    contextUser,
    comparison: comparison(),
  },
  argTypes: {
    contextUser: {
      description: 'The "context" user being compared from (the user currently in focus).',
    },
    comparison: {
      description: "The whole comparison view model, from the host's `useUserComparison` instance.",
    },
  },
} satisfies Meta<typeof UserComparisonView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchPhase: Story = {};

export const Searching: Story = {
  args: { comparison: comparison({ searchQuery: 'last12', isSearching: true }) },
};

export const SearchResults: Story = {
  args: {
    comparison: comparison({ searchQuery: 'last12', searchResults: [comparedUser] }),
  },
};

export const OverviewTab: Story = {
  args: { comparison: loaded() },
};

export const GroupsTab: Story = {
  args: { comparison: loaded({ activeTab: 'groups' }) },
};

export const AppsTab: Story = {
  args: { comparison: loaded({ activeTab: 'apps' }) },
};

export const Loading: Story = {
  args: { comparison: loaded({ isLoading: true }) },
};

export const LoadError: Story = {
  args: { comparison: loaded({ loadError: 'Failed to load memberships' }) },
};

export const AddError: Story = {
  args: {
    comparison: loaded({ activeTab: 'groups', addError: 'Insufficient permissions' }),
  },
};

export const CopyInFlight: Story = {
  args: {
    comparison: loaded({ activeTab: 'groups', addingGroupId: gOnlyCompared.group.id }),
  },
};
