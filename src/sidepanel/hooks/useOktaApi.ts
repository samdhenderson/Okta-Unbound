import { useState, useCallback } from 'react';
import type { UseOktaApiOptions } from './useOktaApi/types';
import { createCoreApi } from './useOktaApi/core';
import { createGroupMemberOperations } from './useOktaApi/groupMembers';
import { createGroupCleanupOperations } from './useOktaApi/groupCleanup';
import { createGroupBulkOperations } from './useOktaApi/groupBulkOps';
import { createGroupDiscoveryOperations } from './useOktaApi/groupDiscovery';
import { createUserOperations } from './useOktaApi/userOperations';
import { createAppOperations } from './useOktaApi/appOperations';
import { createExportOperations } from './useOktaApi/exportOperations';

export function useOktaApi({ targetTabId, onResult, onProgress }: UseOktaApiOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  const cancelOperation = useCallback(() => {
    console.log('[useOktaApi] Cancelling operation');
    setIsCancelled(true);
    if (abortController) {
      abortController.abort();
    }
    onResult?.('Operation cancelled by user', 'warning');
  }, [abortController, onResult]);

  const checkCancelled = useCallback(() => {
    if (isCancelled) {
      throw new Error('Operation cancelled');
    }
  }, [isCancelled]);

  const coreApi = createCoreApi(targetTabId, checkCancelled, { onResult, onProgress });

  const groupMemberOps = createGroupMemberOperations(coreApi);
  const groupCleanupOps = createGroupCleanupOperations(coreApi, groupMemberOps.removeUserFromGroup);
  const groupBulkOps = createGroupBulkOperations(
    coreApi,
    groupMemberOps.removeUserFromGroup,
    groupMemberOps.getAllGroupMembers,
  );
  const groupDiscoveryOps = createGroupDiscoveryOperations(coreApi);
  const userOps = createUserOperations(coreApi);
  const appOps = createAppOperations(coreApi);
  const exportOps = createExportOperations(coreApi);

  const wrappedRemoveDeprovisioned = useCallback(
    async (groupId: string) => {
      setIsCancelled(false);
      const controller = new AbortController();
      setAbortController(controller);
      setIsLoading(true);

      try {
        await groupCleanupOps.removeDeprovisioned(groupId);
      } finally {
        setIsLoading(false);
        setAbortController(null);
        setIsCancelled(false);
      }
    },
    [groupCleanupOps],
  );

  const wrappedSmartCleanup = useCallback(
    async (groupId: string) => {
      setIsCancelled(false);
      const controller = new AbortController();
      setAbortController(controller);
      setIsLoading(true);

      try {
        await groupCleanupOps.smartCleanup(groupId);
      } finally {
        setIsLoading(false);
        setAbortController(null);
        setIsCancelled(false);
      }
    },
    [groupCleanupOps],
  );

  const wrappedCustomFilter = useCallback(
    async (groupId: string, targetStatus: any, action: 'list' | 'remove') => {
      setIsCancelled(false);
      const controller = new AbortController();
      setAbortController(controller);
      setIsLoading(true);

      try {
        await groupCleanupOps.customFilter(groupId, targetStatus, action);
      } finally {
        setIsLoading(false);
        setAbortController(null);
        setIsCancelled(false);
      }
    },
    [groupCleanupOps],
  );

  const wrappedCustomFilterMultiple = useCallback(
    async (groupId: string, targetStatuses: any[], action: 'list' | 'remove') => {
      setIsCancelled(false);
      const controller = new AbortController();
      setAbortController(controller);
      setIsLoading(true);

      try {
        await groupCleanupOps.customFilterMultiple(groupId, targetStatuses, action);
      } finally {
        setIsLoading(false);
        setAbortController(null);
        setIsCancelled(false);
      }
    },
    [groupCleanupOps],
  );

  const wrappedExportMembers = useCallback(
    async (groupId: string, groupName: string, format: 'csv' | 'json', statusFilter?: any) => {
      setIsLoading(true);
      try {
        await exportOps.exportMembers(groupId, groupName, format, statusFilter);
      } finally {
        setIsLoading(false);
      }
    },
    [exportOps],
  );

  return {
    isLoading,
    isCancelled,
    cancelOperation,

    makeApiRequest: coreApi.makeApiRequest,

    getAllGroupMembers: groupMemberOps.getAllGroupMembers,
    removeUserFromGroup: groupMemberOps.removeUserFromGroup,
    removeDeprovisioned: wrappedRemoveDeprovisioned,
    smartCleanup: wrappedSmartCleanup,
    customFilter: wrappedCustomFilter,
    customFilterMultiple: wrappedCustomFilterMultiple,
    getAllGroups: groupDiscoveryOps.getAllGroups,
    getGroupMemberCount: groupDiscoveryOps.getGroupMemberCount,
    getGroupRulesForGroup: groupDiscoveryOps.getGroupRulesForGroup,
    findUserAcrossGroups: groupDiscoveryOps.findUserAcrossGroups,
    executeBulkOperation: groupBulkOps.executeBulkOperation,
    compareGroups: groupBulkOps.compareGroups,
    searchGroups: groupDiscoveryOps.searchGroups,
    getGroupById: groupDiscoveryOps.getGroupById,

    getUserLastLogin: userOps.getUserLastLogin,
    getUserAppAssignments: userOps.getUserAppAssignments,
    batchGetUserDetails: userOps.batchGetUserDetails,
    getUserGroupMemberships: userOps.getUserGroupMemberships,
    searchUsers: userOps.searchUsers,
    getUserById: userOps.getUserById,

    getAllApps: appOps.getAllApps,
    getUserApps: appOps.getUserApps,
    getGroupApps: appOps.getGroupApps,
    getUserAppAssignment: appOps.getUserAppAssignment,
    getGroupAppAssignment: appOps.getGroupAppAssignment,
    getAppDetails: appOps.getAppDetails,
    assignUserToApp: appOps.assignUserToApp,
    assignGroupToApp: appOps.assignGroupToApp,
    removeUserFromApp: appOps.removeUserFromApp,
    removeGroupFromApp: appOps.removeGroupFromApp,
    getAppProfileSchema: appOps.getAppProfileSchema,
    previewConversion: appOps.previewConversion,
    convertUserToGroupAssignment: appOps.convertUserToGroupAssignment,
    copyUserToUserAssignment: appOps.copyUserToUserAssignment,
    bulkAssignGroupsToApps: appOps.bulkAssignGroupsToApps,
    analyzeAppAssignmentSecurity: appOps.analyzeAppAssignmentSecurity,
    getAppAssignmentRecommender: appOps.getAppAssignmentRecommender,
    getAppPushGroupMappings: appOps.getAppPushGroupMappings,
    getAppCertificates: appOps.getAppCertificates,
    getAppFeatures: appOps.getAppFeatures,
    getAppAssignmentCounts: appOps.getAppAssignmentCounts,
    enrichApp: appOps.enrichApp,

    exportMembers: wrappedExportMembers,
  };
}
