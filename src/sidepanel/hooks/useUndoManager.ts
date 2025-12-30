import { useState, useEffect, useCallback } from 'react';
import type {
  UndoAction,
  UndoActionMetadata,
  UndoResult,
  BulkRemoveUsersMetadata,
  BulkAddUsersMetadata,
  ConvertUserToGroupAssignmentMetadata,
} from '../../shared/undoTypes';
import {
  getUndoableActions,
  logAction,
  markActionAsUndone,
  markActionAsFailed,
  markActionAsPartial,
  clearUndoHistory,
  updateSubItemStatus,
  getRemainingSubItems,
} from '../../shared/undoManager';
import type { MessageRequest, MessageResponse } from '../../shared/types';

export interface BulkUndoProgress {
  current: number;
  total: number;
  succeeded: number;
  failed: number;
  currentUserName?: string;
}

export interface UseUndoManagerReturn {
  undoableActions: UndoAction[];
  isLoading: boolean;
  error: string | null;
  bulkProgress: BulkUndoProgress | null;
  refreshUndoHistory: () => Promise<void>;
  performUndo: (
    action: UndoAction,
    targetTabId: number,
    onProgress?: (progress: BulkUndoProgress) => void,
  ) => Promise<UndoResult>;
  logNewAction: (description: string, metadata: UndoActionMetadata) => Promise<UndoAction>;
  clearHistory: () => Promise<void>;
}

