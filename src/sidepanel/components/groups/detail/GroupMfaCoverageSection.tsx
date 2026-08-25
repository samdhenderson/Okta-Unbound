import React, { useMemo } from 'react';
import { AlertMessage, Button, Modal } from '../../shared';
import MfaScanButton from '../../members/MfaScanButton';
import { computeMfaBreakdown } from '../../members/memberAnalytics';
import { mfaScanNeedsConfirm } from '../../../hooks/useMemberMfaScan';
import type { OktaUser, MemberMfaResult, MfaScanStatus } from '../../../../shared/types';

export interface GroupMfaCoverageSectionProps {
  members: OktaUser[];
  mfaResults: Map<string, MemberMfaResult> | null;
  scanStatus: MfaScanStatus;
  onRunScan: () => void;
  onRequestConfirm: () => void;
  onCancelConfirm: () => void;
}

const GroupMfaCoverageSection: React.FC<GroupMfaCoverageSectionProps> = ({
  members,
  mfaResults,
  scanStatus,
  onRunScan,
  onRequestConfirm,
  onCancelConfirm,
}) => {
  const handleScanClick = (): void => {
    if (mfaScanNeedsConfirm(members.length)) onRequestConfirm();
    else onRunScan();
  };

  const noFactorsRow = useMemo(() => {
    if (!mfaResults) return undefined;
    return computeMfaBreakdown(members, mfaResults).find((row) => row.value === 'none');
  }, [members, mfaResults]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">
          {mfaResults && scanStatus === 'complete' && noFactorsRow
            ? `${noFactorsRow.count.toLocaleString()} of ${members.length.toLocaleString()} members (${Math.round(
                noFactorsRow.pct,
              )}%) have no MFA factor enrolled.`
            : 'Scan each member for enrolled MFA factors — one API call per member.'}
        </p>
        <MfaScanButton
          mfaResults={mfaResults}
          scanStatus={scanStatus}
          memberCount={members.length}
          onScanClick={handleScanClick}
        />
      </div>

      {scanStatus === 'error' && (
        <AlertMessage
          message={{ text: 'The MFA scan failed. Please try again.', type: 'danger' }}
        />
      )}

      <Modal
        isOpen={scanStatus === 'confirming'}
        onClose={onCancelConfirm}
        title="Run MFA scan?"
        footer={
          <>
            <Button variant="secondary" onClick={onCancelConfirm}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onRunScan}>
              Scan anyway
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          This group has <strong>{members.length.toLocaleString()}</strong> members. Scanning makes
          roughly <strong>{members.length.toLocaleString()}</strong> API calls (one per member) and
          may take a while on large groups. Results are cached until you reload the panel.
        </p>
      </Modal>
    </div>
  );
};

export default GroupMfaCoverageSection;
