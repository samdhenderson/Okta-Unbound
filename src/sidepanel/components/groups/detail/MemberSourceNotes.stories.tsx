import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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
          'Commentary about one group’s membership split, rendered under the source strip in the Members tab: the per-rule accounting, plus the note explaining the indeterminate slice.\n\n' +
          'The indeterminate note is text, never a tooltip — that slice is members whose rule condition the evaluator could not resolve, not members who do not belong. A rule Okta attributed carries a different chip from one the client-side heuristic inferred, because a deduction must not read as a fact.',
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
    await expect(fact).toHaveAttribute(
      'title',
      expect.stringContaining('Okta itself reports these members'),
    );
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

export const ManyRulesCapsAtThree: Story = {
  args: {
    breakdown: {
      total: 28,
      direct: 0,
      ruleBased: 28,
      unattributed: 0,
      byRule: Array.from({ length: 7 }, (_, i) => ({
        ruleId: `0prFAKE${i + 1}`,
        ruleName: `Feeding rule ${i + 1}`,
        count: 7 - i,
      })),
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Feeding rule 3')).toBeVisible();
    await expect(canvas.queryByText('Feeding rule 4')).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: /4 more rules/ }));

    const dialog = await within(canvasElement).findByRole('dialog');
    await expect(within(dialog).getByText('Feeding rule 7')).toBeVisible();
    await expect(within(dialog).getByText('Feeding rule 1')).toBeVisible();
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
