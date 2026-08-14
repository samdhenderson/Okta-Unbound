import type { Meta, StoryObj } from '@storybook/react-vite';
import MemberSourceMeter from './MemberSourceMeter';
import type {
  MemberSourceBreakdown,
  RuleMemberCounts,
} from '../../../../shared/membership/groupSource';

const rule = (ruleId: string, ruleName: string, soleCount: number): RuleMemberCounts => ({
  ruleId,
  ruleName,
  soleCount,
  oktaAttributedCount: soleCount,
  clientAttributedCount: 0,
});

const breakdown = (over: Partial<MemberSourceBreakdown>): MemberSourceBreakdown => ({
  total: 0,
  direct: 0,
  ruleBased: 0,
  unattributed: 0,
  byRule: [],
  multiRuleMembers: 0,
  ...over,
});

const liveGroup = breakdown({
  total: 70,
  direct: 1,
  ruleBased: 69,
  byRuleMembers: [rule('0prFAKE1', 'Eng — full-time', 44), rule('0prFAKE2', 'Eng — contract', 24)],
  multiRuleMembers: 1,
});

const meta = {
  title: 'Groups/MemberSourceMeter',
  component: MemberSourceMeter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Stacked bar + legend answering "where did this group\'s members come from?", with **one segment per attributing rule**.\n\n' +
          'Segments are mutually exclusive by construction, so they always sum to the analyzed member count: a member two rules ' +
          'both claim is counted once in `Matched by 2+ rules`, never in either rule. Rule colours come from the sanctioned chart ' +
          'ramp (`theme/chartPalette`), whose six stops are the hard cap on named rules — past it the tail aggregates into ' +
          '`Other rules` and prints how many rules it folded in. A zero-count segment is dropped entirely; a one-member segment ' +
          'keeps a minimum width so it stays visible.\n\n' +
          'The bar is `aria-hidden`: every number it encodes is printed in the legend as text.',
      },
    },
  },
  argTypes: {
    breakdown: { description: "The analyzed manual-vs-rule split for the group's members." },
    maxRules: {
      description: 'How many rules get their own colour before the tail aggregates (default 6).',
    },
  },
  args: { breakdown: liveGroup },
} satisfies Meta<typeof MemberSourceMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleRule: Story = {
  args: {
    breakdown: breakdown({
      total: 128,
      direct: 0,
      ruleBased: 128,
      byRuleMembers: [rule('0prFAKE1', 'All employees', 128)],
    }),
  },
};

export const OverflowingRules: Story = {
  args: {
    breakdown: breakdown({
      total: 96,
      direct: 6,
      ruleBased: 90,
      byRuleMembers: [
        rule('0prFAKE1', 'Engineering', 30),
        rule('0prFAKE2', 'Sales', 20),
        rule('0prFAKE3', 'Support', 14),
        rule('0prFAKE4', 'Finance', 10),
        rule('0prFAKE5', 'Legal', 6),
        rule('0prFAKE6', 'Marketing', 5),
        rule('0prFAKE7', 'Facilities', 3),
        rule('0prFAKE8', 'Interns', 2),
      ],
    }),
  },
};

export const CompactBudget: Story = {
  args: { ...OverflowingRules.args, maxRules: 3 },
};

export const WithIndeterminate: Story = {
  args: {
    breakdown: breakdown({
      total: 40,
      direct: 8,
      ruleBased: 32,
      unattributed: 12,
      byRuleMembers: [rule('0prFAKE1', 'Contractors', 20)],
    }),
  },
};

export const AggregateOnly: Story = {
  args: { breakdown: breakdown({ total: 128, direct: 32, ruleBased: 96 }) },
};

export const Empty: Story = {
  args: { breakdown: breakdown({}) },
};
