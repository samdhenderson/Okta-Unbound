import { useCallback, useState } from 'react';
import { useOktaApi } from './useOktaApi';
import {
  logBulkProfileUpdateAction,
  logProfileUpdateAction,
  markActionUndone,
  type AttributeChange,
  type BulkProfileChange,
} from '../../shared/undoManager';
import { toDisplay } from '../components/users/profileAttributes';
import { createLogger } from '../../shared/utils/logger';
import type {
  ActionType,
  BulkProfileUserCapture,
  BulkUpdateUserProfileMetadata,
  CapturedAttribute,
  UndoAction,
} from '../../shared/undoTypes';

const log = createLogger('useUndoAction');

const NOT_UNDOABLE: Record<
  Exclude<ActionType, 'UPDATE_USER_PROFILE' | 'BULK_UPDATE_USER_PROFILE'>,
  string
> = {
  REMOVE_USER_FROM_GROUP:
    'Group removals cannot be undone here. Re-adding the user would record a direct membership, ' +
    'which is not necessarily how they held the group before.',
  ADD_USER_TO_GROUP:
    'Group additions cannot be undone here. Removing the user again could strip access a rule has ' +
    'since granted independently.',
  BULK_REMOVE_USERS_FROM_GROUP:
    'Bulk removals cannot be undone here. Re-adding every user is a new bulk operation with its ' +
    'own cost and confirmation, not a restore.',
  BULK_ADD_USERS_TO_GROUP:
    'Bulk additions cannot be undone here. Removing every user again is a new bulk operation with ' +
    'its own cost and confirmation, not a restore.',
  ACTIVATE_RULE:
    'Rule activations cannot be undone here. Deactivating the rule does not recall the memberships ' +
    'it granted while it was active.',
  DEACTIVATE_RULE:
    'Rule deactivations cannot be undone here. Reactivating the rule re-evaluates it against every ' +
    'user, which is a new operation rather than a restore.',
  CONSOLIDATE_RULE:
    'Consolidations cannot be undone here. It would mean recreating the retired rules and deleting ' +
    'the rule that replaced them, all under new ids.',
  CHANGE_USER_PASSWORD:
    'Password changes cannot be undone. Okta never returns a password, so no previous value was ' +
    'captured and none can be restored — set a new one instead.',
};

const STATUS_REASON: Record<Exclude<UndoAction['status'], 'completed'>, string> = {
  undone: 'This action has already been undone.',
  failed: 'This action failed, so there is nothing to put back.',
  partial:
    'This write was never confirmed, so we do not know which values it actually set — and ' +
    'therefore cannot know what to restore.',
};

const NOTHING_CAPTURED =
  'No previous values were captured for this edit, so there is nothing to restore.';

export type UndoOutcome =
  | {
      kind: 'undone';
      restored: number;
      skipped: number;
      unit: 'attribute' | 'user';
      actionId: string;
    }
  | { kind: 'not-undoable'; reason: string }
  | { kind: 'drifted'; attributeNames: readonly string[] }
  | { kind: 'already-undone' }
  | { kind: 'failed'; error: string };

const NOTHING_CAPTURED_BULK =
  'No previous values were captured for this run, so there is nothing to restore.';

const RESTORE_HAS_NO_UNDO =
  'This entry restored each user to their own previous value, so there is no single value to check against and no undo to offer. Run the verb again to set them all afresh.';

type UndoApi = ReturnType<typeof useOktaApi>;

export interface UseUndoActionOptions {
  targetTabId: number | null | undefined;
}

export interface UseUndoActionReturn {
  undo: (action: UndoAction) => Promise<UndoOutcome>;
  undoingActionId: string | null;
  undoability: (
    action: UndoAction,
  ) => { undoable: true; restorable: number; total: number } | { undoable: false; reason: string };
}

interface RestorableChange {
  name: string;
  label: string;
  beforeDisplay: string;
  beforeRaw: unknown;
  afterDisplay: string;
}

function restorableChanges(changes: readonly CapturedAttribute[]): RestorableChange[] {
  const restorable: RestorableChange[] = [];
  for (const change of changes) {
    if (!change.restorable || change.beforeDisplay === undefined) continue;
    restorable.push({
      name: change.name,
      label: change.label,
      beforeDisplay: change.beforeDisplay,
      beforeRaw: change.beforeRaw,
      afterDisplay: change.afterDisplay,
    });
  }
  return restorable;
}

