import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import RuleUserReport from './RuleUserReport';
import { NavigationProvider } from '../../contexts/NavigationContext';
import {
  alreadyMemberVerdict,
  doesNotMatchVerdict,
  excludedByGroupVerdict,
  excludedByUserVerdict,
  grantsVerdict,
  groupContext,
  inactiveVerdict,
  missingTargetVerdict,
  noConditionVerdict,
  resolveGroupName,
  undeterminedVerdict,
  user,
} from './storyFixtures';

const meta = {
  title: 'Qualification/RuleUserReport',
  component: RuleUserReport,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "One rule × one user: the **qualification** headline, then the evidence — the rule's status when inactive, how the rule excludes the user when it does, the clause ledger, and a row per target group saying whether the user already holds it.\n\n" +
          "The ledger's own chip is the *condition*; the headline is the *qualification*. They legitimately differ (a match under an exclusion, a match on an inactive rule) and neither is rewritten to agree with the other.",
      },
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider handlers={{ group: fn() }}>
        <div className="max-w-md p-4">
          <Story />
        </div>
      </NavigationProvider>
    ),
  ],
  args: { user, groupContext, resolveGroupName },
} satisfies Meta<typeof RuleUserReport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Qualifies: Story = {
  args: { verdict: grantsVerdict },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Qualifies')).toBeInTheDocument();
    await expect(canvas.getByText('Rule matches this user')).toBeInTheDocument();
    await expect(canvas.getByText('Not a member')).toBeInTheDocument();
  },
};

export const InactiveWouldMatch: Story = {
  args: { verdict: inactiveVerdict },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Inactive')).toBeInTheDocument();
    await expect(canvas.getByText('Rule matches this user')).toBeInTheDocument();
  },
};

export const DoesNotMatch: Story = {
  args: { verdict: doesNotMatchVerdict },
};

export const ExcludedByUser: Story = {
  args: { verdict: excludedByUserVerdict },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Excluded')).toBeInTheDocument();
    await expect(canvas.getByText("Named on the rule's exclusion list.")).toBeInTheDocument();
    await expect(canvas.getByText('Rule matches this user')).toBeInTheDocument();
  },
};

export const ExcludedByGroup: Story = {
  args: { verdict: excludedByGroupVerdict },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('A member of a group the rule excludes.'),
    ).toBeInTheDocument();
  },
};

export const Undetermined: Story = {
  args: { verdict: undeterminedVerdict },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Not determined')).toBeInTheDocument();
    await expect(canvas.queryByText('Does not match')).not.toBeInTheDocument();
  },
};

export const NoCondition: Story = {
  args: { verdict: noConditionVerdict },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('This rule has no condition expression to explain.'),
    ).toBeInTheDocument();
  },
};

export const AlreadyMemberOfOneTarget: Story = {
  args: { verdict: alreadyMemberVerdict },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Member')).toBeInTheDocument();
    await expect(canvas.getByText('Not a member')).toBeInTheDocument();
  },
};

export const MissingTarget: Story = {
  args: { verdict: missingTargetVerdict },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Group no longer exists')).toBeInTheDocument();
  },
};

export const Compact: Story = {
  args: { verdict: doesNotMatchVerdict, compact: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Engineers into SecOps')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Condition/ })).toBeInTheDocument();
  },
};
