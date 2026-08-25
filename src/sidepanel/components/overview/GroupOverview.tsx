import React, { useState, useCallback, useMemo } from 'react';
import { useOktaApi } from '../../hooks/useOktaApi';
import type { OperationResult } from '../../hooks/useOktaApi/types';
import { useEntityQuery } from '../../cache/useEntityQuery';
import { invalidate } from '../../cache/entityCache';
import { cacheKeys } from '../../cache/keys';
import { useProgress } from '../../contexts/ProgressContext';
import { useMemberMfaScan } from '../../hooks/useMemberMfaScan';
import AlertMessage, { type AlertMessageData } from '../shared/AlertMessage';
import { Button, Modal, Skeleton } from '../shared';
import StatCard from './shared/StatCard';
import MemberExplorer from '../members/MemberExplorer';
import type { OktaUser } from '../../../shared/types';
import { createLogger } from '../../../shared/utils/logger';

const log = createLogger('GroupOverview');

const STAT_SKELETON_LABELS = [
  'Loading total members',
  'Loading active members',
  'Loading inactive members',
  'Loading deprovisioned members',
];

const GroupOverviewSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3">
      {STAT_SKELETON_LABELS.map((label) => (
        <Skeleton key={label} variant="card" size="lg" label={label} />
      ))}
    </div>
    <Skeleton variant="row" size="md" count={6} label="Loading group members" />
  </div>
);

interface GroupOverviewProps {
  groupId: string;
  groupName: string;
  targetTabId: number;
  onViewRules: () => void;
  onExportMembers: (groupId: string, groupName: string) => void;
  oktaOrigin?: string | null;
}

const GroupOverview: React.FC<GroupOverviewProps> = ({
  groupId,
  groupName,
  targetTabId,
  onViewRules,
  onExportMembers,
  oktaOrigin,
}) => {
  const { updateProgress } = useProgress();
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const [operationResult, setOperationResult] = useState<AlertMessageData | null>(null);
  const handleResult = useCallback(({ message, type }: OperationResult) => {
    log.debug(`${type}:`, message);
    if (type === 'error' || type === 'warning') {
      setOperationResult({ text: message, type: type === 'error' ? 'danger' : 'warning' });
    }
  }, []);

  const handleProgress = useCallback(
    (current: number, total: number, message: string, apiCalls?: number) => {
      updateProgress(current, total, message, apiCalls);
    },
    [updateProgress],
  );

  const {
    getAllGroupMembers,
    removeDeprovisioned,
    isLoading: isApiLoading,
  } = useOktaApi({
    targetTabId,
    onResult: handleResult,
    onProgress: handleProgress,
  });

  const {
    data: membersData,
    isLoading,
    error,
    refetch: refetchMembers,
  } = useEntityQuery<OktaUser[]>(
    cacheKeys.groupMembers(groupId),
    async () => (await getAllGroupMembers(groupId)) ?? [],
    { enabled: Boolean(targetTabId && groupId) },
  );
  const members = useMemo(() => membersData ?? [], [membersData]);

  const {
    mfaResults,
    scanStatus,
    runScan: runMfaScan,
    requestConfirm: requestMfaConfirm,
    cancelConfirm: cancelMfaConfirm,
  } = useMemberMfaScan({ groupId, members, targetTabId });

  const statusCounts = useMemo(
    () =>
      members.reduce<Record<string, number>>((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
      }, {}),
    [members],
  );

  const deprovisionedCount = statusCounts['DEPROVISIONED'] || 0;
  const suspendedCount = statusCounts['SUSPENDED'] || 0;
  const lockedOutCount = statusCounts['LOCKED_OUT'] || 0;
  const inactiveCount = deprovisionedCount + suspendedCount + lockedOutCount;

  const handleRemoveDeprovisioned = async () => {
    setConfirmRemoveOpen(false);
    await removeDeprovisioned(groupId);
    invalidate(cacheKeys.mfaScan(groupId));
    await refetchMembers();
  };

  if (isLoading && members.length === 0) {
    return <GroupOverviewSkeleton />;
  }

  if (error) {
    return (
      <AlertMessage
        message={{ text: error, type: 'danger' }}
        action={{ label: 'Retry', onClick: refetchMembers }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {operationResult && (
        <AlertMessage message={operationResult} onDismiss={() => setOperationResult(null)} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Total Members"
          value={members.length}
          color="primary"
          icon="users"
          countUp
        />
        <StatCard
          title="Active"
          value={statusCounts['ACTIVE'] || 0}
          color="success"
          icon="check"
          countUp
        />
        <StatCard
          title="Inactive"
          value={inactiveCount}
          color={inactiveCount > 0 ? 'warning' : 'success'}
          icon="alert"
          countUp
        />
        <StatCard
          title="Deprovisioned"
          value={deprovisionedCount}
          color={deprovisionedCount > 0 ? 'danger' : 'success'}
          icon="trash"
          countUp
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            icon="trash"
            onClick={() => setConfirmRemoveOpen(true)}
            disabled={deprovisionedCount === 0 || isApiLoading}
            title="Remove only deprovisioned users from this group"
          >
            Remove Deprovisioned
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon="download"
            onClick={() => onExportMembers(groupId, groupName)}
            disabled={isApiLoading}
            title="Export this group's members (opens the Export tab with column picker + presets)"
          >
            Export Members
          </Button>
        </div>

        <MemberExplorer
          members={members}
          isReloading={isLoading}
          mfaResults={mfaResults}
          scanStatus={scanStatus}
          onRunScan={runMfaScan}
          onRequestConfirm={requestMfaConfirm}
          onCancelConfirm={cancelMfaConfirm}
          oktaOrigin={oktaOrigin}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon="list"
          onClick={onViewRules}
          title="View group rules affecting this group"
        >
          View Rules
        </Button>
      </div>

      <Modal
        isOpen={confirmRemoveOpen}
        onClose={() => setConfirmRemoveOpen(false)}
        title="Remove Deprovisioned Members"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmRemoveOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRemoveDeprovisioned}>
              Remove {deprovisionedCount}
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          This will remove <strong>{deprovisionedCount}</strong> deprovisioned{' '}
          {deprovisionedCount === 1 ? 'member' : 'members'} from <strong>{groupName}</strong>. This
          action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default GroupOverview;
