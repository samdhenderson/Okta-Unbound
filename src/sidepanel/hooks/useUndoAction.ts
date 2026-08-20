import { useCallback, useState } from 'react';
import { useOktaApi } from './useOktaApi';
import {
  logProfileUpdateAction,
  markActionUndone,
  type AttributeChange,
} from '../../shared/undoManager';
import { toDisplay } from '../components/users/profileAttributes';
import { createLogger } from '../../shared/utils/logger';
import type { ActionType, CapturedAttribute, UndoAction } from '../../shared/undoTypes';

const log = createLogger('useUndoAction');

const NOT_UNDOABLE: Record<Exclude<ActionType, 'UPDATE_USER_PROFILE'>, string> = {
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
  | { kind: 'undone'; restored: number; skipped: number; actionId: string }
  | { kind: 'not-undoable'; reason: string }
  | { kind: 'drifted'; attributeNames: readonly string[] }
  | { kind: 'already-undone' }
  | { kind: 'failed'; error: string };

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

export function useUndoAction({ targetTabId }: UseUndoActionOptions): UseUndoActionReturn {
  const api = useOktaApi({ targetTabId: targetTabId ?? null });
  const [undoingActionId, setUndoingActionId] = useState<string | null>(null);

  const undoability = useCallback<UseUndoActionReturn['undoability']>((action) => {
    if (action.status !== 'completed') {
      return { undoable: false, reason: STATUS_REASON[action.status] };
    }

    const metadata = action.metadata;
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

        return { kind: 'undone', restored: restorable.length, skipped, actionId: entry.id };
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
