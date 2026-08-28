import React from 'react';
import Eyebrow from '../shared/Eyebrow';
import Icon from '../shared/Icon';
import IconButton from '../shared/IconButton';
import Skeleton from '../shared/Skeleton';
import StretchedButton from '../shared/StretchedButton';
import FigureNumber from './FigureNumber';
import { getRelativeTime } from '../../../shared/utils/dateFormat';
import type { ListViewRequest, ListViewTab } from '../../listViewRequest';
import type { OrgBox, OrgSubCount } from './orgFigures';

export interface OrgSnapshotCardProps {
  boxes: OrgBox[];
  readAt: number | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  canRefresh: boolean;
  onOpenTab: (tab: ListViewTab) => void;
  onOpenListView: (request: ListViewRequest) => void;
}

const FindingLines: React.FC<{ subCount: OrgSubCount; id: string }> = ({ subCount, id }) => (
  <span className="flex min-w-0 flex-1 flex-col gap-px">
    <span
      id={id}
      className={`text-sm ${
        subCount.value === null ? 'font-medium text-neutral-600' : 'font-semibold text-neutral-900'
      }`}
    >
      {subCount.label}
    </span>
    {subCount.note && (
      <span
        className={`text-xs ${
          subCount.status === 'partial' ? 'text-warning-text' : 'text-neutral-600'
        }`}
      >
        {subCount.note}
      </span>
    )}
  </span>
);

const Finding: React.FC<{
  subCount: OrgSubCount;
  onOpen: (request: ListViewRequest) => void;
}> = ({ subCount, onOpen }) => {
  const labelId = `org-finding-${subCount.key}`;

  if (subCount.status === 'reading') {
    return (
      <li className="px-(--sp-row-x) py-(--sp-row-y)">
        <Skeleton variant="text" size="sm" width="w-3/4" label={`Reading ${subCount.label}`} />
      </li>
    );
  }

  if (subCount.value === null) {
    return (
      <li className="flex items-stretch gap-3 bg-neutral-50 px-(--sp-row-x) py-(--sp-row-y)">
        <FigureNumber value={null} />
        <FindingLines subCount={subCount} id={labelId} />
      </li>
    );
  }

  return (
    <li className="relative flex items-stretch gap-3 px-(--sp-row-x) py-(--sp-row-y) transition-colors duration-(--dur-instant) hover:bg-neutral-50">
      <StretchedButton
        label="Open the filtered list"
        describedBy={labelId}
        onClick={() => onOpen(subCount.request)}
      />
      <FigureNumber value={subCount.value} />
      <FindingLines subCount={subCount} id={labelId} />
      <Icon type="chevron-right" size="xs" className="shrink-0 self-center text-neutral-400" />
    </li>
  );
};

const OrgSnapshotCard: React.FC<OrgSnapshotCardProps> = ({
  boxes,
  readAt,
  isRefreshing,
  onRefresh,
  canRefresh,
  onOpenTab,
  onOpenListView,
}) => {
  const age = readAt === null ? null : getRelativeTime(new Date(readAt).toISOString());
  const findings = boxes.flatMap((box) => box.subCounts);
  const totals = boxes.filter((box) => box.value !== null);

  return (
    <section aria-label="This org" className="space-y-2">
      <div className="flex items-center justify-between gap-(--sp-inline)">
        <Eyebrow as="h3">This org</Eyebrow>
        <IconButton
          label="Refresh this org"
          variant="ghost"
          onClick={onRefresh}
          disabled={!canRefresh || isRefreshing}
        >
          <Icon type="refresh" size="sm" className={isRefreshing ? 'animate-spin' : undefined} />
        </IconButton>
      </div>

      <ul className="divide-y divide-neutral-100 overflow-hidden rounded-md border border-neutral-200 bg-white">
        {findings.map((subCount) => (
          <Finding key={subCount.key} subCount={subCount} onOpen={onOpenListView} />
        ))}
      </ul>

      {totals.length > 0 && (
        <p className="flex flex-wrap items-baseline gap-(--sp-inline) text-xs text-neutral-600">
          {totals.map((box, index) => (
            <React.Fragment key={box.key}>
              {index > 0 && (
                <span aria-hidden="true" className="text-neutral-300">
                  ·
                </span>
              )}
              <button
                type="button"
                onClick={() => onOpenTab(box.tab)}
                className="press rounded-sm px-0.5 text-primary-text underline decoration-primary-highlight underline-offset-2 hover:bg-primary-light active:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              >
                {box.status === 'partial' ? 'at least ' : ''}
                {box.value?.toLocaleString()} {box.noun}
              </button>
            </React.Fragment>
          ))}
        </p>
      )}

      <p className="text-xs text-neutral-600">
        {age
          ? `Counts as Okta reports them · read ${age}`
          : // Not omitted, and not guessed. Saying why there is no age is the
            'Counts as Okta reports them. No age stated — not every collection has finished a read.'}
      </p>
    </section>
  );
};

export default OrgSnapshotCard;
