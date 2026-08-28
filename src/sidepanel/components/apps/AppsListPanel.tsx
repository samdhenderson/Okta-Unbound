import React, { memo } from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import { EmptyState, ScrollableList, Skeleton } from '../shared';
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
}) {
  const setStaggerRef = useStaggerReveal();

  return (
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
            />
          ))}
        </div>
      )}
    </ScrollableList>
  );
});

export default AppsListPanel;
