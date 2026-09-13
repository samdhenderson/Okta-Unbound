import React, { useMemo, useState } from 'react';
import {
  Button,
  DetailSection,
  EmptyState,
  IconButton,
  ListRow,
  Modal,
  PageHeader,
  typeIcon,
  typeNounForms,
} from '../shared';
import Icon from '../shared/Icon';
import { useSelection } from '../../selection/useSelection';
import { useCollections } from '../../selection/useCollections';
import { useCollectionLoader } from '../../selection/useCollectionLoader';
import { userFetchCount } from '../../selection/collectionNames';
import { SELECTION_LIMIT, type SelectionKind } from '../../selection/selectionStore';
import type { Collection, CollectionRow } from '../../selection/collectionStore';
import { pluralNoun, pluralize } from '../../../shared/utils/plural';
import SelectionActionBar from './SelectionActionBar';
import SaveCollectionModal, { type SaveScope } from './SaveCollectionModal';
import CollectionsSection from './CollectionsSection';

const KIND_ORDER: readonly SelectionKind[] = ['user', 'group', 'app', 'rule', 'policy'];

const REQUEST = { one: 'request', other: 'requests' };

export interface SelectionTabProps {
  isActive?: boolean;
  oktaOrigin?: string;
  targetTabId?: number | null;
}

