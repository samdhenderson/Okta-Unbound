import React from 'react';
import type { MemberSourceBreakdown } from '../../../../shared/membership/groupSource';
import { toMemberSourceSegments } from '../memberSourceBuckets';

interface MemberSourceMeterProps {
  breakdown: MemberSourceBreakdown;
  maxRules?: number;
}

const MemberSourceMeter: React.FC<MemberSourceMeterProps> = ({ breakdown, maxRules }) => {
  const segments = toMemberSourceSegments(breakdown, { maxRules });
  const filled = segments.filter((segment) => segment.count > 0);

  if (filled.length === 0) {
    return <p className="text-sm text-neutral-500">No members to attribute.</p>;
  }

  return (
    <div className="space-y-3">
      <div aria-hidden="true" className="flex h-2 w-full overflow-hidden rounded-md bg-neutral-100">
        {filled.map((segment) => (
          <div
            key={segment.key}
            className={`min-w-1 ${segment.barClass}`}
            style={{ width: `${segment.percent}%`, backgroundColor: segment.color }}
          />
        ))}
      </div>

      <ul className="space-y-1.5">
        {filled.map((segment) => (
          <li key={segment.key} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-baseline gap-2">
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-full ${segment.dotClass}`}
                style={{ backgroundColor: segment.color }}
              />
              <span className="truncate text-neutral-700" title={segment.description}>
                {segment.label}
              </span>
              {segment.aggregatedRuleCount !== undefined && (
                <span className="shrink-0 text-xs text-neutral-500" title={segment.description}>
                  +{segment.aggregatedRuleCount} more rule
                  {segment.aggregatedRuleCount === 1 ? '' : 's'}
                </span>
              )}
            </span>
            <span className="shrink-0 text-neutral-900">
              <span className="font-semibold">{segment.count.toLocaleString()}</span>{' '}
              <span className="text-xs text-neutral-500">({Math.round(segment.percent)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemberSourceMeter;
