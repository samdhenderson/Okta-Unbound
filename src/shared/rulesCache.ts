import type { FormattedRule, OktaGroupRule } from './types';

interface RulesCacheEntry {
  rules: FormattedRule[];
  rawRules: OktaGroupRule[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    conflicts: number;
  };
  conflicts: any[];
  timestamp: number;
  ttl: number;
}

class RulesCache {
  private static readonly CACHE_KEY = 'global_rules_cache';
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static async get(): Promise<RulesCacheEntry | null> {
    try {
      const result = await chrome.storage.local.get(this.CACHE_KEY);
      const cached = result[this.CACHE_KEY] as RulesCacheEntry | undefined;

      if (!cached) {
        return null;
      }

      const now = Date.now();
      if (now > cached.timestamp + cached.ttl) {
        console.log('[RulesCache] Cache expired');
        await this.clear();
        return null;
      }

      console.log('[RulesCache] Using cached rules:', {
        count: cached.rules.length,
        age: Math.round((now - cached.timestamp) / 1000) + 's',
        expiresIn: Math.round((cached.timestamp + cached.ttl - now) / 1000) + 's',
      });

      return cached;
    } catch (error) {
      console.error('[RulesCache] Failed to get cache:', error);
      return null;
    }
  }

  static async set(
    rules: FormattedRule[],
    rawRules: OktaGroupRule[],
    stats: RulesCacheEntry['stats'],
    conflicts: any[],
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    try {
      const entry: RulesCacheEntry = {
        rules,
        rawRules,
        stats,
        conflicts,
        timestamp: Date.now(),
        ttl,
      };

      await chrome.storage.local.set({ [this.CACHE_KEY]: entry });
      console.log('[RulesCache] Cached', rules.length, 'rules for', ttl / 1000, 'seconds');
    } catch (error) {
      console.error('[RulesCache] Failed to set cache:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.CACHE_KEY);
      console.log('[RulesCache] Cache cleared');
    } catch (error) {
      console.error('[RulesCache] Failed to clear cache:', error);
    }
  }

  static async getRulesForGroup(groupId: string): Promise<FormattedRule[]> {
    const cached = await this.get();
    if (!cached) {
      return [];
    }

    return cached.rules.filter((rule) => rule.groupIds.includes(groupId));
  }

  static async getActiveRulesForGroup(groupId: string): Promise<FormattedRule[]> {
    const cached = await this.get();
    if (!cached) {
      return [];
    }

    return cached.rules.filter(
      (rule) => rule.status === 'ACTIVE' && rule.groupIds.includes(groupId),
    );
  }

  static async isFresh(): Promise<boolean> {
    const cached = await this.get();
    return cached !== null;
  }

  static async getAge(): Promise<number | null> {
    try {
      const result = await chrome.storage.local.get(this.CACHE_KEY);
      const cached = result[this.CACHE_KEY] as RulesCacheEntry | undefined;

      if (!cached) {
        return null;
      }

      return Date.now() - cached.timestamp;
    } catch (error) {
      console.error('[RulesCache] Failed to get cache age:', error);
      return null;
    }
  }
}

export { RulesCache };
export type { RulesCacheEntry };
