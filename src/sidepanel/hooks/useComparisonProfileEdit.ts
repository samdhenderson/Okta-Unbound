import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProfileEdit, type AttributeEditCell } from './useProfileEdit';
import { useBlastRadius } from './useBlastRadius';
import type { AttributeDescriptor } from '../components/users/profileAttributes';
import type { ProfileMastering } from '../components/users/profileEditability';
import type { DraftChange } from '../components/users/profileDraft';
import type {
  BlastRadiusReport,
  RuleInventoryState,
} from '../../shared/membership/blastRadiusTypes';
import type { GroupMembership, OktaUser } from '../../shared/types';

export type ComparisonEditSideKey = 'context' | 'compared';

export interface ComparisonEditMessage {
  readonly type: 'danger' | 'warning';
  readonly text: string;
}

export interface ComparisonEditSide {
  readonly key: ComparisonEditSideKey;
  readonly userName: string;
  readonly cells: Readonly<Record<string, AttributeEditCell>>;
  readonly isEditing: boolean;
  readonly isSaving: boolean;
  readonly hasChanges: boolean;
  readonly hasInvalid: boolean;
  readonly canEdit: boolean;
  readonly message?: ComparisonEditMessage;
  readonly begin: () => void;
  readonly cancel: () => void;
  readonly requestSave: () => void;
}

export interface ComparisonPendingSave {
  readonly side: ComparisonEditSideKey;
  readonly userName: string;
  readonly changes: readonly DraftChange[];
  readonly isSaving: boolean;
  readonly report: BlastRadiusReport;
  readonly isAnalyzing: boolean;
  readonly resolveGroupName: (groupId: string) => string | undefined;
  readonly error?: string;
  readonly analyze: () => void;
  readonly cancel: () => void;
  readonly confirm: () => void;
}

export interface UseComparisonProfileEditOptions {
  readonly contextUser: OktaUser;
  readonly contextName: string;
  readonly contextAttributes: readonly AttributeDescriptor[];
  readonly contextMastering: ProfileMastering;
  readonly contextMemberships: readonly GroupMembership[];
  readonly onContextUserUpdated?: (user: OktaUser) => void;
  readonly comparedUser: OktaUser | null;
  readonly comparedName: string;
  readonly comparedAttributes: readonly AttributeDescriptor[];
  readonly comparedMastering: ProfileMastering;
  readonly comparedMemberships: readonly GroupMembership[];
  readonly onComparedUserUpdated: (user: OktaUser) => void;
  readonly rules: RuleInventoryState;
  readonly oktaOrigin?: string | null;
  readonly targetTabId: number | undefined;
  readonly enabled: boolean;
}

export interface UseComparisonProfileEditReturn {
  readonly context: ComparisonEditSide;
  readonly compared: ComparisonEditSide;
  readonly pendingSave: ComparisonPendingSave | null;
}

interface SideOptions {
  readonly key: ComparisonEditSideKey;
  readonly user: OktaUser | null;
  readonly userName: string;
  readonly attributes: readonly AttributeDescriptor[];
  readonly mastering: ProfileMastering;
  readonly memberships: readonly GroupMembership[];
  readonly onUserUpdated?: (user: OktaUser) => void;
  readonly rules: RuleInventoryState;
  readonly oktaOrigin?: string | null;
  readonly targetTabId: number | undefined;
  readonly enabled: boolean;
}

interface SideResult {
  readonly side: ComparisonEditSide;
  readonly pending: ComparisonPendingSave | null;
}

const NO_LIFT = (): void => {};

