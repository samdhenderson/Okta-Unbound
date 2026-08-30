import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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

const meta = {
  title: 'Rules/RuleImpactModal',
  component: RuleImpactModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Read-only "what does this rule hold up?" preview for a group rule.\n\n' +
          "Shows a rule's target groups with live member counts and, crucially, how many members are held by this rule **alone** — nobody else's rule explains their membership. Doubles as the confirmation gate for a deactivation: in `deactivate` mode its footer commits the change. Computation is read-only — see `shared/membership/ruleImpact`.\n\n" +
          'It used to call that population "lose access" in both modes, which was wrong for the only verb it can perform (D-052): deactivating a rule removes nobody, it merely leaves those members unattributed. Removal exists only on delete, via `removeUsers`, irreversibly.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), [Shared utilities](?path=/docs/internals-shared-utilities--docs)',
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
    onNavigateToGroup: {
      description: "Jump to a target group in the Groups tab (reverse of A2's rule deep-link).",
    },
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
