import React from 'react';
import { SpreadBar } from '../../shared';
import { spreadSegments } from './attributeSpread';
import type { BreakdownRow } from '../../members/memberAnalytics';

export interface AttributeSpreadBarProps {
  rows: readonly BreakdownRow[];
  className?: string;
}

const AttributeSpreadBar: React.FC<AttributeSpreadBarProps> = ({ rows, className = '' }) => (
  <SpreadBar
    className={className}
    segments={spreadSegments(rows).map(({ row, background, isTail }) => ({
      key: row.value,
      background,
      count: row.count,
      title: isTail
        ? `${row.label} — ${row.count.toLocaleString()} members`
        : `${row.label} — ${row.count.toLocaleString()} (${Math.round(row.pct)}%)`,
    }))}
  />
);

export default AttributeSpreadBar;
