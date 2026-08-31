import { useState, useEffect, useCallback } from 'react';
import { useScheduler } from '../contexts/SchedulerContext';
import { useProgress } from '../contexts/ProgressContext';
import type { SchedulerStatus, BucketState } from '../../shared/scheduler/types';
import type { PlanSummary } from '../../shared/scheduler/plan';

export interface ActivityView {
  statusLabel: string;
  statusColorVar: string;
  busy: boolean;
  operationActive: boolean;
  operationName?: string;
  message?: string;
  current: number;
  total: number;
  percentage: number;
  elapsedLabel?: string;
  etaLabel?: string;
  apiCalls?: number;
  opCompleted: number;
  opActive: number;
  opFailed: number;
  queueLength: number;
  activeRequests: number;
  rateLimit: { remaining: number; limit: number; low: boolean } | null;
  cooldownLabel?: string;
  processed: number;
  failed: number;
  isCancelling: boolean;
  canCancel: boolean;
  buckets: BucketState[];
  lowThresholdPercent: number;
  operations: PlanSummary[];
  now: number;
}

export interface UseActivityBar {
  view: ActivityView;
  cancel: () => void;
  cancelOperation: (planId: string) => void;
}

const DEFAULT_LOW_THRESHOLD_PERCENT = 10;

const EMPTY_BUCKETS: BucketState[] = [];

const EMPTY_PLANS: PlanSummary[] = [];

const STATUS_COLOR: Record<SchedulerStatus, string> = {
  idle: 'var(--color-success)',
  processing: 'var(--color-info)',
  throttled: 'var(--color-warning)',
  cooldown: 'var(--color-danger)',
  paused: 'var(--color-neutral-500)',
};

const STATUS_LABEL: Record<SchedulerStatus, string> = {
  idle: 'Ready',
  processing: 'Processing',
  throttled: 'Throttled',
  cooldown: 'Cooldown',
  paused: 'Paused',
};

function clock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function cooldownClock(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds >= 60) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function useActivityBar(): UseActivityBar {
  const { state, metrics, clearQueue, cancelPlan } = useScheduler();
  const { progress, cancel: cancelOperation } = useProgress();

  const [now, setNow] = useState(() => Date.now());
  const cooldownEndsAt = state?.cooldownEndsAt ?? null;
  const buckets = state?.buckets ?? EMPTY_BUCKETS;
  const ticking =
    (progress.isLoading && Boolean(progress.startTime)) ||
    cooldownEndsAt !== null ||
    buckets.some((bucket) => bucket.gatedUntil !== null);

  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [ticking]);

  const elapsed =
    progress.isLoading && progress.startTime
      ? Math.max(0, Math.floor((now - progress.startTime) / 1000))
      : 0;
  const cooldownRemaining = cooldownEndsAt ? Math.max(0, cooldownEndsAt - now) : 0;

  const cancel = useCallback(() => {
    cancelOperation();
    void clearQueue();
  }, [cancelOperation, clearQueue]);

  const cancelSingleOperation = useCallback(
    (planId: string) => {
      void cancelPlan(planId);
    },
    [cancelPlan],
  );

  const status: SchedulerStatus = state?.status ?? 'idle';
  const operationActive = progress.isLoading;
  const done = progress.current;

  const percentage = progress.total > 0 ? Math.min((done / progress.total) * 100, 100) : 0;

  const estimatedTotal = done > 0 ? Math.round((elapsed / done) * progress.total) : 0;
  const remaining = Math.max(0, estimatedTotal - elapsed);
  const etaLabel =
    operationActive && remaining > 0 && done > 2 ? `~${clock(remaining)} left` : undefined;

  const lowThreshold = state?.minRemainingThresholdPercent ?? DEFAULT_LOW_THRESHOLD_PERCENT;
  const rl = state?.rateLimitInfo ?? null;
  const rateLimit =
    rl && rl.limit > 0
      ? {
          remaining: rl.remaining,
          limit: rl.limit,
          low: (rl.remaining / rl.limit) * 100 <= lowThreshold,
        }
      : null;

  const queueLength = state?.queueLength ?? 0;

  const view: ActivityView = {
    statusLabel: STATUS_LABEL[status],
    statusColorVar: STATUS_COLOR[status],
    busy: status !== 'idle' || operationActive,
    operationActive,
    operationName: progress.operationName,
    message: progress.message,
    current: done,
    total: progress.total,
    percentage,
    elapsedLabel: operationActive ? clock(elapsed) : undefined,
    etaLabel,
    apiCalls: progress.apiCalls,
    opCompleted: progress.completed ?? 0,
    opActive: progress.active ?? 0,
    opFailed: progress.failed ?? 0,
    queueLength,
    activeRequests: state?.activeRequests ?? 0,
    rateLimit,
    cooldownLabel:
      status === 'cooldown' && cooldownRemaining > 0 ? cooldownClock(cooldownRemaining) : undefined,
    processed: state?.totalProcessed ?? 0,
    failed: metrics?.failedRequests ?? 0,
    isCancelling: Boolean(progress.isCancelling),
    canCancel: (operationActive || queueLength > 0) && !progress.isCancelling,
    buckets,
    lowThresholdPercent: lowThreshold,
    operations: state?.plans ?? EMPTY_PLANS,
    now,
  };

  return { view, cancel, cancelOperation: cancelSingleOperation };
}
