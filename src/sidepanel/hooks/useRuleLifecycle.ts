import { useCallback } from 'react';
import type { FormattedRule, AuditLogEntry } from '../../shared/types';
import type { Actor } from './useOktaApi/core';
import { logAction } from '../../shared/undoManager';
import { auditStore } from '../../shared/storage/auditStore';
import { createLogger } from '../../shared/utils/logger';
import { useOktaApi } from './useOktaApi';

const log = createLogger('RulesTab');

type LifecycleKind = 'activate' | 'deactivate';

const LIFECYCLE = {
  activate: {
    auditAction: 'activate_rule' as const,
    undoType: 'ACTIVATE_RULE' as const,
    gerund: 'Activating',
    verbPast: 'Activated',
    failMessage: 'Failed to activate rule',
    errorLog: 'Activation error:',
  },
  deactivate: {
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
  const { getCurrentUser, activateGroupRule, deactivateGroupRule } = useOktaApi({
    targetTabId: targetTabId ?? null,
  });

  const runLifecycle = useCallback(
    async (ruleId: string, kind: LifecycleKind) => {
      if (!targetTabId) return;

      const cfg = LIFECYCLE[kind];
      const startTime = Date.now();
      let actor: Actor | null = null;

      try {
        log.debug(`${cfg.gerund} rule:`, ruleId);

        actor = await getCurrentUser();

        const rule = rules.find((r) => r.id === ruleId);
        const ruleName = rule?.name || 'Unknown Rule';
        const groupIds = rule?.groupIds || [];
        const groupNames = rule?.groupNames || [];

        const response = await (kind === 'activate'
          ? activateGroupRule(ruleId)
          : deactivateGroupRule(ruleId));

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
            performedBy: actor?.kind === 'resolved' ? actor.email : null,
            actorResolution: actor?.kind === 'resolved' ? 'resolved' : 'unavailable',
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
            performedBy: actor?.kind === 'resolved' ? actor.email : null,
            actorResolution: actor?.kind === 'resolved' ? 'resolved' : 'unavailable',
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
          performedBy: actor?.kind === 'resolved' ? actor.email : null,
          actorResolution: actor?.kind === 'resolved' ? 'resolved' : 'unavailable',
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
    [targetTabId, rules, reload, onError, getCurrentUser, activateGroupRule, deactivateGroupRule],
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
