import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ActivityBarView from './ActivityBarView';
import type { ActivityView } from '../hooks/useActivityBar';
import { inSidePanelFrame } from '../../../.storybook/decorators';

const meta = {
  title: 'Sidepanel/ActivityBarView',
  component: ActivityBarView,
  tags: ['autodocs'],
  decorators: [inSidePanelFrame],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pure presentation of the unified activity bar: a fixed bottom bar whose status region, one-line summary (queue · rate · ETA) and action area stay mounted, so values coming and going swap text in place instead of reflowing the row. Beneath it sits the bucket rack, one lane per rate-limit family the scheduler has exercised. A chevron condenses the whole thing to a 36px line — status, rate and a processed/progress tally — which is the state the bar boots into.\n\n' +
          'Every figure arrives as an already-merged `ActivityView`; timers and context wiring live in `useActivityBar`.',
      },
    },
  },
  argTypes: {
    view: {
      description:
        'Merged, display-ready activity state (status, summary figures, the ETA range, buckets, progress, cancel flags).',
    },
    onCancel: { description: 'Invoked when the user confirms cancellation of the current work.' },
    onCancelOperation: {
      description: 'Stops one declared operation, leaving every other one running.',
    },
    collapsed: { description: 'Whether the bar is condensed to its essentials.' },
    onToggleCollapse: { description: 'Toggles between the condensed and full layouts.' },
  },
  args: {
    onCancel: fn(),
    onCancelOperation: fn(),
    onToggleCollapse: fn(),
  },
} satisfies Meta<typeof ActivityBarView>;

export default meta;
type Story = StoryObj<typeof meta>;

const FIXED_NOW = 1_760_000_000_000;

const idleView: ActivityView = {
  statusLabel: 'Ready',
  statusColorVar: 'var(--color-success)',
  busy: false,
  operationActive: false,
  current: 0,
  total: 0,
  percentage: 0,
  opCompleted: 0,
  opActive: 0,
  opFailed: 0,
  queueLength: 0,
  activeRequests: 0,
  rateLimit: null,
  eta: null,
  processed: 0,
  failed: 0,
  isCancelling: false,
  canCancel: false,
  buckets: [],
  lowThresholdPercent: 10,
  operations: [],
  now: FIXED_NOW,
};

export const Default: Story = {
  args: { view: idleView },
};

export const OperationInProgress: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Processing',
      statusColorVar: 'var(--color-info)',
      busy: true,
      operationActive: true,
      operationName: 'Removing members',
      current: 42,
      total: 120,
      percentage: 35,
      elapsedLabel: '0:18',
      eta: { kind: 'point', lowerMs: 34_000, label: '~0:34 left' },
      opCompleted: 40,
      opActive: 2,
      opFailed: 0,
      queueLength: 6,
      activeRequests: 2,
      canCancel: true,
    },
  },
};

export const OperationWithFailures: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Processing',
      statusColorVar: 'var(--color-info)',
      busy: true,
      operationActive: true,
      operationName: 'Adding members',
      current: 88,
      total: 100,
      percentage: 88,
      elapsedLabel: '1:02',
      eta: { kind: 'point', lowerMs: 8_000, label: '~0:08 left' },
      opCompleted: 82,
      opActive: 1,
      opFailed: 5,
      queueLength: 1,
      activeRequests: 1,
      canCancel: true,
    },
  },
};

export const RateLimitLow: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Throttled',
      statusColorVar: 'var(--color-warning)',
      busy: true,
      queueLength: 14,
      activeRequests: 3,
      rateLimit: { remaining: 8, limit: 100, low: true },
      canCancel: true,
    },
  },
};

export const Cooldown: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Cooldown',
      statusColorVar: 'var(--color-danger)',
      busy: true,
      queueLength: 9,
      cooldownLabel: '12s',
      canCancel: true,
    },
  },
};

export const ProcessedWithFailures: Story = {
  args: {
    view: {
      ...idleView,
      processed: 118,
      failed: 3,
    },
  },
};

export const CollapsedIdle: Story = {
  args: {
    collapsed: true,
    view: {
      ...idleView,
      rateLimit: { remaining: 480, limit: 600, low: false },
      processed: 118,
      failed: 3,
    },
  },
};

export const CollapsedOperation: Story = {
  args: {
    collapsed: true,
    view: {
      ...idleView,
      statusLabel: 'Processing',
      statusColorVar: 'var(--color-info)',
      busy: true,
      operationActive: true,
      operationName: 'Removing members',
      current: 42,
      total: 120,
      percentage: 35,
      opCompleted: 40,
      opActive: 2,
      opFailed: 1,
      rateLimit: { remaining: 90, limit: 600, low: false },
      queueLength: 6,
      activeRequests: 2,
      canCancel: true,
    },
  },
};

