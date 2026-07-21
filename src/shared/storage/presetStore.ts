import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { createLogger } from '../utils/logger';

const log = createLogger('PresetStore');

export interface ExportPreset {
  id: string;
  entityId: string;
  name: string;
  enabledColumnIds: string[];
  filterText?: string;
  createdAt: Date;
  version: 1;
}

export interface LastUsed {
  entityId: string;
  enabledColumnIds: string[];
  updatedAt: Date;
}

interface ExportDB extends DBSchema {
  presets: {
    key: string;
    value: ExportPreset;
    indexes: { entityId: string };
  };
  lastUsed: {
    key: string;
    value: LastUsed;
  };
}

const DB_NAME = 'okta-unbound-export';
const DB_VERSION = 1;
const PRESETS_STORE = 'presets';
const LAST_USED_STORE = 'lastUsed';

class PresetStore {
  private dbPromise: Promise<IDBPDatabase<ExportDB>> | null = null;

  private async getDB(): Promise<IDBPDatabase<ExportDB>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<ExportDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(PRESETS_STORE)) {
            const presets = db.createObjectStore(PRESETS_STORE, { keyPath: 'id' });
            presets.createIndex('entityId', 'entityId');
          }
          if (!db.objectStoreNames.contains(LAST_USED_STORE)) {
            db.createObjectStore(LAST_USED_STORE, { keyPath: 'entityId' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async listPresets(entityId: string): Promise<ExportPreset[]> {
    try {
      const db = await this.getDB();
      const presets = await db.getAllFromIndex(PRESETS_STORE, 'entityId', entityId);
      return presets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      log.error('Failed to list presets:', error);
      return [];
    }
  }

  async savePreset(
    input: Pick<ExportPreset, 'entityId' | 'name' | 'enabledColumnIds' | 'filterText'>,
  ): Promise<ExportPreset | null> {
    try {
      const db = await this.getDB();
      const preset: ExportPreset = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        version: 1,
      };
      await db.put(PRESETS_STORE, preset);
      return preset;
    } catch (error) {
      log.error('Failed to save preset:', error);
      return null;
    }
  }

  async deletePreset(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await db.delete(PRESETS_STORE, id);
    } catch (error) {
      log.error('Failed to delete preset:', error);
    }
  }

  async getLastUsed(entityId: string): Promise<LastUsed | null> {
    try {
      const db = await this.getDB();
      return (await db.get(LAST_USED_STORE, entityId)) ?? null;
    } catch (error) {
      log.error('Failed to read last-used selection:', error);
      return null;
    }
  }

  async setLastUsed(entityId: string, enabledColumnIds: string[]): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put(LAST_USED_STORE, {
        entityId,
        enabledColumnIds,
        updatedAt: new Date(),
      });
    } catch (error) {
      log.error('Failed to save last-used selection:', error);
    }
  }
}

export const presetStore = new PresetStore();
export default presetStore;
