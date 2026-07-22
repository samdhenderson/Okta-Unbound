import type { OktaGroup, GroupMembership } from '../../../../shared/types';

export interface AppEntry {
  id: string;
  label: string;
}

export type TabKey = 'overview' | 'groups' | 'apps';

export interface DiffItem {
  id: string;
  label: string;
}

export const jaccard = (sharedCount: number, unionCount: number): number =>
  unionCount === 0 ? 0 : Math.round((sharedCount / unionCount) * 100);

export interface GroupBuckets {
  onlyCompared: OktaGroup[];
  shared: OktaGroup[];
  onlyContext: OktaGroup[];
}

export const bucketGroups = (
  contextGroups: GroupMembership[],
  comparedGroups: GroupMembership[],
  addedToContextIds: Set<string>,
  addedToComparedIds: Set<string> = new Set(),
): GroupBuckets => {
  const contextGroupIds = new Set(contextGroups.map((m) => m.group.id));
  const comparedGroupIds = new Set(comparedGroups.map((m) => m.group.id));

  const onlyCompared: OktaGroup[] = [];
  const shared: OktaGroup[] = [];
  for (const m of comparedGroups) {
    if (contextGroupIds.has(m.group.id) || addedToContextIds.has(m.group.id)) {
      shared.push(m.group);
    } else {
      onlyCompared.push(m.group);
    }
  }

  const onlyContext: OktaGroup[] = [];
  for (const m of contextGroups) {
    if (comparedGroupIds.has(m.group.id)) continue;
    if (addedToComparedIds.has(m.group.id)) shared.push(m.group);
    else onlyContext.push(m.group);
  }

  return { onlyCompared, shared, onlyContext };
};

export interface AppBuckets {
  onlyCompared: AppEntry[];
  shared: AppEntry[];
  onlyContext: AppEntry[];
}

export const bucketApps = (contextApps: AppEntry[], comparedApps: AppEntry[]): AppBuckets => {
  const contextAppIds = new Set(contextApps.map((a) => a.id));
  const comparedAppIds = new Set(comparedApps.map((a) => a.id));

  const onlyCompared = comparedApps.filter((a) => !contextAppIds.has(a.id));
  const shared = comparedApps.filter((a) => contextAppIds.has(a.id));
  const onlyContext = contextApps.filter((a) => !comparedAppIds.has(a.id));

  return { onlyCompared, shared, onlyContext };
};

export const similarityColor = (pct: number): string => {
  if (pct >= 75) return 'var(--color-success-text)';
  if (pct >= 40) return 'var(--color-primary-text)';
  if (pct >= 15) return 'var(--color-warning-text)';
  return 'var(--color-neutral-700)';
};
