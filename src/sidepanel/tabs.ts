export type TabType =
  'overview' | 'rules' | 'users' | 'groups' | 'apps' | 'policies' | 'export' | 'history';

export const TAB_DEFS: ReadonlyArray<{ id: TabType; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'groups', label: 'Groups' },
  { id: 'apps', label: 'Apps' },
  { id: 'rules', label: 'Rules' },
  { id: 'policies', label: 'Auth Policies' },
  { id: 'export', label: 'Export' },
  { id: 'history', label: 'History' },
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
