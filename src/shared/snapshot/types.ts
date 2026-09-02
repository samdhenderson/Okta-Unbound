export type SnapshotCollection = 'groups' | 'apps' | 'rules' | 'appGroups';

export const SNAPSHOT_COLLECTIONS: readonly SnapshotCollection[] = [
  'groups',
  'apps',
  'rules',
  'appGroups',
] as const;

export interface SnapshotRecord<T = unknown> {
  origin: string;
  id: string;
  entity: T;
  syncedAt: number;
}

export interface SyncMeta {
  origin: string;
  collection: SnapshotCollection;
  lastFullWalkAt: number | null;
  lastDeltaAt: number | null;
  watermark: string | null;
  itemCount: number | null;
  cursor: string | null;
  walkStartedAt: number | null;
  deltaSupported: boolean | null;
  complete: boolean;
  status: number | null;
  completedShards: string[];
}

export type DriftVerdict = 'in-sync' | 'drifted' | 'unknown';

export const SHARD_KEY_SEPARATOR = '::';

export function splitShardedId(id: string): { shardKey: string; entityId: string } | null {
  const at = id.indexOf(SHARD_KEY_SEPARATOR);
  if (at <= 0) return null;
  const entityId = id.slice(at + SHARD_KEY_SEPARATOR.length);
  if (entityId === '') return null;
  return { shardKey: id.slice(0, at), entityId };
}
