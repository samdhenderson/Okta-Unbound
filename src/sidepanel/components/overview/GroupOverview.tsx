import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOktaApi } from '../../hooks/useOktaApi';
import { useEntityQuery } from '../../cache/useEntityQuery';
import { peek, setEntry, invalidate } from '../../cache/entityCache';
import { cacheKeys } from '../../cache/keys';
import { useProgress } from '../../contexts/ProgressContext';
import AlertMessage, { type AlertMessageData } from '../shared/AlertMessage';
import { Button, Modal } from '../shared';
import LoadingSpinner from '../shared/LoadingSpinner';
import StatCard from './shared/StatCard';
import MemberExplorer from './members/MemberExplorer';
import type { OktaUser, MemberMfaResult, MfaScanStatus } from '../../../shared/types';
import { createLogger } from '../../../shared/utils/logger';

const log = createLogger('GroupOverview');

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
  const [mfaResults, setMfaResults] = useState<Map<string, MemberMfaResult> | null>(null);
  const [scanStatus, setScanStatus] = useState<MfaScanStatus>('idle');

  const [operationResult, setOperationResult] = useState<AlertMessageData | null>(null);
  const handleResult = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
      log.debug(`${type}:`, message);
      if (type === 'error' || type === 'warning') {
        setOperationResult({ text: message, type: type === 'error' ? 'danger' : 'warning' });
      }
    },
    [],
  );

  const handleProgress = useCallback(
    (current: number, total: number, message: string, apiCalls?: number) => {
      updateProgress(current, total, message, apiCalls);
    },
    [updateProgress],
  );

  const {
    getAllGroupMembers,
    removeDeprovisioned,
    scanGroupMfa,
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

  useEffect(() => {
    const cached = peek<Map<string, MemberMfaResult>>(['mfaScan', groupId]);
    if (cached) {
      setMfaResults(cached);
      setScanStatus('complete');
    } else {
      setMfaResults(null);
      setScanStatus('idle');
    }
  }, [groupId]);

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
    invalidate(['mfaScan', groupId]);
    await refetchMembers();
  };

  const runMfaScan = useCallback(async () => {
    setScanStatus('scanning');
    try {
      const result = await scanGroupMfa(members.map((m) => m.id));
      setMfaResults(result);
      setScanStatus('complete');
      setEntry(['mfaScan', groupId], result);
    } catch (err) {
      log.error('MFA scan failed:', err);
      setScanStatus('error');
    }
  }, [groupId, members, scanGroupMfa]);

  const requestMfaConfirm = useCallback(() => setScanStatus('confirming'), []);
  const cancelMfaConfirm = useCallback(() => setScanStatus('idle'), []);

  if (isLoading && members.length === 0) {
    return <LoadingSpinner size="2xl" message="Loading group members..." centered />;
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
        <StatCard title="Total Members" value={members.length} color="primary" icon="users" />
        <StatCard title="Active" value={statusCounts['ACTIVE'] || 0} color="success" icon="check" />
        <StatCard
          title="Inactive"
          value={inactiveCount}
          color={inactiveCount > 0 ? 'warning' : 'success'}
          icon="alert"
        />
        <StatCard
          title="Deprovisioned"
          value={deprovisionedCount}
          color={deprovisionedCount > 0 ? 'danger' : 'success'}
          icon="trash"
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
