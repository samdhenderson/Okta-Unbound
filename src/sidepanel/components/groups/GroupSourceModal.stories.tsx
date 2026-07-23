import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupSourceModal from './GroupSourceModal';
import type { GroupSummary } from '../../../shared/types';
import type { FeedingRule } from '../../hooks/useGroupSource';
import type { MemberSourceBreakdown } from '../../../shared/membership/groupSource';

const baseGroup: GroupSummary = {
  id: 'group123',
  name: 'Engineering Team',
  description: 'All engineering staff',
  type: 'OKTA_GROUP',
  memberCount: 42,
  hasRules: true,
  ruleCount: 2,
  pushMappings: [
    {
      mappingId: 'map1',
      sourceUserGroupId: 'group123',
      targetGroupName: 'Engineering Team (Push)',
      status: 'ACTIVE',
      appId: 'app1',
      appName: 'Slack',
    },
    {
      mappingId: 'map2',
      sourceUserGroupId: 'group123',
      targetGroupName: 'Engineering Team (Push)',
      status: 'ACTIVE',
      appId: 'app2',
      appName: 'GitHub',
    },
  ],
};

const feedingRules: FeedingRule[] = [
  { id: 'rule1', name: 'All Engineers', status: 'ACTIVE' },
  { id: 'rule2', name: 'Contractors — Engineering', status: 'INACTIVE' },
];

const breakdown: MemberSourceBreakdown = {
  total: 42,
  direct: 12,
  ruleBased: 30,
  byRule: [
    { ruleId: 'rule1', ruleName: 'All Engineers', count: 28 },
    { ruleId: 'rule2', ruleName: 'Contractors — Engineering', count: 2 },
  ],
};

const meta = {
  title: 'Groups/GroupSourceModal',
  component: GroupSourceModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Read-only "why does this group exist?" detail for one group.\n\n' +
          'Surfaces the safety context an admin needs before removing/merging a group: the rules that feed it, the apps it is pushed to, and — on demand — the manual-vs-rule split of its current membership. No mutations.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), [Types](?path=/docs/internals-types--docs)',
      },
    },
  },
  argTypes: {
    group: { description: 'The group being explained, or null when closed.' },
    feedingRules: { description: 'Rules that assign users to the group.' },
    rulesStatus: { description: 'Status of the feeding-rules load.' },
    breakdown: { description: 'Manual-vs-rule breakdown once analyzed.' },
    memberStatus: { description: 'Status of the gated member analysis.' },
    error: { description: 'Error message for whichever step failed.' },
    onClose: { description: 'Close the modal.' },
    onAnalyzeMembers: { description: 'Run the gated member-source analysis.' },
    onNavigateToRule: { description: 'Jump to a feeding rule in the Rules tab.' },
  },
  args: {
    group: baseGroup,
    feedingRules,
    rulesStatus: 'done',
    breakdown: null,
    memberStatus: 'idle',
    error: null,
    onClose: fn(),
    onAnalyzeMembers: fn(),
    onNavigateToRule: fn(),
  },
} satisfies Meta<typeof GroupSourceModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoFeedingRules: Story = {
  args: { feedingRules: [], group: { ...baseGroup, hasRules: false, ruleCount: 0 } },
};

export const NoAppPush: Story = {
  args: { group: { ...baseGroup, pushMappings: [] } },
};

export const RulesLoading: Story = {
  args: { rulesStatus: 'loading' },
};

export const RulesError: Story = {
  args: { rulesStatus: 'error', error: 'Failed to load group rules.' },
};

export const AnalyzingMembers: Story = {
  args: { memberStatus: 'loading' },
};

export const MembersError: Story = {
  args: { memberStatus: 'error', error: 'Failed to analyze members.' },
};

export const MembersAnalyzed: Story = {
  args: { memberStatus: 'done', breakdown },
};

export const Closed: Story = {
  args: { group: null },
};
