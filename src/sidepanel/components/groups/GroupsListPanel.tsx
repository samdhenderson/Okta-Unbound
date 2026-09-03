import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import EmptyState from '../shared/EmptyState';
import ScrollableList from '../shared/ScrollableList';
import Skeleton from '../shared/Skeleton';
import Button from '../shared/Button';
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
    <>
      <ScrollableList
        loading={loading}
        loadingMessage="Loading groups from Okta..."
        skeleton={
          <Skeleton variant="row" size="sm" count={6} label="Loading groups from Okta..." />
        }
        className="mt-(--sp-rung)"
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

      {visibleGroups.length > 0 && (
        <div className="shrink-0 flex items-center justify-between gap-2 pt-(--sp-rung) text-xs text-neutral-500">
          <span>
            Showing {visibleGroups.length.toLocaleString()} of{' '}
            {filteredGroups.length.toLocaleString()}
            {selectedCount > 0 && ` · ${selectedCount.toLocaleString()} selected`}
          </span>
          {hasMore && (
            <Button variant="secondary" size="sm" onClick={loadMore}>
              Load more (+{Math.min(PAGE, filteredGroups.length - visibleCount)})
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default GroupsListPanel;
