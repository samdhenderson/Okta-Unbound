import React from 'react';
import type { MemberMfaResult, MfaScanStatus } from '../../../shared/types';
import Button from '../shared/Button';
import StableWidth from '../shared/StableWidth';

interface MfaScanButtonProps {
  mfaResults: Map<string, MemberMfaResult> | null;
  scanStatus: MfaScanStatus;
  memberCount: number;
  onScanClick: () => void;
  size?: 'sm' | 'md';
}

const MfaScanButton: React.FC<MfaScanButtonProps> = ({
  mfaResults,
  scanStatus,
  memberCount,
  onScanClick,
  size = 'sm',
}) => {
  const scanning = scanStatus === 'scanning';
  return (
    <Button
      variant={mfaResults ? 'secondary' : 'primary'}
      size={size}
      icon="shield"
      loading={scanning}
      disabled={scanning || memberCount === 0}
      onClick={onScanClick}
    >
      <StableWidth reserve="Run MFA scan" align="center">
        {scanning ? 'Scanning…' : mfaResults ? 'Rescan' : 'Run MFA scan'}
      </StableWidth>
    </Button>
  );
};

export default MfaScanButton;
