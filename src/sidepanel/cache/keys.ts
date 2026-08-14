import type { EntityKey } from './entityCache';

export const TTL_SHORT = 5 * 60 * 1000;

export const TTL_LONG = 30 * 60 * 1000;

export const cacheKeys = {
  apps: (oktaOrigin?: string | null): EntityKey => ['apps', oktaOrigin ?? 'unknown'],

  groupMembers: (groupId: string): EntityKey => ['groupMembers', groupId],

  memberSource: (groupId: string): EntityKey => ['memberSource', groupId],

  userMemberships: (userId: string): EntityKey => ['userMemberships', userId],

  appDetail: (appId: string): EntityKey => ['appDetail', appId],

  appAssignmentCounts: (appId: string): EntityKey => ['appAssignmentCounts', appId],

  policies: (policyType: string): EntityKey => ['policies', policyType],
} as const;
