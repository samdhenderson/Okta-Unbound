import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import UserComparisonView from './UserComparisonView';
import { mockUsers, mockGroup } from '../../../test/mocks/fixtures';
import { classifyAccessCauses } from './comparison/accessCause';
import type { UserComparisonState } from '../../hooks/useUserComparison';
import type { AttributeParityRow, AttributeVerdict } from './comparison/attributeParity';
import type { FormattedRule, GroupMembership } from '../../../shared/types';
import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';
import { DEFAULT_PROFILE_DISPLAY_CONFIG } from '../../../shared/storage/profileDisplayStore';

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

const attrRow = (
  name: string,
  label: string,
  contextValue: string,
  comparedValue: string,
  verdict: AttributeVerdict,
  over: Partial<AttributeParityRow> = {},
): AttributeParityRow => ({
  key: `profile.${name}`,
  name,
  label,
  kind: 'base',
  contextValue,
  comparedValue,
  verdict,
  categoryKey: 'organization',
  hiddenByConfig: false,
  ...over,
});

const ATTRIBUTE_ROWS: AttributeParityRow[] = [
  attrRow('department', 'Department', 'Engineering', 'Design', 'differs'),
  attrRow('manager', 'Manager', 'dana@example.com', '', 'onlyContext'),
  attrRow('costCenter', 'Cost center', '', 'CC-42', 'onlyCompared'),
  attrRow('userType', 'User type', 'Employee', 'Employee', 'same', {
    categoryKey: 'identity',
  }),
  attrRow('nickName', 'Nickname', '', '', 'bothEmpty', { categoryKey: '' }),
];

const HIDDEN_ATTRIBUTE_ROWS: AttributeParityRow[] = [
  attrRow('employeeNumber', 'Employee number', 'E-0001', 'E-0002', 'differs', {
    hiddenByConfig: true,
  }),
];

const ATTRIBUTE_CONFIG: ProfileDisplayConfig = {
  ...DEFAULT_PROFILE_DISPLAY_CONFIG,
  categories: [
    { key: 'identity', name: 'Identity' },
    { key: 'organization', name: 'Organization' },
    { key: 'contact-locale', name: 'Contact & locale' },
  ],
  assign: {
    userType: 'identity',
    department: 'organization',
    manager: 'organization',
    costCenter: 'organization',
    employeeNumber: 'organization',
    nickName: '',
  },
  attrOrder: ['userType', 'department', 'manager', 'costCenter', 'employeeNumber', 'nickName'],
  hidden: { employeeNumber: true },
};

const idleSide = (
  key: 'context' | 'compared',
  userName: string,
): UserComparisonState['attributeEdit']['context'] => ({
  key,
  userName,
  cells: {},
  isEditing: false,
  isSaving: false,
  hasChanges: false,
  hasInvalid: false,
  canEdit: false,
  begin: fn(),
  cancel: fn(),
  requestSave: fn(),
});

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
  attributeParity: { rows: [], hiddenRows: [], hiddenDifferences: 0, differenceCount: 0 },
  attributeConfig: DEFAULT_PROFILE_DISPLAY_CONFIG,
  attributeRuleReads: {},
  attributeEdit: {
    context: idleSide('context', 'First11 Last11'),
    compared: idleSide('compared', 'First12 Last12'),
    pendingSave: null,
  },
  groupSimilarity: 0,
  appSimilarity: 0,
  overallSimilarity: 0,
  similarityScope: 'both',
  appsIncomplete: false,
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
          'The two-user comparison surface, independent of how it is shown.\n\n' +
          'Purely presentational: every piece of state — search, load, bucketing, similarity, optimistic group-copy — is owned by `useUserComparison` and handed in whole as the `comparison` prop. The host instantiates that hook, so a comparison survives its surface being hidden.',
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

export const AppsIncomplete: Story = {
  args: {
    comparison: loaded({
      appsIncomplete: true,
      appSimilarity: null,
      similarityScope: 'groups-only',
      overallSimilarity: 33,
    }),
  },
};

export const AppsIncompleteOnAppsTab: Story = {
  args: {
    comparison: loaded({
      activeTab: 'apps',
      appsIncomplete: true,
      appSimilarity: null,
      similarityScope: 'groups-only',
      overallSimilarity: 33,
      appBuckets: { onlyCompared: [], shared: [], onlyContext: [] },
    }),
  },
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

const withAttributes = (over: Partial<UserComparisonState> = {}): UserComparisonState =>
  loaded({
    activeTab: 'attributes',
    attributeParity: {
      rows: ATTRIBUTE_ROWS,
      hiddenRows: HIDDEN_ATTRIBUTE_ROWS,
      hiddenDifferences: 1,
      differenceCount: 3,
    },
    attributeConfig: ATTRIBUTE_CONFIG,
    attributeRuleReads: { department: ['Engineering → VPN Access'] },
    ...over,
  });

export const AttributesTab: Story = {
  args: { comparison: withAttributes() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^All/ }));
    await waitFor(() => expect(canvas.getByText('User type')).toBeInTheDocument());
    expect(canvas.getByText('Nickname')).toBeInTheDocument();
    expect(canvas.getAllByText('— not set').length).toBeGreaterThan(0);
    expect(canvas.queryByText('Contact & locale')).not.toBeInTheDocument();
  },
};

export const AttributesHiddenDifferences: Story = {
  args: { comparison: withAttributes() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByText('1 differing attribute hidden by your display config'),
    ).toBeInTheDocument();
    expect(canvas.queryByText('Employee number')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Show' }));
    await waitFor(() => expect(canvas.getByText('Employee number')).toBeInTheDocument());
    expect(canvas.getByText('Hidden')).toBeInTheDocument();
  },
};

export const AttributesApiNames: Story = {
  args: {
    comparison: withAttributes({
      attributeConfig: { ...ATTRIBUTE_CONFIG, showApiNames: true },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('department')).toBeInTheDocument());
    expect(canvas.queryByText('Department')).not.toBeInTheDocument();
  },
};

export const AttributesFilteredToNothing: Story = {
  args: { comparison: withAttributes() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Filter attributes by name or value'), 'zzzz');
    await waitFor(() => expect(canvas.getByText('No attributes match')).toBeInTheDocument());
  },
};

export const AttributesCompactPanel: Story = {
  args: { comparison: withAttributes() },
  parameters: { viewport: { value: 'sidepanelCompact' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^All/ }));
    await waitFor(() => expect(canvas.getByText('User type')).toBeInTheDocument());
  },
};
