import React from 'react';
import type { BucketState } from '@/shared/scheduler/types';
import BucketRow, { isStrained } from './BucketRow';

export interface BucketListProps {
  buckets: BucketState[];
  lowThresholdPercent: number;
  now: number;
  maxRows?: number;
}

function bucketLabel(bucket: string): string {
  return bucket.replace(/^\/api\/v1\//, '');
}

const BucketList: React.FC<BucketListProps> = ({
  buckets,
  lowThresholdPercent,
  now,
  maxRows = 4,
}) => {
  if (buckets.length === 0) return null;

  const strained = buckets.filter((bucket) => isStrained(bucket, lowThresholdPercent));
  const shown = strained.slice(0, maxRows);
  const rest = buckets.filter((bucket) => !shown.includes(bucket));

  return (
    <div data-testid="activity-buckets" className="border-t border-neutral-100">
      {shown.map((bucket) => (
        <BucketRow
          key={bucket.bucket}
          bucket={bucket}
          lowThresholdPercent={lowThresholdPercent}
          now={now}
        />
      ))}

      {rest.length > 0 && (
        <div
          data-testid="activity-buckets-quiet"
          className="flex items-baseline gap-2 px-(--sp-gutter) py-1.5 text-xs text-neutral-500"
        >
          <span className="truncate">
            {rest.length} {rest.length === 1 ? 'bucket' : 'buckets'} idle ·{' '}
            {rest.map((bucket) => bucketLabel(bucket.bucket)).join(', ')}
          </span>
          <span className="ml-auto shrink-0">full headroom</span>
        </div>
      )}
    </div>
  );
};

export default BucketList;
