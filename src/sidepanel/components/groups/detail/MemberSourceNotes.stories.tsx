import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import MemberSourceNotes from './MemberSourceNotes';
import type { MemberSourceBreakdown } from '../../../../shared/membership/groupSource';

const breakdown: MemberSourceBreakdown = {
  total: 4,
  direct: 1,
  ruleBased: 3,
  unattributed: 0,
  byRule: [{ ruleId: '0prFAKE1', ruleName: 'All Engineers', count: 3 }],
};

const meta = {
  title: 'Groups/MemberSourceNotes',
  component: MemberSourceNotes,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'Commentary about one group’s membership split, rendered under the source strip in ' +
          'the Members tab. Both pieces moved here verbatim from the deleted ' +
          '`GroupMembershipSourceSection`.\n\n' +
          '**The indeterminate note is text, never a tooltip.** The strip’s indeterminate slice ' +
          'is members whose feeding rule’s condition the client-side evaluator could not ' +
          'resolve — a limit of the evaluator, not a failed match and not a member who does not ' +
          'belong. Demoting that correction to a segment `title` would make it invisible to ' +
          'anyone not hovering.\n\n' +
          '**A fact and a deduction do not read with the same weight.** A rule Okta itself ' +
          'attributed carries a different chip from one the client-side heuristic inferred ' +
          '(ADR-0020).',
      },
    },
  },
  args: {
    breakdown,
    onNavigateToRule: fn(),
  },
} satisfies Meta<typeof MemberSourceNotes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('3 members')).toBeVisible();
    await expect(canvas.queryByText(/limit of the client-side evaluator/)).toBeNull();
  },
};

export const WithIndeterminateMembers: Story = {
  args: { breakdown: { ...breakdown, unattributed: 1, total: 5 } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(/limit of the client-side evaluator, not a failed match/),
    ).toBeVisible();
  },
};

export const OktaAttributedVersusInferred: Story = {
  args: {
    breakdown: {
      total: 4,
      direct: 0,
      ruleBased: 4,
      unattributed: 0,
      byRule: [
        { ruleId: '0prFAKE1', ruleName: 'All Engineers', count: 3 },
        { ruleId: '0prFAKE2', ruleName: 'Contractors', count: 1 },
      ],
      byRuleMembers: [
        {
          ruleId: '0prFAKE1',
          ruleName: 'All Engineers',
          soleCount: 3,
          oktaAttributedCount: 3,
          clientAttributedCount: 0,
        },
        {
          ruleId: '0prFAKE2',
          ruleName: 'Contractors',
          soleCount: 1,
          oktaAttributedCount: 0,
          clientAttributedCount: 1,
        },
      ],
      multiRuleMembers: 0,
    },
  },
  play: async ({ canvas }) => {
    const fact = canvas.getByText('Okta-attributed');
    const guess = canvas.getByText('Inferred');
    await expect(guess).toHaveAttribute('title', expect.stringContaining('deduction, not a fact'));
    await expect(fact.className).not.toBe(guess.className);
  },
};

export const NothingAttributed: Story = {
  args: {
    breakdown: { total: 4, direct: 4, ruleBased: 0, unattributed: 0, byRule: [] },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('No member was attributed to a specific rule.')).toBeVisible();
  },
};

export const DeepLinksARule: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open rule All Engineers in the Rules tab' }),
    );
    await expect(args.onNavigateToRule).toHaveBeenCalledWith('0prFAKE1');
  },
};
