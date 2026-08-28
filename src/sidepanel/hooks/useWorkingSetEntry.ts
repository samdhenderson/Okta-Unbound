import { useEffect } from 'react';
import { workingSetStore, type WorkingSetKind } from '../../shared/storage/workingSetStore';

export interface UseWorkingSetEntryOptions {
  origin: string | null | undefined;
  kind: WorkingSetKind;
  id: string | null | undefined;
  name: string | null | undefined;
  pane?: string;
  enabled?: boolean;
}

export function useWorkingSetEntry({
  origin,
  kind,
  id,
  name,
  pane,
  enabled = true,
}: UseWorkingSetEntryOptions): void {
  useEffect(() => {
    if (!enabled || !origin || !id) return;
    if (!name) return;
    void workingSetStore.touch(origin, { kind, id, name, lastPane: pane });
  }, [origin, kind, id, name, pane, enabled]);
}
