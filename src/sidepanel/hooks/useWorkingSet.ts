import { useCallback, useEffect, useState } from 'react';
import {
  workingSetStore,
  EMPTY_WORKING_SET,
  type WorkingSet,
  type WorkingSetKind,
  type WorkingSetRef,
} from '../../shared/storage/workingSetStore';

export interface UseWorkingSetResult {
  pinned: WorkingSetRef[];
  recent: WorkingSetRef[];
  isReading: boolean;
  isPinned: (kind: WorkingSetKind, id: string) => boolean;
  togglePin: (ref: Omit<WorkingSetRef, 'lastSeenAt'>) => void;
  forget: (kind: WorkingSetKind, id: string) => void;
}

export function useWorkingSet(origin: string | null | undefined): UseWorkingSetResult {
  const [set, setSet] = useState<WorkingSet>(EMPTY_WORKING_SET);
  const [isReading, setIsReading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsReading(true);
    setSet(EMPTY_WORKING_SET);
    void workingSetStore
      .read(origin)
      .then((stored) => {
        if (!cancelled) setSet(stored);
      })
      .finally(() => {
        if (!cancelled) setIsReading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin]);

  useEffect(() => {
    if (!origin) return;
    return workingSetStore.subscribe((file) => setSet(workingSetStore.select(file, origin)));
  }, [origin]);

  const isPinned = useCallback(
    (kind: WorkingSetKind, id: string) =>
      set.pinned.some((entry) => entry.kind === kind && entry.id === id),
    [set.pinned],
  );

  const togglePin = useCallback(
    (ref: Omit<WorkingSetRef, 'lastSeenAt'>) => {
      void workingSetStore.togglePin(origin, ref).then(setSet);
    },
    [origin],
  );

  const forget = useCallback(
    (kind: WorkingSetKind, id: string) => {
      void workingSetStore.forget(origin, { kind, id }).then(setSet);
    },
    [origin],
  );

  return { pinned: set.pinned, recent: set.recent, isReading, isPinned, togglePin, forget };
}
