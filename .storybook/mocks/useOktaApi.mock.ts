/* eslint-disable @typescript-eslint/no-explicit-any */
import { fn } from 'storybook/test';

const asyncFn = (value?: any) => fn(async () => value);

export type UseOktaApiValue = Record<string, any>;

export function makeUseOktaApiValue(overrides: UseOktaApiValue = {}): UseOktaApiValue {
  return {
    isLoading: false,
    isCancelled: false,
    cancelOperation: fn(),

    makeApiRequest: asyncFn({}),

    getAllGroupMembers: asyncFn([]),
    removeUserFromGroup: asyncFn(),
    addUserToGroup: asyncFn(),
    removeDeprovisioned: asyncFn(),
    getAllGroups: asyncFn([]),
    getGroupMemberCount: asyncFn(0),
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
    suspendUser: asyncFn(),
    unsuspendUser: asyncFn(),
    resetPassword: asyncFn(),

    exportMembers: asyncFn(),

    getAppPushGroupMappings: asyncFn([]),
    applyPushGroupMappings: asyncFn(),

    compareGroups: asyncFn(null),
    searchUserAcrossGroups: asyncFn([]),
    calculateStaleness: asyncFn(null),

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
