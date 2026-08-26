import type { SchedulerState, SchedulerMetrics } from './scheduler/types';

export interface OktaUser {
  id: string;
  status: UserStatus;
  created?: string;
  activated?: string;
  statusChanged?: string;
  lastLogin?: string | null;
  lastUpdated?: string;
  passwordChanged?: string | null;
  managedBy?: {
    rules?: Array<{
      id: string;
      name: string;
    }>;
  };
  credentials?: {
    provider?: {
      type?: string;
      name?: string;
    };
  };
  profile: {
    login: string;
    email: string;
    firstName: string;
    lastName: string;
    secondEmail?: string;
    mobilePhone?: string;
    primaryPhone?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    countryCode?: string;
    department?: string;
    title?: string;
    manager?: string;
    managerId?: string;
    division?: string;
    organization?: string;
    costCenter?: string;
    employeeNumber?: string;
    userType?: string;
    locale?: string;
    timezone?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export type UserStatus =
  | 'ACTIVE'
  | 'DEPROVISIONED'
  | 'SUSPENDED'
  | 'STAGED'
  | 'PROVISIONED'
  | 'RECOVERY'
  | 'LOCKED_OUT'
  | 'PASSWORD_EXPIRED';

export interface OktaFactor {
  id: string;
  factorType: string; // e.g. "push", "signed_nonce", "token:software:totp", "sms", "webauthn"
  provider: string; // e.g. "OKTA", "GOOGLE", "FIDO"
  status: string; // "ACTIVE" | "PENDING_ACTIVATION" | "NOT_SETUP" | ...
}

export type MfaScanStatus = 'idle' | 'confirming' | 'scanning' | 'complete' | 'error';

export interface MemberMfaResult {
  userId: string;
  factors: OktaFactor[];
  enrolled: boolean; // has >=1 ACTIVE non-password factor
  factorCount: number; // number of ACTIVE non-password factors
  factorLabels: string[]; // unique friendly labels of ACTIVE factors (e.g. "SMS", "Okta Verify (Fastpass)")
}

export interface OktaGroup {
  id: string;
  type: GroupType;
  profile: {
    name: string;
    description?: string;
  };
}

export type GroupType = 'OKTA_GROUP' | 'APP_GROUP' | 'BUILT_IN';

export interface OktaGroupRule {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  type: string;
  created: string;
  lastUpdated: string;
  conditions?: RuleConditions;
  actions?: RuleActions;
  allGroupsValid?: boolean;
}

export interface RuleConditions {
  people?: {
    users?: {
      exclude?: string[];
    };
    groups?: {
      exclude?: string[];
      include?: string[];
    };
  };
  expression?: {
    value: string;
    type: string;
  };
}

export interface RuleActions {
  assignUserToGroups?: {
    groupIds: string[];
  };
}

export interface RuleConflict {
  rule1: { id: string; name: string };
  rule2: { id: string; name: string };
  reason: string;
  severity: 'high' | 'medium' | 'low';
  affectedGroups: string[];
}

export interface FormattedRule {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  condition: string;
  conditionExpression?: string;
  groupIds: string[];
  groupNames?: string[];
  allGroupNamesMap?: Record<string, string>;
  userAttributes: string[];
  created: string;
  lastUpdated: string;
  affectsCurrentGroup?: boolean;
  conflicts?: RuleConflict[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  headers?: Record<string, string>;
}

export interface GroupInfo {
  groupId: string;
  groupName: string;
}

export interface UserInfo {
  userId: string;
  userName: string;
  userEmail?: string;
  userStatus?: UserStatus;
}

export interface AppInfo {
  appId: string;
  appName: string;
  appLabel?: string;
}

export interface PolicyInfo {
  policyId: string;
  policyName: string | null;
  policyStatus?: string;
}

export interface UserMembershipTrace {
  userId: string;
  user: OktaUser;
  groups: GroupMembership[];
  totalGroups: number;
}

export interface MembershipRule {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  conditions?: RuleConditions;
  actions?: RuleActions;
  groupIds?: string[];
  conditionExpression?: string;
  userAttributes?: string[];
}

export type MembershipAttribution = 'exact' | 'inferred' | 'ambiguous';

export interface OktaAttributedRule {
  id: string;
  name: string;
}

export interface MembershipProvenance {
  source: 'okta';
  rules: OktaAttributedRule[];
}

export interface GroupMembership {
  group: OktaGroup;
  membershipType: 'DIRECT' | 'RULE_BASED' | 'UNKNOWN';
  rules: MembershipRule[];
  attribution: MembershipAttribution;
  provenance?: MembershipProvenance;
}

export interface MessageRequest {
  action:
    | 'getGroupInfo'
    | 'getUserInfo'
    | 'getAppInfo'
    | 'getPolicyInfo'
    | 'makeApiRequest'
    | 'getOktaOrigin';
  endpoint?: string;
  method?: string;
  body?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MessageResponse<T = any> extends ApiResponse<T> {
  count?: number;
  rules?: OktaGroupRule[];
  formattedRules?: FormattedRule[];
  stats?: RuleStats;
  conflicts?: RuleConflict[];
}

export interface SchedulerStateChangedMessage {
  action: 'schedulerStateChanged';
  state: SchedulerState;
  metrics: SchedulerMetrics;
}

export interface RuleStats {
  total: number;
  active: number;
  inactive: number;
  conflicts: number;
}

export interface ProgressCallback {
  (current: number, total: number, message?: string): void;
}

export type ResultType = 'info' | 'success' | 'warning' | 'error';

export type { UndoAction, UndoActionMetadata, UndoHistory } from './undoTypes';

export type ActorResolution = 'resolved' | 'unavailable';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: 'remove_users' | 'add_users' | 'export' | 'activate_rule' | 'deactivate_rule';
  groupId: string;
  groupName: string;
  performedBy: string | null;
  actorResolution: ActorResolution;
  affectedUsers: string[];
  result: 'success' | 'partial' | 'failed';
  details: {
    usersSucceeded: number;
    usersFailed: number;
    apiRequestCount: number;
    durationMs: number;
    errorMessages?: string[];
  };
}

export interface PersistedAuditLogEntry extends Omit<AuditLogEntry, 'actorResolution'> {
  actorResolution?: ActorResolution;
}

export interface AuditFilters {
  groupId?: string;
  action?: AuditLogEntry['action'];
  startDate?: Date;
  endDate?: Date;
  result?: AuditLogEntry['result'];
  performedBy?: string;
}

export interface AuditStats {
  totalOperations: number;
  operationsByType: Record<string, number>;
  successRate: number;
  totalUsersAffected: number;
  totalApiRequests: number;
  lastWeekOperations: number;
}

export interface AuditSettings {
  enabled: boolean;
  retentionDays: number;
}

export interface PushGroupMapping {
  mappingId: string;
  sourceUserGroupId: string;
  targetGroupName: string;
  priority?: number;
  appId: string;
  appName?: string;
}

export interface GroupComparisonResult {
  groups: Array<{ id: string; name: string; memberCount: number }>;
  intersection: string[]; // user IDs in ALL groups
  uniqueMembers: Record<string, string[]>; // groupId -> user IDs only in that group
  totalUniqueUsers: number;
}

export interface GroupCollection {
  id: string;
  name: string;
  description?: string;
  groupIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface GroupSummary {
  id: string;
  name: string;
  description?: string;
  type: GroupType;
  memberCount: number;
  lastUpdated?: Date;
  hasRules: boolean;
  ruleCount: number;
  usedInRuleCount?: number;
  selected?: boolean;
  sourceAppId?: string;
  sourceAppName?: string;
  created?: Date;
  pushMappings?: PushGroupMapping[];
}

export interface BulkOperation {
  id: string;
  type: 'remove_user' | 'add_user' | 'cleanup_inactive' | 'export_all';
  targetGroups: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results: BulkOperationResult[];
  config?: { userId?: string };
}

export interface BulkOperationResult {
  groupId: string;
  groupName: string;
  status: 'success' | 'failed';
  itemsProcessed: number;
  errors?: string[];
}

export interface UserGroupMemberships {
  user: OktaUser;
  groups: GroupMembership[];
}

export interface GroupsCache {
  groups: GroupSummary[];
  timestamp: number;
}

export interface OktaApp {
  id: string;
  name: string;
  label: string;
  status: 'ACTIVE' | 'INACTIVE';
  created: string;
  lastUpdated: string;
  signOnMode?: string;
}