function restorableUsers(
  metadata: BulkUpdateUserProfileMetadata,
): (BulkProfileUserCapture & { beforeRaw: unknown })[] {
  return metadata.users.filter(
    (user): user is BulkProfileUserCapture & { beforeRaw: unknown } =>
      user.restorable && 'beforeRaw' in user,
  );
}

async function undoBulkProfileRun(
  api: UndoApi,
  action: UndoAction,
  metadata: BulkUpdateUserProfileMetadata,
): Promise<UndoOutcome> {
  const afterDisplay = metadata.afterDisplay;
  if (afterDisplay === undefined) return { kind: 'not-undoable', reason: RESTORE_HAS_NO_UNDO };

  const restorable = restorableUsers(metadata);
  const skipped = metadata.users.length - restorable.length + metadata.unconfirmedUserIds.length;

  const live = new Map<string, Record<string, unknown>>();
  const unreadable: string[] = [];
  await api.runOperation(
    'Re-read users before undo',
    [...restorable],
    async (user) => {
      const fresh = await api.getUserRaw(user.userId);
      if (fresh) live.set(user.userId, fresh.profile as Record<string, unknown>);
      else unreadable.push(user.userId);
    },
    { plan: { endpoint: '/api/v1/users', method: 'GET' } },
  );

  if (unreadable.length > 0) {
    log.error('Undo refused: part of the cohort could not be re-read', {
      actionId: action.id,
      unreadableCount: unreadable.length,
    });
    return {
      kind: 'failed',
      error: `${unreadable.length} of ${restorable.length} users could not be read, so nothing was written back.`,
    };
  }

  const drifted = restorable.filter(
    (user) => toDisplay(live.get(user.userId)?.[metadata.attributeName]) !== afterDisplay,
  );

  if (drifted.length > 0) {
    log.info('Undo refused: the attribute changed on part of the cohort', {
      actionId: action.id,
      driftedCount: drifted.length,
    });
    return { kind: 'drifted', attributeNames: [metadata.attributeName] };
  }

  const saved: BulkProfileChange[] = [];
  const unconfirmed: string[] = [];
  let rejected = 0;
  await api.runOperation(
    'Restore previous values',
    [...restorable],
    async (user) => {
      const result = await api.updateUserProfile(user.userId, {
        [metadata.attributeName]: user.beforeRaw,
      });
      if (result.kind === 'saved') {
        saved.push({
          userId: user.userId,
          beforeRaw: live.get(user.userId)?.[metadata.attributeName],
          beforeDisplay: afterDisplay,
        });
        return;
      }
      if (result.kind === 'unknown') unconfirmed.push(user.userId);
      else rejected += 1;
    },
    { plan: { endpoint: '/api/v1/users', method: 'POST' } },
  );

  const landed = saved.length + unconfirmed.length;
  if (landed === 0) {
    log.error('Undo wrote nothing back', { actionId: action.id, rejected });
    return {
      kind: 'failed',
      error: `Okta rejected all ${rejected} restoring writes, so every user still holds the value the run set.`,
    };
  }

  const entry = await logBulkProfileUpdateAction(
    metadata.attributeName,
    metadata.attributeLabel,
    undefined,
    saved,
    {
      undoOfActionId: action.id,
      unconfirmedUserIds: unconfirmed,
      status: unconfirmed.length > 0 || rejected > 0 ? 'partial' : 'completed',
    },
  );

  if (rejected > 0 || unconfirmed.length > 0) {
    log.error('Undo did not restore the whole cohort', {
      actionId: action.id,
      restored: saved.length,
      unconfirmed: unconfirmed.length,
      rejected,
    });
    const parts = [`Restored ${saved.length} of ${restorable.length} users`];
    if (rejected > 0) parts.push(`Okta rejected ${rejected}`);
    if (unconfirmed.length > 0) {
      parts.push(
        `${unconfirmed.length} could not be confirmed and may or may not have been put back`,
      );
    }
    return { kind: 'failed', error: `${parts.join('; ')}.` };
  }

  const marked = await markActionUndone(action.id, entry.id);

  log.info('Bulk undo completed', {
    actionId: action.id,
    undoneByActionId: entry.id,
    restored: saved.length,
    skipped,
    originalStillInHistory: marked,
  });

  return { kind: 'undone', restored: saved.length, skipped, unit: 'user', actionId: entry.id };
}

