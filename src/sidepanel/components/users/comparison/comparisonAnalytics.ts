import type { GroupMembership } from '../../../../shared/types';
import type { AppAssignmentScope } from '../../../../shared/schemas/okta';

export interface AppEntry {
  id: string;
  label: string;
  scope?: AppAssignmentScope;
}

export type TabKey = 'overview' | 'groups' | 'apps' | 'attributes';

export interface DiffItem {
  id: string;
  label: string;
  membership?: GroupMembership;
}

export interface ParityRow {
  readonly id: string;
  readonly label: string;
  readonly inContext: boolean;
  readonly inCompared: boolean;
  readonly membership?: GroupMembership;
}

const byDifferenceThenName = (a: ParityRow, b: ParityRow): number => {
  const differs = (row: ParityRow) => (row.inContext !== row.inCompared ? 0 : 1);
  return differs(a) - differs(b) || a.label.localeCompare(b.label);
};

export const groupParityRows = (buckets: GroupBuckets): ParityRow[] =>
  [
    ...buckets.onlyCompared.map((m) => parityRowOf(m, false, true)),
    ...buckets.shared.map((m) => parityRowOf(m, true, true)),
    ...buckets.onlyContext.map((m) => parityRowOf(m, true, false)),
  ].sort(byDifferenceThenName);

const parityRowOf = (
  membership: GroupMembership,
  inContext: boolean,
  inCompared: boolean,
): ParityRow => ({
  id: membership.group.id,
  label: membership.group.profile.name,
  inContext,
  inCompared,
  membership,
});

export const appParityRows = (buckets: AppBuckets): ParityRow[] =>
  [
    ...buckets.onlyCompared.map((a) => appRowOf(a, false, true)),
    ...buckets.shared.map((a) => appRowOf(a, true, true)),
    ...buckets.onlyContext.map((a) => appRowOf(a, true, false)),
  ].sort(byDifferenceThenName);

const appRowOf = (app: AppEntry, inContext: boolean, inCompared: boolean): ParityRow => ({
  id: app.id,
  label: app.label,
  inContext,
  inCompared,
});

export const jaccard = (sharedCount: number, unionCount: number): number =>
  unionCount === 0 ? 0 : Math.round((sharedCount / unionCount) * 100);

export interface GroupBuckets {
  onlyCompared: GroupMembership[];
  shared: GroupMembership[];
  onlyContext: GroupMembership[];
}

export const bucketGroups = (
  contextGroups: GroupMembership[],
  comparedGroups: GroupMembership[],
  addedToContextIds: Set<string>,
  addedToComparedIds: Set<string> = new Set(),
): GroupBuckets => {
  const contextGroupIds = new Set(contextGroups.map((m) => m.group.id));
  const comparedGroupIds = new Set(comparedGroups.map((m) => m.group.id));

  const onlyCompared: GroupMembership[] = [];
  const shared: GroupMembership[] = [];
  for (const m of comparedGroups) {
    if (contextGroupIds.has(m.group.id) || addedToContextIds.has(m.group.id)) {
      shared.push(m);
    } else {
      onlyCompared.push(m);
    }
  }

  const onlyContext: GroupMembership[] = [];
  for (const m of contextGroups) {
    if (comparedGroupIds.has(m.group.id)) continue;
    if (addedToComparedIds.has(m.group.id)) shared.push(m);
    else onlyContext.push(m);
  }

  return { onlyCompared, shared, onlyContext };
};

export const groupDiffItem = (membership: GroupMembership): DiffItem => ({
  id: membership.group.id,
  label: membership.group.profile.name,
  membership,
});

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
