import React, { useMemo } from 'react';
import { AlertMessage, Button, DetailSection, EmptyState, Modal, Skeleton } from '../../shared';
import MemberExplorer from '../../members/MemberExplorer';
import { toMemberSourceContext } from '../../members/memberSourceContext';
import type { MemberCohort } from '../../members/useMemberCohort';
import type { MemberFilter } from '../../members/memberAnalytics';
import MemberSourceNotes from './MemberSourceNotes';
import type {
  GroupMembership,
  GroupSummary,
  MemberMfaResult,
  MfaScanStatus,
  OktaUser,
} from '../../../../shared/types';
import type { MemberSourceBreakdown } from '../../../../shared/membership/groupSource';
import type { MemberSourceIndex } from '../../../../shared/membership/memberSourceIndex';
import type { MemberRuleAttribution } from '../../../../shared/membership/memberRuleAttribution';
import type { SourceStatus } from '../../../hooks/useGroupSource';
import type { MemberWriteStatus } from './useGroupMembersSection';
import { userDisplayName } from '../../../../shared/utils/userDisplay';

const READ_ONLY_REASON: Partial<Record<GroupSummary['type'], string>> = {
  APP_GROUP:
    "Membership here is imported from the app that owns this group, so Okta doesn't allow editing it directly.",
  BUILT_IN: "This is one of Okta's built-in groups — its membership is managed by Okta, not here.",
};

export interface GroupMembersSectionProps {
  groupType: GroupSummary['type'];
  memberCount: number;
  members: OktaUser[] | null;
  status: SourceStatus;
  error: string | null;
  onAnalyze: () => void;
  canAnalyze?: boolean;
  oktaOrigin?: string | null;

  breakdown: MemberSourceBreakdown | null;
  memberSourceIndex: MemberSourceIndex | null;
  onNavigateToRule?: (ruleId: string) => void;
  onProveMemberSource?: (userId: string) => Promise<MemberRuleAttribution>;

  mfaResults: Map<string, MemberMfaResult> | null;
  scanStatus: MfaScanStatus;
  onRunScan: () => void;
  onRequestConfirm: () => void;
  onCancelConfirm: () => void;

  removeTarget: OktaUser | null;
  onRequestRemove: (user: OktaUser) => void;
  onCancelRemove: () => void;
  onConfirmRemove: () => void;
  removeStatus: MemberWriteStatus;
  removeError: string | null;
  onOpenInsights?: () => void;
  pendingFilter?: MemberFilter | null;
  cohort?: MemberCohort;
}

const GroupMembersSection: React.FC<GroupMembersSectionProps> = ({
  groupType,
  memberCount,
  members,
  status,
  error,
  onAnalyze,
  canAnalyze = true,
  oktaOrigin,
  breakdown,
  memberSourceIndex,
  onNavigateToRule,
  onProveMemberSource,
  mfaResults,
  scanStatus,
  onRunScan,
  onRequestConfirm,
  onCancelConfirm,
  removeTarget,
  onRequestRemove,
  onCancelRemove,
  onConfirmRemove,
  removeStatus,
  removeError,
  onOpenInsights,
  pendingFilter,
  cohort,
}) => {
  const hasMembers = memberCount > 0;
  const readOnlyReason = READ_ONLY_REASON[groupType];

  const memberSource = useMemo(
    () => toMemberSourceContext(breakdown, memberSourceIndex),
    [breakdown, memberSourceIndex],
  );

  const proveMemberSource = useMemo(
    () =>
      onProveMemberSource
        ? (_membership: GroupMembership, userId: string) => onProveMemberSource(userId)
        : undefined,
    [onProveMemberSource],
  );

  return (
    <DetailSection
      actions={
        status === 'idle' && hasMembers ? (
          <Button
            variant="secondary"
            size="sm"
            icon="users"
            onClick={onAnalyze}
            disabled={!canAnalyze}
          >
            Load members
          </Button>
        ) : undefined
      }
    >
      {readOnlyReason && <p className="mb-3 text-xs text-neutral-500">{readOnlyReason}</p>}

      {!hasMembers ? (
        <p className="text-sm text-neutral-500">This group has no members.</p>
      ) : status === 'idle' ? (
        <p className="text-sm text-neutral-500">
          Not loaded yet. Reads all {memberCount.toLocaleString()} member
          {memberCount === 1 ? '' : 's'} once, then classifies each against the rules that assign
          into this group — one read for both.
        </p>
      ) : status === 'loading' ? (
        <Skeleton variant="row" size="md" count={4} label="Loading members…" />
      ) : status === 'error' ? (
        <AlertMessage
          message={{ text: error || 'Failed to load members.', type: 'danger' }}
          action={{ label: 'Retry', onClick: onAnalyze }}
        />
      ) : !members || members.length === 0 ? (
        <EmptyState icon="users" title="No members" description="This group's roster is empty." />
      ) : (
        <MemberExplorer
          members={members}
          oktaOrigin={oktaOrigin}
          mfaResults={mfaResults}
          scanStatus={scanStatus}
          onRunScan={onRunScan}
          onRequestConfirm={onRequestConfirm}
          onCancelConfirm={onCancelConfirm}
          memberSource={memberSource}
          sourceDetail={
            breakdown ? (
              <MemberSourceNotes breakdown={breakdown} onNavigateToRule={onNavigateToRule} />
            ) : undefined
          }
          onProveMemberSource={proveMemberSource}
          onOpenInsights={onOpenInsights}
          pendingFilter={pendingFilter}
          cohort={cohort}
          onRemoveMember={readOnlyReason ? undefined : onRequestRemove}
        />
      )}

      <Modal
        isOpen={removeTarget !== null}
        onClose={onCancelRemove}
        title="Remove member"
        footer={
          <>
            <Button variant="secondary" onClick={onCancelRemove}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onConfirmRemove}
              loading={removeStatus === 'loading'}
              disabled={removeStatus === 'loading'}
            >
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          This will remove <strong>{removeTarget ? userDisplayName(removeTarget) : ''}</strong> from
          this group. This action cannot be undone.
        </p>
        {removeError && (
          <AlertMessage message={{ text: removeError, type: 'danger' }} className="mt-3" />
        )}
      </Modal>
    </DetailSection>
  );
};

export default GroupMembersSection;
