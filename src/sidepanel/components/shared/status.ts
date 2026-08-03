export type StatusType = 'success' | 'warning' | 'danger' | 'info';

export type UserStatusVariant = StatusType | 'neutral';

const USER_STATUS_VARIANTS: Record<string, UserStatusVariant> = {
  ACTIVE: 'success',
  PROVISIONED: 'info',
  STAGED: 'neutral',
  SUSPENDED: 'warning',
  RECOVERY: 'info',
  PASSWORD_EXPIRED: 'warning',
  LOCKED_OUT: 'danger',
  DEPROVISIONED: 'danger',
};

export function userStatusVariant(status: string): UserStatusVariant {
  return USER_STATUS_VARIANTS[status] ?? 'neutral';
}
