import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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
          'One operation and its declared request budget.\n\n' +
          'The budget reads `spent / estimated`, with a **tilde** while the total is a floor rather than a fact — an operation that promised 50 requests and one that promised *at least* 50 behave very differently against a quota. The meter beneath encodes the same thing in form: an approximate remainder is hatched, not solid. The ✕ stops this operation alone; requests it has already dispatched are left to settle, because they have spent their budget and killing them would cost the quota without saving anything.',
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
};
