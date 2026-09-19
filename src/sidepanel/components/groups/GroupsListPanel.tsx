import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import EmptyState from '../shared/EmptyState';
import ScrollableList from '../shared/ScrollableList';
import Skeleton from '../shared/Skeleton';
import Button from '../shared/Button';
import ListCountRow from '../shared/ListCountRow';
import GroupListItem from './GroupListItem';
import type { GroupSummary } from '../../../shared/types';

interface GroupsListPanelProps {
  loading: boolean;
  searchMode: 'live' | 'cached';
  liveSearchQuery: string;
  isLiveSearching: boolean;
  hasGroups: boolean;
  activeFilterCount: number;
  filteredGroups: GroupSummary[];
  selectedGroupIds: Set<string>;
  selectedCount: number;
  onToggleSelect: (groupId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  oktaOrigin?: string;
  onLoadAllGroups: () => void;
  onClearFilters: () => void;
  onOpenDetail?: (group: GroupSummary) => void;
  onAnalyzeSource?: (group: GroupSummary) => void;
  highlightedGroupId?: string;
  scrollRef?: React.Ref<HTMLDivElement>;
}

const PAGE = 50;

const GroupsListPanel: React.FC<GroupsListPanelProps> = ({
  loading,
  searchMode,
  liveSearchQuery,
  isLiveSearching,
  hasGroups,
  activeFilterCount,
  filteredGroups,
  selectedGroupIds,
  selectedCount,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  oktaOrigin,
  onLoadAllGroups,
  onClearFilters,
  onOpenDetail,
  onAnalyzeSource,
  highlightedGroupId,
  scrollRef,
}) => {
  const setStaggerRef = useStaggerReveal();

  const [visibleCount, setVisibleCount] = useState(PAGE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [lastGroups, setLastGroups] = useState(filteredGroups);
  if (filteredGroups !== lastGroups) {
    setLastGroups(filteredGroups);
    setVisibleCount(PAGE);
  }

  if (highlightedGroupId) {
    const index = filteredGroups.findIndex((g) => g.id === highlightedGroupId);
    if (index >= visibleCount) {
      setVisibleCount(Math.ceil((index + 1) / PAGE) * PAGE);
    }
  }

  const allFilteredSelected = filteredGroups.every((group) => selectedGroupIds.has(group.id));

  const hasMore = visibleCount < filteredGroups.length;
  const visibleGroups = hasMore ? filteredGroups.slice(0, visibleCount) : filteredGroups;

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + PAGE, filteredGroups.length));
  }, [filteredGroups.length]);

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: '120px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div>
      {visibleGroups.length > 0 && (
        <ListCountRow
          shown={visibleGroups.length}
          of={filteredGroups.length}
          selected={selectedCount}
          selection={
            searchMode === 'cached'
              ? {
                  boundary: allFilteredSelected ? 'all-taken' : 'available',
                  onSelectAll,
                  onDeselectAll,
                  selectAllTitle: allFilteredSelected
                    ? `All ${filteredGroups.length} groups matching the filter are already selected`
                    : 'Select every group the current filter matches',
                  deselectAllTitle:
                    'Clear every selected group, including any picked on another screen',
                }
              : undefined
          }
          className="shrink-0"
          testId="groups-count-line"
        />
      )}
      <ScrollableList
        loading={loading}
        loadingMessage="Loading groups from Okta..."
        skeleton={
          <Skeleton variant="row" size="sm" count={6} label="Loading groups from Okta..." />
        }
        scrolls={false}
        fillAvailable={false}
        scrollRef={scrollRef}
        emptyState={
          searchMode === 'live' && liveSearchQuery.trim() && !isLiveSearching ? (
            <EmptyState
              icon="users"
              title={`No groups found matching "${liveSearchQuery}"`}
              description="Try a different search term or load all groups for advanced filtering"
              actions={[{ label: 'Load All Groups', onClick: onLoadAllGroups, variant: 'primary' }]}
            />
          ) : searchMode === 'cached' && hasGroups ? (
            <EmptyState
              icon="users"
              title="No groups match your filters"
              description="Try adjusting your search or filter criteria"
              actions={
                activeFilterCount > 0
                  ? [{ label: 'Clear Filters', onClick: onClearFilters, variant: 'secondary' }]
                  : undefined
              }
            />
          ) : undefined
        }
      >
        {visibleGroups.length > 0 && (
          <div ref={setStaggerRef} className="rise-in-stagger space-y-(--sp-rung)">
            {visibleGroups.map((group) => (
              <GroupListItem
                key={group.id}
                group={group}
                selected={selectedGroupIds.has(group.id)}
                onToggleSelect={onToggleSelect}
                oktaOrigin={oktaOrigin}
                onOpenDetail={onOpenDetail}
                onAnalyzeSource={onAnalyzeSource}
                isHighlighted={highlightedGroupId === group.id}
              />
            ))}
          </div>
        )}
        {hasMore && <div ref={sentinelRef} className="h-px" aria-hidden="true" />}
      </ScrollableList>

      {hasMore && (
        <div className="flex shrink-0 justify-end pt-(--sp-rung)">
          <Button variant="secondary" size="sm" onClick={loadMore}>
            Load more (+{Math.min(PAGE, filteredGroups.length - visibleCount)})
          </Button>
        </div>
      )}
    </div>
  );
};

export default GroupsListPanel;
