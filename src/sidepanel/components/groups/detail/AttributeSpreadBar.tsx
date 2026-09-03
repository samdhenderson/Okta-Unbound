import React from 'react';
import { spreadSegments } from './attributeSpread';
import type { BreakdownRow } from '../../members/memberAnalytics';

export interface AttributeSpreadBarProps {
  rows: readonly BreakdownRow[];
  className?: string;
}

const AttributeSpreadBar: React.FC<AttributeSpreadBarProps> = ({ rows, className = '' }) => {
  const segments = spreadSegments(rows);
  if (segments.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={`flex h-3 w-full gap-px overflow-hidden rounded-full bg-neutral-100 ${className}`}
    >
      {segments.map((segment) => (
        <div
          key={segment.row.value}
          title={
            segment.isTail
              ? `${segment.row.label} — ${segment.row.count.toLocaleString()} members`
              : `${segment.row.label} — ${segment.row.count.toLocaleString()} (${Math.round(segment.row.pct)}%)`
          }
          style={{ background: segment.background, flexGrow: segment.row.count, flexBasis: 0 }}
          className="min-w-1"
        />
      ))}
    </div>
  );
};

export default AttributeSpreadBar;
