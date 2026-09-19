import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertMessage, PageHeader } from './shared';
import AppsToolbar from './apps/AppsToolbar';
import AppsFilterPanel, { countDisclosedAppAxes } from './apps/AppsFilterPanel';
import AppsListPanel from './apps/AppsListPanel';
import AppsListActionBar from './apps/AppsListActionBar';
import {
  appDisplayLabel,
  computeActiveAppFilterCount,
  filterAndSortApps,
  type AppGroupsFilter,
  type AppSortField,
  type AppStatusFilter,
} from './apps/appFilters';
import { useOktaApi } from '../hooks/useOktaApi';
import type { OperationResult } from '../hooks/useOktaApi/types';
import { useAppsData } from '../hooks/useAppsData';
import { useRefreshSubject } from '../hooks/useRefreshSubject';
import { useOrgSnapshot } from '../cache/useOrgSnapshot';
import { splitShardedId } from '../../shared/snapshot/types';
import { useRungSelection } from '../selection/useRungSelection';
import type { OktaAppGroupAssignment } from '../../shared/schemas/okta';
import type { AppsListView } from '../listViewRequest';

export interface AppsTabProps {
  targetTabId: number | null;
  oktaOrigin?: string;
  isActive?: boolean;
  listView?: AppsListView | null;
  onListViewConsumed?: () => void;
  selectedAppId?: string | null;
  onAppSelected?: () => void;
}

const AppsTab: React.FC<AppsTabProps> = ({
  targetTabId,
  oktaOrigin,
  isActive = true,
  listView,
  onListViewConsumed,
  selectedAppId,
  onAppSelected,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppStatusFilter>('');
  const [groupsFilter, setGroupsFilter] = useState<AppGroupsFilter>('');
  const [sortBy, setSortBy] = useState<AppSortField>('label');
  const [sortDesc, setSortDesc] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleResult = useCallback(({ message, type }: OperationResult) => {
    if (type === 'error') setError(message);
  }, []);

  const api = useOktaApi({ targetTabId, onResult: handleResult });

  const handleError = useCallback((message: string) => {
    setError(message || null);
  }, []);

  const { apps, isLoading, loadApps } = useAppsData({
    onError: handleError,
    targetTabId,
    oktaOrigin,
    enabled: isActive,
  });

  const { records: assignmentRecords } = useOrgSnapshot<OktaAppGroupAssignment>(
    'appGroups',
    oktaOrigin,
    targetTabId,
    { enabled: isActive },
  );

  const appsWithPushedGroups = useMemo(() => {
    const ids = new Set<string>();
    for (const record of assignmentRecords) {
      const split = splitShardedId(record.id);
      if (split) ids.add(split.shardKey);
    }
    return ids;
  }, [assignmentRecords]);

  const filteredApps = useMemo(
    () =>
      filterAndSortApps(
        apps,
        { searchQuery, statusFilter, groupsFilter, sortBy, sortDesc },
        appsWithPushedGroups,
      ),
    [apps, searchQuery, statusFilter, groupsFilter, sortBy, sortDesc, appsWithPushedGroups],
  );

  const activeFilterCount = useMemo(
    () => computeActiveAppFilterCount({ statusFilter, groupsFilter }),
    [statusFilter, groupsFilter],
  );

  const selection = useRungSelection('app', apps, appDisplayLabel);
  const { replaceSelection } = selection;

  const allFilteredSelected =
    filteredApps.length > 0 && filteredApps.every((app) => selection.selectedIds.has(app.id));

  const handleSelectAll = useCallback(() => {
    const outcome = replaceSelection(filteredApps.map((app) => app.id));
    if (outcome.refused > 0) {
      setError(
        `Selecting ${outcome.refused} apps would take the selection past its limit, so nothing changed. Narrow the filters and try again.`,
      );
    }
  }, [replaceSelection, filteredApps]);

  const listViewHandledRef = useRef<AppsListView | null>(null);
  useEffect(() => {
    if (!listView) {
      listViewHandledRef.current = null;
      return;
    }
    if (listViewHandledRef.current === listView) return;
    listViewHandledRef.current = listView;
    setSearchQuery('');
    setStatusFilter(listView === 'inactive' ? 'INACTIVE' : '');
    setGroupsFilter(listView === 'pushes-nothing' ? 'no-groups' : '');
    onListViewConsumed?.();
  }, [listView, onListViewConsumed]);

  const selectedAppHandledRef = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedAppId) {
      selectedAppHandledRef.current = null;
      return;
    }
    if (selectedAppHandledRef.current === selectedAppId) return;
    const match = apps.find((app) => app.id === selectedAppId);
    if (!match) {
      if (apps.length === 0) return;
      selectedAppHandledRef.current = selectedAppId;
      onAppSelected?.();
      return;
    }
    selectedAppHandledRef.current = selectedAppId;
    setSearchQuery(match.label || match.name || match.id);
    setStatusFilter('');
    setGroupsFilter('');
    onAppSelected?.();
  }, [selectedAppId, apps, onAppSelected]);

  const handleToggleSort = useCallback((field: AppSortField) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortDesc((desc) => !desc);
        return prev;
      }
      setSortDesc(false);
      return field;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('');
    setGroupsFilter('');
  }, []);

  const reloadApps = useCallback(() => {
    void loadApps(true);
  }, [loadApps]);

  useRefreshSubject('the apps list', reloadApps, isActive);

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title="Applications"
        subtitle="Browse the org's application inventory (read-only)"
        badge={{ text: `${apps.length.toLocaleString()} Apps`, variant: 'primary' }}
      />

      <div className="max-w-7xl mx-auto px-(--sp-gutter) py-(--sp-gutter) space-y-(--sp-rung)">
        <div className="flex flex-col gap-(--sp-rung)">
          <div className="space-y-(--sp-toolbar)">
            <AppsListActionBar
              search={
                <AppsToolbar
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  filtersOpen={showFilters}
                  onToggleFilters={() => setShowFilters((prev) => !prev)}
                  activeFilterCount={countDisclosedAppAxes({
                    statusFilter,
                    groupsFilter,
                    sortBy,
                    sortDesc,
                  })}
                />
              }
            />

            {showFilters && (
              <AppsFilterPanel
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                groupsFilter={groupsFilter}
                onGroupsFilterChange={setGroupsFilter}
                sortBy={sortBy}
                sortDesc={sortDesc}
                onToggleSort={handleToggleSort}
                activeFilterCount={activeFilterCount}
                onClearFilters={handleClearFilters}
              />
            )}

            {error && (
              <AlertMessage
                message={{ text: error, type: 'danger' }}
                onDismiss={() => setError(null)}
              />
            )}
          </div>

          <AppsListPanel
            loading={isLoading}
            apps={filteredApps}
            totalCount={apps.length}
            hasApps={apps.length > 0}
            activeFilterCount={activeFilterCount}
            hasSearchQuery={searchQuery.trim().length > 0}
            onClearFilters={handleClearFilters}
            onReload={reloadApps}
            oktaOrigin={oktaOrigin}
            fetchAssignmentCounts={api.getAppAssignmentCounts}
            selectedIds={selection.selectedIds}
            onToggleSelect={selection.toggleSelect}
            selection={{
              allFilteredSelected,
              onSelectAll: handleSelectAll,
              onDeselectAll: selection.deselectAll,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AppsTab;
