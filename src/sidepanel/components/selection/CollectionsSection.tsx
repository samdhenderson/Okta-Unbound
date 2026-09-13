import React, { useCallback, useEffect, useState } from 'react';
import { Button, DetailSection, IconButton, Input, ListRow, Modal, typeNounForms } from '../shared';
import Icon from '../shared/Icon';
import { pluralNoun } from '../../../shared/utils/plural';
import { formatDateShort } from '../../../shared/utils/dateFormat';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { COLLECTION_LIMIT, COLLECTION_NAME_MAX } from '../../selection/collectionStore';
import type {
  Collection,
  CollectionRow,
  SaveOutcome,
  SaveRefusal,
} from '../../selection/collectionStore';
import type { SelectionKind } from '../../selection/selectionStore';

const DELETE_EXIT_MS = 140;

const KIND_ORDER: readonly SelectionKind[] = ['user', 'group', 'app', 'rule', 'policy'];

const REFUSAL_COPY: Record<SaveRefusal, string> = {
  'duplicate-name': 'Another collection in this org already has that name.',
  'blank-name': 'A collection needs a name.',
  'name-too-long': `A name is at most ${COLLECTION_NAME_MAX} characters.`,
  'too-many': `This org already holds its limit of ${COLLECTION_LIMIT} collections.`,
  'too-big': 'That collection holds more entities than can be saved.',
  'no-origin': 'No Okta org is connected, so there is nothing to rename here.',
};

function summariseRows(rows: CollectionRow[]): string {
  const counts = new Map<SelectionKind, number>();
  for (const row of rows) counts.set(row.kind, (counts.get(row.kind) ?? 0) + 1);

  return KIND_ORDER.filter((kind) => (counts.get(kind) ?? 0) > 0)
    .map((kind) => {
      const count = counts.get(kind) ?? 0;
      return `${count.toLocaleString()} ${pluralNoun(count, typeNounForms[kind])}`;
    })
    .join(' · ');
}

export interface CollectionsSectionProps {
  collections: Collection[];
  isReading: boolean;
  query: string;
  onLoad: (collection: Collection) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => Promise<SaveOutcome>;
}

const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  collections,
  isReading,
  query,
  onLoad,
  onDelete,
  onRename,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [refusal, setRefusal] = useState<SaveRefusal | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Collection | null>(null);
  const [exitingId, setExitingId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const commitDelete = useCallback(
    (id: string) => {
      setExitingId((prev) => (prev === id ? null : prev));
      onDelete(id);
    },
    [onDelete],
  );

  useEffect(() => {
    if (!exitingId) return;
    const id = exitingId;
    const timer = window.setTimeout(() => commitDelete(id), DELETE_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [exitingId, commitDelete]);

  const startRename = (collection: Collection) => {
    setEditingId(collection.id);
    setEditName(collection.name);
    setRefusal(null);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditName('');
    setRefusal(null);
  };

  const commitRename = async (id: string) => {
    const outcome = await onRename(id, editName);
    if (outcome.refused !== null) {
      setRefusal(outcome.refused);
      return;
    }
    cancelRename();
  };

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? collections.filter((entry) => entry.name.toLowerCase().includes(needle))
    : collections;

  if (isReading || collections.length === 0) return null;

  const description = needle
    ? shown.length > 0
      ? `Showing ${shown.length.toLocaleString()} of ${collections.length.toLocaleString()}.`
      : `No collections match "${query.trim()}".`
    : undefined;

  return (
    <>
      <DetailSection
        title="Saved collections"
        description={description}
        itemCount={collections.length}
      >
        <div className="space-y-(--sp-inline)">
          {shown.map((collection) => {
            const summary = summariseRows(collection.rows);
            const isEditing = editingId === collection.id;

            return (
              <div
                key={collection.id}
                className={
                  collection.id === exitingId ? 'pointer-events-none animate-collapse-out' : ''
                }
                onAnimationEnd={() => {
                  if (collection.id === exitingId) commitDelete(collection.id);
                }}
              >
                <ListRow density="compact">
                  {isEditing ? (
                    <div className="flex items-start gap-(--sp-field)">
                      <Input
                        value={editName}
                        onChange={(value) => {
                          setEditName(value);
                          setRefusal(null);
                        }}
                        size="sm"
                        ariaLabel={`Rename ${collection.name}`}
                        error={refusal ? REFUSAL_COPY[refusal] : undefined}
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void commitRename(collection.id);
                          if (e.key === 'Escape') cancelRename();
                        }}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => void commitRename(collection.id)}
                      >
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelRename}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold text-neutral-900">
                          {collection.name}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {summary === '' ? 'No entities saved' : summary} · Saved{' '}
                          {formatDateShort(collection.savedAt)}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="secondary"
                          size="xs"
                          ariaLabel={`Load ${collection.name}`}
                          onClick={() => onLoad(collection)}
                        >
                          Load
                        </Button>
                        <IconButton
                          label={`Rename ${collection.name}`}
                          variant="ghost"
                          onClick={() => startRename(collection)}
                        >
                          <Icon type="pencil" size="sm" />
                        </IconButton>
                        <IconButton
                          label={`Delete ${collection.name}`}
                          variant="ghost"
                          onClick={() => setPendingDelete(collection)}
                        >
                          <Icon type="trash" size="sm" />
                        </IconButton>
                      </span>
                    </div>
                  )}
                </ListRow>
              </div>
            );
          })}
        </div>
      </DetailSection>

      <Modal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={pendingDelete ? `Delete "${pendingDelete.name}"?` : ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                const target = pendingDelete;
                setPendingDelete(null);
                if (!target) return;
                if (reducedMotion) commitDelete(target.id);
                else setExitingId(target.id);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-700">
          This forgets the saved collection. The entities in it are untouched in Okta, and nothing
          restores the collection afterwards.
        </p>
      </Modal>
    </>
  );
};

export default CollectionsSection;
