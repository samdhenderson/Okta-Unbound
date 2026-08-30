import type { GroupSummary } from '../../../shared/types';

export const STALE_AGE_DAYS = 365;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isStaleByAge(group: GroupSummary, now: number = Date.now()): boolean {
  const clock = group.lastMembershipUpdated ?? group.lastUpdated;
  if (!clock) return false;
  const time = clock.getTime();
  if (Number.isNaN(time)) return false;
  return now - time >= STALE_AGE_DAYS * MS_PER_DAY;
}

function staleReason(group: GroupSummary): string {
  return group.lastMembershipUpdated
    ? 'No membership change in over a year'
    : 'Not updated in over a year';
}

export const CLUTTER_WEIGHTS = {
  empty: 40,
  duplicateName: 30,
  stale: 20,
  noDescription: 10,
} as const;

export interface GroupClutterSignals {
  empty: boolean;
  duplicateName: boolean;
  stale: boolean;
  noDescription: boolean;
}

export interface GroupClutterEntry {
  group: GroupSummary;
  signals: GroupClutterSignals;
  reviewScore: number;
  reasons: string[];
}

export interface DuplicateNameCluster {
  normalizedName: string;
  groupIds: string[];
}

export interface ClutterReport {
  totalGroups: number;
  entries: GroupClutterEntry[];
  categories: {
    empty: string[];
    duplicateName: string[];
    stale: string[];
  };
  flaggedIds: string[];
  duplicateNameClusters: DuplicateNameCluster[];
}

export function normalizeGroupName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function analyzeClutter(groups: GroupSummary[], now: number = Date.now()): ClutterReport {
  const byNormalizedName = new Map<string, string[]>();
  for (const g of groups) {
    const key = normalizeGroupName(g.name);
    if (!key) continue;
    const bucket = byNormalizedName.get(key);
    if (bucket) bucket.push(g.id);
    else byNormalizedName.set(key, [g.id]);
  }

  const duplicateNameClusters: DuplicateNameCluster[] = [];
  const duplicateIds = new Set<string>();
  for (const [normalizedName, groupIds] of byNormalizedName) {
    if (groupIds.length > 1) {
      duplicateNameClusters.push({ normalizedName, groupIds });
      for (const id of groupIds) duplicateIds.add(id);
    }
  }

  const entries: GroupClutterEntry[] = [];
  const categories = {
    empty: [] as string[],
    duplicateName: [] as string[],
    stale: [] as string[],
  };

  for (const group of groups) {
    const empty = group.memberCount === 0;
    const duplicateName = duplicateIds.has(group.id);
    const maintainedHere = group.type !== 'BUILT_IN' && group.type !== 'APP_GROUP';
    const stale = maintainedHere && isStaleByAge(group, now);
    const noDescription = !group.description || group.description.trim() === '';

    if (empty) categories.empty.push(group.id);
    if (duplicateName) categories.duplicateName.push(group.id);
    if (stale) categories.stale.push(group.id);

    if (!empty && !duplicateName && !stale) continue;

    const reasons: string[] = [];
    if (empty) reasons.push('No members');
    if (duplicateName) reasons.push('Duplicate name');
    if (stale) reasons.push(staleReason(group));
    if (noDescription) reasons.push('No description');

    const reviewScore = Math.min(
      100,
      (empty ? CLUTTER_WEIGHTS.empty : 0) +
        (duplicateName ? CLUTTER_WEIGHTS.duplicateName : 0) +
        (stale ? CLUTTER_WEIGHTS.stale : 0) +
        (noDescription ? CLUTTER_WEIGHTS.noDescription : 0),
    );

    entries.push({
      group,
      signals: { empty, duplicateName, stale, noDescription },
      reviewScore,
      reasons,
    });
  }

  entries.sort((a, b) => b.reviewScore - a.reviewScore);

  const flaggedIds = entries.map((e) => e.group.id);

  return {
    totalGroups: groups.length,
    entries,
    categories,
    flaggedIds,
    duplicateNameClusters,
  };
}
