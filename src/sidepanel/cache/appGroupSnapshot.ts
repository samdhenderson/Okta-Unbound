import { orgSnapshotStore } from '../../shared/snapshot/orgSnapshotStore';
import { splitShardedId } from '../../shared/snapshot/types';

export async function readAppGroupsFromSnapshot(
  origin: string | null | undefined,
): Promise<Map<string, string[]>> {
  const byApp = new Map<string, string[]>();
  if (!origin) return byApp;

  const records = await orgSnapshotStore.getRecords('appGroups', origin);
  for (const record of records) {
    const split = splitShardedId(record.id);
    if (!split) continue;
    const existing = byApp.get(split.shardKey);
    if (existing) existing.push(split.entityId);
    else byApp.set(split.shardKey, [split.entityId]);
  }

  return byApp;
}
