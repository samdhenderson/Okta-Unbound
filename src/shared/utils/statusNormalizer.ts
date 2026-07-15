import { createLogger } from './logger';
import type { UserStatus } from '../types';

const log = createLogger('statusNormalizer');

const STATUS_MAP: Record<string, UserStatus> = {
  ACTIVE: 'ACTIVE',
  DEPROVISIONED: 'DEPROVISIONED',
  SUSPENDED: 'SUSPENDED',
  STAGED: 'STAGED',
  PROVISIONED: 'PROVISIONED',
  RECOVERY: 'RECOVERY',
  LOCKED_OUT: 'LOCKED_OUT',
  PASSWORD_EXPIRED: 'PASSWORD_EXPIRED',

  DEACTIVATED: 'DEPROVISIONED', // UI shows "Deactivated" for DEPROVISIONED
  PENDING_USER_ACTION: 'PROVISIONED', // UI shows "Pending User Action"
  'PENDING USER ACTION': 'PROVISIONED', // Space-separated variant
  PASSWORD_RESET: 'RECOVERY', // UI shows "Password Reset"
  'PASSWORD RESET': 'RECOVERY', // Space-separated variant

  LOCKEDOUT: 'LOCKED_OUT',
  'LOCKED OUT': 'LOCKED_OUT',
  PASSWORDEXPIRED: 'PASSWORD_EXPIRED',
  'PASSWORD EXPIRED': 'PASSWORD_EXPIRED',

  Active: 'ACTIVE',
  Deprovisioned: 'DEPROVISIONED',
  Deactivated: 'DEPROVISIONED',
  Suspended: 'SUSPENDED',
  Staged: 'STAGED',
  Provisioned: 'PROVISIONED',
  Recovery: 'RECOVERY',
  'Locked Out': 'LOCKED_OUT',
  Locked_Out: 'LOCKED_OUT',
  LockedOut: 'LOCKED_OUT',
  'Password Expired': 'PASSWORD_EXPIRED',
  Password_Expired: 'PASSWORD_EXPIRED',
  PasswordExpired: 'PASSWORD_EXPIRED',
  'Password Reset': 'RECOVERY',
  Password_Reset: 'RECOVERY',
  PasswordReset: 'RECOVERY',
  'Pending User Action': 'PROVISIONED',
  Pending_User_Action: 'PROVISIONED',
  PendingUserAction: 'PROVISIONED',
};

const DEFAULT_STATUS: UserStatus = 'ACTIVE';

export function normalizeUserStatus(statusValue: unknown, context?: string): UserStatus {
  if (statusValue == null) {
    log.warn(`Status is null/undefined${context ? ` for ${context}` : ''}`);
    return DEFAULT_STATUS;
  }

  if (typeof statusValue === 'object') {
    const obj = statusValue as Record<string, unknown>;

    const possibleKeys = ['text', 'label', 'status', 'statusLabel', 'value'];
    for (const key of possibleKeys) {
      const value = obj[key];
      if (value && typeof value === 'string') {
        return normalizeUserStatus(value, context);
      }
    }

    log.warn(`Status is object without recognizable property${context ? ` for ${context}` : ''}`, {
      keys: Object.keys(obj),
    });
    return DEFAULT_STATUS;
  }

  if (typeof statusValue !== 'string') {
    log.warn(`Status is not a string${context ? ` for ${context}` : ''}`, typeof statusValue);
    return DEFAULT_STATUS;
  }

  if (!statusValue.trim()) {
    log.warn(`Status is empty string${context ? ` for ${context}` : ''}`);
    return DEFAULT_STATUS;
  }

  let cleanStatus = statusValue;
  if (statusValue.includes('<') && statusValue.includes('>')) {
    cleanStatus = statusValue.replace(/<[^>]*>/g, '').trim();
    log.debug(`Extracted from HTML: "${statusValue}" => "${cleanStatus}"`);
  }

  const normalizedKey = cleanStatus.trim().toUpperCase().replace(/\s+/g, '_');

  const result = STATUS_MAP[normalizedKey];

  if (!result) {
    log.warn(
      `Unknown status after normalization: "${normalizedKey}" from original: "${statusValue}"${context ? ` for ${context}` : ''}`,
    );
    return DEFAULT_STATUS;
  }

  return result;
}

export function isValidUserStatus(value: unknown): value is UserStatus {
  const validStatuses: UserStatus[] = [
    'ACTIVE',
    'DEPROVISIONED',
    'SUSPENDED',
    'STAGED',
    'PROVISIONED',
    'RECOVERY',
    'LOCKED_OUT',
    'PASSWORD_EXPIRED',
  ];

  return typeof value === 'string' && validStatuses.includes(value as UserStatus);
}

export function normalizeUserStatusBatch(
  statuses: unknown[],
  contextPrefix?: string,
): UserStatus[] {
  return statuses.map((status, index) => {
    const context = contextPrefix ? `${contextPrefix}[${index}]` : `index:${index}`;
    return normalizeUserStatus(status, context);
  });
}

export function isUiLabel(value: string): boolean {
  const trimmedValue = value.trim();
  const normalizedKey = trimmedValue.toUpperCase().replace(/\s+/g, '_');
  const canonicalStatus = STATUS_MAP[normalizedKey];

  if (!canonicalStatus) {
    return false;
  }

  return trimmedValue !== canonicalStatus;
}

const UI_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Active',
  DEPROVISIONED: 'Deactivated',
  SUSPENDED: 'Suspended',
  STAGED: 'Staged',
  PROVISIONED: 'Pending User Action',
  RECOVERY: 'Password Reset',
  LOCKED_OUT: 'Locked Out',
  PASSWORD_EXPIRED: 'Password Expired',
};

export function getUserFriendlyStatus(status: UserStatus): string {
  return UI_LABELS[status];
}

export function getAllUserFriendlyLabels(): Record<UserStatus, string> {
  return { ...UI_LABELS };
}
