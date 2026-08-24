import React from 'react';
import {
  AlertMessage,
  Button,
  DetailSection,
  EmptyState,
  IconButton,
  ListRow,
  Modal,
  Skeleton,
} from '../../shared';
import Icon from '../../overview/shared/Icon';
import type { GroupSummary, OktaUser } from '../../../../shared/types';
import type { SourceStatus } from '../../../hooks/useGroupSource';
import type { MemberWriteStatus } from './useGroupMembersSection';
import { userDisplayName } from '../../../../shared/utils/userDisplay';

const DISPLAY_CAP = 200;

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

  removeTarget: OktaUser | null;
  onRequestRemove: (user: OktaUser) => void;
  onCancelRemove: () => void;
  onConfirmRemove: () => void;
  removeStatus: MemberWriteStatus;
  removeError: string | null;
}

const MemberListRow: React.FC<{
  user: OktaUser;
  readOnly: boolean;
  onRequestRemove: (user: OktaUser) => void;
}> = ({ user, readOnly, onRequestRemove }) => (
  <ListRow as="li" density="compact">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-neutral-900">
          {userDisplayName(user)}
        </div>
        <div className="truncate text-xs text-neutral-600">{user.profile.email}</div>
      </div>
      {!readOnly && (
        <IconButton
          label={`Remove ${userDisplayName(user)} from this group`}
          variant="danger"
          size="sm"
          onClick={() => onRequestRemove(user)}
        >
          <Icon type="trash" size="sm" />
        </IconButton>
      )}
    </div>
  </ListRow>
);

const GroupMembersSection: React.FC<GroupMembersSectionProps> = ({
  groupType,
  memberCount,
  members,
  status,
  error,
  onAnalyze,
  canAnalyze = true,
  removeTarget,
  onRequestRemove,
  onCancelRemove,
  onConfirmRemove,
  removeStatus,
  removeError,
}) => {
  const hasMembers = memberCount > 0;
  const readOnlyReason = READ_ONLY_REASON[groupType];
  const readOnly = readOnlyReason !== undefined;
  const visibleMembers = members ? members.slice(0, DISPLAY_CAP) : [];
  const truncated = (members?.length ?? 0) > DISPLAY_CAP;

  return (
    <DetailSection
      title="Members"
      description="The group's roster, read from the same analysis above."
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
          {memberCount === 1 ? '' : 's'} once — the same read the analysis above uses, so loading
          here costs nothing extra once that analysis has already run.
        </p>
      ) : status === 'loading' ? (
        <Skeleton variant="row" size="md" count={4} label="Loading members…" />
      ) : status === 'error' ? (
        <AlertMessage
          message={{ text: error || 'Failed to load members.', type: 'danger' }}
          action={{ label: 'Retry', onClick: onAnalyze }}
        />
      ) : (
        <div className="space-y-3">
          {visibleMembers.length === 0 ? (
            <EmptyState
              icon="users"
              title="No members"
              description="This group's roster is empty."
            />
          ) : (
            <>
              <ul className="space-y-1.5">
                {visibleMembers.map((user) => (
                  <MemberListRow
                    key={user.id}
                    user={user}
                    readOnly={readOnly}
                    onRequestRemove={onRequestRemove}
                  />
                ))}
              </ul>
              {truncated && (
                <p className="text-xs text-neutral-500">
                  Showing the first {DISPLAY_CAP} of {members?.length.toLocaleString()} members. Use
                  Export members above for the full list.
                </p>
              )}
            </>
          )}
        </div>
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
