import React from 'react';
import type { BucketState } from '@/shared/scheduler/types';
import PipelineMeter from './PipelineMeter';

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

export function headroomPercent(bucket: BucketState): number | null {
  if (bucket.limit === null || bucket.limit <= 0 || bucket.remaining === null) return null;
  return (bucket.remaining / bucket.limit) * 100;
}

export function isStrained(bucket: BucketState, lowThresholdPercent: number): boolean {
  if (bucket.gatedUntil !== null) return true;
  if (bucket.queued > 0 || bucket.active > 0 || bucket.planned > 0) return true;
  const percent = headroomPercent(bucket);
  return percent !== null && percent <= lowThresholdPercent;
}

const BucketRow: React.FC<BucketRowProps> = ({ bucket, lowThresholdPercent, now }) => {
  const percent = headroomPercent(bucket);
  const low = percent !== null && percent <= lowThresholdPercent;
  const gatedFor = bucket.gatedUntil !== null ? Math.max(0, bucket.gatedUntil - now) : 0;
  const gated = gatedFor > 0;

  const headroom =
    bucket.limit === null || bucket.remaining === null
      ? // Never "0/0": an unreported bucket is unknown, not empty.
        'not reported'
      : `${bucket.remaining}/${bucket.limit}`;

  const tone = gated ? 'bg-danger-light' : low ? 'bg-warning-light' : '';

  return (
    <div
      data-testid={`activity-bucket-${bucket.bucket}`}
      data-low={low ? 'true' : undefined}
      data-gated={gated ? 'true' : undefined}
      className={`flex flex-col gap-1 px-(--sp-gutter) py-1.5 ${tone}`}
    >
      <div className="flex items-baseline gap-2 text-xs">
        <span className="truncate font-medium text-neutral-900">{bucketLabel(bucket.bucket)}</span>
        {gated && (
          <span
            data-testid={`activity-bucket-cooldown-${bucket.bucket}`}
            className="shrink-0 rounded-sm border border-danger px-1 text-[0.625rem] font-medium tracking-wide text-danger-text uppercase"
          >
            {countdown(gatedFor)}
          </span>
        )}
        <span
          className={`ml-auto shrink-0 tabular-nums ${low ? 'text-danger-text' : 'text-neutral-600'}`}
        >
          {headroom}
        </span>
        {bucket.planned > 0 && (
          <span className="shrink-0 tabular-nums text-neutral-600">· {bucket.planned} planned</span>
        )}
      </div>
      <PipelineMeter
        counts={{
          spent: 0,
          active: bucket.active,
          queued: bucket.queued,
          planned: bucket.planned,
        }}
        label={`${bucketLabel(bucket.bucket)}: ${bucket.active} in flight, ${bucket.queued} queued, ${bucket.planned} planned`}
      />
    </div>
  );
};

export default BucketRow;
