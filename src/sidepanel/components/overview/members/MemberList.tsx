import React, { useEffect, useRef } from 'react';
import { useStaggerReveal } from '../../../hooks/useStaggerReveal';
import type { OktaUser, MemberMfaResult } from '../../../../shared/types';
import ScrollableList from '../../shared/ScrollableList';
import { Button, Skeleton } from '../../shared';
import MemberRow from './MemberRow';

interface MemberListProps {
  members: OktaUser[];
  loading?: boolean;
  mfaResults: Map<string, MemberMfaResult> | null;
  mfaScanned: boolean;
  visibleCount: number;
  onLoadMore: () => void;
  oktaOrigin?: string | null;
}

const PAGE = 50;

const MemberList: React.FC<MemberListProps> = ({
  members,
  loading = false,
  mfaResults,
  mfaScanned,
  visibleCount,
  onLoadMore,
  oktaOrigin,
}) => {
  const setStaggerRef = useStaggerReveal();

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasMore = visibleCount < members.length;
  const visible = members.slice(0, visibleCount);

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMore();
      },
      { rootMargin: '120px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (!loading && members.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-neutral-500">
        No members match the current search and filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScrollableList
        maxHeight="50vh"
        fillAvailable={false}
        loading={loading}
        skeleton={<Skeleton variant="row" size="md" count={6} label="Reloading members" />}
      >
        <div ref={setStaggerRef} className="space-y-3 rise-in-stagger">
          {visible.map((user) => (
            <MemberRow
              key={user.id}
              user={user}
              mfa={mfaResults?.get(user.id)}
              mfaScanned={mfaScanned}
              oktaOrigin={oktaOrigin}
            />
          ))}
        </div>
        {hasMore && <div ref={sentinelRef} className="h-px" aria-hidden="true" />}
      </ScrollableList>

      <div className="flex items-center justify-between pt-3 text-xs text-neutral-500">
        <span>
          Showing {visible.length.toLocaleString()} of {members.length.toLocaleString()}
        </span>
        {hasMore && (
          <Button variant="secondary" size="sm" onClick={onLoadMore}>
            Load more (+{Math.min(PAGE, members.length - visibleCount)})
          </Button>
        )}
      </div>
    </div>
  );
};

export default MemberList;
