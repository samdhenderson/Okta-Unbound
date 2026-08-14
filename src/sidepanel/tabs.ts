import type { IconType } from './components/overview/shared/Icon';

export type TabType =
  'overview' | 'rules' | 'users' | 'groups' | 'apps' | 'policies' | 'export' | 'history';

export interface TabDef {
  id: TabType;
  label: string;
  icon: IconType;
}

export const TAB_DEFS: ReadonlyArray<TabDef> = [
  { id: 'overview', label: 'Overview', icon: 'chart' },
  { id: 'users', label: 'Users', icon: 'user' },
  { id: 'groups', label: 'Groups', icon: 'users' },
  { id: 'apps', label: 'Apps', icon: 'app' },
  { id: 'rules', label: 'Rules', icon: 'bolt' },
  { id: 'policies', label: 'Policies', icon: 'shield' },
  { id: 'export', label: 'Export', icon: 'download' },
  { id: 'history', label: 'History', icon: 'clipboard' },
];

const LEGACY_TAB_MAP: Readonly<Record<string, TabType>> = {
  dashboard: 'overview',
  operations: 'overview',
  security: 'overview',
  undo: 'history',
};

export function migrateLegacyTabId(saved: string): TabType {
  if (TAB_DEFS.some((tab) => tab.id === saved)) {
    return saved as TabType;
  }
  return LEGACY_TAB_MAP[saved] ?? 'overview';
}
