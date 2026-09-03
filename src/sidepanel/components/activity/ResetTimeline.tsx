import React from 'react';
import type { BucketState } from '@/shared/scheduler/types';

export interface ResetTimelineProps {
  buckets: BucketState[];
  now: number;
}

export interface ResetMark {
  bucket: string;
  inMs: number;
  offsetPercent: number;
}

const MIN_WINDOW_MS = 60_000;

function bucketLabel(bucket: string): string {
  return bucket.replace(/^\/api\/v1\//, '');
}

function countdown(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function resetMarks(
  buckets: BucketState[],
  now: number,
): { marks: ResetMark[]; windowMs: number } {
  const armed = buckets
    .filter((bucket) => bucket.gatedUntil !== null && bucket.gatedUntil > now)
    .map((bucket) => ({ bucket: bucket.bucket, inMs: (bucket.gatedUntil as number) - now }))
    .sort((a, b) => a.inMs - b.inMs);

  if (armed.length === 0) return { marks: [], windowMs: MIN_WINDOW_MS };

  const windowMs = Math.max(MIN_WINDOW_MS, armed[armed.length - 1].inMs);
  return {
    marks: armed.map((mark) => ({ ...mark, offsetPercent: (mark.inMs / windowMs) * 100 })),
    windowMs,
  };
}

const ResetTimeline: React.FC<ResetTimelineProps> = ({ buckets, now }) => {
  const { marks, windowMs } = resetMarks(buckets, now);
  if (marks.length === 0) return null;

  const summary = marks
    .map((mark) => `${bucketLabel(mark.bucket)} in ${countdown(mark.inMs)}`)
    .join(', ');

  return (
    <div
      data-testid="activity-reset-timeline"
      className="flex flex-col gap-1 border-t border-neutral-100 px-(--sp-gutter) py-1.5"
    >
      <div className="flex items-baseline gap-2 text-xs">
        <span className="font-medium text-neutral-900">Rate limits lift</span>
        <span className="ml-auto shrink-0 tabular-nums text-neutral-600">{summary}</span>
      </div>

      <div role="img" aria-label={`Rate limits lift: ${summary}`} className="relative h-4">
        <div aria-hidden="true" className="absolute inset-x-0 top-1.5 h-px bg-neutral-200" />
        {marks.map((mark) => (
          <div
            key={mark.bucket}
            data-testid={`activity-reset-mark-${mark.bucket}`}
            aria-hidden="true"
            className="absolute top-0 h-3 w-px bg-danger"
            style={{ left: `${mark.offsetPercent}%` }}
          />
        ))}
      </div>

      <div aria-hidden="true" className="flex justify-between text-xs text-neutral-600">
        <span>now</span>
        <span className="tabular-nums">+{countdown(windowMs)}</span>
      </div>
    </div>
  );
};

export default ResetTimeline;
