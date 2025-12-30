export type TabName =
  'dashboard' | 'operations' | 'rules' | 'users' | 'security' | 'groups' | 'undo';

export interface BaseTabState {
  lastVisited: number; // Timestamp
  scrollPosition: number;
}

export interface RulesTabState extends BaseTabState {
  searchQuery: string;
  activeFilter: 'all' | 'active' | 'conflicts' | 'current-group';
  cachedRules: any[] | null;
  cachedStats: any | null;
  lastFetchTime: string | null;
}

export interface UsersTabState extends BaseTabState {
  searchQuery: string;
  statusFilter: string;
  sortBy: 'name' | 'status' | 'email';
  sortDirection: 'asc' | 'desc';
  selectedUserIds: string[];
  expandedUserId: string | null;
}

export interface GroupsTabState extends BaseTabState {
  viewMode: 'browse' | 'search' | 'bulk' | 'compare';
  searchQuery: string;
  typeFilter: string;
  sizeFilter: string;
  sortBy: 'name' | 'memberCount' | 'lastUpdated';
  selectedGroupIds: string[];
  cachedGroups: any[] | null;
  cacheTimestamp: number | null;
}

export interface DashboardTabState extends BaseTabState {
  activeWidget: string | null;
  expandedSections: string[];
}

export interface OperationsTabState extends BaseTabState {
  selectedOperation: string | null;
  lastOperation: string | null;
  outputLog: string[];
}

export interface SecurityTabState extends BaseTabState {
  activeView: 'findings' | 'orphaned' | 'stale';
  selectedFindings: string[];
  cachedFindings: any[] | null;
  cacheTimestamp: number | null;
}

export interface UndoTabState extends BaseTabState {
  expandedEntryId: string | null;
}

export interface AllTabStates {
  dashboard: DashboardTabState | null;
  operations: OperationsTabState | null;
  rules: RulesTabState | null;
  users: UsersTabState | null;
  security: SecurityTabState | null;
  groups: GroupsTabState | null;
  undo: UndoTabState | null;
}

export interface StatePersistOptions {
  ttl?: number; // How long state is valid (ms), null = forever
  skipCache?: boolean; // Don't persist cached data (rules, groups, etc.)
}

export interface StoredStateMetadata {
  version: number; // Schema version for migrations
  lastUpdated: number;
  expiresAt: number | null;
}
