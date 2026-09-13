import type { IconType } from './components/shared/Icon';

export type TabType =
  | 'home'
  | 'rules'
  | 'users'
  | 'groups'
  | 'apps'
  | 'policies'
  | 'export'
  | 'explorer'
  | 'history'
  | 'selection';

export interface TabDef {
  id: TabType;
  label: string;
  icon: IconType;
  railHidden?: true;
}

export const TAB_DEFS: ReadonlyArray<TabDef> = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'users', label: 'Users', icon: 'user' },
  { id: 'groups', label: 'Groups', icon: 'users' },
  { id: 'apps', label: 'Apps', icon: 'app' },
  { id: 'rules', label: 'Rules', icon: 'bolt' },
  { id: 'policies', label: 'Policies', icon: 'shield' },
  { id: 'export', label: 'Export', icon: 'download' },
  { id: 'explorer', label: 'Explorer', icon: 'terminal', railHidden: true },
  { id: 'history', label: 'History', icon: 'clipboard', railHidden: true },
  { id: 'selection', label: 'Selection', icon: 'clipboard-check', railHidden: true },
];

export const RAIL_TAB_DEFS: ReadonlyArray<TabDef> = TAB_DEFS.filter((def) => !def.railHidden);

const LEGACY_TAB_MAP: Readonly<Record<string, TabType>> = {
  overview: 'home',
  dashboard: 'home',
  operations: 'home',
  security: 'home',
  undo: 'history',
};

export function migrateLegacyTabId(saved: string): TabType {
  if (TAB_DEFS.some((tab) => tab.id === saved)) {
    return saved as TabType;
  }
  return LEGACY_TAB_MAP[saved] ?? 'home';
}