function useComparisonEditSide({
  key,
  user,
  userName,
  attributes,
  mastering,
  memberships,
  onUserUpdated,
  rules,
  oktaOrigin,
  targetTabId,
  enabled,
}: SideOptions): SideResult {
  const [message, setMessage] = useState<ComparisonEditMessage | undefined>(undefined);

  const canPublish = onUserUpdated !== undefined;

  const edit = useProfileEdit({
    user,
    attributes,
    mastering,
    targetTabId,
    onUserUpdated: onUserUpdated ?? NO_LIFT,
    enabled: enabled && canPublish,
  });

  const blast = useBlastRadius({ user, memberships, rules, oktaOrigin });

  const { draftPatch, requestSave, dismissSave, confirmSave, begin, cancel } = edit;
  const { analyze, reset: resetBlast } = blast;

  useEffect(() => {
    resetBlast();
  }, [draftPatch, resetBlast]);

  const [armed, setArmed] = useState<readonly DraftChange[] | null>(null);
  const confirming = edit.pendingSave ?? (edit.isSaving ? armed : null);

  const beginSide = useCallback(() => {
    setMessage(undefined);
    setArmed(null);
    begin();
  }, [begin]);

  const cancelSide = useCallback(() => {
    setMessage(undefined);
    setArmed(null);
    cancel();
  }, [cancel]);

  const { changes, hasChanges, hasInvalid } = edit;

  const requestSaveSide = useCallback(() => {
    if (!hasChanges || hasInvalid) return;
    setArmed(changes);
    requestSave();
  }, [hasChanges, hasInvalid, changes, requestSave]);

  const dismiss = useCallback(() => {
    setArmed(null);
    dismissSave();
  }, [dismissSave]);

  const confirm = useCallback(() => {
    void (async () => {
      setMessage(undefined);
      const outcome = await confirmSave();
      if (outcome.kind === 'saved') {
        setArmed(null);
        return;
      }
      if (outcome.kind === 'failed') {
        setMessage({ type: 'danger', text: outcome.error });
        requestSave();
        return;
      }
      setArmed(null);
      setMessage({
        type: 'warning',
        text: `This panel could not confirm whether the change to ${userName} was saved. Reload the comparison to check before editing again.`,
      });
    })();
  }, [confirmSave, requestSave, userName]);

  const analyzeSide = useCallback(() => {
    analyze(draftPatch);
  }, [analyze, draftPatch]);

  const side = useMemo<ComparisonEditSide>(
    () => ({
      key,
      userName,
      cells: edit.cells,
      isEditing: edit.isEditing,
      isSaving: edit.isSaving,
      hasChanges: edit.hasChanges,
      hasInvalid: edit.hasInvalid,
      canEdit: enabled && canPublish && user !== null,
      ...(message !== undefined && confirming === null ? { message } : {}),
      begin: beginSide,
      cancel: cancelSide,
      requestSave: requestSaveSide,
    }),
    [
      key,
      userName,
      edit.cells,
      edit.isEditing,
      edit.isSaving,
      edit.hasChanges,
      edit.hasInvalid,
      enabled,
      canPublish,
      user,
      message,
      confirming,
      beginSide,
      cancelSide,
      requestSaveSide,
    ],
  );

  const pending = useMemo<ComparisonPendingSave | null>(
    () =>
      confirming === null
        ? null
        : {
            side: key,
            userName,
            changes: confirming,
            isSaving: edit.isSaving,
            report: blast.report,
            isAnalyzing: blast.isAnalyzing,
            resolveGroupName: blast.resolveGroupName,
            ...(message?.type === 'danger' ? { error: message.text } : {}),
            analyze: analyzeSide,
            cancel: dismiss,
            confirm,
          },
    [
      confirming,
      key,
      userName,
      edit.isSaving,
      blast.report,
      blast.isAnalyzing,
      blast.resolveGroupName,
      message,
      analyzeSide,
      dismiss,
      confirm,
    ],
  );

  return { side, pending };
}

export function useComparisonProfileEdit({
  contextUser,
  contextName,
  contextAttributes,
  contextMastering,
  contextMemberships,
  onContextUserUpdated,
  comparedUser,
  comparedName,
  comparedAttributes,
  comparedMastering,
  comparedMemberships,
  onComparedUserUpdated,
  rules,
  oktaOrigin,
  targetTabId,
  enabled,
}: UseComparisonProfileEditOptions): UseComparisonProfileEditReturn {
  const context = useComparisonEditSide({
    key: 'context',
    user: contextUser,
    userName: contextName,
    attributes: contextAttributes,
    mastering: contextMastering,
    memberships: contextMemberships,
    ...(onContextUserUpdated === undefined ? {} : { onUserUpdated: onContextUserUpdated }),
    rules,
    oktaOrigin,
    targetTabId,
    enabled,
  });

  const compared = useComparisonEditSide({
    key: 'compared',
    user: comparedUser,
    userName: comparedName,
    attributes: comparedAttributes,
    mastering: comparedMastering,
    memberships: comparedMemberships,
    onUserUpdated: onComparedUserUpdated,
    rules,
    oktaOrigin,
    targetTabId,
    enabled,
  });

  return {
    context: context.side,
    compared: compared.side,
    pendingSave: context.pending ?? compared.pending,
  };
}
