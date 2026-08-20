import { useCallback, useMemo, useState } from 'react';
import type { OktaUser } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';
import { logProfileUpdateAction, type AttributeChange } from '../../shared/undoManager';
import { invalidate } from '../cache/entityCache';
import { cacheKeys } from '../cache/keys';
import type { AttributeDescriptor } from '../components/users/profileAttributes';
import {
  attributeEditability,
  type AttributeEditability,
  type ProfileMastering,
} from '../components/users/profileEditability';
import {
  coerceDraftValue,
  draftDiff,
  validateDraft,
  type DraftChange,
} from '../components/users/profileDraft';
import { useOktaApi } from './useOktaApi';

const log = createLogger('useProfileEdit');

const NO_CELLS: Readonly<Record<string, AttributeEditCell>> = Object.freeze({});
const NO_CHANGES: readonly DraftChange[] = Object.freeze([]);
const NO_ERRORS: Readonly<Record<string, string>> = Object.freeze({});
const NO_PATCH: Readonly<Record<string, unknown>> = Object.freeze({});

export interface AttributeEditCell {
  readonly name: string;
  readonly editability: AttributeEditability;
  readonly draft?: string;
  readonly dirty: boolean;
  readonly invalid?: string;
  readonly onChange?: (value: string) => void;
}

export type ProfileSaveOutcome =
  | { readonly kind: 'saved'; readonly user: OktaUser }
  | { readonly kind: 'failed'; readonly error: string }
  | { readonly kind: 'unknown' };

export interface UseProfileEditOptions {
  readonly user: OktaUser | null;
  readonly attributes: readonly AttributeDescriptor[];
  readonly targetTabId: number | undefined;
  readonly onUserUpdated: (user: OktaUser) => void;
  readonly enabled: boolean;
  readonly mastering?: ProfileMastering;
}

export interface UseProfileEditReturn {
  readonly isEditing: boolean;
  readonly begin: () => void;
  readonly cancel: () => void;
  readonly cells: Readonly<Record<string, AttributeEditCell>>;
  readonly changes: readonly DraftChange[];
  readonly hasChanges: boolean;
  readonly hasInvalid: boolean;
  readonly pendingSave: readonly DraftChange[] | null;
  readonly requestSave: () => void;
  readonly dismissSave: () => void;
  readonly confirmSave: () => Promise<ProfileSaveOutcome>;
  readonly isSaving: boolean;
  readonly draftPatch: Readonly<Record<string, unknown>>;
}

interface AttributeEntry {
  readonly attribute: AttributeDescriptor;
  readonly editability: AttributeEditability;
}

function indexAttributes(
  attributes: readonly AttributeDescriptor[],
  user: OktaUser,
  mastering: ProfileMastering | undefined,
): ReadonlyMap<string, AttributeEntry> {
  const entries = new Map<string, AttributeEntry>();

  for (const attribute of attributes) {
    const editability = attributeEditability(attribute, user, mastering);
    const existing = entries.get(attribute.name);
    if (existing === undefined || (existing.editability.editable && !editability.editable)) {
      entries.set(attribute.name, { attribute, editability });
    }
  }

  return entries;
}

interface PatchBuild {
  readonly patch: Record<string, unknown>;
  readonly uncoercible: readonly string[];
}

function buildPatch(
  changes: readonly DraftChange[],
  draft: Readonly<Record<string, string>>,
  entries: ReadonlyMap<string, AttributeEntry>,
): PatchBuild {
  const patch: Record<string, unknown> = {};
  const uncoercible: string[] = [];

  for (const change of changes) {
    const entry = entries.get(change.name);
    if (entry === undefined || !entry.editability.editable) continue;

    const raw = draft[change.name];
    if (raw === undefined) continue;

    const coerced = coerceDraftValue(raw, entry.editability.control);
    if (!coerced.ok) {
      uncoercible.push(change.name);
      continue;
    }

    patch[change.name] = coerced.value === undefined ? null : coerced.value;
  }

  return { patch, uncoercible };
}

function displayName(user: OktaUser): string {
  const composed = `${user.profile.firstName ?? ''} ${user.profile.lastName ?? ''}`.trim();
  return composed === '' ? user.profile.login : composed;
}

