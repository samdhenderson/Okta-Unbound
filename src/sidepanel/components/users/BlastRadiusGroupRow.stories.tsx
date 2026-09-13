import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import BlastRadiusGroupRow from './BlastRadiusGroupRow';
import type { GroupEffect } from '../../../shared/membership/blastRadiusTypes';

const RULE_ID = '0prFAKErule00001';

const effect = (
  over: Partial<GroupEffect> & Pick<GroupEffect, 'groupId' | 'groupName' | 'kind'>,
): GroupEffect => ({
  contributingRuleIds: [RULE_ID],
  currentlyHeld: false,
  ...over,
});

const meta = {
  title: 'Users/BlastRadiusGroupRow',
  component: BlastRadiusGroupRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'What one profile edit is predicted to do to one group’s membership. The marker is a status, not a control: its accessible name is `Added` / `Removed`, so the row asserts the effect rather than qualifying it.\n\n' +
          '`Not predicted` is a third peer kind, neutral rather than `danger` — it is emitted only where something was implicated and the engine declined to call it, and it always names why and shows how Okta credits the membership today.',
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
        'One entry from `BlastRadiusReport.groups`; its names are untrusted tenant data.',
    },
  },
  args: {
    onToggle: fn(),
    effect: effect({
      groupId: '00gFAKE00000000000001',
      groupName: 'Sales-All',
      kind: 'added',
      ruleId: RULE_ID,
      ruleName: 'Sales auto-add',
    }),
  },
} satisfies Meta<typeof BlastRadiusGroupRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddedEffect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Sales-All')).toBeInTheDocument();
    await expect(canvas.getByRole('img', { name: 'Added' })).toBeInTheDocument();
    await expect(canvas.queryByRole('img', { name: 'Likely added' })).toBeNull();
    await expect(canvas.getByText(/starts matching this user/i)).toBeInTheDocument();
  },
};

