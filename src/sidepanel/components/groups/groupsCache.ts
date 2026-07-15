import type { GroupSummary } from '../../../shared/types';

export const GROUPS_CACHE_KEY = 'okta_unbound_groups_cache';
export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day

interface SerializedGroupsCache {
  groups: SerializedGroup[];
  timestamp: number;
}

type SerializedGroup = { lastUpdated?: string; created?: string; [key: string]: unknown };

export function reviveGroupDates(g: SerializedGroup): GroupSummary {
  return {
    ...g,
    lastUpdated: g.lastUpdated ? new Date(g.lastUpdated) : undefined,
    created: g.created ? new Date(g.created) : undefined,
  } as GroupSummary;
}

export function parseGroupsCache(raw: string, now: number): GroupSummary[] | null {
  const cached = JSON.parse(raw) as SerializedGroupsCache;
  const age = now - cached.timestamp;
  if (age >= CACHE_DURATION) return null;
  return cached.groups.map(reviveGroupDates);
}

export function serializeGroupsCache(groups: GroupSummary[], now: number): string {
  return JSON.stringify({ groups, timestamp: now });
}
