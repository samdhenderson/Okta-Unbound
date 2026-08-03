import { useState, useCallback, useMemo, useRef } from 'react';
import type { UseOktaApiOptions } from './useOktaApi/types';
import { useProgressOptional } from '../contexts/ProgressContext';
import { createCancellation } from '../../shared/scheduler/cancellation';
import { createCoreApi } from './useOktaApi/core';
import { createGroupMemberOperations } from './useOktaApi/groupMembers';
import { createGroupCleanupOperations } from './useOktaApi/groupCleanup';
import { createGroupBulkOperations } from './useOktaApi/groupBulkOps';
import { createGroupDiscoveryOperations } from './useOktaApi/groupDiscovery';
import { createUserOperations } from './useOktaApi/userOperations';
import { createAppOperations } from './useOktaApi/appOperations';
import { createPolicyOperations } from './useOktaApi/policyOperations';
import { createExportEngineOperations } from './useOktaApi/exportEngine';
import { createPushGroupOperations } from './useOktaApi/pushGroupOps';
import { createGroupAnalysisOperations } from './useOktaApi/groupAnalysis';
import { createRuleImpactOperations } from './useOktaApi/ruleImpact';
import { createRuleWriteOperations } from './useOktaApi/ruleWrites';

export function useOktaApi({ targetTabId, onResult, onProgress }: UseOktaApiOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const progressCtx = useProgressOptional();
  const localToken = useRef(createCancellation());
  const cancelFns = useRef({
    check: () => {},
    cancel: () => {},
    reset: () => {},
  });
  cancelFns.current.check = progressCtx
    ? progressCtx.throwIfCancelled
    : () => localToken.current.throwIfCancelled();
  cancelFns.current.cancel = progressCtx ? progressCtx.cancel : () => localToken.current.cancel();
  cancelFns.current.reset = progressCtx
    ? progressCtx.resetCancellation
    : () => localToken.current.reset();

  const isCancelled = progressCtx ? progressCtx.isCancelled : localToken.current.isCancelled;

  const cancelOperation = useCallback(() => {
    cancelFns.current.cancel();
    onResult?.('Operation cancelled by user', 'warning');
  }, [onResult]);

  const checkCancelled = useCallback(() => {
    cancelFns.current.check();
  }, []);

  const resetCancellation = useCallback(() => {
    cancelFns.current.reset();
  }, []);

  const progressFns = useRef({
    start: (_name: string, _total: number) => {},
    reportBatch: (
      _p: { total: number; completed: number; active: number; failed: number },
      _m?: string,
    ) => {},
    complete: () => {},
  });
  progressFns.current.start = progressCtx
    ? (name, total) => progressCtx.startProgress(name, `${name}…`, total)
    : () => {};
  progressFns.current.reportBatch = progressCtx ? progressCtx.updateBatch : () => {};
  progressFns.current.complete = progressCtx ? progressCtx.completeProgress : () => {};

  const progressBridge = useMemo(
    () => ({
      start: (name: string, total: number) => progressFns.current.start(name, total),
      reportBatch: (
        p: { total: number; completed: number; active: number; failed: number },
        m?: string,
      ) => progressFns.current.reportBatch(p, m),
      complete: () => progressFns.current.complete(),
    }),
    [],
  );

  const coreApi = useMemo(
    () =>
      createCoreApi(targetTabId, checkCancelled, resetCancellation, progressBridge, {
        onResult,
        onProgress,
      }),
    [targetTabId, checkCancelled, resetCancellation, progressBridge, onResult, onProgress],
  );

  const groupMemberOps = useMemo(() => createGroupMemberOperations(coreApi), [coreApi]);
  const groupCleanupOps = useMemo(
    () => createGroupCleanupOperations(coreApi, groupMemberOps.removeUserFromGroup),
    [coreApi, groupMemberOps],
  );
  const groupBulkOps = useMemo(
    () =>
      createGroupBulkOperations(
        coreApi,
        groupMemberOps.removeUserFromGroup,
        groupMemberOps.getAllGroupMembers,
      ),
    [coreApi, groupMemberOps],
  );
  const groupDiscoveryOps = useMemo(() => createGroupDiscoveryOperations(coreApi), [coreApi]);
  const userOps = useMemo(() => createUserOperations(coreApi), [coreApi]);
  const appOps = useMemo(() => createAppOperations(coreApi), [coreApi]);
  const policyOps = useMemo(() => createPolicyOperations(coreApi), [coreApi]);
  const exportEngineOps = useMemo(() => createExportEngineOperations(coreApi), [coreApi]);
  const pushGroupOps = useMemo(() => createPushGroupOperations(coreApi), [coreApi]);
  const groupAnalysisOps = useMemo(
    () => createGroupAnalysisOperations(groupMemberOps.getAllGroupMembers),
    [groupMemberOps],
  );
  const ruleImpactOps = useMemo(
    () => createRuleImpactOperations(coreApi, groupMemberOps.getAllGroupMembers),
    [coreApi, groupMemberOps],
  );
  const ruleWriteOps = useMemo(() => createRuleWriteOperations(coreApi), [coreApi]);

  const wrapOperation = useCallback(<A extends unknown[]>(fn: (...args: A) => Promise<void>) => {
    return async (...args: A) => {
      cancelFns.current.reset();
      setIsLoading(true);
      try {
        await fn(...args);
      } finally {
        setIsLoading(false);
      }
    };
  }, []);

  const removeDeprovisioned = useMemo(
    () => wrapOperation(groupCleanupOps.removeDeprovisioned),
    [wrapOperation, groupCleanupOps],
  );
  return useMemo(
    () => ({
      isLoading,
      isCancelled,
      cancelOperation,

      makeApiRequest: coreApi.makeApiRequest,

      getAllGroupMembers: groupMemberOps.getAllGroupMembers,
      removeUserFromGroup: groupMemberOps.removeUserFromGroup,
      removeUserFromGroups: groupMemberOps.removeUserFromGroups,
      addUserToGroup: groupMemberOps.addUserToGroup,
      removeDeprovisioned,
      getAllGroups: groupDiscoveryOps.getAllGroups,
      getGroupMemberCount: groupDiscoveryOps.getGroupMemberCount,
      getGroupRulesForGroup: groupDiscoveryOps.getGroupRulesForGroup,
      executeBulkOperation: groupBulkOps.executeBulkOperation,
      searchGroups: groupDiscoveryOps.searchGroups,
      getGroupById: groupDiscoveryOps.getGroupById,

      getUserLastLogin: userOps.getUserLastLogin,
      getUserAppAssignments: userOps.getUserAppAssignments,
      getUserApps: userOps.getUserApps,
      batchGetUserDetails: userOps.batchGetUserDetails,
      scanGroupMfa: userOps.scanGroupMfa,
      getUserGroupMemberships: userOps.getUserGroupMemberships,
      searchUsers: userOps.searchUsers,
      getUserById: userOps.getUserById,
      searchApps: appOps.searchApps,
      suspendUser: userOps.suspendUser,
      unsuspendUser: userOps.unsuspendUser,
      resetPassword: userOps.resetPassword,

      getAllApps: appOps.getAllApps,
      getAppById: appOps.getAppById,
      getAppAssignmentCounts: appOps.getAppAssignmentCounts,

      listPolicies: policyOps.listPolicies,
      getPolicyRules: policyOps.getPolicyRules,
      getAppAccessPolicyId: policyOps.getAppAccessPolicyId,

      fetchExportRows: exportEngineOps.fetchAllRows,
      countExportRows: exportEngineOps.countRows,
      runExport: exportEngineOps.runExport,

      getAppPushGroupMappings: pushGroupOps.getAppPushGroupMappings,
      applyPushGroupMappings: pushGroupOps.applyPushGroupMappings,

      compareGroups: groupAnalysisOps.compareGroups,
      searchUserAcrossGroups: groupAnalysisOps.searchUserAcrossGroups,
      calculateStaleness: groupAnalysisOps.calculateStaleness,

      captureRuleImpact: ruleImpactOps.captureRuleImpact,

      getRawGroupRule: ruleWriteOps.getRawGroupRule,
      createGroupRule: ruleWriteOps.createGroupRule,
      deleteGroupRule: ruleWriteOps.deleteGroupRule,
      activateGroupRule: ruleWriteOps.activateGroupRule,
      deactivateGroupRule: ruleWriteOps.deactivateGroupRule,
    }),
    [
      isLoading,
      isCancelled,
      cancelOperation,
      coreApi,
      groupMemberOps,
      groupDiscoveryOps,
      groupBulkOps,
      userOps,
      appOps,
      policyOps,
      exportEngineOps,
      pushGroupOps,
      groupAnalysisOps,
      ruleImpactOps,
      ruleWriteOps,
      removeDeprovisioned,
    ],
  );
}
