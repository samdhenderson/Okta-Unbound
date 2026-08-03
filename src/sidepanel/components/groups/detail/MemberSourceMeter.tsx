import React from 'react';
import type { MemberSourceBreakdown } from '../../../../shared/membership/groupSource';
import { toMemberSourceBuckets } from '../memberSourceBuckets';

interface MemberSourceMeterProps {
  breakdown: MemberSourceBreakdown;
}

const MemberSourceMeter: React.FC<MemberSourceMeterProps> = ({ breakdown }) => {
  const buckets = toMemberSourceBuckets(breakdown);
  const filled = buckets.filter((bucket) => bucket.count > 0);

  if (filled.length === 0) {
    return <p className="text-sm text-neutral-500">No members to attribute.</p>;
  }

  return (
    <div className="space-y-3">
      <div aria-hidden="true" className="flex h-2 w-full overflow-hidden rounded-md bg-neutral-100">
        {filled.map((bucket) => (
          <div
            key={bucket.key}
            className={bucket.barClass}
            style={{ width: `${bucket.percent}%` }}
          />
        ))}
      </div>

      <ul className="space-y-1.5">
        {filled.map((bucket) => (
          <li key={bucket.key} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-baseline gap-2">
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-full ${bucket.dotClass}`}
              />
              <span className="text-neutral-700" title={bucket.description}>
                {bucket.label}
              </span>
            </span>
            <span className="shrink-0 text-neutral-900">
              <span className="font-semibold">{bucket.count.toLocaleString()}</span>{' '}
              <span className="text-xs text-neutral-500">({Math.round(bucket.percent)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemberSourceMeter;
