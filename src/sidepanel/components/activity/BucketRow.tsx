import React from 'react';
import type { BucketState } from '@/shared/scheduler/types';
import { Badge } from '../shared';
import { COOLDOWN_HATCH, QUEUED_DASHES, UNKNOWN_HATCH } from './hatches';

export interface BucketRowProps {
  bucket: BucketState;
  lowThresholdPercent: number;
  now: number;
}

function bucketLabel(bucket: string): string {
  return bucket.replace(/^\/api\/v1\//, '');
}

function countdown(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function sinceLabel(ms: number): string {
  if (!Number.isFinite(ms)) return 'recently';
  const seconds = Math.max(0, Math.floor(ms / 1000));
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function headroomPercent(bucket: BucketState): number | null {
  if (bucket.limit === null || bucket.limit <= 0 || bucket.remaining === null) return null;
  return (bucket.remaining / bucket.limit) * 100;
}

export function activeAt(bucket: BucketState): number | null {
  return typeof bucket.lastActiveAt === 'number' && Number.isFinite(bucket.lastActiveAt)
    ? bucket.lastActiveAt
    : null;
}

export function budgetDenominator(bucket: BucketState): number | null {
  const { remaining } = bucket;
  if (typeof remaining !== 'number' || !Number.isFinite(remaining) || remaining <= 0) return null;
  return remaining;
}

export type LaneForm = 'gated' | 'working' | 'unmeasured' | 'at-rest';

export function laneWidths(
  bucket: BucketState,
  denominator: number,
): { running: string; queued: string } {
  const running = Math.min(Math.max(bucket.active, 0) / denominator, 1);
  const queued = Math.min(
    (Math.max(bucket.queued, 0) + Math.max(bucket.planned, 0)) / denominator,
    1 - running,
  );
  return { running: `${running * 100}%`, queued: `${queued * 100}%` };
}

const BucketRow: React.FC<BucketRowProps> = ({ bucket, lowThresholdPercent, now }) => {
  const percent = headroomPercent(bucket);
  const low = percent !== null && percent <= lowThresholdPercent;
  const gatedFor = bucket.gatedUntil !== null ? Math.max(0, bucket.gatedUntil - now) : 0;
  const gated = gatedFor > 0;

  const work = bucket.active + bucket.queued + bucket.planned;
  const denominator = budgetDenominator(bucket);

  const form: LaneForm = gated
    ? 'gated'
    : work === 0
      ? 'at-rest'
      : denominator === null
        ? 'unmeasured'
        : 'working';

  const widths =
    form === 'working' && denominator !== null ? laneWidths(bucket, denominator) : null;

  const activeSince = activeAt(bucket);
  const label = bucketLabel(bucket.bucket);

  const words =
    form === 'gated'
      ? `cooling down · ${countdown(gatedFor)}`
      : form === 'at-rest'
        ? `at rest${activeSince !== null ? ` · ${sinceLabel(now - activeSince)}` : ''}`
        : [
            `${bucket.active} running`,
            bucket.queued > 0 ? `${bucket.queued} queued` : null,
            bucket.planned > 0 ? `${bucket.planned} planned` : null,
          ]
            .filter(Boolean)
            .join(' · ');

  const budgetPhrase =
    bucket.limit === null || bucket.remaining === null
      ? 'budget not reported'
      : `${bucket.remaining} of ${bucket.limit} requests remaining`;

  return (
    <div
      data-testid={`activity-bucket-${bucket.bucket}`}
      data-low={low ? 'true' : undefined}
      data-gated={gated ? 'true' : undefined}
      data-state={form}
      className="flex flex-col gap-1 px-(--sp-gutter) py-1.5"
    >
      <div className="flex items-baseline gap-2 text-xs">
        <span className="shrink-0 truncate font-medium text-neutral-900">{label}</span>
        <span
          data-testid={`activity-bucket-words-${bucket.bucket}`}
          className={`ms-auto min-w-0 truncate ${gated ? 'text-danger-text' : 'text-neutral-600'}`}
        >
          {words}
        </span>
        {low && (
          <Badge variant="danger" testId={`activity-bucket-low-${bucket.bucket}`}>
            low
          </Badge>
        )}
      </div>

      <div
        role="img"
        aria-label={`${label}: ${words}, ${budgetPhrase}`}
        data-testid={`activity-bucket-track-${bucket.bucket}`}
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-primary-light"
      >
        {form === 'gated' && (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ backgroundImage: COOLDOWN_HATCH }}
          />
        )}

        {form === 'unmeasured' && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-neutral-50"
            style={{ backgroundImage: UNKNOWN_HATCH }}
          />
        )}

        {form === 'at-rest' && (
          <div aria-hidden="true" className="absolute inset-0 bg-neutral-100" />
        )}

        {widths !== null && (
          <div aria-hidden="true" className="absolute inset-y-0 left-0 flex w-full">
            <div
              data-testid={`activity-bucket-running-${bucket.bucket}`}
              className="h-full bg-primary"
              style={{ width: widths.running }}
            />
            <div
              data-testid={`activity-bucket-queued-${bucket.bucket}`}
              className="h-full"
              style={{ width: widths.queued, backgroundImage: QUEUED_DASHES }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BucketRow;
