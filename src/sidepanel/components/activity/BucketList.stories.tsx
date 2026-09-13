import type { Meta, StoryObj } from '@storybook/react-vite';
import BucketList from './BucketList';
import type { BucketState } from '@/shared/scheduler/types';

const meta = {
  title: 'Sidepanel/Activity/BucketList',
  component: BucketList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The bucket rack of the expanded activity bar. Lanes are identical because the question is comparative: which endpoint family is holding everything up?\n\n' +
          'Every published bucket gets a lane — no filter, no row cap, no summary line. A lane appears when the scheduler starts tracking a bucket and disappears when the scheduler forgets it; the rack renders retention and has no retention policy of its own. Height is bounded by scrolling rather than truncating.',
      },
    },
  },
  argTypes: {
    buckets: { description: 'Buckets as published by the scheduler, most-pressured first.' },
    lowThresholdPercent: {
      description: 'The org-learned percentage at which the scheduler backs off.',
    },
    now: { description: 'Shared clock tick in epoch ms, so every countdown in the bar agrees.' },
  },
} satisfies Meta<typeof BucketList>;

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

export const NothingExercised: Story = {
  args: {
    buckets: [
      bucket({ bucket: '/api/v1/users' }),
      bucket({ bucket: '/api/v1/groups' }),
      bucket({ bucket: '/api/v1/policies' }),
    ],
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const WorkInParallel: Story = {
  args: {
    buckets: [
      bucket({
        bucket: '/api/v1/users',
        remaining: 288,
        active: 4,
        queued: 26,
        planned: 470,
        lastActiveAt: NOW - 400,
      }),
      bucket({
        bucket: '/api/v1/groups',
        remaining: 512,
        active: 3,
        queued: 8,
        lastActiveAt: NOW - 900,
      }),
      bucket({ bucket: '/api/v1/apps', limit: 300, remaining: 24, active: 1, lastActiveAt: NOW }),
      bucket({ bucket: '/api/v1/policies' }),
    ],
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const RememberedAtRest: Story = {
  args: {
    buckets: [
      bucket({
        bucket: '/api/v1/users',
        limit: null,
        remaining: null,
        resetAt: null,
        lastActiveAt: NOW - 95_000,
      }),
      bucket({
        bucket: '/api/v1/groups',
        limit: null,
        remaining: null,
        resetAt: null,
        lastActiveAt: NOW - 8_000,
      }),
      bucket({ bucket: '/api/v1/policies' }),
    ],
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const OneFamilyGated: Story = {
  args: {
    buckets: [
      bucket({
        bucket: '/api/v1/users',
        remaining: 18,
        queued: 40,
        planned: 500,
        gatedUntil: NOW + 24_000,
        lastActiveAt: NOW - 1_000,
      }),
      bucket({
        bucket: '/api/v1/groups',
        remaining: 540,
        active: 4,
        lastActiveAt: NOW - 200,
      }),
      bucket({ bucket: '/api/v1/meta', limit: null, remaining: null, resetAt: null }),
    ],
    lowThresholdPercent: 10,
    now: NOW,
  },
};

export const EveryBucketKeepsItsLane: Story = {
  args: {
    buckets: [
      bucket({ bucket: '/api/v1/users', limit: 600, remaining: 90, active: 4, queued: 120 }),
      bucket({ bucket: '/api/v1/groups', limit: 600, remaining: 410, active: 2, queued: 18 }),
      bucket({ bucket: '/api/v1/apps', limit: 300, remaining: 22, gatedUntil: NOW + 24_000 }),
      bucket({ bucket: '/api/v1/zones', queued: 2, lastActiveAt: NOW - 400 }),
      bucket({ bucket: '/api/v1/policies', lastActiveAt: NOW - 40_000 }),
      bucket({ bucket: '/api/v1/meta', limit: null, remaining: null, resetAt: null, active: 1 }),
      bucket({ bucket: '/api/v1/idps' }),
    ],
    lowThresholdPercent: 10,
    now: NOW,
  },
};
