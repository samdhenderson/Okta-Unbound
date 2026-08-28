export type GroupsListView = 'empty' | 'no-rules';

export type AppsListView = 'inactive' | 'pushes-nothing';

export type RulesListView = 'paused';

interface ListViewByTab {
  groups: GroupsListView;
  apps: AppsListView;
  rules: RulesListView;
}

export type ListViewTab = keyof ListViewByTab;

export type ListViewRequest = {
  [K in ListViewTab]: { tab: K; view: ListViewByTab[K] };
}[ListViewTab];

export function viewFor<T extends ListViewTab>(
  request: ListViewRequest | null | undefined,
  tab: T,
): ListViewByTab[T] | null {
  if (!request || request.tab !== tab) return null;
  return request.view as ListViewByTab[T];
}
