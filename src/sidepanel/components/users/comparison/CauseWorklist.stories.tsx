import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import CauseWorklist from './CauseWorklist';
import type { AccessCause } from './accessCause';
import type { ClauseExplanation } from '../../../../shared/rules/explainExpression';

const failing = (expressionText: string, resolvedValue: string): ClauseExplanation => ({
  expressionText,
  resolvedValue,
  status: 'fail',
});

const blocked: AccessCause = {
  groupId: '00gFAKE001',
  groupName: 'Engineering — Platform',
  remedy: 'blocked-by-attribute',
  ruleId: '0prFAKE001',
  ruleName: 'Platform engineers',
  failingClauses: [
    failing('user.department == "Platform"', 'Support'),
    failing('user.title != "Contractor"', 'Contractor'),
  ],
};

const excluded: AccessCause = {
  groupId: '00gFAKE002',
  groupName: 'VPN Access',
  remedy: 'excluded-by-rule',
  ruleId: '0prFAKE002',
  ruleName: 'All full-time staff get VPN',
  failingClauses: [],
};

const manual: AccessCause = {
  groupId: '00gFAKE003',
  groupName: 'Finance Approvers',
  remedy: 'manual-add',
  failingClauses: [],
};

const undetermined: AccessCause = {
  groupId: '00gFAKE004',
  groupName: 'Regional Leads',
  remedy: 'cannot-determine',
  undeterminedReason: 'unevaluable-clause',
  ruleId: '0prFAKE004',
  ruleName: 'Leads by region',
  failingClauses: [],
};

const meta = {
  title: 'Users/Comparison/CauseWorklist',
  component: CauseWorklist,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The comparison worklist: every group the compared user has and the context user lacks, grouped by **remedy** — the action that would close the gap.\n\n' +
          '`cannot-determine` is a first-class group. It never folds into another remedy, is never hidden because it is short, and is rendered **neutral** — not `danger` (nothing resolved to false) and not `warning` (nothing is wrong; we simply could not tell). Its `undeterminedReason` becomes a sentence saying why.\n\n' +
          'Three empty states are deliberately distinct: `causes` absent means *not computed*, `causes` empty means *computed and nothing found*, and a remedy group with no rows is simply not rendered.',
      },
    },
  },
  args: {
    contextName: 'Jane Doe',
    comparedName: 'John Smith',
    causes: [blocked, excluded, manual, undetermined],
    onViewClauses: fn(),
  },
  argTypes: {
    causes: {
      description:
        'Access differences classified by remedy. Absent means "not computed" — rendered differently from an empty array.',
    },
    contextName: { description: 'Display name for the context user (the one who lacks access).' },
    comparedName: { description: 'Display name for the compared user (the one who has it).' },
    onViewClauses: {
      description: 'Opens the full clause checklist for one cause. Omitted, rows offer no jump.',
    },
  },
} satisfies Meta<typeof CauseWorklist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllRemedies: Story = {};

export const OnlyCannotDetermine: Story = {
  args: {
    causes: [
      undetermined,
      { ...undetermined, groupId: '00gFAKE005', groupName: 'Contractors — EMEA' },
      {
        ...undetermined,
        groupId: '00gFAKE006',
        groupName: 'Data Stewards',
        undeterminedReason: 'needs-group-context',
      },
      {
        ...undetermined,
        groupId: '00gFAKE007',
        groupName: 'Payroll Admins',
        undeterminedReason: 'ambiguous-attribution',
      },
      {
        ...undetermined,
        groupId: '00gFAKE008',
        groupName: 'Beta Testers',
        undeterminedReason: 'no-rule-inventory',
      },
      {
        ...undetermined,
        groupId: '00gFAKE009',
        groupName: 'On-call Rotation',
        undeterminedReason: 'no-condition',
      },
    ],
  },
};

export const SingleCannotDetermineBesideLargeGroup: Story = {
  args: {
    causes: [
      ...Array.from({ length: 8 }, (_, i) => ({
        ...blocked,
        groupId: `00gFAKEB${i}`,
        groupName: `Engineering — Squad ${i + 1}`,
      })),
      undetermined,
    ],
  },
};

export const NotComputed: Story = {
  args: { causes: undefined },
};

export const Empty: Story = {
  args: { causes: [] },
};

export const LongGroupName: Story = {
  args: {
    causes: [
      {
        ...blocked,
        groupId: '00gFAKELONG',
        groupName:
          'Engineering — Platform — Identity and Access Management — Contractors — EMEA — Read Only — Provisioned via Workday — Do Not Delete',
        ruleName:
          'All Workday-provisioned contractors in EMEA with a read-only entitlement on the identity platform',
      },
    ],
  },
};

export const WithoutClauseDeepLink: Story = {
  args: { onViewClauses: undefined },
};
