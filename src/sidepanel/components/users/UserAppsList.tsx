import React, { useMemo, useState } from 'react';
import { AlertMessage, EmptyState, FilterPill, Input, Skeleton } from '../shared';
import Icon from '../shared/Icon';
import UserAppRow from './UserAppRow';
import { summarizeAppSources, type AppSourceBucket } from './appSourceSummary';
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

  const clearFilters = () => {
    setQuery('');
    setFilter('all');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton variant="row" size="lg" count={4} label="Loading app assignments…" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!complete && (
        <AlertMessage
          message={{
            type: 'warning',
            text: 'This list may be incomplete — the walk of this user’s app assignments did not finish, so it is short by an unknown number of apps. Treat any count or “not assigned” conclusion drawn from it as unavailable rather than as zero.',
          }}
        />
      )}

      {summary && <p className="text-xs text-neutral-600">{summary}</p>}

      <Input
        size="sm"
        value={query}
        onChange={setQuery}
        type="search"
        ariaLabel="Filter apps or granting group"
        placeholder="Filter apps or granting group…"
        icon={<Icon type="search" size="sm" className="text-neutral-400" />}
      />

      <div className="flex flex-wrap gap-2">
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
        <ul className="space-y-3">
          {visible.map((row) => (
            <UserAppRow key={row.id} row={row} oktaOrigin={oktaOrigin} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserAppsList;
