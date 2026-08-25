import { useState, useEffect, useCallback } from 'react';
import { useOktaApi } from './useOktaApi';
import { peek, setEntry } from '../cache/entityCache';
import { cacheKeys } from '../cache/keys';
import type { OktaUser, MemberMfaResult, MfaScanStatus } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useMemberMfaScan');

export const MFA_AUTO_THRESHOLD = 500;

export function mfaScanNeedsConfirm(memberCount: number): boolean {
  return memberCount > MFA_AUTO_THRESHOLD;
}

export interface UseMemberMfaScanOptions {
  groupId: string;
  members: OktaUser[];
  targetTabId: number | undefined;
}

export interface UseMemberMfaScanResult {
  mfaResults: Map<string, MemberMfaResult> | null;
  scanStatus: MfaScanStatus;
  runScan: () => Promise<void>;
  requestConfirm: () => void;
  cancelConfirm: () => void;
}

export function useMemberMfaScan({
  groupId,
  members,
  targetTabId,
}: UseMemberMfaScanOptions): UseMemberMfaScanResult {
  const [mfaResults, setMfaResults] = useState<Map<string, MemberMfaResult> | null>(null);
  const [scanStatus, setScanStatus] = useState<MfaScanStatus>('idle');

  const { scanGroupMfa } = useOktaApi({ targetTabId: targetTabId ?? null });

  useEffect(() => {
    const cached = peek<Map<string, MemberMfaResult>>(cacheKeys.mfaScan(groupId));
    if (cached) {
      setMfaResults(cached);
      setScanStatus('complete');
    } else {
      setMfaResults(null);
      setScanStatus('idle');
    }
  }, [groupId]);

  const runScan = useCallback(async () => {
    setScanStatus('scanning');
    try {
      const result = await scanGroupMfa(members.map((m) => m.id));
      setMfaResults(result);
      setScanStatus('complete');
      setEntry(cacheKeys.mfaScan(groupId), result);
    } catch (err) {
      log.error('MFA scan failed:', err);
      setScanStatus('error');
    }
  }, [groupId, members, scanGroupMfa]);

  const requestConfirm = useCallback(() => setScanStatus('confirming'), []);
  const cancelConfirm = useCallback(() => setScanStatus('idle'), []);

  return { mfaResults, scanStatus, runScan, requestConfirm, cancelConfirm };
}
