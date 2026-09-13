import React, { useMemo, useState } from 'react';
import { AlertMessage, Button, Checkbox, FilterPill, Input, Modal, typeNounForms } from '../shared';
import { pluralNoun } from '../../../shared/utils/plural';
import {
  COLLECTION_LIMIT,
  COLLECTION_NAME_MAX,
  COLLECTION_ROW_LIMIT,
  type SaveOutcome,
  type SaveRefusal,
} from '../../selection/collectionStore';
import type { SelectionKind } from '../../selection/selectionStore';

export type SaveScope = SelectionKind | 'all';

export interface SaveCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  counts: Partial<Record<SelectionKind, number>>;
  existingNames: string[];
  onSave: (name: string, scope: SaveScope, rememberNames: boolean) => Promise<SaveOutcome>;
}

const KIND_ORDER: readonly SelectionKind[] = ['rule', 'group', 'user', 'app', 'policy'];

interface KindCount {
  kind: SelectionKind;
  count: number;
}

function refusalText(refusal: SaveRefusal): string {
  switch (refusal) {
    case 'duplicate-name':
      return 'This org already has a collection with that name. Nothing was saved.';
    case 'blank-name':
      return 'A collection needs a name. Nothing was saved.';
    case 'name-too-long':
      return `A name may be ${COLLECTION_NAME_MAX} characters. Nothing was saved.`;
    case 'too-many':
      return `This org already holds ${COLLECTION_LIMIT} collections, which is the limit. Delete one, then save again.`;
    case 'too-big':
      return `A collection holds ${COLLECTION_ROW_LIMIT} entities. This one is larger, and it was refused whole rather than trimmed. Nothing was saved.`;
    case 'no-origin':
      return 'No Okta org is connected, so there is nowhere to file this collection. Open your Okta tab, then save again.';
  }
}

function joinPhrases(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

const phrase = ({ kind, count }: KindCount): string =>
  `${count.toLocaleString()} ${pluralNoun(count, typeNounForms[kind])}`;

const pillLabel = ({ kind, count }: KindCount): string => {
  const noun = pluralNoun(count, typeNounForms[kind]);
  return `${noun.charAt(0).toUpperCase()}${noun.slice(1)} (${count.toLocaleString()})`;
};

const SaveCollectionModal: React.FC<SaveCollectionModalProps> = ({
  isOpen,
  onClose,
  counts,
  existingNames,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [scope, setScope] = useState<SaveScope>('all');
  const [rememberNames, setRememberNames] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [refusal, setRefusal] = useState<SaveRefusal | null>(null);

  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName('');
      setScope('all');
      setRememberNames(true);
      setIsSaving(false);
      setRefusal(null);
    }
  }

  const present = useMemo<KindCount[]>(
    () =>
      KIND_ORDER.map((kind) => ({ kind, count: counts[kind] ?? 0 }))
        .filter((entry) => entry.count > 0)
        .sort(
          (a, b) => b.count - a.count || KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind),
        ),
    [counts],
  );

  const total = present.reduce((sum, entry) => sum + entry.count, 0);

  const activeScope: SaveScope =
    scope !== 'all' && !present.some((entry) => entry.kind === scope) ? 'all' : scope;

  const covered = useMemo<KindCount[]>(
    () => (activeScope === 'all' ? present : present.filter((e) => e.kind === activeScope)),
    [activeScope, present],
  );

  const userCount = covered.find((entry) => entry.kind === 'user')?.count ?? 0;

  const trimmed = name.trim();
  const duplicate = existingNames.find(
    (existing) => existing.trim().toLowerCase() === trimmed.toLowerCase(),
  );

  const nameError =
    trimmed.length > COLLECTION_NAME_MAX
      ? `A name may be ${COLLECTION_NAME_MAX} characters; this is ${trimmed.length}.`
      : trimmed.length > 0 && duplicate !== undefined
        ? `This org already has a collection called “${duplicate}”.`
        : null;

  const canSave = trimmed.length > 0 && nameError === null && total > 0 && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    setRefusal(null);
    const outcome = await onSave(trimmed, activeScope, userCount > 0 && rememberNames);
    setIsSaving(false);
    if (outcome.refused !== null) {
      setRefusal(outcome.refused);
      return;
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save collection"
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => void handleSave()}
            disabled={!canSave}
            loading={isSaving}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Name"
          ariaLabel="Name"
          value={name}
          onChange={setName}
          placeholder="Marketing rename"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleSave();
          }}
          {...(nameError
            ? { error: nameError }
            : { hint: `Unique within this org, up to ${COLLECTION_NAME_MAX} characters.` })}
        />

        {total === 0 ? (
          <p className="text-xs text-neutral-600">
            Nothing is ticked, so there is nothing to save yet.
          </p>
        ) : (
          <div className="space-y-(--sp-field)">
            <p className="text-xs font-medium text-neutral-700">What to save</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="What to save">
              <FilterPill active={activeScope === 'all'} onClick={() => setScope('all')}>
                Everything ({total.toLocaleString()})
              </FilterPill>
              {present.length > 1 &&
                present.map((entry) => (
                  <FilterPill
                    key={entry.kind}
                    active={activeScope === entry.kind}
                    onClick={() => setScope(entry.kind)}
                  >
                    {pillLabel(entry)}
                  </FilterPill>
                ))}
            </div>
            <p className="text-xs text-neutral-600">Saves {joinPhrases(covered.map(phrase))}.</p>
          </div>
        )}

        {userCount > 0 && (
          <Checkbox
            checked={rememberNames}
            onChange={setRememberNames}
            label="Remember display names"
            description={
              rememberNames
                ? 'Names are stored unencrypted on this device.'
                : `Reopening will look up ${userCount.toLocaleString()} ${pluralNoun(userCount, typeNounForms.user)} — one request each.`
            }
          />
        )}

        {refusal !== null && (
          <AlertMessage message={{ text: refusalText(refusal), type: 'danger' }} />
        )}
      </div>
    </Modal>
  );
};

export default SaveCollectionModal;
