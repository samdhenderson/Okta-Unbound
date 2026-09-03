import React, { useState, useCallback, useEffect, useRef } from 'react';
import PageHeader from './shared/PageHeader';
import Breadcrumbs from './shared/Breadcrumbs';
import AlertMessage from './shared/AlertMessage';
import Button from './shared/Button';
import EntityIdentity from './shared/EntityIdentity';
import FilterToggle from './shared/FilterToggle';
import OpenInOktaLink from './shared/OpenInOktaLink';
import WorkingSetPinButton from './shared/WorkingSetPinButton';
import { groupIdentity } from './groups/groupIdentity';
import { useOktaApi } from '../hooks/useOktaApi';
import type { OperationResult } from '../hooks/useOktaApi/types';
import { useGroupsLoader } from '../hooks/useGroupsLoader';
import { useGroupLiveSearch } from '../hooks/useGroupLiveSearch';
import { useGroupFilters } from '../hooks/useGroupFilters';
import type { GroupsListView } from '../listViewRequest';
import { useGroupSelection } from '../hooks/useGroupSelection';
import { useGroupMembersCache } from '../hooks/useGroupMembersCache';
import { useGroupMerge } from '../hooks/useGroupMerge';
import { useViewStack } from '../hooks/useViewStack';
import { useWorkingSet } from '../hooks/useWorkingSet';
import { useScrollPreservation } from '../hooks/useScrollPreservation';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GroupSummary } from '../../shared/types';
import GroupExportModal from './groups/GroupExportModal';
import GroupComparisonModal from './groups/GroupComparisonModal';
import CrossGroupSearch from './groups/CrossGroupSearch';
import BulkOperationsPanel from './groups/BulkOperationsPanel';
import GroupCollections from './groups/GroupCollections';
import GroupCleanupPanel from './groups/GroupCleanupPanel';
import GroupSearchBar from './groups/GroupSearchBar';
import GroupFilterPanel from './groups/GroupFilterPanel';
import GroupsListActionBar, { type ActivePanel } from './groups/GroupsListActionBar';
import GroupsListPanel from './groups/GroupsListPanel';
import GroupDetailView, { type GroupDetailTab } from './groups/detail/GroupDetailView';
import GroupMergeModal from './groups/GroupMergeModal';
import { downloadCSV, getDateForFilename } from '../../shared/utils/csvUtils';
import { buildGroupsListCsv } from './groups/groupsListCsv';

interface GroupsTabProps {
  targetTabId: number | null;
  oktaOrigin?: string;
  onNavigateToRule?: (ruleId: string) => void;
  selectedGroupId?: string | null;
  selectedGroupPane?: GroupDetailTab;
  onGroupSelected?: () => void;
  onExportGroup?: (groupId: string, groupName: string) => void;
  isActive?: boolean;
  scrollRootRef?: React.RefObject<HTMLElement | null>;
  listView?: GroupsListView | null;
  onListViewConsumed?: () => void;
}

const groupCrumbLabel = (group: GroupSummary): string => group.name;

const groupCrumbKey = (group: GroupSummary): string => group.id;

