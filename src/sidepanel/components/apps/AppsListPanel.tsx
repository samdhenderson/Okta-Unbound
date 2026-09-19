import React, { memo } from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import { EmptyState, ListCountRow, ScrollableList, Skeleton } from '../shared';
import AppListItem from './AppListItem';
import type { AppAssignmentCounts } from '../../hooks/useOktaApi/appOperations';
import type { OktaAppListItem } from '../../../shared/schemas/okta';

export interface AppsListSelectionControls {
  allFilteredSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export interface AppsListPanelProps {
  loading: boolean;
  apps: OktaAppListItem[];
  totalCount: number;
  hasApps: boolean;
  activeFilterCount: number;
  hasSearchQuery: boolean;
  onClearFilters: () => void;
  onReload: () => void;
  oktaOrigin?: string;
  fetchAssignmentCounts?: (appId: string) => Promise<AppAssignmentCounts | null>;
  selectedIds: Set<string>;
  onToggleSelect: (appId: string) => void;
  selection?: AppsListSelectionControls;
}

const AppsListPanel: React.FC<AppsListPanelProps> = memo(function AppsListPanel({
  loading,
  apps,
  totalCount,
  hasApps,
  activeFilterCount,
  hasSearchQuery,
  onClearFilters,
  onReload,
  oktaOrigin,
  fetchAssignmentCounts,
  selectedIds,
  onToggleSelect,
  selection,
}) {
  const setStaggerRef = useStaggerReveal();
  const selectedHere = selectedIds.size;

  return (
    <div className="flex flex-col">
      {apps.length > 0 && (
        <ListCountRow
          shown={apps.length}
          of={totalCount}
          selected={selectedHere}
          testId="apps-count-line"
          selection={
            selection && {
              boundary: selection.allFilteredSelected ? 'all-taken' : 'available',
              onSelectAll: selection.onSelectAll,
              onDeselectAll: selection.onDeselectAll,
              selectAllTitle: selection.allFilteredSelected
                ? `All ${apps.length.toLocaleString()} apps matching the current search and filters are already selected`
                : `Replace the app selection with the ${apps.length.toLocaleString()} apps matching the current search and filters`,
              deselectAllTitle: 'Clear every selected app, including any picked on another screen',
            }
          }
        />
      )}
      <ScrollableList
        loading={loading}
        loadingMessage="Loading applications from Okta..."
        scrolls={false}
        fillAvailable={false}
        skeleton={
          <Skeleton variant="row" size="lg" count={6} label="Loading applications from Okta..." />
        }
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
    </div>
  );
});

export default AppsListPanel;
