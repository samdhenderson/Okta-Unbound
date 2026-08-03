import React, { useState, useCallback, useEffect, useRef } from 'react';
import PageHeader from './shared/PageHeader';
import Breadcrumbs from './shared/Breadcrumbs';
import AlertMessage from './shared/AlertMessage';
import Button from './shared/Button';
import { useOktaApi } from '../hooks/useOktaApi';
import { useGroupsLoader } from '../hooks/useGroupsLoader';
import { useGroupLiveSearch } from '../hooks/useGroupLiveSearch';
import { useGroupFilters } from '../hooks/useGroupFilters';
import { useGroupSelection } from '../hooks/useGroupSelection';
import { useGroupMembersCache } from '../hooks/useGroupMembersCache';
import { useGroupMerge } from '../hooks/useGroupMerge';
import { useViewStack } from '../hooks/useViewStack';
import { useScrollPreservation } from '../hooks/useScrollPreservation';
import type { GroupSummary } from '../../shared/types';
import GroupExportModal from './groups/GroupExportModal';
import GroupComparisonModal from './groups/GroupComparisonModal';
import CrossGroupSearch from './groups/CrossGroupSearch';
import BulkOperationsPanel from './groups/BulkOperationsPanel';
import GroupCollections from './groups/GroupCollections';
import GroupCleanupPanel from './groups/GroupCleanupPanel';
import GroupSearchBar from './groups/GroupSearchBar';
import GroupFilterToggle from './groups/GroupFilterToggle';
import GroupFilterPanel from './groups/GroupFilterPanel';
import GroupSelectionBar, { type ActivePanel } from './groups/GroupSelectionBar';
import GroupsListPanel from './groups/GroupsListPanel';
import GroupDetailView from './groups/detail/GroupDetailView';
import GroupMergeModal from './groups/GroupMergeModal';
import { downloadCSV, getDateForFilename } from '../../shared/utils/csvUtils';
import { buildGroupsListCsv } from './groups/groupsListCsv';

interface GroupsTabProps {
  targetTabId: number | null;
  oktaOrigin?: string;
  onNavigateToRule?: (ruleId: string) => void;
  selectedGroupId?: string | null;
  onGroupSelected?: () => void;
  isActive?: boolean;
}

const groupCrumbLabel = (group: GroupSummary): string => group.name;

const groupCrumbKey = (group: GroupSummary): string => group.id;

const groupTypeBadgeVariant: Record<GroupSummary['type'], 'primary' | 'warning' | 'neutral'> = {
  OKTA_GROUP: 'primary',
  APP_GROUP: 'warning',
  BUILT_IN: 'neutral',
};

const groupTypeBadgeText: Record<GroupSummary['type'], string> = {
  OKTA_GROUP: 'Okta group',
  APP_GROUP: 'App group',
  BUILT_IN: 'Built-in',
};

