import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import OperationList from './OperationList';
import type { PlanSummary } from '@/shared/scheduler/plan';

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
    legs: [leg('/api/v1/users', 50, 12)],
    spent: 12,
    estimated: 50,
    remaining: 38,
    approximate: false,
    ...overrides,
  };
}

const exportUsers = plan({ id: 'export', name: 'Export all users' });
const scanMfa = plan({
  id: 'scan',
  name: 'Scan group MFA',
  legs: [leg('/api/v1/groups', 4, 4), leg('/api/v1/users', 120, 31)],
  spent: 35,
  estimated: 124,
  remaining: 89,
});
const captureImpact = plan({
  id: 'impact',
  name: 'Capture rule impact',
  legs: [leg('/api/v1/groups', null, 6)],
  spent: 6,
  estimated: null,
  remaining: null,
  approximate: true,
});
const loadGroups = plan({ id: 'groups', name: 'Load all groups' });
const walkApps = plan({ id: 'apps', name: 'Walk app assignments' });

const meta = {
  title: 'Sidepanel/Activity/OperationList',
  component: OperationList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every operation that has declared a budget, oldest first, so concurrent work reads as several rows rather than one progress bar. Each row is an `OperationRow` with its own stop control.\n\n' +
          'With nothing declared the list renders nothing at all, keeping an idle bar slim; past `maxRows` the remainder is counted on one line rather than listed.',
      },
    },
  },
  argTypes: {
    operations: { description: 'Active plans as published by the scheduler, oldest first.' },
    onCancelOperation: { description: 'Stops one operation; omit for a read-only ledger.' },
    maxRows: { description: 'Cap on listed rows; beyond it the overflow is counted.' },
  },
  args: {
    operations: [exportUsers, scanMfa],
    onCancelOperation: fn(),
  },
} satisfies Meta<typeof OperationList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleOperation: Story = {
  args: { operations: [exportUsers] },
};

export const Empty: Story = {
  args: { operations: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

export const OverflowCounted: Story = {
  args: { operations: [exportUsers, scanMfa, captureImpact, loadGroups, walkApps] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('+ 2 more operations')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Stop Walk app assignments' })).toBeNull();
  },
};

export const OverflowOfOne: Story = {
  args: { operations: [exportUsers, scanMfa, captureImpact, loadGroups] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('+ 1 more operation')).toBeInTheDocument();
  },
};

export const ReadOnly: Story = {
  args: { onCancelOperation: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

export const StoppingOneOperation: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Stop Scan group MFA' }));
    await expect(args.onCancelOperation).toHaveBeenCalledWith('scan');
    await expect(canvas.getByRole('button', { name: 'Stop Export all users' })).toBeInTheDocument();
  },
};
