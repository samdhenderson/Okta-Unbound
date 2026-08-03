import type { CoreApi } from './core';
import type { OktaUser } from './types';
import type { BatchOutcome } from '@/shared/scheduler/runBatch';
import { logAction } from '../../../shared/undoManager';
import { fetchAllPages, OKTA_PAGE_SIZE } from '@/shared/utils/oktaPagination';
import { oktaUserListItemSchema, type OktaUserListItem } from '@/shared/schemas/okta';

export function createGroupMemberOperations(coreApi: CoreApi) {
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

    const allMembers: OktaUser[] = await fetchAllPages<OktaUserListItem>(
      (url) => coreApi.makeApiRequest(url),
      `/api/v1/groups/${groupId}/users?limit=${OKTA_PAGE_SIZE}`,
      {
        schema: oktaUserListItemSchema,
        errorMessage: 'Failed to fetch group members',
        onBeforePage: (pageNumber) => {
          pageCount = pageNumber;
          coreApi.callbacks.onResult?.(`Fetching page ${pageNumber}...`, 'info');
        },
        onPage: (pageMembers, totalSoFar) => {
          coreApi.callbacks.onResult?.(
            `Page ${pageCount}: Loaded ${pageMembers.length} members (Total: ${totalSoFar})`,
            'info',
          );
        },
      },
    );

    coreApi.callbacks.onResult?.(`Loaded ${allMembers.length} total members`, 'success');
    return allMembers;
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
      await logAction(`Added ${user.profile.firstName} ${user.profile.lastName} to ${groupName}`, {
        type: 'ADD_USER_TO_GROUP',
        userId: user.id,
        userEmail: user.profile.email,
        userName: `${user.profile.firstName} ${user.profile.lastName}`,
        groupId,
        groupName,
      });
      coreApi.callbacks.onResult?.(`Added ${user.profile.login} to ${groupName}`, 'success');
    }

    return { success: result.success, error: result.error };
  };

  return {
    removeUserFromGroup,
    removeUserFromGroups,
    getAllGroupMembers,
    addUserToGroup,
  };
}
