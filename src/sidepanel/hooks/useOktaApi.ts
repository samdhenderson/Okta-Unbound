import { useState, useCallback, useMemo, useRef } from 'react';
import type { UseOktaApiOptions } from './useOktaApi/types';
import { useProgressOptional } from '../contexts/ProgressContext';
import { createCancellation } from '../../shared/scheduler/cancellation';
import { createCoreApi } from './useOktaApi/core';
import { createGroupMemberOperations } from './useOktaApi/groupMembers';
import { invalidate } from '../cache/entityCache';
import { cacheKeys } from '../cache/keys';
import { createGroupCleanupOperations } from './useOktaApi/groupCleanup';
import { createGroupBulkOperations } from './useOktaApi/groupBulkOps';
import { createGroupDiscoveryOperations } from './useOktaApi/groupDiscovery';
import { createUserOperations } from './useOktaApi/userOperations';
import { createProfileOperations } from './useOktaApi/profileOperations';
import { createPasswordOperations } from './useOktaApi/passwordOperations';
import { createAppOperations } from './useOktaApi/appOperations';
import { createSamlOperations } from './useOktaApi/samlOperations';
import { createPolicyOperations } from './useOktaApi/policyOperations';
import { createExportEngineOperations } from './useOktaApi/exportEngine';
import { createGroupAnalysisOperations } from './useOktaApi/groupAnalysis';
import { createRuleImpactOperations } from './useOktaApi/ruleImpact';
import { createRuleWriteOperations } from './useOktaApi/ruleWrites';

export function useOktaApi({ targetTabId, oktaOrigin, onResult, onProgress }: UseOktaApiOptions) {
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
    onResult?.({ message: 'Operation cancelled by user', type: 'warning' });
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

  const groupMemberOps = useMemo(
    () =>
      createGroupMemberOperations(coreApi, (groupId) =>
        invalidate(cacheKeys.groupMembers(groupId)),
      ),
    [coreApi],
  );
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
  const groupDiscoveryOps = useMemo(
    () => createGroupDiscoveryOperations(coreApi, oktaOrigin),
    [coreApi, oktaOrigin],
  );
  const userOps = useMemo(() => createUserOperations(coreApi), [coreApi]);
  const profileOps = useMemo(() => createProfileOperations(coreApi), [coreApi]);
  const passwordOps = useMemo(() => createPasswordOperations(coreApi), [coreApi]);
  const appOps = useMemo(() => createAppOperations(coreApi), [coreApi]);
  const samlOps = useMemo(() => createSamlOperations(coreApi), [coreApi]);
  const policyOps = useMemo(() => createPolicyOperations(coreApi), [coreApi]);
  const exportEngineOps = useMemo(() => createExportEngineOperations(coreApi), [coreApi]);
  const groupAnalysisOps = useMemo(
    () => createGroupAnalysisOperations(groupMemberOps.getAllGroupMembers),
    [groupMemberOps],
  );
  const ruleImpactOps = useMemo(
    () => createRuleImpactOperations(coreApi, groupMemberOps.getAllGroupMembers, oktaOrigin),
    [coreApi, groupMemberOps, oktaOrigin],
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
      runOperation: coreApi.runOperation,
      getCurrentUser: coreApi.getCurrentUser,

      getAllGroupMembers: groupMemberOps.getAllGroupMembers,
      getMembershipRuleProof: groupMemberOps.getMembershipRuleProof,
      removeUserFromGroup: groupMemberOps.removeUserFromGroup,
      removeUserFromGroups: groupMemberOps.removeUserFromGroups,
      addUserToGroup: groupMemberOps.addUserToGroup,
      removeDeprovisioned,
      getAllGroups: groupDiscoveryOps.getAllGroups,
      getGroupMemberCount: groupDiscoveryOps.getGroupMemberCount,
      ensureGroupRulesLoaded: groupDiscoveryOps.ensureGroupRulesLoaded,
      getGroupRulesForGroup: groupDiscoveryOps.getGroupRulesForGroup,
      executeBulkOperation: groupBulkOps.executeBulkOperation,
      searchGroups: groupDiscoveryOps.searchGroups,
      getGroupById: groupDiscoveryOps.getGroupById,

      getUserLastLogin: userOps.getUserLastLogin,
      getUserApps: userOps.getUserApps,
      batchGetUserDetails: userOps.batchGetUserDetails,
      scanGroupMfa: userOps.scanGroupMfa,
      getUserGroupMemberships: userOps.getUserGroupMemberships,
      searchUsers: userOps.searchUsers,
      getUserById: userOps.getUserById,
      getUserProfileSchema: profileOps.getUserProfileSchema,
      getUserRaw: profileOps.getUserRaw,
      updateUserProfile: profileOps.updateUserProfile,
      searchApps: appOps.searchApps,
      suspendUser: userOps.suspendUser,
      unsuspendUser: userOps.unsuspendUser,
      resetPassword: userOps.resetPassword,
      setUserPassword: passwordOps.setUserPassword,
      expirePassword: passwordOps.expirePassword,
      expirePasswordWithTempPassword: passwordOps.expirePasswordWithTempPassword,

      getAppById: appOps.getAppById,
      getAppAssignmentCounts: appOps.getAppAssignmentCounts,
      getAppGroupAssignments: appOps.getAppGroupAssignments,

      fetchAppAssertion: samlOps.fetchAppAssertion,

      listPolicies: policyOps.listPolicies,
      getPolicyRules: policyOps.getPolicyRules,
      getAppAccessPolicyId: policyOps.getAppAccessPolicyId,

      fetchExportRows: exportEngineOps.fetchAllRows,
      fetchSelectionExportRows: exportEngineOps.fetchSelectionRows,
      countExportRows: exportEngineOps.countRows,
      runExport: exportEngineOps.runExport,

      compareGroups: groupAnalysisOps.compareGroups,
      searchUserAcrossGroups: groupAnalysisOps.searchUserAcrossGroups,

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
      profileOps,
      passwordOps,
      appOps,
      samlOps,
      policyOps,
      exportEngineOps,
      groupAnalysisOps,
      ruleImpactOps,
      ruleWriteOps,
      removeDeprovisioned,
    ],
  );
}