const GroupsTab: React.FC<GroupsTabProps> = ({
  targetTabId,
  oktaOrigin,
  onNavigateToRule,
  selectedGroupId,
  onGroupSelected,
  isActive = true,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'live' | 'cached'>('live');
  const [showFilters, setShowFilters] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportGroups, setExportGroups] = useState<GroupSummary[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');

  const handleResult = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
      if (type === 'error') setError(message);
    },
    [],
  );

  const api = useOktaApi({ targetTabId, onResult: handleResult });

  const liveSearch = useGroupLiveSearch({ targetTabId, searchMode, setError, enabled: isActive });
  const loader = useGroupsLoader({
    api,
    setError,
    setSearchMode,
    onLoaded: liveSearch.resetLiveSearch,
  });
  const filters = useGroupFilters({
    groups: loader.groups,
    searchMode,
    liveSearchResults: liveSearch.liveSearchResults,
  });
  const selection = useGroupSelection(loader.groups);
  const membersCache = useGroupMembersCache(api, loader.groups);
  const merge = useGroupMerge(targetTabId ?? undefined);

  const detailViewRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [autoAnalyzeGroupId, setAutoAnalyzeGroupId] = useState<string | null>(null);
  const nav = useViewStack<GroupSummary>({
    rootLabel: 'Groups',
    getLabel: groupCrumbLabel,
    getKey: groupCrumbKey,
    viewRef: detailViewRef,
  });
  const captureListScroll = useScrollPreservation(listScrollRef, isActive && nav.isRoot);

  const handleCloseMerge = useCallback(() => {
    setShowMergeModal(false);
    merge.reset();
  }, [merge]);

  const { groups, loading, loadAllGroups } = loader;
  const { filteredGroups, activeFilterCount } = filters;
  const { selectedGroupIds, selectedGroups } = selection;

  const pushedGroup = nav.currentEntry;
  const detailGroup = pushedGroup
    ? (groups.find((g) => g.id === pushedGroup.id) ?? pushedGroup)
    : undefined;

  const { push: pushView } = nav;
  const handleOpenDetail = useCallback(
    (group: GroupSummary) => {
      captureListScroll();
      setAutoAnalyzeGroupId(null);
      pushView(group);
    },
    [captureListScroll, pushView],
  );

  const handleAnalyzeSource = useCallback(
    (group: GroupSummary) => {
      captureListScroll();
      setAutoAnalyzeGroupId(group.id);
      pushView(group);
    },
    [captureListScroll, pushView],
  );

  const navHandledRef = useRef<string | null>(null);
  const navLoadRef = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedGroupId) {
      navHandledRef.current = null;
      navLoadRef.current = null;
      return;
    }
    if (navHandledRef.current === selectedGroupId) return;
    if (!groups.some((g) => g.id === selectedGroupId)) {
      if (!loading && navLoadRef.current !== selectedGroupId) {
        navLoadRef.current = selectedGroupId;
        setSearchMode('cached');
        void loadAllGroups();
      }
      return;
    }
    navHandledRef.current = selectedGroupId;

    nav.reset();
    setSearchMode('cached');
    filters.clearFilters();
    filters.setSearchQuery('');

    const scrollT = setTimeout(() => {
      document
        .querySelector(`[data-group-id="${selectedGroupId}"]`)
        ?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    }, 150);
    const clearT = setTimeout(() => onGroupSelected?.(), 2500);
    return () => {
      clearTimeout(scrollT);
      clearTimeout(clearT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId, groups, loading]);

  const handleExportSelection = useCallback(() => {
    if (selectedGroupIds.size === 0) {
      setError('Please select at least one group');
      return;
    }
    setExportGroups(groups.filter((g) => selectedGroupIds.has(g.id)));
    setShowExportModal(true);
  }, [selectedGroupIds, groups]);

  const handleExportGroupsList = useCallback(() => {
    downloadCSV(
      buildGroupsListCsv(filteredGroups),
      `okta_groups_${getDateForFilename()}.csv`,
      'text/csv',
    );
  }, [filteredGroups]);

  const togglePanel = useCallback((panel: ActivePanel) => {
    setActivePanel((prev) => (prev === panel ? 'none' : panel));
  }, []);

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title={detailGroup ? detailGroup.name : 'Groups'}
        subtitle={detailGroup ? undefined : 'Browse, search, and manage groups'}
        onBack={detailGroup ? nav.pop : undefined}
        backLabel="Back to groups"
        breadcrumbs={detailGroup ? <Breadcrumbs items={nav.trail} /> : undefined}
        badge={
          detailGroup
            ? {
                text: groupTypeBadgeText[detailGroup.type],
                variant: groupTypeBadgeVariant[detailGroup.type],
              }
            : selectedGroupIds.size > 0
              ? { text: `${selectedGroupIds.size} Selected`, variant: 'primary' }
              : searchMode === 'cached'
                ? { text: `${groups.length} Cached`, variant: 'success' }
                : { text: 'Live', variant: 'primary' }
        }
        actions={
          detailGroup ? undefined : searchMode === 'live' ? (
            <Button
              variant="primary"
              onClick={loadAllGroups}
              disabled={loading || !targetTabId}
              loading={loading}
            >
              Load All Groups
            </Button>
          ) : (
            <Button variant="secondary" icon="refresh" onClick={loadAllGroups} loading={loading}>
              Refresh
            </Button>
          )
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div
          className={nav.isRoot ? 'flex flex-col h-[calc(100vh-280px)] min-h-[400px]' : 'hidden'}
        >
          <div className="shrink-0 space-y-3">
            <div className="flex gap-2">
              <GroupSearchBar
                searchMode={searchMode}
                liveSearchQuery={liveSearch.liveSearchQuery}
                onLiveSearchQueryChange={liveSearch.setLiveSearchQuery}
                searchQuery={filters.searchQuery}
                onSearchQueryChange={filters.setSearchQuery}
                isLiveSearching={liveSearch.isLiveSearching}
              />

              {searchMode === 'cached' && (
                <GroupFilterToggle
                  showFilters={showFilters}
                  activeFilterCount={activeFilterCount}
                  onToggle={() => setShowFilters((prev) => !prev)}
                />
              )}
            </div>

            {searchMode === 'cached' && showFilters && (
              <GroupFilterPanel
                activeFilterCount={activeFilterCount}
                typeFilter={filters.typeFilter}
                setTypeFilter={filters.setTypeFilter}
                sizeFilter={filters.sizeFilter}
                setSizeFilter={filters.setSizeFilter}
                pushFilter={filters.pushFilter}
                setPushFilter={filters.setPushFilter}
                pushAppFilter={filters.pushAppFilter}
                setPushAppFilter={filters.setPushAppFilter}
                availablePushApps={filters.availablePushApps}
                sortBy={filters.sortBy}
                sortDesc={filters.sortDesc}
                toggleSort={filters.toggleSort}
                clearFilters={filters.clearFilters}
              />
            )}

            {searchMode === 'cached' && (
              <GroupSelectionBar
                selectedCount={selectedGroupIds.size}
                filteredCount={filteredGroups.length}
                activePanel={activePanel}
                crossSearchBadge={membersCache.groupMembersCache.size}
                onSelectAll={() => selection.replaceSelection(filteredGroups.map((g) => g.id))}
                onDeselectAll={selection.deselectAll}
                onCompare={() => setShowComparisonModal(true)}
                onMerge={() => setShowMergeModal(true)}
                onTogglePanel={togglePanel}
                onExportSelection={handleExportSelection}
                onExportGroupsList={handleExportGroupsList}
              />
            )}

            {activePanel === 'bulk' && selectedGroupIds.size > 0 && (
              <BulkOperationsPanel
                selectedGroups={selectedGroups}
                executeBulkOperation={api.executeBulkOperation}
                onClose={() => setActivePanel('none')}
                onExportSelection={handleExportSelection}
              />
            )}

            {activePanel === 'crossSearch' && (
              <CrossGroupSearch
                groupMembersCache={membersCache.groupMembersCache}
                groupNames={membersCache.groupNames}
                searchUserAcrossGroups={api.searchUserAcrossGroups}
                onRemoveUserFromGroups={membersCache.removeUserFromGroups}
                onClose={() => setActivePanel('none')}
              />
            )}

            {activePanel === 'collections' && (
              <GroupCollections
                selectedGroupIds={selectedGroupIds}
                groups={groups}
                onLoadCollection={selection.replaceSelection}
                onClose={() => setActivePanel('none')}
              />
            )}

            {activePanel === 'cleanup' && (
              <GroupCleanupPanel
                groups={groups}
                onSelectGroups={selection.replaceSelection}
                onAnalyzeSource={handleOpenDetail}
                onClose={() => setActivePanel('none')}
              />
            )}

            {error && (
              <AlertMessage
                message={{ text: error, type: 'danger' }}
                onDismiss={() => setError(null)}
              />
            )}
          </div>

          <GroupsListPanel
            loading={loading}
            searchMode={searchMode}
            liveSearchQuery={liveSearch.liveSearchQuery}
            isLiveSearching={liveSearch.isLiveSearching}
            hasGroups={groups.length > 0}
            activeFilterCount={activeFilterCount}
            filteredGroups={filteredGroups}
            selectedGroupIds={selectedGroupIds}
            onToggleSelect={selection.toggleSelect}
            oktaOrigin={oktaOrigin}
            onLoadAllGroups={loadAllGroups}
            onClearFilters={filters.clearFilters}
            onOpenDetail={handleOpenDetail}
            onAnalyzeSource={handleAnalyzeSource}
            highlightedGroupId={selectedGroupId ?? undefined}
            scrollRef={listScrollRef}
          />
        </div>

        {detailGroup && (
          <div ref={detailViewRef} tabIndex={-1} className="focus:outline-none">
            <GroupDetailView
              group={detailGroup}
              targetTabId={targetTabId}
              oktaOrigin={oktaOrigin}
              onNavigateToRule={onNavigateToRule}
              autoAnalyze={autoAnalyzeGroupId === detailGroup.id}
              isActive={isActive}
            />
          </div>
        )}
      </div>

      <GroupExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        groups={exportGroups}
        targetTabId={targetTabId}
        exportType="selection"
        collectionName=""
        onFetchMembers={membersCache.fetchMembers}
      />

      <GroupComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        groups={selectedGroups}
        compareGroups={api.compareGroups}
        memberCache={membersCache.groupMembersCache}
      />

      <GroupMergeModal
        isOpen={showMergeModal}
        selectedGroups={selectedGroups}
        phase={merge.phase}
        plan={merge.plan}
        results={merge.results}
        error={merge.error}
        onPreview={merge.preview}
        onExecute={merge.execute}
        onClose={handleCloseMerge}
      />
    </div>
  );
};

export default GroupsTab;
