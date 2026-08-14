import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import CauseWorklistRow from './CauseWorklistRow';
import type { AccessCause } from './accessCause';
import type { ClauseExplanation } from '../../../../shared/rules/explainExpression';

const failing = (expressionText: string, resolvedValue: ClauseExplanation['resolvedValue']) =>
  ({ expressionText, resolvedValue, status: 'fail' }) satisfies ClauseExplanation;

const blocked: AccessCause = {
  groupId: '00gFAKE001',
  groupName: 'Engineering — Platform',
  remedy: 'blocked-by-attribute',
  ruleId: '0prFAKE001',
  ruleName: 'Platform engineers',
  failingClauses: [failing('user.department == "Platform"', 'Support')],
};

const meta = {
  title: 'Users/Comparison/CauseWorklistRow',
  component: CauseWorklistRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One group on the cause worklist: its name, the rule it hinges on, the failing-clause evidence, and the jump into the full clause checklist.\n\n' +
          'A `cannot-determine` row renders its reason as a sentence in the **neutral** palette — never `danger`, never `warning`. The clause preview is capped, with the remainder counted and left to the checklist. Long group and rule names wrap rather than overflow.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ul className="space-y-2 p-3">
        <Story />
      </ul>
    ),
  ],
  args: { cause: blocked, onViewClauses: fn() },
  argTypes: {
    cause: { description: 'The classified difference. Its group and rule names are untrusted.' },
    onViewClauses: {
      description:
        'Opens the full clause checklist for this cause. Omitted, the row offers no jump.',
    },
  },
} satisfies Meta<typeof CauseWorklistRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BlockedByAttribute: Story = {};

export const ManyFailingClauses: Story = {
  args: {
    cause: {
      ...blocked,
      failingClauses: [
        failing('user.department == "Platform"', 'Support'),
        failing('user.title != "Contractor"', 'Contractor'),
        failing('user.costCenter == "R&D"', 'G&A'),
        failing('user.employeeNumber != null', null),
        failing('user.locale == "en_US"', undefined),
      ],
    },
  },
};

export const ManualAdd: Story = {
  args: {
    cause: {
      groupId: '00gFAKE003',
      groupName: 'Finance Approvers',
      remedy: 'manual-add',
      failingClauses: [],
    },
  },
};

export const CannotDetermine: Story = {
  args: {
    cause: {
      groupId: '00gFAKE004',
      groupName: 'Regional Leads',
      remedy: 'cannot-determine',
      undeterminedReason: 'unevaluable-clause',
      ruleId: '0prFAKE004',
      ruleName: 'Leads by region',
      failingClauses: [],
    },
  },
};

export const LongGroupName: Story = {
  args: {
    cause: {
      ...blocked,
      groupName:
        'Engineering — Platform — Identity and Access Management — Contractors — EMEA — Read Only — Provisioned via Workday — Do Not Delete',
      ruleName:
        'All Workday-provisioned contractors in EMEA with a read-only entitlement on the identity platform',
    },
  },
};

export const WithoutClauseDeepLink: Story = {
  args: { onViewClauses: undefined },
};
