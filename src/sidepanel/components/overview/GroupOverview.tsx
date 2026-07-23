import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOktaApi } from '../../hooks/useOktaApi';
import { useEntityQuery } from '../../cache/useEntityQuery';
import { peek, setEntry, invalidate } from '../../cache/entityCache';
import { useProgress } from '../../contexts/ProgressContext';
import AlertMessage from '../shared/AlertMessage';
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
  onTabChange: (tab: 'rules' | 'users' | 'groups', selectedRuleId?: string) => void;
  oktaOrigin?: string | null;
}

const GroupOverview: React.FC<GroupOverviewProps> = ({
  groupId,
  groupName,
  targetTabId,
  onTabChange,
  oktaOrigin,
}) => {
  const { startProgress, completeProgress, updateProgress } = useProgress();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [mfaResults, setMfaResults] = useState<Map<string, MemberMfaResult> | null>(null);
  const [scanStatus, setScanStatus] = useState<MfaScanStatus>('idle');

  const handleResult = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
      log.debug(`${type}:`, message);
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
    exportMembers,
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
    ['groupMembers', groupId],
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

  const statusCounts = members.reduce<Record<string, number>>((acc, user) => {
    acc[user.status] = (acc[user.status] || 0) + 1;
    return acc;
  }, {});

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

  const handleExportConfirm = async () => {
    setExportModalOpen(false);
    startProgress('Export', `Exporting members to ${exportFormat.toUpperCase()}...`);
    try {
      await exportMembers(groupId, groupName, exportFormat);
    } finally {
      completeProgress();
    }
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
    return <LoadingSpinner size="lg" message="Loading group members..." centered />;
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
            onClick={() => setExportModalOpen(true)}
            disabled={isApiLoading}
            title="Export member list to CSV or JSON"
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
          onClick={() => onTabChange('rules')}
          title="View group rules affecting this group"
        >
          View Rules
        </Button>
      </div>

      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Group Members"
        footer={
          <>
            <Button variant="secondary" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExportConfirm}>
              Export
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Format</label>
            <select
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-primary focus:border-primary"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <p className="text-sm text-neutral-600">
            This will export all members from <strong>{groupName}</strong> to a{' '}
            {exportFormat.toUpperCase()} file.
          </p>
        </div>
      </Modal>

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
