import React from 'react';
import type { BreakdownRow } from './memberAnalytics';
import { OTHER_VALUE } from './memberAnalytics';

interface BreakdownReportProps {
  rows: BreakdownRow[];
  activeValues: Set<string>;
  onRowClick: (row: BreakdownRow) => void;
  onShowOther?: () => void;
  emptyMessage?: string;
}

const BreakdownReport: React.FC<BreakdownReportProps> = ({
  rows,
  activeValues,
  onRowClick,
  onShowOther,
  emptyMessage = 'No data',
}) => {
  if (rows.length === 0) {
    return <p className="text-xs text-neutral-500 py-1">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-1.5">
      {rows.map((row) => {
        const isOther = row.value === OTHER_VALUE;
        const isActive = activeValues.has(row.value);
        const clickable = isOther ? !!onShowOther : true;

        return (
          <button
            key={row.value}
            type="button"
            disabled={!clickable}
            onClick={() => {
              if (isOther) onShowOther?.();
              else onRowClick(row);
            }}
            className={`
              press-subtle relative w-full text-left rounded-md px-2.5 py-1.5
              transition-colors duration-(--dur-instant)
              ${clickable ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-default'}
              ${isActive ? 'ring-1 ring-primary bg-primary-light/40' : ''}
            `
              .trim()
              .replace(/\s+/g, ' ')}
            aria-pressed={!isOther ? isActive : undefined}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-md bg-neutral-100"
              style={{ width: '100%' }}
            />
            <div
              className={`absolute inset-y-0 left-0 rounded-md ${isActive ? 'bg-primary-highlight' : 'bg-primary-light'}`}
              style={{ width: `${Math.max(row.pct, 1.5)}%` }}
            />
            <div className="relative flex items-center justify-between gap-3">
              <span
                className={`truncate text-xs ${isActive ? 'font-semibold text-primary-text' : 'text-neutral-800'} ${isOther ? 'italic text-neutral-500' : ''}`}
                title={row.label}
              >
                {row.label}
                {isOther && clickable && (
                  <span className="ml-1.5 not-italic text-primary-text">View →</span>
                )}
              </span>
              <span className="flex-shrink-0 text-xs font-medium text-neutral-600 tabular-nums">
                {row.count.toLocaleString()}
                <span className="ml-1 text-neutral-400">{row.pct.toFixed(0)}%</span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BreakdownReport;
