export type ActionType =
  | 'REMOVE_USER_FROM_GROUP'
  | 'ADD_USER_TO_GROUP'
  | 'BULK_REMOVE_USERS_FROM_GROUP'
  | 'BULK_ADD_USERS_TO_GROUP'
  | 'ACTIVATE_RULE'
  | 'DEACTIVATE_RULE'
  | 'CONSOLIDATE_RULE'
  | 'UPDATE_USER_PROFILE'
  | 'BULK_UPDATE_USER_PROFILE'
  | 'CHANGE_USER_PASSWORD';

export interface UndoAction {
  id: string;
  type: ActionType;
  timestamp: number;
  description: string;
  metadata: UndoActionMetadata;
  status: 'completed' | 'undone' | 'failed' | 'partial';
  undoneByActionId?: string;
}

export type UndoActionMetadata =
  | RemoveUserMetadata
  | AddUserMetadata
  | BulkRemoveUsersMetadata
  | BulkAddUsersMetadata
  | ActivateRuleMetadata
  | DeactivateRuleMetadata
  | ConsolidateRuleMetadata
  | UpdateUserProfileMetadata
  | BulkUpdateUserProfileMetadata
  | ChangeUserPasswordMetadata;

export interface RemoveUserMetadata {
  type: 'REMOVE_USER_FROM_GROUP';
  userId: string;
  userEmail: string;
  userName: string;
  groupId: string;
  groupName: string;
}

export interface AddUserMetadata {
  type: 'ADD_USER_TO_GROUP';
  userId: string;
  userEmail: string;
  userName: string;
  groupId: string;
  groupName: string;
}

export interface BulkUserInfo {
  userId: string;
  userEmail: string;
  userName: string;
}

export interface BulkRemoveUsersMetadata {
  type: 'BULK_REMOVE_USERS_FROM_GROUP';
  users: BulkUserInfo[];
  groupId: string;
  groupName: string;
  operationType: 'deprovisioned' | 'inactive' | 'custom_status' | 'multi_status';
  targetStatus?: string;
}

export interface BulkAddUsersMetadata {
  type: 'BULK_ADD_USERS_TO_GROUP';
  users: BulkUserInfo[];
  groupId: string;
  groupName: string;
}

export interface ActivateRuleMetadata {
  type: 'ACTIVATE_RULE';
  ruleId: string;
  ruleName: string;
}

export interface DeactivateRuleMetadata {
  type: 'DEACTIVATE_RULE';
  ruleId: string;
  ruleName: string;
}

export interface RetiredRuleSnapshot {
  id: string;
  name: string;
  expression: string;
  groupIds: string[];
}

export interface ConsolidateRuleMetadata {
  type: 'CONSOLIDATE_RULE';
  createdRuleId: string;
  createdRuleName: string;
  createdGroupIds: string[];
  retiredRules: RetiredRuleSnapshot[];
}

export type CaptureOmission = 'too-large' | 'too-many';

export interface CapturedAttribute {
  name: string;
  label: string;
  beforeDisplay?: string;
  beforeRaw?: unknown;
  afterDisplay: string;
  restorable: boolean;
  omitted?: CaptureOmission;
}

export type PasswordChangeMode = 'email-reset' | 'set' | 'set-and-expire' | 'temp';

export interface ChangeUserPasswordMetadata {
  type: 'CHANGE_USER_PASSWORD';
  userId: string;
  userLogin: string;
  userName: string;
  mode: PasswordChangeMode;
  expired?: boolean;
}

export interface UpdateUserProfileMetadata {
  type: 'UPDATE_USER_PROFILE';
  userId: string;
  userLogin: string;
  userName: string;
  changes: CapturedAttribute[];
  undoOfActionId?: string;
}

export interface BulkProfileUserCapture {
  userId: string;
  beforeRaw?: unknown;
  restorable: boolean;
  omitted?: CaptureOmission;
}

export interface BulkUpdateUserProfileMetadata {
  type: 'BULK_UPDATE_USER_PROFILE';
  attributeName: string;
  attributeLabel: string;
  afterDisplay?: string;
  users: BulkProfileUserCapture[];
  unconfirmedUserIds: string[];
  undoOfActionId?: string;
}

export interface UndoHistory {
  actions: UndoAction[];
  maxSize: number;
}
