import { useCallback } from 'react';
import type { FormattedRule, AuditLogEntry } from '../../shared/types';
import { logAction } from '../../shared/undoManager';
import { auditStore } from '../../shared/storage/auditStore';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('RulesTab');

type LifecycleKind = 'activate' | 'deactivate';

const LIFECYCLE = {
  activate: {
    action: 'activateRule' as const,
    auditAction: 'activate_rule' as const,
    undoType: 'ACTIVATE_RULE' as const,
    gerund: 'Activating',
    verbPast: 'Activated',
    failMessage: 'Failed to activate rule',
    errorLog: 'Activation error:',
  },
  deactivate: {
    action: 'deactivateRule' as const,
    auditAction: 'deactivate_rule' as const,
    undoType: 'DEACTIVATE_RULE' as const,
    gerund: 'Deactivating',
    verbPast: 'Deactivated',
    failMessage: 'Failed to deactivate rule',
    errorLog: 'Deactivation error:',
  },
};

interface UseRuleLifecycleOptions {
  targetTabId?: number;
  rules: FormattedRule[];
  reload: () => Promise<void>;
  onError: (message: string) => void;
}

interface UseRuleLifecycleReturn {
  activateRule: (ruleId: string) => Promise<void>;
  deactivateRule: (ruleId: string) => Promise<void>;
}

export function useRuleLifecycle({
  targetTabId,
  rules,
  reload,
  onError,
}: UseRuleLifecycleOptions): UseRuleLifecycleReturn {
  const runLifecycle = useCallback(
    async (ruleId: string, kind: LifecycleKind) => {
      if (!targetTabId) return;

      const cfg = LIFECYCLE[kind];
      const startTime = Date.now();
      let currentUserEmail = 'unknown@unknown.com';

      try {
        log.debug(`${cfg.gerund} rule:`, ruleId);

        try {
          const userResponse = await chrome.tabs.sendMessage(targetTabId, {
            action: 'makeApiRequest',
            endpoint: '/api/v1/users/me',
            method: 'GET',
          });
          if (userResponse.success && userResponse.data) {
            currentUserEmail = userResponse.data.profile?.email || 'unknown@unknown.com';
          }
        } catch (err) {
          log.error('Failed to get current user:', err);
        }

        const rule = rules.find((r) => r.id === ruleId);
        const ruleName = rule?.name || 'Unknown Rule';
        const groupIds = rule?.groupIds || [];
        const groupNames = rule?.groupNames || [];

        const response = await chrome.tabs.sendMessage(targetTabId, {
          action: cfg.action,
          ruleId,
        });

        if (response.success) {
          await logAction(`${cfg.verbPast} rule: ${ruleName}`, {
            type: cfg.undoType,
            ruleId,
            ruleName,
          });

          const auditEntry: AuditLogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            action: cfg.auditAction,
            groupId: groupIds[0] || 'multiple',
            groupName: groupNames.length > 0 ? groupNames.join(', ') : ruleName,
            performedBy: currentUserEmail,
            affectedUsers: [],
            result: 'success',
            details: {
              usersSucceeded: 0,
              usersFailed: 0,
              apiRequestCount: 1,
              durationMs: Date.now() - startTime,
            },
          };
          auditStore.logOperation(auditEntry).catch((err) => {
            log.error('Failed to log audit entry:', err);
          });

          await reload();
        } else {
          onError(response.error || cfg.failMessage);

          const auditEntry: AuditLogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            action: cfg.auditAction,
            groupId: groupIds[0] || 'multiple',
            groupName: groupNames.length > 0 ? groupNames.join(', ') : ruleName,
            performedBy: currentUserEmail,
            affectedUsers: [],
            result: 'failed',
            details: {
              usersSucceeded: 0,
              usersFailed: 0,
              apiRequestCount: 1,
              durationMs: Date.now() - startTime,
              errorMessages: [response.error || 'Unknown error'],
            },
          };
          auditStore.logOperation(auditEntry).catch((err) => {
            log.error('Failed to log audit entry:', err);
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        onError(message || cfg.failMessage);
        log.error(cfg.errorLog, err);

        const rule = rules.find((r) => r.id === ruleId);
        const groupIds = rule?.groupIds || [];
        const groupNames = rule?.groupNames || [];
        const auditEntry: AuditLogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          action: cfg.auditAction,
          groupId: groupIds[0] || 'unknown',
          groupName: groupNames.length > 0 ? groupNames.join(', ') : 'Unknown',
          performedBy: currentUserEmail,
          affectedUsers: [],
          result: 'failed',
          details: {
            usersSucceeded: 0,
            usersFailed: 0,
            apiRequestCount: 1,
            durationMs: Date.now() - startTime,
            errorMessages: [message || 'Unknown error'],
          },
        };
        auditStore.logOperation(auditEntry).catch((e) => {
          log.error('Failed to log audit entry:', e);
        });
      }
    },
    [targetTabId, rules, reload, onError],
  );

  const activateRule = useCallback(
    (ruleId: string) => runLifecycle(ruleId, 'activate'),
    [runLifecycle],
  );
  const deactivateRule = useCallback(
    (ruleId: string) => runLifecycle(ruleId, 'deactivate'),
    [runLifecycle],
  );

  return { activateRule, deactivateRule };
}