export const Expanded: Story = {
  args: {
    collapsed: false,
    view: {
      ...idleView,
      statusLabel: 'Processing',
      statusColorVar: 'var(--color-info)',
      busy: true,
      operationActive: true,
      operationName: 'Removing members',
      current: 42,
      total: 120,
      percentage: 35,
      elapsedLabel: '0:18',
      eta: { kind: 'point', lowerMs: 34_000, label: '~0:34 left' },
      opCompleted: 40,
      opActive: 2,
      opFailed: 0,
      rateLimit: { remaining: 90, limit: 600, low: false },
      queueLength: 6,
      activeRequests: 2,
      canCancel: true,
    },
  },
};

export const Cancelling: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Processing',
      statusColorVar: 'var(--color-info)',
      busy: true,
      operationActive: true,
      operationName: 'Removing members',
      current: 10,
      total: 50,
      percentage: 20,
      opCompleted: 10,
      opActive: 0,
      opFailed: 0,
      queueLength: 3,
      isCancelling: true,
      canCancel: false,
    },
  },
};

function bucket(
  overrides: { bucket: string } & Partial<ActivityView['buckets'][number]>,
): ActivityView['buckets'][number] {
  return {
    limit: 600,
    remaining: 600,
    resetAt: FIXED_NOW + 60_000,
    queued: 0,
    active: 0,
    planned: 0,
    gatedUntil: null,
    lastActiveAt: null,
    ...overrides,
  };
}

export const BucketsAllQuiet: Story = {
  args: {
    view: {
      ...idleView,
      processed: 128,
      buckets: [
        bucket({ bucket: '/api/v1/users' }),
        bucket({ bucket: '/api/v1/groups' }),
        bucket({ bucket: '/api/v1/apps' }),
        bucket({ bucket: '/api/v1/policies' }),
        bucket({ bucket: '/api/v1/meta', limit: null, remaining: null, resetAt: null }),
      ],
    },
  },
};

export const BucketsWithPlannedWork: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Processing',
      statusColorVar: 'var(--color-info)',
      busy: true,
      operationActive: true,
      operationName: 'Export all users',
      current: 312,
      total: 812,
      percentage: 38,
      opCompleted: 312,
      opActive: 4,
      queueLength: 26,
      activeRequests: 4,
      rateLimit: { remaining: 288, limit: 600, low: false },
      canCancel: true,
      buckets: [
        bucket({ bucket: '/api/v1/users', remaining: 288, active: 4, queued: 26, planned: 470 }),
        bucket({ bucket: '/api/v1/groups' }),
        bucket({ bucket: '/api/v1/policies' }),
      ],
    },
  },
};

export const BucketCoolingDown: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Cooldown',
      statusColorVar: 'var(--color-danger)',
      busy: true,
      queueLength: 40,
      rateLimit: { remaining: 18, limit: 600, low: true },
      cooldownLabel: '24s',
      canCancel: true,
      buckets: [
        bucket({
          bucket: '/api/v1/users',
          remaining: 18,
          queued: 40,
          planned: 500,
          gatedUntil: FIXED_NOW + 24_000,
        }),
        bucket({ bucket: '/api/v1/apps', limit: 300, remaining: 81, queued: 3, planned: 402 }),
        bucket({ bucket: '/api/v1/groups' }),
        bucket({ bucket: '/api/v1/policies' }),
      ],
    },
  },
};

export const RackAtRest: Story = {
  args: {
    view: {
      ...idleView,
      processed: 1_284,
      buckets: [
        bucket({
          bucket: '/api/v1/users',
          limit: null,
          remaining: null,
          resetAt: null,
          lastActiveAt: FIXED_NOW - 95_000,
        }),
        bucket({
          bucket: '/api/v1/groups',
          limit: null,
          remaining: null,
          resetAt: null,
          lastActiveAt: FIXED_NOW - 6_000,
        }),
        bucket({ bucket: '/api/v1/apps', limit: null, remaining: null, resetAt: null }),
        bucket({ bucket: '/api/v1/policies' }),
      ],
    },
  },
};

export const EtaNotKnownYet: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Processing',
      statusColorVar: 'var(--color-info)',
      busy: true,
      operationActive: true,
      operationName: 'Export all users',
      current: 1,
      total: 812,
      percentage: 0,
      opCompleted: 1,
      opActive: 4,
      queueLength: 30,
      activeRequests: 4,
      rateLimit: { remaining: 594, limit: 600, low: false },
      eta: { kind: 'unknown', label: 'estimating…' },
      canCancel: true,
      buckets: [
        bucket({
          bucket: '/api/v1/users',
          remaining: 594,
          active: 4,
          queued: 30,
          planned: 778,
          lastActiveAt: FIXED_NOW - 1_000,
        }),
      ],
    },
  },
};

