import React, { memo } from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import { Button, EmptyState, ScrollableList, Skeleton } from '../shared';
import AppListItem from './AppListItem';
import type { AppAssignmentCounts } from '../../hooks/useOktaApi/appOperations';
import type { OktaAppListItem } from '../../../shared/schemas/okta';

export interface AppsListPanelProps {
  loading: boolean;
  apps: OktaAppListItem[];
  hasApps: boolean;
  activeFilterCount: number;
  hasSearchQuery: boolean;
  onClearFilters: () => void;
  onReload: () => void;
  oktaOrigin?: string;
  fetchAssignmentCounts?: (appId: string) => Promise<AppAssignmentCounts | null>;
  selectedIds: Set<string>;
  onToggleSelect: (appId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const AppsListPanel: React.FC<AppsListPanelProps> = memo(function AppsListPanel({
  loading,
  apps,
  hasApps,
  activeFilterCount,
  hasSearchQuery,
  onClearFilters,
  onReload,
  oktaOrigin,
  fetchAssignmentCounts,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
}) {
  const setStaggerRef = useStaggerReveal();
  const selectedHere = selectedIds.size;
  const allFilteredSelected = apps.length > 0 && apps.every((app) => selectedIds.has(app.id));

  return (
    <>
      {apps.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          {selectedHere > 0 ? (
            <p className="text-xs tabular-nums text-primary-text">
              {selectedHere.toLocaleString()} selected
            </p>
          ) : (
            <span />
          )}
          <div className="flex shrink-0 items-center gap-(--sp-inline)">
            {selectedHere > 0 && (
              <Button
                variant="link"
                size="xs"
                onClick={onDeselectAll}
                title="Clear every selected app, including any picked on another screen"
              >
                Deselect all
              </Button>
            )}
            <Button
              variant="link"
              size="xs"
              onClick={onSelectAll}
              disabled={allFilteredSelected}
              title={
                allFilteredSelected
                  ? `All ${apps.length.toLocaleString()} apps matching the current search and filters are already selected`
                  : `Replace the app selection with the ${apps.length.toLocaleString()} apps matching the current search and filters`
              }
            >
              Select all
            </Button>
          </div>
        </div>
      )}
      <ScrollableList
        loading={loading}
        loadingMessage="Loading applications from Okta..."
        skeleton={
          <Skeleton variant="row" size="lg" count={6} label="Loading applications from Okta..." />
        }
        className="mt-4"
        testId="apps-list"
        emptyState={
          hasApps ? (
            <EmptyState
              icon="app"
              title="No applications match your filters"
              description="Try adjusting your search or status filter."
              actions={
                activeFilterCount > 0 || hasSearchQuery
                  ? [{ label: 'Clear filters', onClick: onClearFilters, variant: 'secondary' }]
                  : undefined
              }
            />
          ) : (
            <EmptyState
              icon="app"
              title="No applications loaded"
              description="Load the org's application inventory to browse it here."
              actions={[{ label: 'Load applications', onClick: onReload, variant: 'primary' }]}
            />
          )
        }
      >
        {apps.length > 0 && (
          <div ref={setStaggerRef} className="space-y-(--sp-rung) rise-in-stagger">
            {apps.map((app) => (
              <AppListItem
                key={app.id}
                app={app}
                oktaOrigin={oktaOrigin}
                fetchAssignmentCounts={fetchAssignmentCounts}
                selected={selectedIds.has(app.id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </div>
        )}
      </ScrollableList>
    </>
  );
});

export default AppsListPanel;
