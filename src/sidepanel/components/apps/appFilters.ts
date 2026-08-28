import { isGroupPushApp, type OktaAppListItem } from '../../../shared/schemas/okta';
import { parseRegexQuery } from '../../../shared/utils/regexQuery';

export type AppStatusFilter = '' | 'ACTIVE' | 'INACTIVE';

export type AppGroupsFilter = '' | 'no-groups';

export type AppSortField = 'label' | 'status' | 'created';

export type AppStatusVariant = 'success' | 'neutral' | 'danger';

export interface AppFilterState {
  searchQuery: string;
  statusFilter: AppStatusFilter;
  groupsFilter: AppGroupsFilter;
  sortBy: AppSortField;
  sortDesc: boolean;
}

export function appDisplayLabel(app: OktaAppListItem): string {
  return app.label || app.name || app.id;
}

export function matchesAppSearch(app: OktaAppListItem, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const label = appDisplayLabel(app);
  const name = app.name ?? '';

  const regex = parseRegexQuery(trimmed);
  if (regex) {
    return regex.test(label) || (name ? regex.test(name) : false) || regex.test(app.id);
  }

  const q = trimmed.toLowerCase();
  return (
    label.toLowerCase().includes(q) ||
    name.toLowerCase().includes(q) ||
    app.id.toLowerCase().includes(q)
  );
}

export function matchesAppStatus(status: string | undefined, filter: AppStatusFilter): boolean {
  if (!filter) return true;
  const normalized = status?.toUpperCase();
  return filter === 'ACTIVE' ? normalized === 'ACTIVE' : normalized !== 'ACTIVE';
}

export function pushesNoGroups(
  app: OktaAppListItem,
  appsWithPushedGroups: ReadonlySet<string>,
): boolean {
  return isGroupPushApp(app.features) && !appsWithPushedGroups.has(app.id);
}

export function compareAppsBy(
  a: OktaAppListItem,
  b: OktaAppListItem,
  sortBy: AppSortField,
): number {
  switch (sortBy) {
    case 'label':
      return appDisplayLabel(a).localeCompare(appDisplayLabel(b));
    case 'status':
      return (a.status ?? '').localeCompare(b.status ?? '');
    case 'created': {
      if (!a.created) return 1;
      if (!b.created) return -1;
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    }
    default:
      return 0;
  }
}

export function filterAndSortApps(
  apps: OktaAppListItem[],
  state: AppFilterState,
  appsWithPushedGroups: ReadonlySet<string> = new Set(),
): OktaAppListItem[] {
  let filtered = [...apps];

  if (state.searchQuery.trim()) {
    filtered = filtered.filter((app) => matchesAppSearch(app, state.searchQuery));
  }

  if (state.statusFilter) {
    filtered = filtered.filter((app) => matchesAppStatus(app.status, state.statusFilter));
  }

  if (state.groupsFilter === 'no-groups') {
    filtered = filtered.filter((app) => pushesNoGroups(app, appsWithPushedGroups));
  }

  filtered.sort((a, b) => {
    const cmp = compareAppsBy(a, b, state.sortBy);
    return state.sortDesc ? -cmp : cmp;
  });

  return filtered;
}

export function appStatusVariant(status: string | undefined): AppStatusVariant {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'success';
    case 'DELETED':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function computeActiveAppFilterCount(
  state: Pick<AppFilterState, 'statusFilter' | 'groupsFilter'>,
): number {
  return (state.statusFilter ? 1 : 0) + (state.groupsFilter ? 1 : 0);
}
