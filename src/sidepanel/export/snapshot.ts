import type { FigureSource } from '../components/home/orgFigures';

export interface SnapshotCollection {
  rows: readonly unknown[];
  records: readonly { id: string }[];
  isReading: boolean;
  complete: boolean;
  lastFullWalkAt: number | null;
  error?: string | null;
  status?: number | null;
}

export interface OrgSnapshotView {
  groups: SnapshotCollection;
  rules: SnapshotCollection;
  apps: SnapshotCollection;
  appGroups: SnapshotCollection;
}

export function collectionSource(collection: SnapshotCollection): FigureSource {
  return {
    isReading: collection.isReading,
    complete: collection.complete,
    lastFullWalkAt: collection.lastFullWalkAt,
    count: collection.rows.length,
    error: collection.error ?? null,
    status: collection.status ?? null,
  };
}
