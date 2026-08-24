import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { orgSnapshotStore } from '../../shared/snapshot/orgSnapshotStore';
import type { SnapshotCollection, SnapshotRecord } from '../../shared/snapshot/types';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useOrgSnapshot');

export interface UseOrgSnapshotResult<T> {
  rows: T[];
  records: SnapshotRecord<T>[];
  isReading: boolean;
  complete: boolean;
  lastFullWalkAt: number | null;
  isSyncing: boolean;
  error: string | null;
  sync: (force?: boolean) => Promise<string | null>;
}

export interface UseOrgSnapshotOptions {
  enabled?: boolean;
}

interface SnapshotUpdatedBroadcast {
  action?: unknown;
  origin?: unknown;
  collection?: unknown;
}

export function useOrgSnapshot<T>(
  collection: SnapshotCollection,
  origin: string | null | undefined,
  tabId: number | null,
  options: UseOrgSnapshotOptions = {},
): UseOrgSnapshotResult<T> {
  const { enabled = true } = options;

  const [records, setRecords] = useState<SnapshotRecord<T>[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [lastFullWalkAt, setLastFullWalkAt] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originRef = useRef(origin);
  originRef.current = origin;

  const readSnapshot = useCallback(async () => {
    if (!origin) {
      setRecords([]);
      setComplete(false);
      setLastFullWalkAt(null);
      return;
    }
    const [stored, meta] = await Promise.all([
      orgSnapshotStore.getRecords<T>(collection, origin),
      orgSnapshotStore.getMeta(collection, origin),
    ]);
    if (originRef.current !== origin) return;
    setRecords(stored);
    setComplete(meta.complete);
    setLastFullWalkAt(meta.lastFullWalkAt);
  }, [collection, origin]);

  useEffect(() => {
    let cancelled = false;
    setIsReading(true);
    setRecords([]);
    void readSnapshot().finally(() => {
      if (!cancelled) setIsReading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [readSnapshot]);

  useEffect(() => {
    if (!origin) return;
    const listener = (message: SnapshotUpdatedBroadcast): void => {
      if (message?.action !== 'snapshotUpdated') return;
      if (message.origin !== origin || message.collection !== collection) return;
      void readSnapshot();
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [collection, origin, readSnapshot]);

  const sync = useCallback(
    async (force = false): Promise<string | null> => {
      if (!origin || tabId === null) return 'No Okta tab connected';
      if (!enabled) return null;
      setIsSyncing(true);
      setError(null);
      let failure: string | null = null;
      try {
        const response = (await chrome.runtime.sendMessage({
          action: 'syncSnapshot',
          origin,
          tabId,
          force,
        })) as { success?: boolean; error?: string } | undefined;
        if (!response?.success) {
          failure = response?.error || 'Failed to load from Okta';
        }
        await readSnapshot();
      } catch (err) {
        failure = err instanceof Error ? err.message : 'Failed to load from Okta';
        log.error('Snapshot sync request failed', { code: 'snapshot_sync_failed', collection });
      } finally {
        setError(failure);
        setIsSyncing(false);
      }
      return failure;
    },
    [collection, enabled, origin, readSnapshot, tabId],
  );

  const rows = useMemo(() => records.map((record) => record.entity), [records]);

  return { rows, records, isReading, complete, lastFullWalkAt, isSyncing, error, sync };
}
