import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupListItem from './GroupListItem';
import type { GroupSummary } from '../../../shared/types';

const baseGroup: GroupSummary = {
  id: '00g1x2y3z4',
  name: 'Engineering',
  description: 'All engineering staff across every team.',
  type: 'OKTA_GROUP',
  memberCount: 128,
  hasRules: true,
  ruleCount: 2,
  created: new Date('2023-01-15'),
  lastUpdated: new Date('2026-06-01'),
  lastMembershipUpdated: new Date('2026-06-10'),
};

const appGroup: GroupSummary = {
  id: '00g4a5b6c7',
  name: 'Salesforce Users',
  type: 'APP_GROUP',
  memberCount: 42,
  hasRules: false,
  ruleCount: 0,
  sourceAppId: 'app1',
  sourceAppName: 'Salesforce',
};

const pushedGroup: GroupSummary = {
  ...baseGroup,
  id: '00g8p9u0s1',
  name: 'Push-Mapped Group',
  pushMappings: [
    {
      mappingId: 'map1',
      sourceUserGroupId: '00g8p9u0s1',
      targetGroupName: 'AD - Push Group',
      status: 'ACTIVE',
      appId: 'app1',
      appName: 'Salesforce',
    },
    {
      mappingId: 'map2',
      sourceUserGroupId: '00g8p9u0s1',
      targetGroupName: 'Workday - Push Group',
      status: 'INACTIVE',
      appId: 'app2',
      appName: 'Workday',
    },
  ],
};

const staleGroup: GroupSummary = {
  ...baseGroup,
  id: '00g9s0t1a2',
  name: 'Legacy Contractors',
  staleness: {
    score: 82,
    factors: ['No membership changes in 400 days', 'No active rules', 'Owner deprovisioned'],
  },
};

const longNameGroup: GroupSummary = {
  ...baseGroup,
  id: '00glong0001',
  name: 'A Very Long Group Name That Describes A Highly Specific Cross-Functional Access Boundary For Reporting Purposes',
  description:
    'A correspondingly long description explaining the purpose, scope, and ownership of this group in more detail than usual, to exercise text truncation and wrapping.',
};

const meta = {
  title: 'Groups/GroupListItem',
  component: GroupListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A single expandable row in the groups list.\n\n' +
          'Renders the group name, type/rule/push/staleness badges, and a selection ' +
          'checkbox; expanding the row reveals member metadata, push mappings, and ' +
          'staleness factors. Highlights when selected, adds an "Open in Okta" deep link ' +
          'when `oktaOrigin` is set, and auto-expands with a ring when deep-linked as a ' +
          'highlight target.',
      },
    },
  },
  argTypes: {
    group: { description: 'The group to render.' },
    selected: { description: 'Whether this row is selected.' },
    onToggleSelect: { description: "Toggles selection for this group's id." },
    oktaOrigin: {
      description: 'Okta origin, enabling the "Open in Okta" deep link when present.',
    },
    onAnalyzeSource: {
      description: 'Opens the read-only membership-source insight for this group.',
    },
    isHighlighted: {
      description: 'When true, the row auto-expands and shows a highlight ring (deep-link target).',
    },
  },
  args: {
    group: baseGroup,
    selected: false,
    onToggleSelect: fn(),
    onAnalyzeSource: fn(),
  },
} satisfies Meta<typeof GroupListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const AppGroup: Story = {
  args: { group: appGroup },
};

export const WithPushMappings: Story = {
  args: { group: pushedGroup },
};

export const Stale: Story = {
  args: { group: staleGroup },
};

export const WithOktaLink: Story = {
  args: { group: baseGroup, oktaOrigin: 'https://example.okta.com' },
};

export const Highlighted: Story = {
  args: { group: staleGroup, isHighlighted: true },
};

export const WithoutAnalyzeSource: Story = {
  args: { onAnalyzeSource: undefined },
};

export const LongText: Story = {
  args: { group: longNameGroup, isHighlighted: true },
};
