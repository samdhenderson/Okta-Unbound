import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import type { OktaUser, MemberMfaResult } from '../../../shared/types';
import type { MemberSourceIndex } from '../../../shared/membership/memberSourceIndex';
import type { MembershipProofs } from '../users/GroupMembershipsListProof';
import ScrollableList from '../shared/ScrollableList';
import { Button, Skeleton } from '../shared';
import MemberRow from './MemberRow';

interface MemberListProps {
  members: OktaUser[];
  loading?: boolean;
  mfaResults: Map<string, MemberMfaResult> | null;
  mfaScanned: boolean;
  visibleCount: number;
  onLoadMore: () => void;
  oktaOrigin?: string | null;
  onRemoveMember?: (user: OktaUser) => void;
  memberSourceIndex?: MemberSourceIndex;
  proofs?: MembershipProofs;
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
  onRemoveMember,
  memberSourceIndex,
  proofs,
}) => {
  const setStaggerRef = useStaggerReveal();

  const [openUserIds, setOpenUserIds] = useState<ReadonlySet<string>>(() => new Set());
  const toggleRow = useCallback((userId: string) => {
    setOpenUserIds((previous) => {
      const next = new Set(previous);
      if (!next.delete(userId)) next.add(userId);
      return next;
    });
  }, []);

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
              expanded={openUserIds.has(user.id)}
              onToggle={toggleRow}
              onRemove={onRemoveMember}
              membership={memberSourceIndex?.byUserId.get(user.id)?.membership}
              proofEnabled={proofs?.enabled ?? false}
              proofOutcome={proofs?.outcomeFor(user.id)}
              onProve={proofs?.prove}
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
