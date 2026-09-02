import { useCallback, useState } from 'react';
import type { GroupSummary, AuditLogEntry, OktaUser } from '../../shared/types';
import type { BatchOutcome } from '../../shared/scheduler/runBatch';
import type { AlertMessageData } from '../components/shared/AlertMessage';
import { useOktaApi } from './useOktaApi';
import { useActorNotice } from './useActorNotice';
import { useProgress } from '../contexts/ProgressContext';
import { logAction } from '../../shared/undoManager';
import { auditStore } from '../../shared/storage/auditStore';
import {
  planGroupMerge,
  type MergePlan,
  type MergeFeedingRule,
} from '../../shared/membership/mergePlan';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useGroupMerge');

export type MergePhase = 'idle' | 'preview-loading' | 'preview' | 'running' | 'done' | 'error';

export interface MergeResults {
  copied: number;
  copyFailed: number;
  removed: number;
  removeFailed: number;
}

export interface UseGroupMergeReturn {
  phase: MergePhase;
  plan: MergePlan | null;
  results: MergeResults | null;
  error: string | null;
  actorNotice: AlertMessageData | null;
  dismissActorNotice: () => void;
  preview: (survivor: GroupSummary, sources: GroupSummary[]) => Promise<void>;
  execute: () => Promise<void>;
  reset: () => void;
}

function toBulkUserInfo(u: OktaUser) {
  return {
    userId: u.id,
    userEmail: u.profile.email,
    userName: `${u.profile.firstName} ${u.profile.lastName}`.trim(),
  };
}

class MergeWriteRejectedError extends Error {
  constructor(message = 'Membership write rejected') {
    super(message);
    this.name = 'MergeWriteRejectedError';
    Object.setPrototypeOf(this, MergeWriteRejectedError.prototype);
  }
}

function settledUsers(outcome: BatchOutcome<OktaUser, OktaUser>): OktaUser[] {
  return outcome.results.filter((r) => r.status === 'fulfilled').map((r) => r.item);
}

function rejectedByOkta(outcome: BatchOutcome<OktaUser, OktaUser>): number {
  return outcome.results.filter((r) => r.error instanceof MergeWriteRejectedError).length;
}

function rethrowFatal(outcome: BatchOutcome<OktaUser, OktaUser>): void {
  const fatal = outcome.results.find(
    (r) => r.status === 'rejected' && !(r.error instanceof MergeWriteRejectedError),
  );
  if (fatal) throw fatal.error;
}

