import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupHealthPane from './GroupHealthPane';
import type { FeedingRule } from '../../../hooks/useGroupSource';
import type { OktaUser, MemberMfaResult } from '../../../../shared/types';

const members: OktaUser[] = Array.from({ length: 12 }, (_, i) => ({
  id: `user${i + 1}`,
  status: 'ACTIVE',
  profile: {
    login: `user${i + 1}@example.com`,
    email: `user${i + 1}@example.com`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    department: i < 9 ? (i % 2 === 0 ? 'Engineering' : 'Product') : undefined,
    title: i % 3 === 0 ? 'Manager' : 'Individual Contributor',
  },
}));

const feedingRules: FeedingRule[] = [
  {
    id: '0prFAKE1',
    name: 'Eng & Product — full-time',
    status: 'ACTIVE',
    userAttributes: ['department'],
    conditionExpression: 'user.department in {"Engineering", "Product"}',
  },
  {
    id: '0prFAKE2',
    name: 'Managers',
    status: 'ACTIVE',
    userAttributes: ['title'],
    conditionExpression: 'user.title == "Manager"',
  },
];

const mfaResults = new Map<string, MemberMfaResult>(
  members.map((m, i) => [
    m.id,
    {
      userId: m.id,
      factors: [],
      enrolled: i % 4 !== 0,
      factorCount: i % 4 === 0 ? 0 : 1,
      factorLabels: i % 4 === 0 ? [] : ['Okta Verify'],
    },
  ]),
);

const meta = {
  title: 'Groups/GroupHealthPane',
  component: GroupHealthPane,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Group Detail's fourth tab: attribute-health cards (blank rate + which feeding " +
          'rule(s) depend on it — the intersection of `discoverAttributeBreakdowns` and ' +
          '`indexRulesByAttribute`), a gated opt-in MFA-coverage scan (never auto-runs), and ' +
          'the group\'s own reference facts folded into a closed "About this group" section. ' +
          "Fully presentational — the caller owns every load (`useGroupSource`'s member " +
          'analysis, `useMemberMfaScan`) and passes its state through, mirroring how every ' +
          'other Group Detail section/pane is composed by `GroupDetailView`.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs)',
      },
    },
  },
  argTypes: {
    groupId: { description: "The group's Okta id." },
    memberCount: {
      description: "The group's member count, used for the attribute gate's cost estimate.",
    },
    members: { description: "The group's roster, once analyzed; `null` before then." },
    memberStatus: {
      description: 'Status of the gated member analysis (shared with the Members tab).',
    },
    error: { description: 'Error message when the member analysis failed.' },
    canAnalyze: {
      description: '`false` when no Okta tab is connected; disables both gate buttons.',
    },
    feedingRules: { description: 'The feeding rules intersected with the attribute breakdown.' },
    mfaResults: { description: 'Per-member MFA scan results, or `null` before a scan has run.' },
    scanStatus: { description: 'Current MFA scan lifecycle status.' },
  },
  args: {
    groupId: '00gFAKEgroup00001',
    memberCount: members.length,
    members: null,
    memberStatus: 'idle',
    error: null,
    onAnalyzeMembers: fn(),
    canAnalyze: true,
    feedingRules,
    onNavigateToRule: fn(),
    mfaResults: null,
    scanStatus: 'idle',
    onRunScan: fn(),
    onRequestConfirm: fn(),
    onCancelConfirm: fn(),
    description: 'Engineering and Product — full-time.',
    created: new Date('2022-03-01T12:00:00Z'),
    lastUpdated: new Date('2025-11-14T09:30:00Z'),
  },
} satisfies Meta<typeof GroupHealthPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RosterNotLoaded: Story = {};

export const RosterLoading: Story = { args: { memberStatus: 'loading' } };

export const RosterError: Story = {
  args: { memberStatus: 'error', error: 'Members could not be read.' },
};

export const AttributeCards: Story = {
  args: { members, memberStatus: 'done' },
};

export const NoDependentAttributes: Story = {
  args: { members, memberStatus: 'done', feedingRules: [] },
};

export const MfaIdle: Story = {
  args: { members, memberStatus: 'done' },
};

export const MfaConfirming: Story = {
  args: { members, memberStatus: 'done', scanStatus: 'confirming' },
};

export const MfaScanning: Story = {
  args: { members, memberStatus: 'done', scanStatus: 'scanning' },
};

export const MfaComplete: Story = {
  args: { members, memberStatus: 'done', scanStatus: 'complete', mfaResults },
};

export const MfaError: Story = {
  args: { members, memberStatus: 'done', scanStatus: 'error' },
};

export const Disabled: Story = { args: { canAnalyze: false } };
