import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import RuleImpactModal from './RuleImpactModal';
import type { RuleImpactSummary, TargetGroupImpact } from '../../shared/membership/ruleImpact';
import { mockUsers } from '../../test/mocks/fixtures';

const soleHeldUsers = mockUsers.slice(10, 22);
const manySoleHeldUsers = mockUsers.slice(10, 90);

const targetWithSoleHolds: TargetGroupImpact = {
  groupId: 'grp1',
  groupName: 'Engineering',
  memberCount: 60,
  heldSolelyCount: soleHeldUsers.length,
  heldSolelyByRule: soleHeldUsers,
};

const targetWithManySoleHolds: TargetGroupImpact = {
  groupId: 'grp2',
  groupName: 'Engineering Contractors',
  memberCount: 90,
  heldSolelyCount: manySoleHeldUsers.length,
  heldSolelyByRule: manySoleHeldUsers,
};

const targetNoSoleHolds: TargetGroupImpact = {
  groupId: 'grp3',
  groupName: 'Engineering Managers',
  memberCount: 12,
  heldSolelyCount: 0,
  heldSolelyByRule: [],
};

const mockSummary: RuleImpactSummary = {
  ruleId: 'rule1',
  ruleName: 'Engineering - US',
  targetGroups: [targetWithSoleHolds, targetNoSoleHolds],
  distinctMemberCount: 72,
  totalHeldSolely: soleHeldUsers.length,
};

const mockLargeSummary: RuleImpactSummary = {
  ruleId: 'rule2',
  ruleName: 'Engineering - EU',
  targetGroups: [targetWithManySoleHolds],
  distinctMemberCount: 90,
  totalHeldSolely: manySoleHeldUsers.length,
};

const mockEmptySummary: RuleImpactSummary = {
  ruleId: 'rule3',
  ruleName: 'Orphaned rule',
  targetGroups: [],
  distinctMemberCount: 0,
  totalHeldSolely: 0,
};

const targetNoOverlap: TargetGroupImpact = {
  groupId: 'grp4',
  groupName: 'Engineering',
  memberCount: 12,
  heldSolelyCount: 0,
  heldSolelyByRule: [],
};

const mockNoRuleInventorySummary: RuleImpactSummary = {
  ruleId: 'rule4',
  ruleName: 'Only Rule',
  targetGroups: [targetNoOverlap],
  distinctMemberCount: 12,
  totalHeldSolely: 0,
  emptyRuleInventory: true,
};

const mockEvaluatedNoOverlapSummary: RuleImpactSummary = {
  ruleId: 'rule5',
  ruleName: 'Engineering - US',
  targetGroups: [targetNoOverlap],
  distinctMemberCount: 12,
  totalHeldSolely: 0,
  emptyRuleInventory: false,
};

const meta = {
  title: 'Rules/RuleImpactModal',
  component: RuleImpactModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Read-only "what does this rule hold up?" preview for a group rule: its target groups with live member counts, and how many members are held by this rule **alone**.\n\n' +
          'In `deactivate` mode it doubles as the confirmation gate for the deactivation. Deactivating removes nobody — it leaves those members unattributed — so the copy never says they lose access.',
      },
    },
  },
  argTypes: {
    isOpen: { description: 'Whether the modal is shown.' },
    ruleName: { description: 'The rule name being analyzed (for the header/copy).' },
    mode: { description: 'Preview vs deactivation-confirmation intent.' },
    status: { description: 'Async status of the capture.' },
    summary: { description: 'The captured summary once available.' },
    error: { description: "Error message when `status === 'error'`." },
    progress: { description: 'Load progress while capturing.' },
    onClose: { description: 'Close/cancel the modal.' },
    onConfirmDeactivate: {
      description: 'Commit the deactivation (only used in `deactivate` mode).',
    },
    onNavigateToGroup: { description: 'Jump to a target group in the Groups tab.' },
  },
  args: {
    isOpen: true,
    ruleName: 'Engineering - US',
    mode: 'preview',
    status: 'done',
    summary: mockSummary,
    error: null,
    progress: null,
    onClose: fn(),
    onConfirmDeactivate: fn(),
    onNavigateToGroup: fn(),
  },
} satisfies Meta<typeof RuleImpactModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DeactivateConfirm: Story = {
  args: { mode: 'deactivate' },
};

export const Loading: Story = {
  args: {
    status: 'loading',
    summary: null,
    progress: { current: 2, total: 3, message: 'Loading Engineering Contractors…' },
  },
};

export const ErrorState: Story = {
  args: { status: 'error', summary: null, error: 'Failed to load group members.' },
};

export const NoTargetGroups: Story = {
  args: { summary: mockEmptySummary },
};

export const LargeSoleHoldList: Story = {
  args: { ruleName: 'Engineering - EU', summary: mockLargeSummary },
};

export const NoOtherRulesInOrg: Story = {
  args: { ruleName: 'Only Rule', summary: mockNoRuleInventorySummary },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(
      canvas.getByText(
        'This org has no other group rules, so there was nothing to check this rule against.',
      ),
    ).toBeVisible();
    await expect(
      canvas.queryByText(/Checked against every other group rule in the org/),
    ).not.toBeInTheDocument();
  },
};

export const EvaluatedNoOverlap: Story = {
  args: { summary: mockEvaluatedNoOverlapSummary },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(
      canvas.getByText(
        'Checked against every other group rule in the org — none collide with this one.',
      ),
    ).toBeVisible();
    await expect(canvas.queryByText(/no other group rules/)).not.toBeInTheDocument();
  },
};
