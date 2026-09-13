import type { Meta, StoryObj } from '@storybook/react-vite';
import BucketRow from './BucketRow';
import type { BucketState } from '@/shared/scheduler/types';

const meta = {
  title: 'Sidepanel/Activity/BucketRow',
  component: BucketRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One lane of the bucket rack. The track is the budget, not the shape of the work: its denominator is `remaining`, running requests fill solid, queued and planned work continues dashed, and the pale tail is the headroom left once this work drains. Declared work past the remaining budget saturates the track and removes the tail.\n\n' +
          'A lane with no denominator never invents one — a remembered bucket draws an empty track and says **at rest**, and a bucket Okta has not reported on draws a faint hatch and states only its counts. Every magnitude drawn is also stated in words, nothing depends on hue, and every pattern is static.',
      },
    },
  },
  argTypes: {
    bucket: { description: 'The bucket state as published by the scheduler.' },
    lowThresholdPercent: {
      description: 'The org-learned percentage at which the scheduler backs off.',
    },
    now: { description: 'Shared clock tick in epoch ms, so every countdown in the bar agrees.' },
  },
} satisfies Meta<typeof BucketRow>;

export default meta;
type Story = StoryObj<typeof meta>;

const NOW = 1_760_000_000_000;

function bucket(overrides: Partial<BucketState> & { bucket: string }): BucketState {
  return {
    limit: 600,
    remaining: 600,
    resetAt: NOW + 60_000,
    queued: 0,
    active: 0,
    planned: 0,
    gatedUntil: null,
    lastActiveAt: null,
    ...overrides,
  };
}

export const Healthy: Story = {
  args: {
    bucket: bucket({ bucket: '/api/v1/groups' }),
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const PlannedWork: Story = {
  args: {
    bucket: bucket({ bucket: '/api/v1/users', remaining: 380, planned: 812 }),
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const FullPipeline: Story = {
  args: {
    bucket: bucket({
      bucket: '/api/v1/users',
      remaining: 288,
      active: 4,
      queued: 26,
      planned: 300,
    }),
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const LowHeadroom: Story = {
  args: {
    bucket: bucket({ bucket: '/api/v1/apps', limit: 300, remaining: 27, queued: 12, planned: 96 }),
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const Cooling: Story = {
  args: {
    bucket: bucket({
      bucket: '/api/v1/users',
      limit: 600,
      remaining: 18,
      queued: 40,
      planned: 500,
      gatedUntil: NOW + 24_000,
    }),
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const WorkExceedsBudget: Story = {
  args: {
    bucket: bucket({ bucket: '/api/v1/users', limit: 600, remaining: 60, active: 4, queued: 240 }),
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const AtRest: Story = {
  args: {
    bucket: bucket({
      bucket: '/api/v1/users',
      limit: null,
      remaining: null,
      resetAt: null,
      lastActiveAt: NOW - 125_000,
    }),
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const AtRestWorkerEvicted: Story = {
  args: {
    bucket: bucket({
      bucket: '/api/v1/users',
      limit: null,
      remaining: null,
      resetAt: null,
    }),
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const NotReported: Story = {
  args: {
    bucket: bucket({
      bucket: '/api/v1/meta',
      limit: null,
      remaining: null,
      resetAt: null,
      planned: 2,
    }),
    lowThresholdPercent: 10,
    now: NOW,
  },
};
