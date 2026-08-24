import { useCallback, useEffect, useMemo } from 'react';
import type { AlertAction, AlertMessageData } from '../components/shared/AlertMessage';
import type { ProfileSaveModalProps } from '../components/users/ProfileSaveModal';
import type { ProfileEditControls } from '../components/users/UserProfilePaneHeader';
import type { AttributeDescriptor } from '../components/users/profileAttributes';
import {
  attributeEditability,
  type ProfileMastering,
} from '../components/users/profileEditability';
import type { RuleInventoryState } from '../../shared/membership/blastRadiusTypes';
import type { GroupMembership, OktaUser } from '../../shared/types';
import { getUndoHistory } from '../../shared/undoManager';
import type { UndoAction } from '../../shared/undoTypes';
import { userDisplayName } from '../../shared/utils/userDisplay';
import { useBlastRadius } from './useBlastRadius';
import { useOktaApi } from './useOktaApi';
import { useProfileEdit, type AttributeEditCell } from './useProfileEdit';
import { useUndoAction } from './useUndoAction';

export interface UserProfileEditing {
  controls: ProfileEditControls;
  cells: Readonly<Record<string, AttributeEditCell>>;
  save: Omit<ProfileSaveModalProps, 'userName'>;
}

function attributeCountLabel(count: number): string {
  return count === 1 ? '1 attribute' : `${count} attributes`;
}

function hasEditableAttribute(
  attributes: readonly AttributeDescriptor[],
  user: OktaUser,
  mastering: ProfileMastering | undefined,
): boolean {
  const verdicts = new Map<string, boolean>();

  for (const attribute of attributes) {
    const editable = attributeEditability(attribute, user, mastering).editable;
    const existing = verdicts.get(attribute.name);
    verdicts.set(attribute.name, existing === undefined ? editable : existing && editable);
  }

  for (const editable of verdicts.values()) {
    if (editable) return true;
  }
  return false;
}

async function recordedSave(userId: string): Promise<UndoAction | null> {
  const history = await getUndoHistory();
  const newest = history.actions[0];

  if (!newest || newest.status !== 'completed') return null;
  if (newest.metadata.type !== 'UPDATE_USER_PROFILE') return null;
  if (newest.metadata.userId !== userId) return null;
  if (newest.metadata.undoOfActionId !== undefined) return null;

  return newest;
}

export interface UseUsersTabProfileEditOptions {
  user: OktaUser | null;
  attributes: readonly AttributeDescriptor[];
  memberships: GroupMembership[];
  rules: RuleInventoryState;
  oktaOrigin?: string | null;
  mastering?: ProfileMastering;
  targetTabId: number | undefined;
  enabled: boolean;
  onUserUpdated: (user: OktaUser) => void;
  onResult: (message: AlertMessageData, action?: AlertAction) => void;
}

export function useUsersTabProfileEdit({
  user,
  attributes,
  memberships,
  rules,
  mastering,
  targetTabId,
  enabled,
  onUserUpdated,
  onResult,
  oktaOrigin,
}: UseUsersTabProfileEditOptions): UserProfileEditing {
  const edit = useProfileEdit({ user, attributes, targetTabId, onUserUpdated, enabled, mastering });
  const blast = useBlastRadius({ user, memberships, rules, oktaOrigin });
  const { undo } = useUndoAction({ targetTabId });
  const { getUserRaw } = useOktaApi({ targetTabId: targetTabId ?? null });

  const { draftPatch, pendingSave, confirmSave } = edit;
  const { reset: resetReport, analyze, report, isAnalyzing } = blast;

  useEffect(() => {
    resetReport();
  }, [draftPatch, resetReport]);

  const canEdit = useMemo(
    () => (user === null ? false : hasEditableAttribute(attributes, user, mastering)),
    [attributes, user, mastering],
  );

  const runUndo = useCallback(
    async (action: UndoAction, userId: string): Promise<void> => {
      onResult({ type: 'info', text: 'Putting the previous values back…' });

      const outcome = await undo(action);

      switch (outcome.kind) {
        case 'undone': {
          const restored = await getUserRaw(userId);
          if (restored) onUserUpdated(restored);

          const text =
            outcome.skipped > 0
              ? `Put back ${attributeCountLabel(outcome.restored)}. ` +
                `${attributeCountLabel(outcome.skipped)} had no previous value recorded, so ${
                  outcome.skipped === 1 ? 'it was' : 'they were'
                } left alone.`
              : `Put back ${attributeCountLabel(outcome.restored)}.`;
          onResult({ type: 'success', text });
          return;
        }
        case 'drifted':
          onResult({
            type: 'warning',
            text:
              'Nothing was put back: these attributes have changed since that edit, so restoring ' +
              `them would overwrite someone else's change — ${outcome.attributeNames.join(', ')}.`,
          });
          return;
        case 'already-undone':
          onResult({ type: 'info', text: 'That change has already been undone.' });
          return;
        case 'not-undoable':
          onResult({ type: 'warning', text: outcome.reason });
          return;
        case 'failed':
          onResult({ type: 'danger', text: outcome.error });
          return;
      }
    },
    [undo, onResult, getUserRaw, onUserUpdated],
  );

  const handleConfirmSave = useCallback(async (): Promise<void> => {
    const count = pendingSave?.length ?? 0;
    const outcome = await confirmSave();

    if (outcome.kind === 'failed') {
      onResult({ type: 'danger', text: outcome.error });
      return;
    }

    if (outcome.kind === 'unknown') {
      onResult({
        type: 'warning',
        text: 'The result of this change is unknown. Reload to check.',
      });
      return;
    }

    const saved = outcome.user;
    const message: AlertMessageData = {
      type: 'success',
      text: `Saved ${attributeCountLabel(count)} on ${userDisplayName(saved)}.`,
    };

    const recorded = await recordedSave(saved.id);
    if (!recorded) {
      onResult(message);
      return;
    }

    onResult(message, {
      label: 'Undo',
      onClick: () => {
        void runUndo(recorded, saved.id);
      },
    });
  }, [pendingSave, confirmSave, onResult, runUndo]);

  return useMemo(
    () => ({
      controls: {
        canEdit,
        isEditing: edit.isEditing,
        changeCount: edit.changes.length,
        hasInvalid: edit.hasInvalid,
        onBeginEdit: edit.begin,
        onCancelEdit: edit.cancel,
        onSave: edit.requestSave,
      },
      cells: edit.cells,
      save: {
        changes: pendingSave,
        onCancel: edit.dismissSave,
        onConfirm: () => {
          void handleConfirmSave();
        },
        isSaving: edit.isSaving,
        report,
        onAnalyze: () => analyze(draftPatch),
        isAnalyzing,
      },
    }),
    [
      canEdit,
      edit.isEditing,
      edit.changes.length,
      edit.hasInvalid,
      edit.begin,
      edit.cancel,
      edit.requestSave,
      edit.cells,
      edit.dismissSave,
      edit.isSaving,
      pendingSave,
      handleConfirmSave,
      report,
      analyze,
      draftPatch,
      isAnalyzing,
    ],
  );
}