export function useGroupMerge(targetTabId?: number): UseGroupMergeReturn {
  const api = useOktaApi({ targetTabId: targetTabId ?? null });
  const {
    getAllGroupMembers,
    getGroupRulesForGroup,
    getCurrentUser,
    makeApiRequest,
    removeUserFromGroup,
    runOperation,
  } = api;
  const { completeProgress } = useProgress();
  const { actorNotice, noteActor, dismissActorNotice } = useActorNotice();

  const [phase, setPhase] = useState<MergePhase>('idle');
  const [plan, setPlan] = useState<MergePlan | null>(null);
  const [results, setResults] = useState<MergeResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = useCallback(
    async (survivor: GroupSummary, sources: GroupSummary[]) => {
      setPhase('preview-loading');
      setError(null);
      setResults(null);
      try {
        const groups = [survivor, ...sources];
        const membersByGroup = new Map<string, OktaUser[]>();
        const feedingRulesByGroup = new Map<string, MergeFeedingRule[]>();

        for (const g of groups) {
          membersByGroup.set(g.id, await getAllGroupMembers(g.id, { memberCount: g.memberCount }));
        }
        for (const s of sources) {
          const rules = await getGroupRulesForGroup(s.id);
          feedingRulesByGroup.set(
            s.id,
            rules.map((r) => ({ name: r.name, status: r.status })),
          );
        }

        const built = planGroupMerge(
          { id: survivor.id, name: survivor.name },
          sources.map((s) => ({ id: s.id, name: s.name })),
          membersByGroup,
          feedingRulesByGroup,
        );
        setPlan(built);
        setPhase('preview');
      } catch (err) {
        log.error('Merge preview failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to build merge preview');
        setPhase('error');
      }
    },
    [getAllGroupMembers, getGroupRulesForGroup],
  );

  const execute = useCallback(async () => {
    if (!plan || plan.blocked) return;
    setPhase('running');
    setError(null);

    const startTime = Date.now();
    const res: MergeResults = { copied: 0, copyFailed: 0, removed: 0, removeFailed: 0 };

    const actor = await getCurrentUser();
    noteActor(actor);

    const finish = (cancelledMessage?: string) => {
      const auditBase = {
        performedBy: actor.kind === 'resolved' ? actor.email : null,
        actorResolution:
          actor.kind === 'resolved' ? ('resolved' as const) : ('unavailable' as const),
        affectedUsers: [] as string[],
      };
      const addEntry: AuditLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        action: 'add_users',
        groupId: plan.survivor.id,
        groupName: plan.survivor.name,
        ...auditBase,
        result: res.copyFailed === 0 ? 'success' : res.copied > 0 ? 'partial' : 'failed',
        details: {
          usersSucceeded: res.copied,
          usersFailed: res.copyFailed,
          apiRequestCount: plan.totalCopies,
          durationMs: Date.now() - startTime,
        },
      };
      const removeEntry: AuditLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        action: 'remove_users',
        groupId: plan.sources.length === 1 ? plan.sources[0].id : 'multiple',
        groupName: plan.sources.map((s) => s.name).join(', '),
        ...auditBase,
        result: res.removeFailed === 0 ? 'success' : res.removed > 0 ? 'partial' : 'failed',
        details: {
          usersSucceeded: res.removed,
          usersFailed: res.removeFailed,
          apiRequestCount: plan.totalRemovals,
          durationMs: Date.now() - startTime,
        },
      };
      auditStore.logOperation(addEntry).catch((e) => log.error('audit add failed', e));
      auditStore.logOperation(removeEntry).catch((e) => log.error('audit remove failed', e));

      setResults(res);
      if (cancelledMessage) {
        setError(cancelledMessage);
        setPhase('error');
        return;
      }
      setPhase('done');
    };

    try {
      const copyOutcome = await runOperation<OktaUser, OktaUser>(
        'Merging groups',
        plan.toCopy,
        async (user, _index, planId) => {
          const result = await makeApiRequest(
            `/api/v1/groups/${plan.survivor.id}/users/${user.id}`,
            {
              method: 'PUT',
              reason: 'Merge groups: copy member into survivor',
              planId,
            },
          );
          if (!result.success) throw new MergeWriteRejectedError(result.error);
          return user;
        },
        {
          stopOnError: (error) => !(error instanceof MergeWriteRejectedError),
          message: (p) => `Copied ${p.completed}/${p.total} into ${plan.survivor.name}`,
          plan: { endpoint: '/api/v1/groups', method: 'PUT' },
        },
      );
      const copiedUsers = settledUsers(copyOutcome);
      res.copied = copiedUsers.length;
      res.copyFailed = rejectedByOkta(copyOutcome);
      rethrowFatal(copyOutcome);

      if (copiedUsers.length > 0) {
        await logAction(
          `Merged ${copiedUsers.length} member${copiedUsers.length === 1 ? '' : 's'} into ${plan.survivor.name}`,
          {
            type: 'BULK_ADD_USERS_TO_GROUP',
            users: copiedUsers.map(toBulkUserInfo),
            groupId: plan.survivor.id,
            groupName: plan.survivor.name,
          },
        );
      }

      if (copyOutcome.cancelled) {
        finish('Merge cancelled. The source groups were not emptied.');
        return;
      }

      for (const source of plan.sources) {
        const removeOutcome = await runOperation<OktaUser, OktaUser>(
          'Merging groups',
          source.membersToRemove,
          async (user, _index, planId) => {
            const result = await removeUserFromGroup(source.id, source.name, user, true, planId);
            if (!result.success) throw new MergeWriteRejectedError(result.error);
            return user;
          },
          {
            stopOnError: (error) => !(error instanceof MergeWriteRejectedError),
            message: () => `Emptying ${source.name}…`,
            plan: { endpoint: '/api/v1/groups', method: 'DELETE' },
          },
        );
        const removedUsers = settledUsers(removeOutcome);
        res.removed += removedUsers.length;
        res.removeFailed += rejectedByOkta(removeOutcome);
        rethrowFatal(removeOutcome);

        if (removedUsers.length > 0) {
          await logAction(
            `Emptied ${removedUsers.length} member${removedUsers.length === 1 ? '' : 's'} from ${source.name} (merge into ${plan.survivor.name})`,
            {
              type: 'BULK_REMOVE_USERS_FROM_GROUP',
              users: removedUsers.map(toBulkUserInfo),
              groupId: source.id,
              groupName: source.name,
              operationType: 'custom_status',
            },
          );
        }

        if (removeOutcome.cancelled) {
          finish(
            `Merge cancelled. ${source.name} was not fully emptied, and any later source group was left untouched.`,
          );
          return;
        }
      }

      finish();
    } catch (err) {
      log.error('Merge execution failed:', err);
      setError(err instanceof Error ? err.message : 'Merge failed');
      setResults(res);
      setPhase('error');
    } finally {
      completeProgress();
    }
  }, [
    plan,
    getCurrentUser,
    noteActor,
    makeApiRequest,
    removeUserFromGroup,
    runOperation,
    completeProgress,
  ]);

  const reset = useCallback(() => {
    setPhase('idle');
    setPlan(null);
    setResults(null);
    setError(null);
    dismissActorNotice();
  }, [dismissActorNotice]);

  return {
    phase,
    plan,
    results,
    error,
    actorNotice,
    dismissActorNotice,
    preview,
    execute,
    reset,
  };
}
