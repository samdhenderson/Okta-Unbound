import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GroupInsightsPane from './GroupInsightsPane';
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
    condition: 'department in {"Engineering", "Product"}',
    conditionExpression: 'user.department in {"Engineering", "Product"}',
    groupIds: ['00gFAKE1'],
    created: '2024-01-01T00:00:00.000Z',
    lastUpdated: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '0prFAKE2',
    name: 'Managers',
    status: 'ACTIVE',
    userAttributes: ['title'],
    condition: 'title == "Manager"',
    conditionExpression: 'user.title == "Manager"',
    groupIds: ['00gFAKE1'],
    created: '2024-01-01T00:00:00.000Z',
    lastUpdated: '2025-01-01T00:00:00.000Z',
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
  title: 'Groups/GroupInsightsPane',
  component: GroupInsightsPane,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Group Detail\'s Insights tab: attribute-spread cards from `discoverAttributeBreakdowns`, a gated opt-in MFA-coverage scan that never auto-runs, and the group\'s own reference facts folded into a closed "About this group" section.\n\n' +
          'Fully presentational — the caller owns every load and passes its state through. Every discovered attribute gets a card; the feeding rules only influence the order, never which cards exist.',
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
    feedingRules: {
      description:
        'The feeding rules, layered onto the cards as an annotation and the lightest ranking input.',
    },
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
} satisfies Meta<typeof GroupInsightsPane>;

export default meta;
type Story = StoryObj<typeof meta>;

const openSection = async (canvas: ReturnType<typeof within>, name: RegExp): Promise<void> => {
  await userEvent.click(canvas.getByRole('button', { name }));
};

export const RosterNotLoaded: Story = {};

export const RosterLoading: Story = { args: { memberStatus: 'loading' } };

export const RosterError: Story = {
  args: { memberStatus: 'error', error: 'Members could not be read.' },
};

export const AttributeCards: Story = {
  args: { members, memberStatus: 'done' },
  play: async ({ canvas }) => {
    await openSection(canvas, /Attribute spread/);
    await expect(canvas.getByText('department')).toBeVisible();
  },
};

export const AllSectionsClosed: Story = {
  args: { members, memberStatus: 'done', scanStatus: 'complete', mfaResults },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('2 attributes · 2 flagged')).toBeVisible();
    await expect(
      canvas.getByText('3 of 12 members scanned have no MFA factor enrolled.'),
    ).toBeVisible();

    await expect(canvas.getByRole('button', { name: /Attribute spread/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(canvas.getByRole('button', { name: /MFA coverage/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};

export const ClosedSummariesWithoutARoster: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Not analyzed yet.')).toBeVisible();
    await expect(canvas.getByText('Load members first.')).toBeVisible();
    await expect(canvas.queryByText(/0 attributes/)).toBeNull();
  },
};

export const NoDependentAttributes: Story = {
  args: { members, memberStatus: 'done', feedingRules: [] },
  play: async ({ canvas }) => {
    await openSection(canvas, /Attribute spread/);
    await expect(canvas.getByText('department')).toBeVisible();
    await expect(canvas.queryByText(/Depended on by/)).toBeNull();
  },
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

export const ValueJumpsToMembersFromCard: Story = {
  args: { members, memberStatus: 'done', onFilterMembers: fn() },
  play: async ({ args, canvas }) => {
    await openSection(canvas, /Attribute spread/);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show the value breakdown for department' }),
    );

    await userEvent.click(
      canvas.getByRole('button', { name: /^Open Members filtered by Department: Engineering/ }),
    );
    await expect(args.onFilterMembers).toHaveBeenCalledWith(
      expect.objectContaining({ dimension: 'department', value: 'Engineering' }),
    );
  },
};

export const ValueRowsInertWithNowhereToGo: Story = {
  args: { members, memberStatus: 'done' },
  play: async ({ canvas }) => {
    await openSection(canvas, /Attribute spread/);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show the value breakdown for department' }),
    );

    await expect(canvas.getByText('Engineering')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /Open Members filtered by/ })).toBeNull();
  },
};

const wideMembers: OktaUser[] = Array.from({ length: 40 }, (_, i) => ({
  id: `wide${i + 1}`,
  status: 'ACTIVE',
  profile: {
    login: `wide${i + 1}@example.com`,
    email: `wide${i + 1}@example.com`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    department: i % 2 === 0 ? 'Engineering' : 'Product',
    costCenter: `CC-${100 + (i % 9)}`,
  },
}));

export const HiddenTailRevealedInThreeStages: Story = {
  args: { members: wideMembers, memberCount: wideMembers.length, memberStatus: 'done' },
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await openSection(canvas, /Attribute spread/);

    await expect(canvas.getByText('costCenter')).toBeVisible();
    await expect(canvas.getByText('30% hidden in the tail')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Show the value breakdown for costCenter' }),
    );

    await userEvent.click(canvas.getByRole('button', { name: /Show all 9 values/ }));

    const dialog = await body.findByRole('dialog');
    await expect(within(dialog).getByText('CC-108')).toBeVisible();
    await expect(within(dialog).getByText('CC-100')).toBeVisible();
    await expect(within(dialog).queryByText(/Members tab/)).toBeNull();
  },
};
