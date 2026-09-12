import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import MembershipRuleEvidence from './MembershipRuleEvidence';
import { NavigationProvider } from '../../contexts/NavigationContext';
import type { MembershipRule, OktaUser } from '../../../shared/types';

const handlers = { rule: fn(), group: fn(), user: fn(), app: fn(), policy: fn() };

const user: OktaUser = {
  id: '00uFAKE00000000000001',
  status: 'ACTIVE',
  profile: {
    login: 'user@example.com',
    email: 'user@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
    title: 'Intern',
    countryCode: 'GB',
  },
};

const rule = (id: string, name: string, conditionExpression: string): MembershipRule => ({
  id,
  name,
  status: 'ACTIVE',
  conditionExpression,
});

const singleClause = rule(
  '0prFAKErule00001',
  'Auto-add Engineers',
  'user.department == "Engineering"',
);

const multiClause = rule(
  '0prFAKErule00002',
  'EMEA engineering interns',
  'user.department == "Engineering" && user.countryCode == "GB" && user.title == "Intern"',
);

const missingAttribute = rule('0prFAKErule00003', 'Cost-centre 4100', 'user.costCenter == "4100"');

const unevaluable = rule(
  '0prFAKErule00004',
  'Contractor VPN',
  'isMemberOfGroup("00gFAKE00000000000009")',
);

const meta = {
  title: 'Users/MembershipRuleEvidence',
  component: MembershipRuleEvidence,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The evidence card behind one membership: a link to the rule, the profile attributes its ' +
          'condition **reads**, and the condition itself.\n\n' +
          'It carries **no caption of its own**. The row above already wears the verdict badge that ' +
          'says how much the attribution is worth, and repeating that hedge once per rule is exactly ' +
          'how this surface used to read.\n\n' +
          'The `Reads` chips come from walking the parsed AST, not from a regex over the text: ' +
          '`user.department == "user.title"` names **one** attribute, and any pattern match over the ' +
          'expression reports two. An **unparseable** condition therefore yields no chips at all ' +
          'rather than an empty `Reads` row, which would state as fact that the rule reads nothing.\n\n' +
          'With a `user`, the condition is rendered by `ClauseLedger` — the tree the tenant actually ' +
          'wrote, with the profile value that drove each clause. Without one there is nothing to evaluate against, so the ' +
          'raw condition is shown instead of an explanation nobody could trust.\n\n' +
          '**Related internals:** [Shared](?path=/docs/internals-shared--docs)',
      },
    },
  },
  decorators: [
    (Story: () => React.ReactElement) => (
      <NavigationProvider handlers={handlers}>
        <div className="bg-white p-4">
          <Story />
        </div>
      </NavigationProvider>
    ),
  ],
  args: {
    rule: singleClause,
    user,
  },
  argTypes: {
    rule: { description: 'One rule this membership is attributed to.' },
    user: {
      description:
        'The user to explain the condition against. Omitted, the raw condition is shown — an explanation would have nothing to evaluate.',
    },
  },
} satisfies Meta<typeof MembershipRuleEvidence>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EvaluatedAgainstUser: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('department')).toHaveLength(2);
    await expect(canvas.getByText('Pass')).toBeInTheDocument();
  },
};

export const WithoutUser: Story = {
  args: { user: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('user.department == "Engineering"')).toBeInTheDocument();
    await expect(canvas.queryByText('Pass')).toBeNull();
  },
};

export const MultiClauseCondition: Story = {
  args: { rule: multiClause },
};

export const MultiClauseWithoutUser: Story = {
  args: { rule: multiClause, user: undefined },
};

export const AttributeTheUserLacks: Story = {
  args: { rule: missingAttribute },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('costCenter')).toHaveLength(2);
  },
};

export const UnevaluableClause: Story = {
  args: { rule: unevaluable },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Not evaluated')).toBeInTheDocument();
  },
};

export const Compact: Story = {
  args: { rule: multiClause },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