export const RemovedEffect: Story = {
  args: {
    effect: effect({
      groupId: '00gFAKE00000000000002',
      groupName: 'Engineering-All',
      kind: 'removed',
      ruleId: RULE_ID,
      ruleName: 'Eng auto-add',
      currentlyHeld: true,
      currentBucket: 'rule',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Removed' })).toBeInTheDocument();
    await expect(canvas.getByText(/stops matching this user/i)).toBeInTheDocument();
  },
};

export const SeveralRules: Story = {
  args: {
    effect: effect({
      groupId: '00gFAKE00000000000003',
      groupName: 'EMEA-Everyone',
      kind: 'added',
      contributingRuleIds: [RULE_ID, '0prFAKErule00002', '0prFAKErule00003'],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3 rules start matching this user.')).toBeInTheDocument();
  },
};

export const NotPredictedAnotherRuleMatches: Story = {
  args: {
    effect: effect({
      groupId: '00gFAKE00000000000004',
      groupName: 'Contractors',
      kind: 'not-predicted',
      withheldReason: 'another-active-rule-still-matches',
      blockingRuleName: 'Contractor catch-all',
      currentlyHeld: true,
      currentBucket: 'rule',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Not predicted' })).toBeInTheDocument();
    await expect(canvas.getByText(/Contractor catch-all/)).toBeInTheDocument();
    await expect(canvas.getByText('Rule')).toBeInTheDocument();
  },
};

export const NotPredictedDirectMembership: Story = {
  args: {
    effect: effect({
      groupId: '00gFAKE00000000000005',
      groupName: 'Ops-Handbook',
      kind: 'not-predicted',
      withheldReason: 'membership-not-credited-to-rule',
      currentlyHeld: true,
      currentBucket: 'direct',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/credits this membership to a direct add/i)).toBeInTheDocument();
    await expect(canvas.getByText('Direct')).toBeInTheDocument();
  },
};

export const NotPredictedAttributionHedged: Story = {
  args: {
    effect: effect({
      groupId: '00gFAKE00000000000006',
      groupName: 'Security-Reviewers',
      kind: 'not-predicted',
      withheldReason: 'membership-attribution-deduced',
      currentlyHeld: true,
      currentBucket: 'rule',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/was never established/i)).toBeInTheDocument();
  },
};

export const NotPredictedRuleUnevaluable: Story = {
  args: {
    effect: effect({
      groupId: '00gFAKE00000000000007',
      groupName: 'Finance-All',
      kind: 'not-predicted',
      withheldReason: 'rule-unevaluable-after',
      currentlyHeld: true,
      currentBucket: 'rule',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/could not be evaluated here/i)).toBeInTheDocument();
    await expect(canvas.getByText(/cannot say the membership ends/i)).toBeInTheDocument();
  },
};

export const NotPredictedRuleInactive: Story = {
  args: {
    effect: effect({
      groupId: '00gFAKE00000000000008',
      groupName: 'Legacy-Interns',
      kind: 'not-predicted',
      withheldReason: 'rule-inactive',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/deactivated or no longer evaluable/i)).toBeInTheDocument();
    await expect(canvas.queryByText(/rule is inactive/i)).not.toBeInTheDocument();
  },
};

export const NotPredictedAppMastered: Story = {
  args: {
    effect: effect({
      groupId: '00gFAKE00000000000009',
      groupName: 'workday.contractors',
      kind: 'not-predicted',
      withheldReason: 'app-mastered-group',
      currentlyHeld: true,
      currentBucket: 'app',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/managed by its application/i)).toBeInTheDocument();
    await expect(canvas.getByText('App')).toBeInTheDocument();
  },
};

export const Compact: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
  args: {
    effect: effect({
      groupId: '00gFAKE00000000000010',
      groupName: 'emea-sales-enablement-contractors-2026',
      kind: 'removed',
      ruleId: RULE_ID,
      ruleName: 'EMEA sales enablement — contractors only',
      currentlyHeld: true,
      currentBucket: 'rule',
    }),
  },
};

export const WithCascade: Story = {
  args: {
    effect: effect({
      groupId: '00gFAKE00000000000011',
      groupName: 'New Hires',
      kind: 'added',
      ruleId: RULE_ID,
      ruleName: 'Sales onboarding',
    }),
    expanded: false,
    cascade: [
      {
        ruleId: '0prFAKErule00021',
        ruleName: 'Downstream feeder',
        direction: 'toward-match',
        matchedBy: 'name',
        targetGroupNames: ['Finance'],
      },
      {
        ruleId: '0prFAKErule00022',
        ruleName: 'Contractor guard',
        direction: 'away-from-match',
        matchedBy: 'nameStartsWith',
        targetGroupNames: ['Vendors', 'Temp Access'],
      },
    ],
  },
  render: (args) => {
    const Harness = () => {
      const [expanded, setExpanded] = useState(false);
      return (
        <BlastRadiusGroupRow
          {...args}
          expanded={expanded}
          onToggle={() => setExpanded((prev) => !prev)}
        />
      );
    };
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Rules that use this group/ });

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Downstream feeder')).toBeInTheDocument();
  },
};

export const CascadeOpen: Story = {
  args: { ...WithCascade.args, expanded: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: /Rules that use this group/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(canvas.getByText('Downstream feeder')).toBeInTheDocument();
    await expect(canvas.getByText(/Finance/)).toBeInTheDocument();
    await expect(canvas.getByText('Toward matching')).toBeInTheDocument();
    await expect(canvas.getByText(/Matched by name pattern/)).toBeInTheDocument();
    await expect(canvas.getByText(/prediction stops at one hop/i)).toBeInTheDocument();
  },
};

export const NoCascade: Story = {
  args: {
    effect: effect({
      groupId: '00gFAKE00000000000012',
      groupName: 'Sales-All',
      kind: 'added',
      ruleId: RULE_ID,
      ruleName: 'Sales onboarding',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /Rules that use/ })).toBeNull();
  },
};