export function useUndoAction({ targetTabId }: UseUndoActionOptions): UseUndoActionReturn {
  const api = useOktaApi({ targetTabId: targetTabId ?? null });
  const [undoingActionId, setUndoingActionId] = useState<string | null>(null);

  const undoability = useCallback<UseUndoActionReturn['undoability']>((action) => {
    if (action.status !== 'completed') {
      return { undoable: false, reason: STATUS_REASON[action.status] };
    }

    const metadata = action.metadata;
    if (metadata.type === 'BULK_UPDATE_USER_PROFILE') {
      if (metadata.afterDisplay === undefined) {
        return { undoable: false, reason: RESTORE_HAS_NO_UNDO };
      }
      const restorable = restorableUsers(metadata).length;
      if (restorable === 0) return { undoable: false, reason: NOTHING_CAPTURED_BULK };
      return {
        undoable: true,
        restorable,
        total: metadata.users.length + metadata.unconfirmedUserIds.length,
      };
    }

    if (metadata.type !== 'UPDATE_USER_PROFILE') {
      return { undoable: false, reason: NOT_UNDOABLE[metadata.type] };
    }

    const total = metadata.changes.length;
    const restorable = restorableChanges(metadata.changes).length;
    if (restorable === 0) {
      return { undoable: false, reason: NOTHING_CAPTURED };
    }

    return { undoable: true, restorable, total };
  }, []);

  const undo = useCallback<UseUndoActionReturn['undo']>(
    async (action) => {
      if (action.status === 'undone') return { kind: 'already-undone' };

      const verdict = undoability(action);
      if (!verdict.undoable) return { kind: 'not-undoable', reason: verdict.reason };

      const metadata = action.metadata;
      if (metadata.type === 'BULK_UPDATE_USER_PROFILE') {
        setUndoingActionId(action.id);
        try {
          return await undoBulkProfileRun(api, action, metadata);
        } catch {
          log.error('Bulk undo failed', { actionId: action.id });
          return { kind: 'failed', error: 'The previous values could not be written back.' };
        } finally {
          setUndoingActionId(null);
        }
      }

      if (metadata.type !== 'UPDATE_USER_PROFILE') {
        return { kind: 'not-undoable', reason: NOT_UNDOABLE[metadata.type] };
      }

      const restorable = restorableChanges(metadata.changes);
      const skipped = metadata.changes.length - restorable.length;

      setUndoingActionId(action.id);
      try {
        const live = await api.getUserRaw(metadata.userId);
        if (!live) {
          return {
            kind: 'failed',
            error: 'Could not read the user, so the previous values were not written back.',
          };
        }

        const drifted = restorable
          .filter((change) => toDisplay(live.profile[change.name]) !== change.afterDisplay)
          .map((change) => change.name);

        if (drifted.length > 0) {
          log.info('Undo refused: attributes changed since', {
            actionId: action.id,
            driftedCount: drifted.length,
          });
          return { kind: 'drifted', attributeNames: drifted };
        }

        const patch: Record<string, unknown> = {};
        for (const change of restorable) patch[change.name] = change.beforeRaw;

        const result = await api.updateUserProfile(metadata.userId, patch);

        const undoChanges: AttributeChange[] = restorable.map((change) => ({
          name: change.name,
          label: change.label,
          beforeDisplay: change.afterDisplay,
          beforeRaw: live.profile[change.name] as unknown,
          afterDisplay: change.beforeDisplay,
        }));

        if (result.kind !== 'saved') {
          if (result.kind === 'unknown') {
            await logProfileUpdateAction(
              metadata.userId,
              metadata.userLogin,
              metadata.userName,
              undoChanges,
              {
                undoOfActionId: action.id,
                originalAttributeCount: metadata.changes.length,
                status: 'partial',
              },
            );
          }
          log.error('Undo write did not succeed', { actionId: action.id, outcome: result.kind });
          return { kind: 'failed', error: result.error };
        }

        const entry = await logProfileUpdateAction(
          metadata.userId,
          metadata.userLogin,
          metadata.userName,
          undoChanges,
          { undoOfActionId: action.id, originalAttributeCount: metadata.changes.length },
        );

        const marked = await markActionUndone(action.id, entry.id);

        log.info('Undo completed', {
          actionId: action.id,
          undoneByActionId: entry.id,
          restored: restorable.length,
          skipped,
          originalStillInHistory: marked,
        });

        return {
          kind: 'undone',
          restored: restorable.length,
          skipped,
          unit: 'attribute',
          actionId: entry.id,
        };
      } catch {
        log.error('Undo failed', { actionId: action.id });
        return { kind: 'failed', error: 'The previous values could not be written back.' };
      } finally {
        setUndoingActionId(null);
      }
    },
    [api, undoability],
  );

  return { undo, undoingActionId, undoability };
}
