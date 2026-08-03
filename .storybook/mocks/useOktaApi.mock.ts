/* eslint-disable @typescript-eslint/no-explicit-any */
import { fn } from 'storybook/test';

const asyncFn = (value?: any) => fn(async () => value);

const sampleUser = {
  id: 'user1',
  status: 'ACTIVE',
  profile: {
    login: 'ada.lovelace@example.com',
    email: 'ada.lovelace@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
    title: 'Principal Engineer',
  },
};

const sampleGroups = [
  {
    id: 'g-eng',
    type: 'OKTA_GROUP',
    profile: { name: 'Engineering', description: 'All engineers' },
  },
  {
    id: 'g-admins',
    type: 'APP_GROUP',
    profile: { name: 'Okta Admins', description: 'Admin console' },
  },
];

const makeApiRequestFn = () =>
  fn(async (endpoint?: string) => {
    if (typeof endpoint === 'string') {
      if (/^\/api\/v1\/users\/[^/?]+\/groups/.test(endpoint)) {
        return { success: true, data: sampleGroups };
      }
      if (/^\/api\/v1\/users\/[^/?]+$/.test(endpoint)) {
        return { success: true, data: sampleUser };
      }
    }
    return { success: true, data: [] };
  });

export type UseOktaApiValue = Record<string, any>;

export function makeUseOktaApiValue(overrides: UseOktaApiValue = {}): UseOktaApiValue {
  return {
    isLoading: false,
    isCancelled: false,
    cancelOperation: fn(),

    makeApiRequest: makeApiRequestFn(),

    getAllGroupMembers: asyncFn([]),
    removeUserFromGroup: asyncFn(),
    removeUserFromGroups: asyncFn({
      results: [],
      total: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
      stoppedByError: false,
      cancelled: false,
    }),
    addUserToGroup: asyncFn(),
    removeDeprovisioned: asyncFn(),
    getAllGroups: asyncFn([]),
    getGroupMemberCount: asyncFn(0),
    ensureGroupRulesLoaded: asyncFn(null),
    getGroupRulesForGroup: asyncFn([]),
    executeBulkOperation: asyncFn(),
    searchGroups: asyncFn([]),
    getGroupById: asyncFn(null),

    getUserLastLogin: asyncFn(null),
    getUserAppAssignments: asyncFn([]),
    getUserApps: asyncFn([]),
    batchGetUserDetails: asyncFn([]),
    scanGroupMfa: asyncFn([]),
    getUserGroupMemberships: asyncFn([]),
    searchUsers: asyncFn([]),
    getUserById: asyncFn(null),
    searchApps: asyncFn([]),
    suspendUser: asyncFn(),
    unsuspendUser: asyncFn(),
    resetPassword: asyncFn(),

    getAllApps: asyncFn([]),
    getAppById: asyncFn(null),
    getAppAssignmentCounts: asyncFn(null),

    listPolicies: asyncFn([]),
    getPolicyRules: asyncFn([]),
    getAppAccessPolicyId: asyncFn(null),

    exportMembers: asyncFn(),

    fetchExportRows: asyncFn({ rows: [], fetched: 0, dropped: 0, capped: false }),
    countExportRows: asyncFn({ count: 0, hasMore: false }),
    runExport: asyncFn(),

    getAppPushGroupMappings: asyncFn([]),
    applyPushGroupMappings: asyncFn(),

    compareGroups: asyncFn(null),
    searchUserAcrossGroups: asyncFn([]),

    captureRuleImpact: asyncFn(null),

    getRawGroupRule: asyncFn(null),
    createGroupRule: asyncFn(),
    deleteGroupRule: asyncFn(),
    activateGroupRule: asyncFn(),
    deactivateGroupRule: asyncFn(),

    ...overrides,
  };
}

const defaultValue = makeUseOktaApiValue();

export const useOktaApi = fn((_options?: unknown) => defaultValue).mockName('useOktaApi');
