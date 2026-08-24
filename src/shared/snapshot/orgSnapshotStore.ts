import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { createLogger } from '../utils/logger';
import { emptySyncMeta } from './syncMeta';
import {
  SNAPSHOT_COLLECTIONS,
  type SnapshotCollection,
  type SnapshotRecord,
  type SyncMeta,
} from './types';

const log = createLogger('OrgSnapshotStore');

const DB_NAME = 'okta-unbound-snapshot';
const DB_VERSION = 1;
const META_STORE = 'syncMeta';

type EntityKey = [string, string];
type MetaKey = [string, string];

interface EntityStore {
  key: EntityKey;
  value: SnapshotRecord;
  indexes: { origin: string };
}

interface SnapshotDB extends DBSchema {
  groups: EntityStore;
  apps: EntityStore;
  rules: EntityStore;
  appGroups: EntityStore;
  syncMeta: { key: MetaKey; value: SyncMeta };
}

function errorReason(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown';
}

class OrgSnapshotStore {
  private dbPromise: Promise<IDBPDatabase<SnapshotDB>> | null = null;

  private async getDB(): Promise<IDBPDatabase<SnapshotDB>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<SnapshotDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          for (const collection of SNAPSHOT_COLLECTIONS) {
            if (!db.objectStoreNames.contains(collection)) {
              const store = db.createObjectStore(collection, { keyPath: ['origin', 'id'] });
              store.createIndex('origin', 'origin');
            }
          }
          if (!db.objectStoreNames.contains(META_STORE)) {
            db.createObjectStore(META_STORE, { keyPath: ['origin', 'collection'] });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async getCollection<T>(collection: SnapshotCollection, origin: string): Promise<T[]> {
    try {
      const db = await this.getDB();
      const rows = await db.getAllFromIndex(collection, 'origin', origin);
      return rows.map((row) => row.entity as T);
    } catch (error) {
      log.error('Failed to read collection', { code: 'snapshot_read_failed', collection });
      log.debug('Snapshot read error detail', { reason: errorReason(error) });
      return [];
    }
  }

  async getRecords<T>(
    collection: SnapshotCollection,
    origin: string,
  ): Promise<SnapshotRecord<T>[]> {
    try {
      const db = await this.getDB();
      const rows = await db.getAllFromIndex(collection, 'origin', origin);
      return rows as SnapshotRecord<T>[];
    } catch (error) {
      log.error('Failed to read collection records', {
        code: 'snapshot_read_failed',
        collection,
      });
      log.debug('Snapshot read error detail', { reason: errorReason(error) });
      return [];
    }
  }

  async countCollection(collection: SnapshotCollection, origin: string): Promise<number> {
    try {
      const db = await this.getDB();
      return (await db.getAllKeysFromIndex(collection, 'origin', origin)).length;
    } catch (error) {
      log.error('Failed to count collection', { code: 'snapshot_count_failed', collection });
      log.debug('Snapshot count error detail', { reason: errorReason(error) });
      return 0;
    }
  }

  async upsertMany<T>(
    collection: SnapshotCollection,
    origin: string,
    entities: ReadonlyArray<{ id: string; entity: T }>,
    now: number,
  ): Promise<void> {
    if (entities.length === 0) return;
    try {
      const db = await this.getDB();
      const tx = db.transaction(collection, 'readwrite');
      await Promise.all(
        entities.map(({ id, entity }) =>
          tx.store.put({ origin, id, entity, syncedAt: now } as SnapshotRecord),
        ),
      );
      await tx.done;
    } catch (error) {
      log.error('Failed to upsert rows', {
        code: 'snapshot_upsert_failed',
        collection,
        count: entities.length,
      });
      log.debug('Snapshot upsert error detail', { reason: errorReason(error) });
    }
  }

  async deleteIds(
    collection: SnapshotCollection,
    origin: string,
    ids: ReadonlyArray<string>,
  ): Promise<void> {
    if (ids.length === 0) return;
    try {
      const db = await this.getDB();
      const tx = db.transaction(collection, 'readwrite');
      await Promise.all(ids.map((id) => tx.store.delete([origin, id] as EntityKey)));
      await tx.done;
    } catch (error) {
      log.error('Failed to delete rows', {
        code: 'snapshot_delete_failed',
        collection,
        count: ids.length,
      });
      log.debug('Snapshot delete error detail', { reason: errorReason(error) });
    }
  }

  async sweepStale(
    collection: SnapshotCollection,
    origin: string,
    walkStartedAt: number,
  ): Promise<number> {
    try {
      const db = await this.getDB();
      const rows = await db.getAllFromIndex(collection, 'origin', origin);
      const stale = rows.filter((row) => row.syncedAt < walkStartedAt).map((row) => row.id);
      await this.deleteIds(collection, origin, stale);
      return stale.length;
    } catch (error) {
      log.error('Failed to sweep stale rows', { code: 'snapshot_sweep_failed', collection });
      log.debug('Snapshot sweep error detail', { reason: errorReason(error) });
      return 0;
    }
  }

  async getIds(collection: SnapshotCollection, origin: string): Promise<Set<string>> {
    try {
      const db = await this.getDB();
      const keys = await db.getAllKeysFromIndex(collection, 'origin', origin);
      return new Set(keys.map((key) => (key as EntityKey)[1]));
    } catch (error) {
      log.error('Failed to read ids', { code: 'snapshot_ids_failed', collection });
      log.debug('Snapshot id read error detail', { reason: errorReason(error) });
      return new Set();
    }
  }

  async getMeta(collection: SnapshotCollection, origin: string): Promise<SyncMeta> {
    try {
      const db = await this.getDB();
      const stored = await db.get(META_STORE, [origin, collection] as MetaKey);
      return stored ?? emptySyncMeta(origin, collection);
    } catch (error) {
      log.error('Failed to read sync meta', { code: 'snapshot_meta_read_failed', collection });
      log.debug('Snapshot meta read error detail', { reason: errorReason(error) });
      return emptySyncMeta(origin, collection);
    }
  }

  async patchMeta(
    collection: SnapshotCollection,
    origin: string,
    patch: Partial<Omit<SyncMeta, 'origin' | 'collection'>>,
  ): Promise<SyncMeta> {
    const current = await this.getMeta(collection, origin);
    const merged: SyncMeta = { ...current, ...patch, origin, collection };
    try {
      const db = await this.getDB();
      await db.put(META_STORE, merged);
    } catch (error) {
      log.error('Failed to write sync meta', { code: 'snapshot_meta_write_failed', collection });
      log.debug('Snapshot meta write error detail', { reason: errorReason(error) });
    }
    return merged;
  }

  async clearOrigin(origin: string): Promise<void> {
    for (const collection of SNAPSHOT_COLLECTIONS) {
      const ids = await this.getIds(collection, origin);
      await this.deleteIds(collection, origin, [...ids]);
      try {
        const db = await this.getDB();
        await db.delete(META_STORE, [origin, collection] as MetaKey);
      } catch (error) {
        log.error('Failed to clear sync meta', { code: 'snapshot_meta_clear_failed', collection });
        log.debug('Snapshot meta clear error detail', { reason: errorReason(error) });
      }
    }
    log.debug('Cleared snapshot for one origin');
  }
}

export const orgSnapshotStore = new OrgSnapshotStore();