const GroupsTab: React.FC<GroupsTabProps> = ({
  targetTabId,
  oktaOrigin,
  onNavigateToRule,
  selectedGroupId,
  selectedGroupPane,
  onGroupSelected,
  isActive = true,
  scrollRootRef,
  onExportGroup,
  listView,
  onListViewConsumed,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'live' | 'cached'>('live');
  const [showFilters, setShowFilters] = useState(false);

  const reducedMotion = useReducedMotion();

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportGroups, setExportGroups] = useState<GroupSummary[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');

  const handleResult = useCallback(({ message, type }: OperationResult) => {
    if (type === 'error') setError(message);
  }, []);

  const api = useOktaApi({ targetTabId, onResult: handleResult });

  const liveSearch = useGroupLiveSearch({ targetTabId, searchMode, setError, enabled: isActive });
  const loader = useGroupsLoader({
    targetTabId,
    oktaOrigin,
    setError,
    setSearchMode,
    onLoaded: liveSearch.resetLiveSearch,
    enabled: isActive,
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
  const listRef = useRef<HTMLDivElement>(null);
  const noScroller = useRef<HTMLElement | null>(null);
  const [panePush, setPanePush] = useState<{ groupId: string; pane: GroupDetailTab } | null>(null);
  const nav = useViewStack<GroupSummary>({
    rootLabel: 'Groups',
    getLabel: groupCrumbLabel,
    getKey: groupCrumbKey,
    viewRef: detailViewRef,
  });
  const captureListScroll = useScrollPreservation(
    scrollRootRef ?? noScroller,
    isActive && nav.isRoot,
  );

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

  const identity = detailGroup ? groupIdentity(detailGroup) : undefined;

  const workingSet = useWorkingSet(oktaOrigin);

  const { push: pushView } = nav;
  const handleOpenDetail = useCallback(
    (group: GroupSummary) => {
      captureListScroll();
      setPanePush(null);
      pushView(group);
    },
    [captureListScroll, pushView],
  );

  const handleAnalyzeSource = useCallback(
    (group: GroupSummary) => {
      captureListScroll();
      setPanePush({ groupId: group.id, pane: 'members' });
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
    const target = groups.find((g) => g.id === selectedGroupId);
    if (!target) {
      if (!loading && navLoadRef.current !== selectedGroupId) {
        navLoadRef.current = selectedGroupId;
        setSearchMode('cached');
        void loadAllGroups();
      }
      return;
    }
    navHandledRef.current = selectedGroupId;

    if (selectedGroupPane) {
      setPanePush({ groupId: target.id, pane: selectedGroupPane });
      pushView(target);
      onGroupSelected?.();
      return;
    }

    nav.reset();
    setSearchMode('cached');
    filters.clearFilters();
    filters.setSearchQuery('');

    const scrollT = setTimeout(() => {
      document
        .querySelector(`[data-group-id="${selectedGroupId}"]`)
        ?.scrollIntoView?.({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    }, 150);
    const clearT = setTimeout(() => onGroupSelected?.(), 2500);
    return () => {
      clearTimeout(scrollT);
      clearTimeout(clearT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId, selectedGroupPane, groups, loading]);

  const listViewHandledRef = useRef<GroupsListView | null>(null);
  useEffect(() => {
    if (!listView) {
      listViewHandledRef.current = null;
      return;
    }
    if (listViewHandledRef.current === listView) return;
    listViewHandledRef.current = listView;

    nav.reset();
    setSearchMode('cached');
    filters.clearFilters();
    if (listView === 'empty') filters.setSizeFilter('empty');
    else filters.setRuleFilter('unruled');

    if (groups.length === 0 && !loading) void loadAllGroups();
    onListViewConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listView, groups.length, loading]);

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

  const searchRow = (
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
        <FilterToggle
          open={showFilters}
          activeCount={activeFilterCount}
          onToggle={() => setShowFilters((prev) => !prev)}
          size="lg"
        />
      )}
    </div>
  );

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title={identity ? identity.name : 'Groups'}
        subtitle={identity ? undefined : 'Browse, search, and manage groups'}
        onBack={detailGroup ? nav.pop : undefined}
        backLabel="Back to groups"
        breadcrumbs={detailGroup ? <Breadcrumbs items={nav.trail} /> : undefined}
        sticky={isActive}
        identityKey={identity?.key}
        identity={identity ? <EntityIdentity rows={identity.rows} /> : undefined}
        badge={
          identity
            ? identity.badge
            : selectedGroupIds.size > 0
              ? { text: `${selectedGroupIds.size} Selected`, variant: 'primary' }
              : searchMode === 'cached'
                ? { text: `${groups.length} Cached`, variant: 'success' }
                : { text: 'Live', variant: 'primary' }
        }
        actions={
          identity ? (
            identity.link && (
              <OpenInOktaLink
                oktaOrigin={oktaOrigin}
                entityType={identity.link.entityType}
                entityId={identity.link.entityId}
              />
            )
          ) : searchMode === 'live' ? (
            <Button
              variant="primary"
              onClick={() => void loadAllGroups()}
              disabled={loading || !targetTabId}
              loading={loading}
            >
              Load All Groups
            </Button>
          ) : (
            <Button
              variant="secondary"
              icon="refresh"
              onClick={() => void loadAllGroups(true)}
              loading={loading}
            >
              Refresh
            </Button>
          )
        }
        cornerAction={
          detailGroup && (
            <WorkingSetPinButton
              pinned={workingSet.isPinned('group', detailGroup.id)}
              onToggle={() =>
                workingSet.togglePin({
                  kind: 'group',
                  id: detailGroup.id,
                  name: detailGroup.name,
                })
              }
            />
          )
        }
      />

      <div className="max-w-7xl mx-auto px-(--sp-gutter) py-(--sp-gutter) space-y-(--sp-rung)">
        <div
          className={
            nav.isRoot
              ? // `animate-pop-in` (arrive from the left) only after a real pop — the
                `space-y-(--sp-rung) ${nav.transition === 'pop' ? 'animate-pop-in' : ''}`
              : 'hidden'
          }
        >
          {searchMode === 'cached' ? (
            <GroupsListActionBar
              search={searchRow}
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
          ) : (
            searchRow
          )}

          <div className="space-y-(--sp-toolbar)">
            {searchMode === 'cached' && showFilters && (
              <GroupFilterPanel
                activeFilterCount={activeFilterCount}
                typeFilter={filters.typeFilter}
                setTypeFilter={filters.setTypeFilter}
                sizeFilter={filters.sizeFilter}
                setSizeFilter={filters.setSizeFilter}
                pushFilter={filters.pushFilter}
                setPushFilter={filters.setPushFilter}
                ruleFilter={filters.ruleFilter}
                setRuleFilter={filters.setRuleFilter}
                pushAppFilter={filters.pushAppFilter}
                setPushAppFilter={filters.setPushAppFilter}
                availablePushApps={filters.availablePushApps}
                sortBy={filters.sortBy}
                sortDesc={filters.sortDesc}
                toggleSort={filters.toggleSort}
                clearFilters={filters.clearFilters}
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

            {!loader.complete && groups.length > 0 && !loading && (
              <AlertMessage
                message={{
                  text: `Showing ${groups.length} groups — the last load did not finish, so this is part of the org, not all of it. Refresh to complete it.`,
                  type: 'warning',
                }}
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
            onLoadAllGroups={() => void loadAllGroups()}
            onClearFilters={filters.clearFilters}
            onOpenDetail={handleOpenDetail}
            onAnalyzeSource={handleAnalyzeSource}
            highlightedGroupId={selectedGroupId ?? undefined}
            scrollRef={listRef}
          />
        </div>

        {detailGroup && (
          <div
            ref={detailViewRef}
            tabIndex={-1}
            className={`focus:outline-none ${
              nav.transition === 'pop' ? 'animate-pop-in' : 'animate-push-in'
            }`}
          >
            <GroupDetailView
              group={detailGroup}
              targetTabId={targetTabId}
              oktaOrigin={oktaOrigin}
              onNavigateToRule={onNavigateToRule}
              initialPane={panePush?.groupId === detailGroup.id ? panePush.pane : undefined}
              isActive={isActive}
              onExportGroup={onExportGroup}
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
        actorNotice={merge.actorNotice}
        onDismissActorNotice={merge.dismissActorNotice}
        onPreview={merge.preview}
        onExecute={merge.execute}
        onClose={handleCloseMerge}
      />
    </div>
  );
};

export default GroupsTab;
