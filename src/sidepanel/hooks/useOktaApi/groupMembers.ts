import type { CoreApi } from './core';
import type { OktaUser } from './types';
import type { BatchOutcome } from '@/shared/scheduler/runBatch';
import { logAction } from '../../../shared/undoManager';
import { fetchAllPages, OKTA_PAGE_SIZE } from '@/shared/utils/oktaPagination';
import {
  GROUP_RULES_EXPAND,
  interpretGroupRules,
  memberWithGroupRulesSchema,
  type MemberRuleAttribution,
  type MemberWithGroupRules,
} from '@/shared/membership/memberRuleAttribution';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('useOktaApi');

function groupRulesPayload(data: unknown): unknown {
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data !== null && GROUP_RULES_EXPAND in data) {
    return (data as Record<string, unknown>)[GROUP_RULES_EXPAND];
  }
  return undefined;
}

export function createGroupMemberOperations(
  coreApi: CoreApi,
  onMembershipChanged?: (groupId: string) => void,
) {
  const removeUserFromGroup = async (
    groupId: string,
    groupName: string,
    user: OktaUser,
    skipUndoLog = false,
  ) => {
    const result = await coreApi.makeApiRequest(
      `/api/v1/groups/${groupId}/users/${user.id}`,
      'DELETE',
    );

    if (result.success) onMembershipChanged?.(groupId);

    if (result.success && !skipUndoLog) {
      await logAction(
        `Removed ${user.profile.firstName} ${user.profile.lastName} from ${groupName}`,
        {
          type: 'REMOVE_USER_FROM_GROUP',
          userId: user.id,
          userEmail: user.profile.email,
          userName: `${user.profile.firstName} ${user.profile.lastName}`,
          groupId,
          groupName,
        },
      );
    }

    return result;
  };

  const removeUserFromGroups = async (
    userId: string,
    groupIds: string[],
    onProgress?: (completed: number, total: number) => void,
  ): Promise<BatchOutcome<string, void>> => {
    let completedCount = 0;
    return coreApi.runOperation(
      'Remove user from groups',
      groupIds,
      async (groupId) => {
        await coreApi.makeApiRequest(`/api/v1/groups/${groupId}/users/${userId}`, 'DELETE');
        onMembershipChanged?.(groupId);
        completedCount += 1;
        onProgress?.(completedCount, groupIds.length);
      },
      {
        concurrency: 1,
        stopOnError: () => true,
        message: (p) => `Removing user from groups (${p.completed}/${p.total})`,
      },
    );
  };

  const getAllGroupMembers = async (groupId: string): Promise<OktaUser[]> => {
    let pageCount = 0;

    const allMembers: OktaUser[] = await fetchAllPages<MemberWithGroupRules>(
      (url) => coreApi.makeApiRequest(url),
      `/api/v1/groups/${groupId}/users?limit=${OKTA_PAGE_SIZE}&expand=${GROUP_RULES_EXPAND}`,
      {
        schema: memberWithGroupRulesSchema,
        preserveParams: ['expand'],
        errorMessage: 'Failed to fetch group members',
        onBeforePage: (pageNumber) => {
          pageCount = pageNumber;
          coreApi.callbacks.onResult?.({ message: `Fetching page ${pageNumber}...`, type: 'info' });
        },
        onPage: (pageMembers, totalSoFar) => {
          coreApi.callbacks.onResult?.({
            message: `Page ${pageCount}: Loaded ${pageMembers.length} members (Total: ${totalSoFar})`,
            type: 'info',
          });
        },
      },
    );

    coreApi.callbacks.onResult?.({
      message: `Loaded ${allMembers.length} total members`,
      type: 'success',
    });
    return allMembers;
  };

  const getMembershipRuleProof = async (
    groupId: string,
    userId: string,
  ): Promise<MemberRuleAttribution> => {
    const result = await coreApi.makeApiRequest(
      `/api/v1/groups/${groupId}/users/${userId}/group-rules`,
    );

    if (!result.success) {
      log.warn('Membership rule proof unavailable', {
        groupId,
        userId,
        status: result.status,
      });
      return { state: 'unknown' };
    }

    return interpretGroupRules(groupRulesPayload(result.data));
  };

  const addUserToGroup = async (
    groupId: string,
    groupName: string,
    user: {
      id: string;
      profile: { login: string; firstName: string; lastName: string; email: string };
    },
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await coreApi.makeApiRequest(
      `/api/v1/groups/${groupId}/users/${user.id}`,
      'PUT',
    );

    if (result.success) {
      onMembershipChanged?.(groupId);
      await logAction(`Added ${user.profile.firstName} ${user.profile.lastName} to ${groupName}`, {
        type: 'ADD_USER_TO_GROUP',
        userId: user.id,
        userEmail: user.profile.email,
        userName: `${user.profile.firstName} ${user.profile.lastName}`,
        groupId,
        groupName,
      });
      coreApi.callbacks.onResult?.({
        message: `Added ${user.profile.login} to ${groupName}`,
        type: 'success',
      });
    }

    return { success: result.success, error: result.error };
  };

  return {
    removeUserFromGroup,
    removeUserFromGroups,
    getAllGroupMembers,
    getMembershipRuleProof,
    addUserToGroup,
  };
}
