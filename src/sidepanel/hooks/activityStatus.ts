import type { SchedulerStatus } from '../../shared/scheduler/types';

export const STATUS_COLOR: Record<SchedulerStatus, string> = {
  idle: 'var(--color-success)',
  processing: 'var(--color-info)',
  throttled: 'var(--color-warning)',
  cooldown: 'var(--color-danger)',
  paused: 'var(--color-neutral-500)',
};

export const STATUS_LABEL: Record<SchedulerStatus, string> = {
  idle: 'Ready',
  processing: 'Processing',
  throttled: 'Throttled',
  cooldown: 'Cooldown',
  paused: 'Paused',
};
