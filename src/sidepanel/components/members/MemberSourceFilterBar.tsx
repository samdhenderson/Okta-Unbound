import React from 'react';
import FilterPill from '../shared/FilterPill';
import type { MemberSourceBucket } from '../groups/memberSourceBuckets';

export interface MemberSourceFilterBarProps {
  segments: MemberSourceBucket[];
  activeKeys: ReadonlySet<string>;
  onToggle: (key: string, label: string) => void;
  onClearAll: () => void;
  total: number;
}

const MemberSourceFilterBar: React.FC<MemberSourceFilterBarProps> = ({
  segments,
  activeKeys,
  onToggle,
  onClearAll,
  total,
}) => {
  const filled = segments.filter((segment) => segment.count > 0);
  const aggregated = filled.reduce(
    (count, segment) => count + (segment.aggregatedRuleCount ?? 0),
    0,
  );
  if (filled.length === 0) return null;

  return (
    <div className="space-y-2">
      <div aria-hidden="true" className="flex h-2 w-full overflow-hidden rounded-md bg-neutral-100">
        {filled.map((segment) => (
          <div
            key={segment.key}
            className={`min-w-1 ${segment.barClass}`}
            style={{ width: `${segment.percent}%`, backgroundColor: segment.color }}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterPill
          active={activeKeys.size === 0}
          onClick={onClearAll}
          title={`All ${total.toLocaleString()} analyzed members`}
        >
          All {total.toLocaleString()}
        </FilterPill>
        {filled.map((segment) => (
          <FilterPill
            key={segment.key}
            active={activeKeys.has(segment.key)}
            onClick={() => onToggle(segment.key, segment.label)}
            title={segment.description}
          >
            <span
              aria-hidden="true"
              className={`me-1.5 inline-block h-2 w-2 shrink-0 rounded-full align-middle ${segment.dotClass}`}
              style={{ backgroundColor: segment.color }}
            />
            {segment.label} {segment.count.toLocaleString()}{' '}
            <span className="font-normal opacity-80">({segment.percent}%)</span>
          </FilterPill>
        ))}
      </div>

      {aggregated > 0 && (
        <p className="text-xs text-neutral-600">
          &ldquo;Other rules&rdquo; folds in +{aggregated} more rule{aggregated === 1 ? '' : 's'}.
        </p>
      )}
    </div>
  );
};

export default MemberSourceFilterBar;
