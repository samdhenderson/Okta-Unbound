import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RuleImpactModal from './RuleImpactModal';
import type { RuleImpactSummary, TargetGroupImpact } from '../../shared/membership/ruleImpact';
import { mockUsers } from '../../test/mocks/fixtures';

const losingUsers = mockUsers.slice(10, 22);
const manyLosingUsers = mockUsers.slice(10, 90);

const targetWithLoss: TargetGroupImpact = {
  groupId: 'grp1',
  groupName: 'Engineering',
  memberCount: 60,
  losingCount: losingUsers.length,
  losing: losingUsers,
};

const targetWithManyLoss: TargetGroupImpact = {
  groupId: 'grp2',
  groupName: 'Engineering Contractors',
  memberCount: 90,
  losingCount: manyLosingUsers.length,
  losing: manyLosingUsers,
};

const targetNoLoss: TargetGroupImpact = {
  groupId: 'grp3',
  groupName: 'Engineering Managers',
  memberCount: 12,
  losingCount: 0,
  losing: [],
};

const mockSummary: RuleImpactSummary = {
  ruleId: 'rule1',
  ruleName: 'Engineering - US',
  targetGroups: [targetWithLoss, targetNoLoss],
  distinctMemberCount: 72,
  totalLosing: losingUsers.length,
};

const mockLargeSummary: RuleImpactSummary = {
  ruleId: 'rule2',
  ruleName: 'Engineering - EU',
  targetGroups: [targetWithManyLoss],
  distinctMemberCount: 90,
  totalLosing: manyLosingUsers.length,
};

const mockEmptySummary: RuleImpactSummary = {
  ruleId: 'rule3',
  ruleName: 'Orphaned rule',
  targetGroups: [],
  distinctMemberCount: 0,
  totalLosing: 0,
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
          'Read-only "who loses access?" preview for a group rule.\n\n' +
          "Shows a rule's target groups with live member counts and, crucially, how many members would lose access if the rule were deactivated (the members held by this rule alone). Doubles as the confirmation gate for a deactivation: in `deactivate` mode it leads with the loss headline and its footer commits the change. Computation is read-only — see `shared/membership/ruleImpact`.\n\n" +
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

export const LargeLossList: Story = {
  args: { ruleName: 'Engineering - EU', summary: mockLargeSummary },
};
