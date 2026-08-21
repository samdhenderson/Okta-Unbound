import React, { useMemo, useState } from 'react';
import { EmptyState, FilterPill, IconButton, Input, Skeleton } from '../shared';
import Icon from '../overview/shared/Icon';
import GroupMembershipRow from './GroupMembershipRow';
import { useMembershipProofs } from './GroupMembershipsListProof';
import {
  BUCKET_PILL_LABELS,
  filterMemberships,
  membershipSummaryLine,
  type MembershipBucket,
  type MembershipBucketFilter,
} from './membershipVerdict';
import type { MemberRuleAttribution } from '../../../shared/membership/memberRuleAttribution';
import { groupContextOf } from '../../../shared/membership/groupContext';
import type { GroupMembership, OktaUser } from '../../../shared/types';

const BUCKET_ORDER: readonly MembershipBucket[] = ['rule', 'direct', 'app', 'unresolved'];

interface GroupMembershipsListProps {
  memberships: GroupMembership[];
  user?: OktaUser;
  isLoading: boolean;
  currentGroupId?: string;
  oktaOrigin?: string | null;
  recentlyAddedGroupId?: string | null;
  appsByGroupId?: Record<string, string[]>;
  onProveMembershipSource?: (groupId: string) => Promise<MemberRuleAttribution>;
}

const GroupMembershipsList: React.FC<GroupMembershipsListProps> = ({
  memberships,
  user,
  isLoading,
  currentGroupId,
  oktaOrigin,
  recentlyAddedGroupId,
  appsByGroupId,
  onProveMembershipSource,
}) => {
  const [query, setQuery] = useState('');
  const [bucket, setBucket] = useState<MembershipBucketFilter>('all');
  const [openGroupIds, setOpenGroupIds] = useState<ReadonlySet<string>>(() => new Set());
  const proofs = useMembershipProofs(onProveMembershipSource);

  const summary = useMemo(() => membershipSummaryLine(memberships), [memberships]);
  const visible = useMemo(
    () => filterMemberships(memberships, query, bucket),
    [memberships, query, bucket],
  );

  const groupContext = useMemo(
    () => (isLoading ? undefined : groupContextOf(memberships)),
    [isLoading, memberships],
  );

  const toggleRow = (groupId: string) =>
    setOpenGroupIds((current) => {
      const next = new Set(current);
      if (!next.delete(groupId)) next.add(groupId);
      return next;
    });

  const clearFilters = () => {
    setQuery('');
    setBucket('all');
  };

  const hasMemberships = memberships.length > 0;

  return (
    <section aria-label="Group memberships">
      {hasMemberships && !isLoading && (
        <div className="space-y-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-xs text-neutral-600">{summary}</p>

          <Input
            size="sm"
            type="search"
            value={query}
            onChange={setQuery}
            ariaLabel="Filter group memberships"
            placeholder="Filter groups or rules…"
            icon={<Icon type="search" size="sm" />}
            trailingInteractive
            trailing={
              query ? (
                <IconButton
                  label="Clear the group filter"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery('')}
                >
                  <Icon type="close" size="sm" />
                </IconButton>
              ) : undefined
            }
          />

          <div className="flex flex-wrap gap-1.5">
            <FilterPill active={bucket === 'all'} onClick={() => setBucket('all')}>
              All
            </FilterPill>
            {BUCKET_ORDER.map((value) => (
              <FilterPill
                key={value}
                active={bucket === value}
                onClick={() => setBucket(value)}
                title={`Show only ${BUCKET_PILL_LABELS[value].toLowerCase()} memberships`}
              >
                {BUCKET_PILL_LABELS[value]}
              </FilterPill>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 p-4">
          <Skeleton variant="row" size="lg" count={4} label="Loading group memberships..." />
        </div>
      ) : !hasMemberships ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-neutral-500">This user is not a member of any groups</p>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon="users"
          title="No memberships match"
          description="No group matches this filter, either by name or by the rule that granted it."
          actions={[{ label: 'Clear filters', onClick: clearFilters, variant: 'secondary' }]}
        />
      ) : (
        <div className="space-y-3 p-4">
          {visible.map((membership) => (
            <GroupMembershipRow
              key={membership.group.id}
              membership={membership}
              user={user}
              groupContext={groupContext}
              isCurrentGroup={membership.group.id === currentGroupId}
              expanded={openGroupIds.has(membership.group.id)}
              onToggle={toggleRow}
              oktaOrigin={oktaOrigin}
              flash={membership.group.id === recentlyAddedGroupId}
              appNames={appsByGroupId?.[membership.group.id]}
              proofEnabled={proofs.enabled}
              proofOutcome={proofs.outcomeFor(membership.group.id)}
              onProve={proofs.prove}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default GroupMembershipsList;
