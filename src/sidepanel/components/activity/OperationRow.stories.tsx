import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import OperationRow from './OperationRow';
import type { PlanSummary } from '@/shared/scheduler/plan';

const meta = {
  title: 'Sidepanel/Activity/OperationRow',
  component: OperationRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One operation and its declared request budget. The budget reads `spent / estimated` ' +
          'plainly — the total the scheduler currently holds, with no qualifier — and the meter ' +
          'beneath renders the same figures. The ✕ stops this operation alone; requests already ' +
          'dispatched are left to settle, because their budget is already spent.',
      },
    },
  },
  argTypes: {
    operation: { description: 'The plan as published by the scheduler.' },
    onCancel: { description: 'Stops this operation alone. Omit for a read-only ledger.' },
  },
  args: { onCancel: fn() },
} satisfies Meta<typeof OperationRow>;

export default meta;
type Story = StoryObj<typeof meta>;

const STARTED_AT = 1_760_000_000_000;

function leg(bucket: string, estimated: number | null, spent = 0) {
  return {
    id: `${bucket}-leg`,
    bucket,
    method: 'GET',
    estimated,
    spent,
    remaining: estimated === null ? null : Math.max(0, estimated - spent),
    approximate: false,
  };
}

function plan(overrides: Partial<PlanSummary> & { id: string; name: string }): PlanSummary {
  return {
    startedAt: STARTED_AT,
    legs: [leg('/api/v1/users', 50)],
    spent: 0,
    estimated: 50,
    remaining: 50,
    approximate: false,
    ...overrides,
  };
}

export const ExactBudget: Story = {
  args: {
    operation: plan({
      id: 'export',
      name: 'Export all users',
      legs: [leg('/api/v1/users', 50, 12)],
      spent: 12,
      remaining: 38,
    }),
  },
};

export const ApproximateBudget: Story = {
  args: {
    operation: plan({
      id: 'export',
      name: 'Export all users',
      legs: [leg('/api/v1/users', 8, 3)],
      spent: 3,
      estimated: 8,
      remaining: 5,
      approximate: true,
    }),
  },
};

export const MultipleBuckets: Story = {
  args: {
    operation: plan({
      id: 'scan',
      name: 'Scan group MFA',
      legs: [leg('/api/v1/groups', 4, 4), leg('/api/v1/users', 120, 31)],
      spent: 35,
      estimated: 124,
      remaining: 89,
    }),
  },
};

export const Unsized: Story = {
  args: {
    operation: plan({
      id: 'rules',
      name: 'Capture rule impact',
      legs: [leg('/api/v1/groups', null, 6)],
      spent: 6,
      estimated: null,
      remaining: null,
      approximate: true,
    }),
  },
};

export const NoCancelControl: Story = {
  args: {
    operation: plan({ id: 'export', name: 'Export all users', spent: 12, remaining: 38 }),
    onCancel: undefined,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

export const Stopping: Story = {
  args: {
    operation: plan({
      id: 'export',
      name: 'Export all users',
      legs: [leg('/api/v1/users', 50, 12)],
      spent: 12,
      remaining: 38,
    }),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Stop Export all users' }));
    await expect(args.onCancel).toHaveBeenCalledWith('export');
  },
};
