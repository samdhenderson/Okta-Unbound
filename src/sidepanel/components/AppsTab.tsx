import React, { useCallback, useMemo, useState } from 'react';
import { AlertMessage, Button, PageHeader } from './shared';
import AppsToolbar from './apps/AppsToolbar';
import AppsListPanel from './apps/AppsListPanel';
import {
  computeActiveAppFilterCount,
  filterAndSortApps,
  type AppSortField,
  type AppStatusFilter,
} from './apps/appFilters';
import { useOktaApi } from '../hooks/useOktaApi';
import type { OperationResult } from '../hooks/useOktaApi/types';
import { useAppsData } from '../hooks/useAppsData';

export interface AppsTabProps {
  targetTabId: number | null;
  oktaOrigin?: string;
  isActive?: boolean;
}

const AppsTab: React.FC<AppsTabProps> = ({ targetTabId, oktaOrigin, isActive = true }) => {
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppStatusFilter>('');
  const [sortBy, setSortBy] = useState<AppSortField>('label');
  const [sortDesc, setSortDesc] = useState(false);

  const handleResult = useCallback(({ message, type }: OperationResult) => {
    if (type === 'error') setError(message);
  }, []);

  const api = useOktaApi({ targetTabId, onResult: handleResult });

  const handleError = useCallback((message: string) => {
    setError(message || null);
  }, []);

  const { apps, isLoading, loadApps } = useAppsData({
    api,
    onError: handleError,
    targetTabId,
    oktaOrigin,
    enabled: isActive,
  });

  const filteredApps = useMemo(
    () => filterAndSortApps(apps, { searchQuery, statusFilter, sortBy, sortDesc }),
    [apps, searchQuery, statusFilter, sortBy, sortDesc],
  );

  const activeFilterCount = useMemo(
    () => computeActiveAppFilterCount({ statusFilter }),
    [statusFilter],
  );

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
  }, []);

  const handleRefresh = useCallback(() => {
    void loadApps(true);
  }, [loadApps]);

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title="Applications"
        subtitle="Browse the org's application inventory (read-only)"
        badge={{ text: `${apps.length.toLocaleString()} Apps`, variant: 'primary' }}
        actions={
          <Button
            variant="secondary"
            icon="refresh"
            onClick={handleRefresh}
            loading={isLoading}
            disabled={isLoading || targetTabId == null}
          >
            Refresh
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
          <div className="shrink-0 space-y-3">
            <AppsToolbar
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortBy={sortBy}
              sortDesc={sortDesc}
              onToggleSort={handleToggleSort}
              resultCount={filteredApps.length}
              totalCount={apps.length}
            />

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
            hasApps={apps.length > 0}
            activeFilterCount={activeFilterCount}
            hasSearchQuery={searchQuery.trim().length > 0}
            onClearFilters={handleClearFilters}
            onReload={handleRefresh}
            oktaOrigin={oktaOrigin}
            fetchAssignmentCounts={api.getAppAssignmentCounts}
          />
        </div>
      </div>
    </div>
  );
};

export default AppsTab;
