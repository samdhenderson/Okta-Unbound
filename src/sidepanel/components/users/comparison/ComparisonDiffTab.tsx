import React, { useMemo, useState } from 'react';
import Icon from '../../overview/shared/Icon';
import Input from '../../shared/Input';
import FilterPill from '../../shared/FilterPill';
import type { ParityRow } from './comparisonAnalytics';

export type ParityFilter = 'differences' | 'shared' | 'all';

export type CellDirection = 'left' | 'right';

interface ComparisonDiffTabProps {
  contextName: string;
  comparedName: string;
  rows: ParityRow[];
  noun: string;
  emptyText: string;
  renderContextAction?: (row: ParityRow, direction: CellDirection) => React.ReactNode;
  renderComparedAction?: (row: ParityRow, direction: CellDirection) => React.ReactNode;
  renderMeta?: (row: ParityRow) => React.ReactNode;
}

const differs = (row: ParityRow): boolean => row.inContext !== row.inCompared;

const ComparisonDiffTab: React.FC<ComparisonDiffTabProps> = ({
  contextName,
  comparedName,
  rows,
  noun,
  emptyText,
  renderContextAction,
  renderComparedAction,
  renderMeta,
}) => {
  const [filter, setFilter] = useState<ParityFilter>('differences');
  const [query, setQuery] = useState('');

  const differenceCount = useMemo(() => rows.filter(differs).length, [rows]);
  const sharedCount = rows.length - differenceCount;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === 'differences' && !differs(row)) return false;
      if (filter === 'shared' && differs(row)) return false;
      return needle === '' || row.label.toLowerCase().includes(needle);
    });
  }, [rows, filter, query]);

  return (
    <div className="flex min-h-[calc(100vh-22rem)] flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <FilterPill active={filter === 'differences'} onClick={() => setFilter('differences')}>
          Differences {differenceCount}
        </FilterPill>
        <FilterPill active={filter === 'shared'} onClick={() => setFilter('shared')}>
          Shared {sharedCount}
        </FilterPill>
        <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
          All {rows.length}
        </FilterPill>
      </div>

      <Input
        type="search"
        value={query}
        onChange={setQuery}
        placeholder={`Filter ${noun}s…`}
        ariaLabel={`Filter ${noun}s by name`}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {visible.length === 0 ? (
          <p className="px-3 py-3 text-xs text-neutral-500 italic">
            {rows.length === 0 ? emptyText : `No ${noun}s match this filter.`}
          </p>
        ) : (
          <ul className="scrollable-list min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto">
            {visible.map((row) => (
              <ParityListRow
                key={row.id}
                row={row}
                contextName={contextName}
                comparedName={comparedName}
                renderContextAction={renderContextAction}
                renderComparedAction={renderComparedAction}
                renderMeta={renderMeta}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const ParityListRow: React.FC<{
  row: ParityRow;
  contextName: string;
  comparedName: string;
  renderContextAction?: (row: ParityRow, direction: CellDirection) => React.ReactNode;
  renderComparedAction?: (row: ParityRow, direction: CellDirection) => React.ReactNode;
  renderMeta?: (row: ParityRow) => React.ReactNode;
}> = ({
  row,
  contextName,
  comparedName,
  renderContextAction,
  renderComparedAction,
  renderMeta,
}) => {
  const meta = renderMeta?.(row);
  const matched = row.inContext && row.inCompared;

  return (
    <li className="flex flex-col gap-1.5 px-3 py-2 hover:bg-neutral-50/70">
      <span className="flex min-w-0 flex-col items-start gap-0.5">
        <span className="w-full truncate text-sm text-neutral-800" title={row.label}>
          {row.label}
        </span>
        {meta}
      </span>

      <span className="flex items-stretch gap-2">
        <SideCell
          held={row.inContext}
          userName={contextName}
          action={renderContextAction?.(row, 'right')}
        />
        <span
          role="img"
          aria-label={matched ? 'Both users have this' : 'Only one user has this'}
          className={`flex w-8 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-bold ${
            matched
              ? 'border-success-light bg-success-light text-success-text'
              : 'border-warning-light bg-warning-light text-warning-text'
          }`}
        >
          {matched ? '=' : '≠'}
        </span>
        <SideCell
          held={row.inCompared}
          userName={comparedName}
          action={renderComparedAction?.(row, 'left')}
        />
      </span>
    </li>
  );
};

const SideCell: React.FC<{
  held: boolean;
  userName: string;
  action: React.ReactNode;
}> = ({ held, userName, action }) => {
  if (held) {
    return (
      <span
        className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-600"
        title={`${userName} has this`}
      >
        <Icon type="check" size="sm" className="shrink-0 text-success-text" />
        <span className="truncate">{userName}</span>
      </span>
    );
  }

  if (!action) {
    return (
      <span
        className="flex min-w-0 flex-1 items-center justify-center rounded-md border border-dashed border-neutral-200 px-2 py-1 text-xs text-neutral-400"
        title={`${userName} does not have this`}
      >
        —
      </span>
    );
  }

  return <span className="flex min-w-0 flex-1 items-center justify-center">{action}</span>;
};

export default ComparisonDiffTab;
