import { createLogger } from './utils/logger';
import type {
  UndoAction,
  UndoActionMetadata,
  UndoHistory,
  BulkRemoveUsersMetadata,
  BulkUserInfo,
  CapturedAttribute,
  UpdateUserProfileMetadata,
} from './undoTypes';

const log = createLogger('UndoManager');

const UNDO_STORAGE_KEY = 'undoHistory';
const MAX_UNDO_SIZE = 50;

export const MAX_CAPTURED_VALUE_CHARS = 1024;

export const MAX_CAPTURED_ATTRIBUTES = 25;

const DESCRIPTION_NAME_LIMIT = 3;

export async function getUndoHistory(): Promise<UndoHistory> {
  try {
    const result = await chrome.storage.local.get([UNDO_STORAGE_KEY]);
    const history = result[UNDO_STORAGE_KEY] as UndoHistory | undefined;

    if (history && Array.isArray(history.actions)) {
      return history;
    }

    return { actions: [], maxSize: MAX_UNDO_SIZE };
  } catch (error) {
    log.error('Failed to get history:', error);
    return { actions: [], maxSize: MAX_UNDO_SIZE };
  }
}

async function saveUndoHistory(history: UndoHistory): Promise<void> {
  try {
    await chrome.storage.local.set({ [UNDO_STORAGE_KEY]: history });
  } catch (error) {
    log.error('Failed to save history:', error);
  }
}

function generateActionId(): string {
  return `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function logAction(
  description: string,
  metadata: UndoActionMetadata,
  status: UndoAction['status'] = 'completed',
): Promise<UndoAction> {
  const history = await getUndoHistory();

  const action: UndoAction = {
    id: generateActionId(),
    type: metadata.type,
    timestamp: Date.now(),
    description,
    metadata,
    status,
  };

  history.actions.unshift(action);

  if (history.actions.length > history.maxSize) {
    history.actions = history.actions.slice(0, history.maxSize);
  }

  await saveUndoHistory(history);
  return action;
}

export async function logBulkRemoveAction(
  groupId: string,
  groupName: string,
  users: BulkUserInfo[],
  operationType: 'deprovisioned' | 'inactive' | 'custom_status' | 'multi_status',
  targetStatus?: string,
): Promise<UndoAction> {
  let description: string;
  if (operationType === 'deprovisioned') {
    description = `Removed ${users.length} deprovisioned user${users.length !== 1 ? 's' : ''} from ${groupName}`;
  } else if (operationType === 'inactive') {
    description = `Removed ${users.length} inactive user${users.length !== 1 ? 's' : ''} from ${groupName}`;
  } else if (operationType === 'multi_status' && targetStatus) {
    const statusCount = targetStatus.split(',').length;
    description = `Removed ${users.length} user${users.length !== 1 ? 's' : ''} (${statusCount} status types) from ${groupName}`;
  } else {
    description = `Removed ${users.length} ${targetStatus || 'filtered'} user${users.length !== 1 ? 's' : ''} from ${groupName}`;
  }

  const metadata: BulkRemoveUsersMetadata = {
    type: 'BULK_REMOVE_USERS_FROM_GROUP',
    users,
    groupId,
    groupName,
    operationType,
    targetStatus,
  };

  return logAction(description, metadata);
}

export interface AttributeChange {
  name: string;
  label: string;
  beforeDisplay: string;
  beforeRaw: unknown;
  afterDisplay: string;
}

export function captureAttribute(change: AttributeChange, index: number): CapturedAttribute {
  const { name, label, afterDisplay } = change;

  if (index >= MAX_CAPTURED_ATTRIBUTES) {
    return { name, label, afterDisplay, restorable: false, omitted: 'too-many' };
  }

  if (change.beforeDisplay.length > MAX_CAPTURED_VALUE_CHARS) {
    return { name, label, afterDisplay, restorable: false, omitted: 'too-large' };
  }

  return {
    name,
    label,
    beforeDisplay: change.beforeDisplay,
    beforeRaw: change.beforeRaw,
    afterDisplay,
    restorable: true,
  };
}

export function captureAttributes(changes: AttributeChange[]): CapturedAttribute[] {
  return changes.map((change, index) => captureAttribute(change, index));
}

function describeProfileUpdate(
  userName: string,
  changes: CapturedAttribute[],
  undoOfActionId: string | undefined,
  originalAttributeCount: number | undefined,
): string {
  if (undoOfActionId) {
    const total = originalAttributeCount ?? changes.length;
    return `Restored ${changes.length} of ${total} attribute${total !== 1 ? 's' : ''} on ${userName}`;
  }

  const names = changes.slice(0, DESCRIPTION_NAME_LIMIT).map((change) => change.name);
  const remaining = changes.length - names.length;
  const list = remaining > 0 ? `${names.join(', ')} and ${remaining} more` : names.join(', ');
  return `Updated ${list} on ${userName}`;
}

export interface ProfileUpdateLogOptions {
  undoOfActionId?: string;
  status?: UndoAction['status'];
  originalAttributeCount?: number;
}

export async function logProfileUpdateAction(
  userId: string,
  userLogin: string,
  userName: string,
  changes: AttributeChange[],
  options: ProfileUpdateLogOptions = {},
): Promise<UndoAction> {
  const captured = captureAttributes(changes);

  const metadata: UpdateUserProfileMetadata = {
    type: 'UPDATE_USER_PROFILE',
    userId,
    userLogin,
    userName,
    changes: captured,
    undoOfActionId: options.undoOfActionId,
  };

  const description = describeProfileUpdate(
    userName,
    captured,
    options.undoOfActionId,
    options.originalAttributeCount,
  );

  return logAction(description, metadata, options.status ?? 'completed');
}

export async function markActionUndone(
  actionId: string,
  undoneByActionId: string,
): Promise<boolean> {
  const history = await getUndoHistory();
  const action = history.actions.find((entry) => entry.id === actionId);

  if (!action) {
    log.debug('Undone action no longer in history', { actionId, undoneByActionId });
    return false;
  }

  action.status = 'undone';
  action.undoneByActionId = undoneByActionId;
  await saveUndoHistory(history);
  return true;
}

export async function clearUndoHistory(): Promise<void> {
  await saveUndoHistory({ actions: [], maxSize: MAX_UNDO_SIZE });
}

export function formatActionTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}
