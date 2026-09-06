import React from 'react';
import { Eyebrow, IconButton, ListRow, Skeleton } from '../shared';
import Icon from '../shared/Icon';
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

const NUMBER_SLOT = 'shrink-0 min-w-[3ch] text-right text-base font-semibold tabular-nums';

function glyphTone(subCount: OrgSubCount): string {
  if (subCount.status === 'reading') return 'text-neutral-300';
  if (subCount.value === 0) return 'text-success-text';
  return 'text-neutral-400';
}

const FindingBody: React.FC<{
  subCount: OrgSubCount;
  noteId: string;
  isControl: boolean;
}> = ({ subCount, noteId, isControl }) => {
  const recessed = subCount.value === null;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Icon type={subCount.icon} size="md" className={`shrink-0 ${glyphTone(subCount)}`} />

      <div className="min-w-0 flex-1">
        {subCount.status === 'reading' ? (
          <div className="space-y-1">
            <Skeleton
              variant="text"
              size="sm"
              width="w-3/4"
              label={`Reading ${subCount.label}`}
              className="text-left"
            />
            <Skeleton variant="text" size="sm" width="w-1/2" label="" />
          </div>
        ) : (
          <>
            <p
              className={`text-pretty text-sm font-medium ${
                recessed ? 'text-neutral-600' : 'text-neutral-900'
              }`}
            >
              {subCount.label}
            </p>
            {subCount.note && (
              <p
                id={noteId}
                className={`text-xs ${
                  subCount.status === 'partial' ? 'text-warning-text' : 'text-neutral-600'
                }`}
              >
                {subCount.note}
              </p>
            )}
          </>
        )}
      </div>

      <span
        data-testid="org-finding-value"
        className={`${NUMBER_SLOT} ${recessed ? 'text-neutral-400' : 'text-neutral-900'}`}
        aria-hidden={subCount.value === null ? 'true' : undefined}
      >
        {subCount.status === 'reading' ? '·' : (subCount.value?.toLocaleString() ?? '—')}
      </span>

      {isControl ? (
        <Icon type="chevron-right" size="xs" className="shrink-0 text-neutral-400" />
      ) : (
        <span aria-hidden="true" className="w-3 shrink-0" />
      )}
    </div>
  );
};

const Finding: React.FC<{
  subCount: OrgSubCount;
  onOpen: (request: ListViewRequest) => void;
}> = ({ subCount, onOpen }) => {
  const noteId = `org-finding-note-${subCount.key}`;
  const isControl = subCount.value !== null && subCount.value > 0;

  if (!isControl) {
    return (
      <ListRow as="li" density="comfortable">
        <FindingBody subCount={subCount} noteId={noteId} isControl={false} />
      </ListRow>
    );
  }

  return (
    <li>
      <ListRow
        as="button"
        density="comfortable"
        onClick={() => onOpen(subCount.request)}
        ariaLabel={`${subCount.label} — ${subCount.value?.toLocaleString()}`}
        describedBy={subCount.note ? noteId : undefined}
      >
        <FindingBody subCount={subCount} noteId={noteId} isControl />
      </ListRow>
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

      <ul className="space-y-1">
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