const SelectionTab: React.FC<SelectionTabProps> = ({
  isActive = true,
  oktaOrigin,
  targetTabId = null,
}) => {
  const { basket, total, counts, clearKind, clearAll, remove, addMany } = useSelection();
  const {
    collections,
    isReading,
    save,
    rename,
    remove: removeCollection,
  } = useCollections(oktaOrigin);
  const loader = useCollectionLoader({ targetTabId, oktaOrigin });

  const [pendingClearKind, setPendingClearKind] = useState<SelectionKind | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pendingLoad, setPendingLoad] = useState<{ collection: Collection; cost: number } | null>(
    null,
  );
  const [unnamed, setUnnamed] = useState<CollectionRow[] | null>(null);
  const [refusedCount, setRefusedCount] = useState<number | null>(null);

  const needle = query.trim().toLowerCase();
  const matches = (name: string) => needle.length === 0 || name.toLowerCase().includes(needle);

  const nonEmptyKinds = KIND_ORDER.filter((kind) => (counts[kind] ?? 0) > 0);
  const pendingCount = pendingClearKind ? (counts[pendingClearKind] ?? 0) : 0;
  const pendingNoun = pendingClearKind
    ? pluralNoun(pendingCount, typeNounForms[pendingClearKind])
    : '';

  const existingNames = useMemo(() => collections.map((entry) => entry.name), [collections]);

  const runLoad = async (collection: Collection) => {
    const { refs, unnamed: blocked } = await loader.load(collection);
    if (blocked.length > 0) {
      setUnnamed(blocked);
      return;
    }
    const outcome = addMany(refs);
    if (outcome.refused > 0) setRefusedCount(outcome.refused);
  };

  const handleLoad = (collection: Collection) => {
    const plan = loader.plan(collection);
    const cost =
      userFetchCount(plan) +
      (plan.needsFetch.group?.length ?? 0) +
      (plan.needsFetch.app?.length ?? 0) +
      (plan.needsFetch.policy?.length ? 1 : 0);

    if (cost === 0) {
      void runLoad(collection);
      return;
    }
    setPendingLoad({ collection, cost });
  };

  const handleSave = (name: string, scope: SaveScope, rememberNames: boolean) => {
    const picked = scope === 'all' ? basket.picked : basket.picked.filter((r) => r.kind === scope);
    const rows: CollectionRow[] = picked.map((ref) =>
      ref.kind === 'user' && rememberNames
        ? { kind: ref.kind, id: ref.id, name: ref.name }
        : { kind: ref.kind, id: ref.id },
    );
    return save(name, rows);
  };

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title="Selection"
        subtitle="Review what you've ticked across the panel, and keep it"
        sticky={isActive}
      />

      <SelectionActionBar
        total={total}
        hasCollections={collections.length > 0}
        query={query}
        onQueryChange={setQuery}
        onSaveCollection={() => setSaveOpen(true)}
        onClearAll={clearAll}
        sticky={isActive}
      />

      <div className="max-w-7xl mx-auto px-(--sp-gutter) py-(--sp-gutter) space-y-(--sp-rung)">
        <CollectionsSection
          collections={collections}
          isReading={isReading}
          query={query}
          onLoad={handleLoad}
          onDelete={removeCollection}
          onRename={rename}
        />

        {total === 0
          ? // Only a page with nothing saved *and* nothing ticked is empty. With
            collections.length === 0 &&
            !isReading && (
              <EmptyState
                icon="clipboard-check"
                title="Nothing selected"
                description="Tick rows on any rung — a group's member list, the Users tab, wherever you're working — and they land here. The running count shows up beside Refresh at the top of the panel."
              />
            )
          : nonEmptyKinds.map((kind) => {
              const count = counts[kind] ?? 0;
              const forms = typeNounForms[kind];
              const entries = basket.picked.filter((ref) => ref.kind === kind);
              const shown = entries.filter((ref) => matches(ref.name));

              return (
                <DetailSection
                  key={kind}
                  title={`${count.toLocaleString()} ${pluralNoun(count, forms)} selected`}
                  actions={
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="trash"
                      ariaLabel={`Clear ${forms.other}`}
                      onClick={() => setPendingClearKind(kind)}
                    >
                      Clear
                    </Button>
                  }
                >
                  {needle.length > 0 && (
                    <p className="mb-(--sp-inline) text-xs text-neutral-600">
                      {shown.length === 0
                        ? `No ${forms.other} match "${query.trim()}".`
                        : `Showing ${shown.length.toLocaleString()} of ${count.toLocaleString()}.`}
                    </p>
                  )}
                  <div className="space-y-(--sp-inline)">
                    {shown.map((ref) => (
                      <ListRow key={ref.id} density="compact">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <Icon
                              type={typeIcon[kind]}
                              size="sm"
                              className="shrink-0 text-neutral-400"
                            />
                            <span className="truncate text-sm font-semibold text-neutral-900">
                              {ref.name}
                            </span>
                          </span>
                          <IconButton
                            label={`Remove ${ref.name} from the selection`}
                            variant="ghost"
                            onClick={() => remove({ kind: ref.kind, id: ref.id })}
                          >
                            <Icon type="close" size="sm" />
                          </IconButton>
                        </div>
                      </ListRow>
                    ))}
                  </div>
                </DetailSection>
              );
            })}
      </div>

      <SaveCollectionModal
        isOpen={saveOpen}
        onClose={() => setSaveOpen(false)}
        counts={counts}
        existingNames={existingNames}
        onSave={handleSave}
      />

      <Modal
        isOpen={pendingClearKind !== null}
        onClose={() => setPendingClearKind(null)}
        title={pendingClearKind ? `Clear selected ${pendingNoun}?` : ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPendingClearKind(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (pendingClearKind) clearKind(pendingClearKind);
                setPendingClearKind(null);
              }}
            >
              Clear
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-700">
          Clear {pendingCount.toLocaleString()} selected {pendingNoun}? This cannot be undone.
        </p>
      </Modal>

      <Modal
        isOpen={pendingLoad !== null}
        onClose={() => setPendingLoad(null)}
        title="Look up the names first?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPendingLoad(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const target = pendingLoad?.collection;
                setPendingLoad(null);
                if (target) void runLoad(target);
              }}
            >
              Look up and load
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-700">
          This collection was saved without display names, so loading it takes{' '}
          {pluralize(pendingLoad?.cost ?? 0, REQUEST)}.
        </p>
      </Modal>

      <Modal
        isOpen={refusedCount !== null}
        onClose={() => setRefusedCount(null)}
        title="Nothing was loaded"
        size="sm"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setRefusedCount(null)}>
            Close
          </Button>
        }
      >
        <p className="text-sm text-neutral-700">
          Loading this collection would take one kind past the {SELECTION_LIMIT.toLocaleString()}
          -entry limit, so the selection is unchanged. Clear a partition and load it again.
        </p>
      </Modal>

      <Modal
        isOpen={unnamed !== null}
        onClose={() => setUnnamed(null)}
        title="Nothing was loaded"
        size="sm"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setUnnamed(null)}>
            Close
          </Button>
        }
      >
        <p className="text-sm text-neutral-700">
          {(unnamed?.length ?? 0).toLocaleString()} of this collection&rsquo;s entries could not be
          named, so the selection is unchanged. Loading part of a saved cohort would hand the next
          verb a smaller set than the one you kept.
        </p>
      </Modal>
    </div>
  );
};

export default SelectionTab;