export function useProfileEdit({
  user,
  attributes,
  targetTabId,
  onUserUpdated,
  enabled,
  mastering,
}: UseProfileEditOptions): UseProfileEditReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Readonly<Record<string, string>>>({});
  const [pendingSave, setPendingSave] = useState<readonly DraftChange[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { updateUserProfile } = useOktaApi({ targetTabId: targetTabId ?? null });

  const identity = user === null ? null : `${user.id}|${user.lastUpdated ?? ''}`;
  const [draftIdentity, setDraftIdentity] = useState<string | null>(identity);
  if (draftIdentity !== identity) {
    setDraftIdentity(identity);
    setIsEditing(false);
    setDraft({});
    setPendingSave(null);
  }

  const entries = useMemo(
    () =>
      user === null
        ? new Map<string, AttributeEntry>()
        : indexAttributes(attributes, user, mastering),
    [attributes, user, mastering],
  );

  const changes = useMemo(() => {
    if (!isEditing) return NO_CHANGES;
    const seen = new Set<string>();
    return draftDiff(attributes, draft).filter((change) => {
      if (seen.has(change.name)) return false;
      seen.add(change.name);
      return true;
    });
  }, [isEditing, attributes, draft]);

  const errors = useMemo(() => {
    if (!isEditing) return NO_ERRORS;
    const editability = new Map<string, AttributeEditability>();
    for (const [name, entry] of entries) editability.set(name, entry.editability);
    return validateDraft(attributes, editability, draft);
  }, [isEditing, attributes, entries, draft]);

  const draftPatch = useMemo(
    () => (isEditing ? buildPatch(changes, draft, entries).patch : NO_PATCH),
    [isEditing, changes, draft, entries],
  );

  const setValue = useCallback((name: string, value: string) => {
    setDraft((current) => ({ ...current, [name]: value }));
  }, []);

  const cells = useMemo(() => {
    if (!isEditing) return NO_CELLS;

    const changed = new Set(changes.map((change) => change.name));
    const built: Record<string, AttributeEditCell> = {};

    for (const [name, entry] of entries) {
      const drafted = draft[name];
      const invalid = errors[name];
      built[name] = {
        name,
        editability: entry.editability,
        ...(drafted === undefined ? {} : { draft: drafted }),
        dirty: changed.has(name),
        ...(invalid === undefined ? {} : { invalid }),
        ...(entry.editability.editable
          ? { onChange: (value: string) => setValue(name, value) }
          : {}),
      };
    }

    return built;
  }, [isEditing, entries, draft, changes, errors, setValue]);

  const hasChanges = changes.length > 0;
  const hasInvalid = Object.keys(errors).length > 0;

  const begin = useCallback(() => {
    if (!enabled || user === null) return;
    setDraft({});
    setPendingSave(null);
    setIsEditing(true);
  }, [enabled, user]);

  const cancel = useCallback(() => {
    setDraft({});
    setPendingSave(null);
    setIsEditing(false);
  }, []);

  const requestSave = useCallback(() => {
    if (!hasChanges || hasInvalid) return;
    setPendingSave(changes);
  }, [hasChanges, hasInvalid, changes]);

  const dismissSave = useCallback(() => {
    setPendingSave(null);
  }, []);

  const confirmSave = useCallback(async (): Promise<ProfileSaveOutcome> => {
    if (!enabled) return { kind: 'failed', error: 'This view is not active.' };
    if (user === null || pendingSave === null) {
      return { kind: 'failed', error: 'There is nothing to save.' };
    }

    const confirmed = pendingSave;
    const { patch, uncoercible } = buildPatch(confirmed, draft, entries);

    if (uncoercible.length > 0) {
      return { kind: 'failed', error: 'Some values are not valid. Fix them and try again.' };
    }
    if (Object.keys(patch).length === 0) {
      return { kind: 'failed', error: 'None of these attributes can be edited here.' };
    }

    const userId = user.id;
    const attributeCount = Object.keys(patch).length;

    setPendingSave(null);
    setIsSaving(true);

    try {
      const result = await updateUserProfile(userId, patch).catch((error: unknown) => ({
        kind: 'failed' as const,
        error: error instanceof Error ? error.message : 'The update could not be sent.',
      }));

      if (result.kind === 'failed') {
        log.warn('Profile update rejected', { userId, attributeCount });
        return { kind: 'failed', error: result.error };
      }

      const changesForHistory = confirmed
        .filter((change) => Object.prototype.hasOwnProperty.call(patch, change.name))
        .map((change): AttributeChange => ({
          name: change.name,
          label: change.label,
          beforeDisplay: change.beforeDisplay,
          beforeRaw: entries.get(change.name)?.attribute.raw,
          afterDisplay: change.afterDisplay,
        }));

      if (result.kind === 'unknown') {
        log.warn('Profile update outcome unknown', { userId, attributeCount });
        setDraft({});
        setIsEditing(false);
        await recordHistory(userId, user, changesForHistory, 'partial');
        return { kind: 'unknown' };
      }

      onUserUpdated(result.user);
      invalidate(cacheKeys.userMemberships(userId));
      setDraft({});
      setIsEditing(false);
      log.info('Profile updated', { userId, attributeCount });
      await recordHistory(userId, user, changesForHistory, 'completed');
      return { kind: 'saved', user: result.user };
    } finally {
      setIsSaving(false);
    }
  }, [enabled, user, pendingSave, draft, entries, updateUserProfile, onUserUpdated]);

  return {
    isEditing,
    begin,
    cancel,
    cells,
    changes,
    hasChanges,
    hasInvalid,
    pendingSave,
    requestSave,
    dismissSave,
    confirmSave,
    isSaving,
    draftPatch,
  };
}

async function recordHistory(
  userId: string,
  user: OktaUser,
  changes: AttributeChange[],
  status: 'completed' | 'partial',
): Promise<void> {
  try {
    await logProfileUpdateAction(userId, user.profile.login, displayName(user), changes, {
      status,
    });
  } catch {
    log.warn('Could not record the profile update in history', {
      userId,
      attributeCount: changes.length,
    });
  }
}
