import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GroupOverviewPane from './GroupOverviewPane';
import type { MemberSourceBreakdown } from '../../../../shared/membership/groupSource';
import type { GroupSummary } from '../../../../shared/types';

const groupWithPush: GroupSummary = {
  id: '00gFAKEgroup00001',
  name: 'Engineering',
  description: 'Eng team',
  type: 'OKTA_GROUP',
  memberCount: 70,
  hasRules: true,
  ruleCount: 2,
  pushMappings: [
    {
      mappingId: 'm1',
      sourceUserGroupId: '00gFAKEgroup00001',
      targetGroupName: 'Engineering (Slack)',
      priority: 1,
      appId: '0oaFAKEAPP1',
      appName: 'Slack',
    },
  ],
};

const groupWithoutPush: GroupSummary = { ...groupWithPush, pushMappings: undefined };

const analyzedBreakdown: MemberSourceBreakdown = {
  total: 70,
  direct: 1,
  ruleBased: 69,
  unattributed: 0,
  byRule: [
    { ruleId: '0prFAKE1', ruleName: 'Eng — full-time', count: 45 },
    { ruleId: '0prFAKE2', ruleName: 'Eng — contract', count: 25 },
  ],
};

const allManualBreakdown: MemberSourceBreakdown = {
  total: 12,
  direct: 12,
  ruleBased: 0,
  unattributed: 0,
  byRule: [],
};

const meta = {
  title: 'Groups/GroupOverviewPane',
  component: GroupOverviewPane,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "The Group Detail view's landing pane: verdict tiles, each a derived claim, that " +
          'drill into the tab that answers it. Presentational only — every figure re-reads ' +
          'state `GroupDetailView` already computes, and the pane issues no fetch of its ' +
          'own.\n\n' +
          'A tile never restates a fact `PageHeader` already owns, and a fact that has not ' +
          'loaded is omitted rather than shown as zero: the Access and Rules tiles are absent ' +
          'until their reads resolve, and the app-push tile exists only when the group carries ' +
          'at least one mapping.',
      },
    },
  },
  argTypes: {
    group: { description: 'The group being described. Only `pushMappings` is read here.' },
    breakdown: {
      description: 'The manual-vs-rule membership split, once the gated analysis has run.',
    },
    memberStatus: { description: 'Status of the gated member-source analysis.' },
    feedingRulesCount: { description: 'Number of rules that assign into this group.' },
    rulesStatus: { description: 'Status of the feeding-rules load.' },
    appsCount: { description: 'Number of apps this group is assigned to.' },
    appsStatus: { description: 'Status of the app-assignment read.' },
    rolesCount: { description: 'Number of admin roles this group grants.' },
    rolesStatus: { description: 'Whether the admin-roles read could be completed.' },
    referencingRulesCount: {
      description: 'Number of rules that reference this group in a condition expression.',
    },
    referencingStatus: { description: 'Status of the referencing-rules load.' },
    onNavigate: { description: "Switches the Group Detail view's active tab." },
  },
  args: {
    group: groupWithoutPush,
    breakdown: null,
    memberStatus: 'idle',
    feedingRulesCount: 0,
    rulesStatus: 'loading',
    appsCount: 0,
    appsStatus: 'loading',
    rolesCount: 0,
    rolesStatus: 'loading',
    referencingRulesCount: 0,
    referencingStatus: 'loading',
    onNavigate: fn(),
  },
} satisfies Meta<typeof GroupOverviewPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotAnalyzed: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Where membership comes from/i }));
    await expect(args.onNavigate).toHaveBeenCalledWith('members');
  },
};

export const AllTilesLoaded: Story = {
  args: {
    group: groupWithPush,
    breakdown: analyzedBreakdown,
    memberStatus: 'done',
    feedingRulesCount: 2,
    rulesStatus: 'done',
    appsCount: 5,
    appsStatus: 'done',
    rolesCount: 2,
    rolesStatus: 'available',
    referencingRulesCount: 1,
    referencingStatus: 'done',
  },
};

export const Empty: Story = {
  args: {
    group: groupWithoutPush,
    breakdown: allManualBreakdown,
    memberStatus: 'done',
    feedingRulesCount: 0,
    rulesStatus: 'done',
    appsCount: 0,
    appsStatus: 'done',
    rolesCount: 0,
    rolesStatus: 'available',
    referencingRulesCount: 0,
    referencingStatus: 'done',
  },
};