export function useUndoManager(): UseUndoManagerReturn {
  const [undoableActions, setUndoableActions] = useState<UndoAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<BulkUndoProgress | null>(null);

  const refreshUndoHistory = useCallback(async () => {
    try {
      const actions = await getUndoableActions();
      setUndoableActions(actions);
    } catch (err) {
      console.error('[useUndoManager] Failed to load undo history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load undo history');
    }
  }, []);

  useEffect(() => {
    refreshUndoHistory();
  }, [refreshUndoHistory]);

  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.undoHistory) {
        console.log('[useUndoManager] Undo history changed, refreshing');
        refreshUndoHistory();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [refreshUndoHistory]);

  const performUndo = useCallback(
    async (
      action: UndoAction,
      targetTabId: number,
      onProgress?: (progress: BulkUndoProgress) => void,
    ): Promise<UndoResult> => {
      setIsLoading(true);
      setError(null);
      setBulkProgress(null);

      try {
        console.log('[useUndoManager] Performing undo for action:', action.id, action.type);

        if (action.type === 'BULK_REMOVE_USERS_FROM_GROUP') {
          const metadata = action.metadata as BulkRemoveUsersMetadata;
          if (metadata.type !== 'BULK_REMOVE_USERS_FROM_GROUP') {
            throw new Error('Invalid metadata for BULK_REMOVE_USERS_FROM_GROUP action');
          }

          const { users, groupId } = metadata;
          let succeeded = 0;
          let failed = 0;

          for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const progress: BulkUndoProgress = {
              current: i + 1,
              total: users.length,
              succeeded,
              failed,
              currentUserName: user.userName,
            };
            setBulkProgress(progress);
            onProgress?.(progress);

            try {
              const response: MessageResponse = await chrome.tabs.sendMessage(targetTabId, {
                action: 'makeApiRequest',
                endpoint: `/api/v1/groups/${groupId}/users/${user.userId}`,
                method: 'PUT',
              });

              if (response.success) {
                succeeded++;
              } else {
                console.warn(
                  `[useUndoManager] Failed to restore user ${user.userEmail}:`,
                  response.error,
                );
                failed++;
              }
            } catch (err) {
              console.warn(`[useUndoManager] Error restoring user ${user.userEmail}:`, err);
              failed++;
            }

            if (i < users.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }

          const finalProgress: BulkUndoProgress = {
            current: users.length,
            total: users.length,
            succeeded,
            failed,
          };
          setBulkProgress(finalProgress);
          onProgress?.(finalProgress);

          if (failed === 0) {
            await markActionAsUndone(action.id);
          } else if (succeeded === 0) {
            await markActionAsFailed(action.id);
          } else {
            await markActionAsPartial(action.id);
          }

          await refreshUndoHistory();

          return {
            success: failed === 0,
            error: failed > 0 ? `${failed} of ${users.length} users failed to restore` : undefined,
            actionUndone: action,
          };
        }

        if (action.type === 'BULK_ADD_USERS_TO_GROUP') {
          const metadata = action.metadata as BulkAddUsersMetadata;
          if (metadata.type !== 'BULK_ADD_USERS_TO_GROUP') {
            throw new Error('Invalid metadata for BULK_ADD_USERS_TO_GROUP action');
          }

          const { users, groupId } = metadata;
          let succeeded = 0;
          let failed = 0;

          for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const progress: BulkUndoProgress = {
              current: i + 1,
              total: users.length,
              succeeded,
              failed,
              currentUserName: user.userName,
            };
            setBulkProgress(progress);
            onProgress?.(progress);

            try {
              const response: MessageResponse = await chrome.tabs.sendMessage(targetTabId, {
                action: 'makeApiRequest',
                endpoint: `/api/v1/groups/${groupId}/users/${user.userId}`,
                method: 'DELETE',
              });

              if (response.success) {
                succeeded++;
              } else {
                console.warn(
                  `[useUndoManager] Failed to remove user ${user.userEmail}:`,
                  response.error,
                );
                failed++;
              }
            } catch (err) {
              console.warn(`[useUndoManager] Error removing user ${user.userEmail}:`, err);
              failed++;
            }

            if (i < users.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }

          const finalProgress: BulkUndoProgress = {
            current: users.length,
            total: users.length,
            succeeded,
            failed,
          };
          setBulkProgress(finalProgress);
          onProgress?.(finalProgress);

          if (failed === 0) {
            await markActionAsUndone(action.id);
          } else if (succeeded === 0) {
            await markActionAsFailed(action.id);
          } else {
            await markActionAsPartial(action.id);
          }

          await refreshUndoHistory();

          return {
            success: failed === 0,
            error: failed > 0 ? `${failed} of ${users.length} users failed to remove` : undefined,
            actionUndone: action,
          };
        }

        if (action.type === 'CONVERT_USER_TO_GROUP_ASSIGNMENT') {
          const metadata = action.metadata as ConvertUserToGroupAssignmentMetadata;
          if (metadata.type !== 'CONVERT_USER_TO_GROUP_ASSIGNMENT') {
            throw new Error('Invalid metadata for CONVERT_USER_TO_GROUP_ASSIGNMENT action');
          }

          const { userId, targetGroupId: _targetGroupId, apps, userAssignmentsRemoved } = metadata;

          const remainingSubItems = await getRemainingSubItems(action.id);
          const appsToUndo = apps.filter((app) =>
            remainingSubItems.some((si) => si.id === app.appId),
          );

          if (appsToUndo.length === 0) {
            return {
              success: true,
              error: 'All apps have already been undone',
              actionUndone: action,
            };
          }

          let succeeded = 0;
          let failed = 0;

          for (let i = 0; i < appsToUndo.length; i++) {
            const app = appsToUndo[i];
            const progress: BulkUndoProgress = {
              current: i + 1,
              total: appsToUndo.length,
              succeeded,
              failed,
              currentUserName: app.appName,
            };
            setBulkProgress(progress);
            onProgress?.(progress);

            try {
              if (userAssignmentsRemoved && app.profileData) {
                const assignResponse: MessageResponse = await chrome.tabs.sendMessage(targetTabId, {
                  action: 'makeApiRequest',
                  endpoint: `/api/v1/apps/${app.appId}/users/${userId}`,
                  method: 'POST',
                  body: {
                    id: userId,
                    scope: 'USER',
                    profile: app.profileData,
                  },
                });

                if (!assignResponse.success) {
                  console.warn(
                    `[useUndoManager] Failed to restore user assignment for ${app.appName}:`,
                    assignResponse.error,
                  );
                  failed++;
                  await updateSubItemStatus(action.id, app.appId, 'failed');
                  continue;
                }
              }

              succeeded++;
              await updateSubItemStatus(action.id, app.appId, 'undone');
            } catch (err) {
              console.warn(`[useUndoManager] Error undoing conversion for ${app.appName}:`, err);
              failed++;
              await updateSubItemStatus(action.id, app.appId, 'failed');
            }

            if (i < appsToUndo.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }

          const finalProgress: BulkUndoProgress = {
            current: appsToUndo.length,
            total: appsToUndo.length,
            succeeded,
            failed,
          };
          setBulkProgress(finalProgress);
          onProgress?.(finalProgress);

          if (failed === 0) {
            await markActionAsUndone(action.id);
          } else if (succeeded === 0) {
            await markActionAsFailed(action.id);
          } else {
            await markActionAsPartial(action.id);
          }

          await refreshUndoHistory();

          return {
            success: failed === 0,
            error:
              failed > 0
                ? `${failed} of ${appsToUndo.length} app conversions failed to undo`
                : undefined,
            actionUndone: action,
          };
        }

        let request: MessageRequest;

        switch (action.type) {
          case 'REMOVE_USER_FROM_GROUP': {
            const metadata = action.metadata;
            if (metadata.type !== 'REMOVE_USER_FROM_GROUP') {
              throw new Error('Invalid metadata for REMOVE_USER_FROM_GROUP action');
            }

            request = {
              action: 'makeApiRequest',
              endpoint: `/api/v1/groups/${metadata.groupId}/users/${metadata.userId}`,
              method: 'PUT',
            };
            break;
          }

          case 'ADD_USER_TO_GROUP': {
            const metadata = action.metadata;
            if (metadata.type !== 'ADD_USER_TO_GROUP') {
              throw new Error('Invalid metadata for ADD_USER_TO_GROUP action');
            }

            request = {
              action: 'makeApiRequest',
              endpoint: `/api/v1/groups/${metadata.groupId}/users/${metadata.userId}`,
              method: 'DELETE',
            };
            break;
          }

          case 'ACTIVATE_RULE': {
            const metadata = action.metadata;
            if (metadata.type !== 'ACTIVATE_RULE') {
              throw new Error('Invalid metadata for ACTIVATE_RULE action');
            }

            request = {
              action: 'deactivateRule',
              ruleId: metadata.ruleId,
            };
            break;
          }

          case 'DEACTIVATE_RULE': {
            const metadata = action.metadata;
            if (metadata.type !== 'DEACTIVATE_RULE') {
              throw new Error('Invalid metadata for DEACTIVATE_RULE action');
            }

            request = {
              action: 'activateRule',
              ruleId: metadata.ruleId,
            };
            break;
          }

          default:
            throw new Error(`Unknown action type: ${action.type}`);
        }

        const response: MessageResponse = await chrome.tabs.sendMessage(targetTabId, request);

        if (response.success) {
          await markActionAsUndone(action.id);
          await refreshUndoHistory();

          console.log('[useUndoManager] Successfully undone action:', action.id);

          return {
            success: true,
            actionUndone: action,
          };
        } else {
          await markActionAsFailed(action.id);
          throw new Error(response.error || 'Undo operation failed');
        }
      } catch (err) {
        console.error('[useUndoManager] Failed to perform undo:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to undo action';
        setError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
        setBulkProgress(null);
      }
    },
    [refreshUndoHistory],
  );

  const logNewAction = useCallback(
    async (description: string, metadata: UndoActionMetadata): Promise<UndoAction> => {
      const action = await logAction(description, metadata);
      await refreshUndoHistory();
      return action;
    },
    [refreshUndoHistory],
  );

  const clearHistory = useCallback(async () => {
    await clearUndoHistory();
    await refreshUndoHistory();
  }, [refreshUndoHistory]);

  return {
    undoableActions,
    isLoading,
    error,
    bulkProgress,
    refreshUndoHistory,
    performUndo,
    logNewAction,
    clearHistory,
  };
}
