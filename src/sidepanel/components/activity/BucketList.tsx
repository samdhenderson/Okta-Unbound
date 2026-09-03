import React from 'react';
import type { BucketState } from '@/shared/scheduler/types';
import BucketRow from './BucketRow';
import RackLegend from './RackLegend';

export interface BucketListProps {
  buckets: BucketState[];
  lowThresholdPercent: number;
  now: number;
}

const BucketList: React.FC<BucketListProps> = ({ buckets, lowThresholdPercent, now }) => {
  if (buckets.length === 0) return null;

  return (
    <div data-testid="activity-buckets" className="flex flex-col border-t border-neutral-100 py-1">
      <div className="flex max-h-56 flex-col overflow-y-auto">
        {buckets.map((bucket) => (
          <BucketRow
            key={bucket.bucket}
            bucket={bucket}
            lowThresholdPercent={lowThresholdPercent}
            now={now}
          />
        ))}
      </div>

      <RackLegend />
    </div>
  );
};

export default BucketList;
