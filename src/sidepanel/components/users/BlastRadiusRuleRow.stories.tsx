import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import BlastRadiusRuleRow from './BlastRadiusRuleRow';
import type { RuleEffect } from '../../../shared/membership/blastRadiusTypes';
import type { OktaUser } from '../../../shared/types';

const DRAFTED = {
  id: '00uFAKEstory00000001',
  status: 'ACTIVE',
  profile: {
    login: 'ada@example.com',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Sales',
    title: 'Account Executive',
  },
} as unknown as OktaUser;

const effect = (
  over: Partial<RuleEffect> & Pick<RuleEffect, 'ruleId' | 'ruleName' | 'transition'>,
): RuleEffect => ({
  expression: 'user.department == "Sales"',
  targetGroupIds: ['00gFAKE00000000000001'],
  targetGroupNames: ['Sales-All'],
  touchedAttributes: ['department'],
  active: true,
  ...over,
});

const meta = {
  title: 'Users/BlastRadiusRuleRow',
  component: BlastRadiusRuleRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The rule-centric mirror of `BlastRadiusGroupRow`: the groups view answers *what ' +
          'access changes*, this one answers *what is driving it* — the view an admin needs to ' +
          'go and fix a rule rather than a person.\n\n' +
          '`Could not be evaluated` is neutral, not a fifth shade of unchanged: one of the two ' +
          'evaluations produced no answer, so the pair cannot be compared, and the sentence ' +
          'comes from the shared `unevaluableReasonText` table. The expression wraps and never ' +
          'truncates — the clause that decided the verdict is routinely the one past an ' +
          'ellipsis — and `Reads` is a display aid the engine never filters on.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ul className="space-y-3">
        <Story />
      </ul>
    ),
  ],
  argTypes: {
    effect: {
      description:
        'One entry from `BlastRadiusReport.rules`. Its `ruleName`, `expression` and `targetGroupNames` are untrusted tenant data — rendered escaped, never logged.',
    },
  },
  args: {
    onToggle: fn(),
    effect: effect({
      ruleId: '0prFAKErule00001',
      ruleName: 'Sales auto-add',
      transition: 'starts-matching',
    }),
  },
} satisfies Meta<typeof BlastRadiusRuleRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StartsMatching: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Sales auto-add')).toBeInTheDocument();
    await expect(canvas.getByText('Starts matching')).toBeInTheDocument();
    await expect(canvas.getByText('Sales-All')).toBeInTheDocument();
    await expect(canvas.getByText('user.department == "Sales"')).toBeInTheDocument();
  },
};

export const StopsMatching: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00002',
      ruleName: 'Eng auto-add',
      transition: 'stops-matching',
      expression: 'user.department == "Engineering"',
      targetGroupIds: ['00gFAKE00000000000002'],
      targetGroupNames: ['Engineering-All'],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Stops matching')).toBeInTheDocument();
  },
};

export const Undetermined: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00003',
      ruleName: 'Reviewers — by group',
      transition: 'undetermined',
      afterReason: 'regex-unsupported-syntax',
      expression: 'isMemberOfGroupNameRegex("(?=sec)sec-.*")',
      targetGroupIds: ['00gFAKE00000000000003'],
      targetGroupNames: ['Security-Reviewers'],
      touchedAttributes: [],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Could not be evaluated')).toBeInTheDocument();
    await expect(canvas.getByText(/syntax this panel does not implement/i)).toBeInTheDocument();
    await expect(canvas.queryByText(/Stops matching|Starts matching/)).toBeNull();
  },
};

export const NotInForceRule: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00004',
      ruleName: 'Legacy intern auto-add',
      transition: 'stops-matching',
      active: false,
      status: 'INACTIVE',
      expression: 'user.title == "Intern"',
      targetGroupIds: ['00gFAKE00000000000004'],
      targetGroupNames: ['Legacy-Interns'],
      touchedAttributes: ['title'],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Not in force')).toBeInTheDocument();
    await expect(canvas.queryByText(/INACTIVE|Inactive/)).toBeNull();
    await expect(canvas.queryByText('Broken')).toBeNull();
  },
};

export const BrokenRule: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00009',
      ruleName: 'Contractors — deleted group reference',
      transition: 'stops-matching',
      active: false,
      status: 'INVALID',
      expression: 'isMemberOfGroup("00gDELETEDFAKE00001")',
      targetGroupIds: ['00gFAKE00000000000004'],
      targetGroupNames: ['Legacy-Interns'],
      touchedAttributes: [],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Broken')).toBeInTheDocument();
    await expect(canvas.queryByText('Not in force')).toBeNull();
    await expect(canvas.queryByText(/INACTIVE|Inactive/)).toBeNull();
  },
};

export const UnchangedMatch: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00005',
      ruleName: 'Everyone',
      transition: 'unchanged-match',
      expression: 'user.status == "ACTIVE"',
      touchedAttributes: [],
    }),
  },
};