export const EtaRangeWidenedByCooldown: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Cooldown',
      statusColorVar: 'var(--color-danger)',
      busy: true,
      operationActive: true,
      operationName: 'Export all users',
      current: 406,
      total: 812,
      percentage: 50,
      opCompleted: 402,
      opActive: 4,
      opFailed: 4,
      queueLength: 40,
      activeRequests: 4,
      rateLimit: { remaining: 18, limit: 600, low: true },
      eta: { kind: 'range', lowerMs: 80_000, upperMs: 170_000, label: '1:20–2:50 left' },
      canCancel: true,
      buckets: [
        bucket({
          bucket: '/api/v1/users',
          remaining: 18,
          queued: 40,
          planned: 366,
          gatedUntil: FIXED_NOW + 90_000,
          lastActiveAt: FIXED_NOW - 2_000,
        }),
        bucket({
          bucket: '/api/v1/groups',
          limit: 600,
          remaining: 540,
          active: 4,
          lastActiveAt: FIXED_NOW - 500,
        }),
      ],
    },
  },
};

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

export const ConcurrentOperations: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Processing',
      statusColorVar: 'var(--color-info)',
      busy: true,
      operationActive: true,
      operationName: 'Export all users',
      current: 312,
      total: 812,
      percentage: 38,
      opCompleted: 312,
      opActive: 4,
      queueLength: 26,
      activeRequests: 4,
      rateLimit: { remaining: 288, limit: 600, low: false },
      canCancel: true,
      buckets: [
        bucket({ bucket: '/api/v1/users', remaining: 288, active: 4, queued: 26, planned: 470 }),
        bucket({ bucket: '/api/v1/groups', active: 1, planned: 2 }),
      ],
      operations: [
        {
          id: 'export',
          name: 'Export all users',
          startedAt: FIXED_NOW - 90_000,
          legs: [leg('/api/v1/users', 812, 342)],
          spent: 342,
          estimated: 812,
          remaining: 470,
          approximate: false,
        },
        {
          id: 'search',
          name: 'Search groups',
          startedAt: FIXED_NOW - 2_000,
          legs: [leg('/api/v1/groups', 3, 1)],
          spent: 1,
          estimated: 3,
          remaining: 2,
          approximate: true,
        },
      ],
    },
  },
};

export const GatedWithLedger: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Cooldown',
      statusColorVar: 'var(--color-danger)',
      busy: true,
      queueLength: 40,
      rateLimit: { remaining: 18, limit: 600, low: true },
      cooldownLabel: '24s',
      canCancel: true,
      buckets: [
        bucket({
          bucket: '/api/v1/users',
          remaining: 18,
          queued: 40,
          planned: 470,
          gatedUntil: FIXED_NOW + 24_000,
        }),
        bucket({
          bucket: '/api/v1/apps',
          limit: 300,
          remaining: 4,
          queued: 3,
          planned: 402,
          gatedUntil: FIXED_NOW + 95_000,
        }),
        bucket({ bucket: '/api/v1/groups' }),
      ],
      operations: [
        {
          id: 'export',
          name: 'Export all users',
          startedAt: FIXED_NOW - 90_000,
          legs: [leg('/api/v1/users', 812, 342)],
          spent: 342,
          estimated: 812,
          remaining: 470,
          approximate: false,
        },
        {
          id: 'assignments',
          name: 'Count app assignments',
          startedAt: FIXED_NOW - 30_000,
          legs: [leg('/api/v1/apps', 402, 0)],
          spent: 0,
          estimated: 402,
          remaining: 402,
          approximate: true,
        },
      ],
    },
  },
};

const CollapsibleHarness = (args: React.ComponentProps<typeof ActivityBarView>) => {
  const [collapsed, setCollapsed] = React.useState(true);
  return (
    <ActivityBarView
      {...args}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((c) => !c)}
    />
  );
};

export const ToggleCollapse: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Processing',
      statusColorVar: 'var(--color-info)',
      busy: true,
      operationActive: true,
      operationName: 'Removing members',
      current: 42,
      total: 120,
      percentage: 35,
      eta: { kind: 'point', lowerMs: 34_000, label: '~0:34 left' },
      opCompleted: 40,
      opActive: 2,
      queueLength: 6,
      activeRequests: 2,
      rateLimit: { remaining: 90, limit: 600, low: false },
      canCancel: true,
      buckets: [bucket({ bucket: '/api/v1/users', remaining: 90, active: 2, queued: 6 })],
    },
  },
  render: (args) => <CollapsibleHarness {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Show all activity stats' }));
    await expect(await canvas.findByTestId('activity-operation-name')).toHaveTextContent(
      'Removing members',
    );

    await userEvent.click(await canvas.findByRole('button', { name: 'Hide extra activity stats' }));
    await expect(
      await canvas.findByRole('button', { name: 'Show all activity stats' }),
    ).toBeInTheDocument();
  },
};

export const CancelRunningWork: Story = {
  args: {
    view: {
      ...idleView,
      statusLabel: 'Processing',
      statusColorVar: 'var(--color-info)',
      busy: true,
      operationActive: true,
      operationName: 'Removing members',
      current: 10,
      total: 50,
      percentage: 20,
      opCompleted: 10,
      queueLength: 3,
      canCancel: true,
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Cancel' }));
    await expect(args.onCancel).toHaveBeenCalled();
  },
};
