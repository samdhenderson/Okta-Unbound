import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { createLogger } from '../utils/logger';

const log = createLogger('ProfileDisplayStore');

export interface ProfileDisplayCategory {
  key: string;
  name: string;
}

export interface ProfileDisplayConfig {
  layout: 'rows' | 'compact' | 'grid';
  showApiNames: boolean;
  showRuleChips: boolean;
  showEmpty: boolean;
  categories: ProfileDisplayCategory[];
  assign: Record<string, string>;
  attrOrder: string[];
  hidden: Record<string, boolean>;
}

export interface StoredProfileDisplay {
  oktaOrigin: string;
  config: ProfileDisplayConfig;
  updatedAt: Date;
  version: 1;
}

export const DEFAULT_PROFILE_DISPLAY_CONFIG: ProfileDisplayConfig = {
  layout: 'rows',
  showApiNames: false,
  showRuleChips: true,
  showEmpty: false,
  categories: [
    { key: 'identity', name: 'Identity' },
    { key: 'organization', name: 'Organization' },
    { key: 'account-state', name: 'Account state' },
    { key: 'contact-locale', name: 'Contact & locale' },
    { key: 'custom', name: 'Custom attributes' },
  ],
  assign: {},
  attrOrder: [],
  hidden: {},
};

interface ProfileDisplayDB extends DBSchema {
  configs: {
    key: string;
    value: StoredProfileDisplay;
  };
}

const DB_NAME = 'okta-unbound-profile-display';
const DB_VERSION = 1;
const CONFIGS_STORE = 'configs';

class ProfileDisplayStore {
  private dbPromise: Promise<IDBPDatabase<ProfileDisplayDB>> | null = null;

  private async getDB(): Promise<IDBPDatabase<ProfileDisplayDB>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<ProfileDisplayDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(CONFIGS_STORE)) {
            db.createObjectStore(CONFIGS_STORE, { keyPath: 'oktaOrigin' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async getConfig(oktaOrigin: string): Promise<ProfileDisplayConfig | null> {
    try {
      const db = await this.getDB();
      const record = await db.get(CONFIGS_STORE, oktaOrigin);
      return record?.config ?? null;
    } catch (error) {
      log.error('Failed to read profile display config:', error);
      return null;
    }
  }

  async saveConfig(oktaOrigin: string, config: ProfileDisplayConfig): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put(CONFIGS_STORE, {
        oktaOrigin,
        config,
        updatedAt: new Date(),
        version: 1,
      });
    } catch (error) {
      log.error('Failed to save profile display config:', error);
    }
  }

  async clearConfig(oktaOrigin: string): Promise<void> {
    try {
      const db = await this.getDB();
      await db.delete(CONFIGS_STORE, oktaOrigin);
    } catch (error) {
      log.error('Failed to clear profile display config:', error);
    }
  }
}

export const profileDisplayStore = new ProfileDisplayStore();
export default profileDisplayStore;