export const UnchangedNoMatch: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00006',
      ruleName: 'Tokyo office',
      transition: 'unchanged-no-match',
      expression: 'user.city == "Tokyo"',
      touchedAttributes: [],
    }),
  },
};

export const UnchangedUnevaluable: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00009',
      ruleName: 'Contractor pattern',
      transition: 'unchanged-unevaluable',
      expression: 'isMemberOfGroupNameRegex("(?=contractor).*")',
      beforeReason: 'regex-unsupported-syntax',
      afterReason: 'regex-unsupported-syntax',
      touchedAttributes: [],
    }),
  },
};

export const ManyTargets: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00007',
      ruleName: 'EMEA sales enablement',
      transition: 'starts-matching',
      targetGroupIds: ['00gFAKE00000000000001', '00gFAKE00000000000005', '00gFAKE00000000000006'],
      targetGroupNames: ['Sales-All', 'EMEA-Everyone', 'Enablement-Readers'],
      touchedAttributes: ['department', 'countryCode', 'employeeType'],
      expression:
        'user.department == "Sales" && user.countryCode in {"GB", "IE", "FR", "DE"} && user.employeeType != "CONTRACTOR"',
    }),
  },
};

export const Compact: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
  args: {
    effect: effect({
      ruleId: '0prFAKErule00008',
      ruleName: 'EMEA sales enablement — contractors excluded',
      transition: 'stops-matching',
      targetGroupIds: ['00gFAKE00000000000001'],
      targetGroupNames: ['emea-sales-enablement-contractors-2026'],
      touchedAttributes: ['department', 'countryCode'],
      expression:
        'user.department == "Sales" && user.countryCode in {"GB", "IE", "FR", "DE"} && user.employeeType != "CONTRACTOR"',
    }),
  },
};

export const CascadeSingleGroup: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00031',
      ruleName: 'Sales onboarding',
      transition: 'starts-matching',
      targetGroupIds: ['00gFAKEnewhires1'],
      targetGroupNames: ['New Hires'],
    }),
    expanded: true,
    cascadeBlocks: [
      {
        groupId: '00gFAKEnewhires1',
        groupName: 'New Hires',
        lines: [
          {
            ruleId: '0prFAKErule00032',
            ruleName: 'Downstream feeder',
            direction: 'toward-match',
            matchedBy: 'name',
            targetGroupNames: ['Finance'],
          },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: /Rules that use New Hires/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(canvas.getByText('Downstream feeder')).toBeInTheDocument();
    const panel = canvasElement.querySelector('.disclose');
    await expect(panel?.textContent).not.toMatch(/New Hires/);
  },
};

export const CascadeAcrossTwoGroups: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00041',
      ruleName: 'Regional onboarding',
      transition: 'starts-matching',
      targetGroupIds: ['00gFAKEnewhires1', '00gFAKEemea00001'],
      targetGroupNames: ['New Hires', 'EMEA'],
    }),
    expanded: false,
    cascadeBlocks: [
      {
        groupId: '00gFAKEnewhires1',
        groupName: 'New Hires',
        lines: [
          {
            ruleId: '0prFAKErule00042',
            ruleName: 'Downstream feeder',
            direction: 'toward-match',
            matchedBy: 'name',
            targetGroupNames: ['Finance'],
          },
        ],
      },
      {
        groupId: '00gFAKEemea00001',
        groupName: 'EMEA',
        lines: [
          {
            ruleId: '0prFAKErule00043',
            ruleName: 'EMEA tooling',
            direction: 'toward-match',
            matchedBy: 'nameContains',
            targetGroupNames: ['EMEA-Tools'],
          },
        ],
      },
    ],
  },
  render: function Disclosure(args) {
    const [expanded, setExpanded] = useState(false);
    return (
      <BlastRadiusRuleRow
        {...args}
        expanded={expanded}
        onToggle={(ruleId) => {
          args.onToggle?.(ruleId);
          setExpanded((open) => !open);
        }}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Rules that use these groups/ });

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(args.onToggle).toHaveBeenCalledWith('0prFAKErule00041');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('EMEA tooling')).toBeInTheDocument();
  },
};

export const NoCascade: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00051',
      ruleName: 'Sales auto-add',
      transition: 'starts-matching',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /Rules that use/ })).toBeNull();
  },
};

export const WithClauseLedger: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00010',
      ruleName: 'Sales enablement',
      transition: 'starts-matching',
      expression: 'user.department == "Sales" && user.title == "Account Executive"',
      touchedAttributes: ['department'],
    }),
    drafted: DRAFTED,
    groupContext: [],
  },
};

export const ClauseLedgerWithUnreadableClause: Story = {
  args: {
    effect: effect({
      ruleId: '0prFAKErule00011',
      ruleName: 'Regional enablement',
      transition: 'undetermined',
      expression: 'user.department == "Sales" && isMemberOfGroupNameRegex("(?=EMEA).*")',
      beforeReason: 'regex-unsupported-syntax',
      afterReason: 'regex-unsupported-syntax',
      touchedAttributes: ['department'],
    }),
    drafted: DRAFTED,
    groupContext: [],
  },
};
