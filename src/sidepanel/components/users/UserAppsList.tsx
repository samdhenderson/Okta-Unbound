import React, { useCallback, useMemo, useState } from 'react';
import { AlertMessage, Button, EmptyState, FilterPill, Input, Skeleton } from '../shared';
import Icon from '../shared/Icon';
import UserAppRow from './UserAppRow';
import { summarizeAppSources, type AppSourceBucket } from './appSourceSummary';
import { SELECTION_LIMIT } from '../../selection/selectionStore';
import { useRungSelection } from '../../selection/useRungSelection';
import type { GroupMembership } from '../../../shared/types';
import type { UserAppAssignment } from '../../hooks/useOktaApi/userOperations';

type AppFilter = 'all' | AppSourceBucket;

const FILTER_LABELS: Record<AppFilter, string> = {
  all: 'All',
  direct: 'Direct',
  viaGroup: 'Via group',
  unknown: 'Unknown',
};

const FILTER_ORDER: readonly AppFilter[] = ['all', 'direct', 'viaGroup', 'unknown'];

export interface UserAppsListProps {
  apps: UserAppAssignment[];
  memberships: GroupMembership[];
  isLoading: boolean;
  complete: boolean;
  oktaOrigin?: string | null;
}

const UserAppsList: React.FC<UserAppsListProps> = ({
  apps,
  memberships,
  isLoading,
  complete,
  oktaOrigin,
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AppFilter>('all');
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);

  const { rows, counts, summary } = useMemo(
    () => summarizeAppSources(apps, memberships),
    [apps, memberships],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        (filter === 'all' || row.bucket === filter) &&
        (needle === '' || row.filterText.includes(needle)),
    );
  }, [rows, filter, query]);

  const selection = useRungSelection('app', apps, (app) => app.label);
  const { replaceSelection, deselectAll } = selection;
  const selectedHere = selection.selectedEntities.length;
  const allFilteredSelected =
    visible.length > 0 && visible.every((row) => selection.selectedIds.has(row.id));

  const handleSelectAll = useCallback(() => {
    const outcome = replaceSelection(visible.map((row) => row.id));
    setSelectionNotice(
      outcome.refused > 0
        ? `Selecting ${outcome.refused.toLocaleString()} apps would take the selection past its ` +
            `limit of ${SELECTION_LIMIT.toLocaleString()}, so nothing changed. Narrow the filters ` +
            `and try again.`
        : null,
    );
  }, [replaceSelection, visible]);

  const handleDeselectAll = useCallback(() => {
    deselectAll();
    setSelectionNotice(null);
  }, [deselectAll]);

  const clearFilters = () => {
    setQuery('');
    setFilter('all');
  };

  if (isLoading) {
    return (
      <div className="space-y-(--sp-rung)">
        <Skeleton variant="row" size="lg" count={4} label="Loading app assignments…" />
      </div>
    );
  }

  return (
    <div className="space-y-(--sp-rung)">
      {!complete && (
        <AlertMessage
          message={{
            type: 'warning',
            text: 'This list may be incomplete — the walk of this user’s app assignments did not finish, so it is short by an unknown number of apps. Treat any count or “not assigned” conclusion drawn from it as unavailable rather than as zero.',
          }}
        />
      )}

      {rows.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          {summary ? (
            <p className="text-xs text-neutral-600">
              {summary}
              {selectedHere > 0 && (
                <span className="ml-2 text-xs font-normal tabular-nums text-primary-text">
                  · {selectedHere.toLocaleString()} selected
                </span>
              )}
            </p>
          ) : (
            <span />
          )}
          <div className="flex shrink-0 items-center gap-(--sp-inline)">
            {selectedHere > 0 && (
              <Button
                variant="link"
                size="xs"
                onClick={handleDeselectAll}
                title="Clear every selected app, including any picked on another screen"
              >
                Deselect all
              </Button>
            )}
            <Button
              variant="link"
              size="xs"
              onClick={handleSelectAll}
              disabled={visible.length === 0 || allFilteredSelected}
              title={
                visible.length === 0
                  ? 'No apps match the current search and filters'
                  : allFilteredSelected
                    ? `All ${visible.length.toLocaleString()} apps matching the current search and filters are already selected`
                    : `Replace the app selection with the ${visible.length.toLocaleString()} apps matching the current search and filters`
              }
            >
              Select all
            </Button>
          </div>
        </div>
      )}

      {selectionNotice && (
        <AlertMessage
          message={{ text: selectionNotice, type: 'danger' }}
          onDismiss={() => setSelectionNotice(null)}
        />
      )}

      <Input
        size="sm"
        value={query}
        onChange={setQuery}
        type="search"
        ariaLabel="Filter apps or granting group"
        placeholder="Filter apps or granting group…"
        icon={<Icon type="search" size="sm" className="text-neutral-400" />}
      />

      <div className="flex flex-wrap gap-(--sp-inline)">
        {FILTER_ORDER.map((key) => (
          <FilterPill
            key={key}
            active={filter === key}
            onClick={() => setFilter(key)}
            title={key === 'all' ? `${rows.length} apps` : `${counts[key]} apps`}
          >
            {FILTER_LABELS[key]} {key === 'all' ? rows.length : counts[key]}
          </FilterPill>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="app"
          title="No apps assigned"
          description="Okta reports no application assignments for this user."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="app"
          title="No apps match"
          description="No app matches this filter. Clearing it brings the whole list back."
          actions={[{ label: 'Clear filters', onClick: clearFilters, variant: 'secondary' }]}
        />
      ) : (
        <ul className="space-y-(--sp-rung)">
          {visible.map((row) => (
            <UserAppRow
              key={row.id}
              row={row}
              oktaOrigin={oktaOrigin}
              selected={selection.selectedIds.has(row.id)}
              onToggleSelect={selection.toggleSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserAppsList;
