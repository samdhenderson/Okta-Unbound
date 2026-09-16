import React, { useState } from 'react';
import { Button, EmptyState, Modal } from '../../shared';
import CollectionsSection from '../CollectionsSection';
import { useCollectionLoader } from '../../../selection/useCollectionLoader';
import { userFetchCount } from '../../../selection/collectionNames';
import { SELECTION_LIMIT } from '../../../selection/selectionStore';
import type { Collection, CollectionRow, SaveOutcome } from '../../../selection/collectionStore';
import type { AddOutcome, SelectionRef } from '../../../selection/selectionStore';
import { pluralize } from '../../../../shared/utils/plural';

const REQUEST = { one: 'request', other: 'requests' };

export interface CollectionsPaneProps {
  collections: Collection[];
  isReading: boolean;
  query: string;
  oktaOrigin?: string;
  targetTabId?: number | null;
  addMany: (refs: Omit<SelectionRef, 'pickedAt'>[]) => AddOutcome;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => Promise<SaveOutcome>;
}

const CollectionsPane: React.FC<CollectionsPaneProps> = ({
  collections,
  isReading,
  query,
  oktaOrigin,
  targetTabId = null,
  addMany,
  onDelete,
  onRename,
}) => {
  const loader = useCollectionLoader({ targetTabId, oktaOrigin });

  const [pendingLoad, setPendingLoad] = useState<{ collection: Collection; cost: number } | null>(
    null,
  );
  const [unnamed, setUnnamed] = useState<CollectionRow[] | null>(null);
  const [refusedCount, setRefusedCount] = useState<number | null>(null);

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

  return (
    <div role="tabpanel" aria-label="Collections" className="space-y-(--sp-rung)">
      <CollectionsSection
        collections={collections}
        isReading={isReading}
        query={query}
        onLoad={handleLoad}
        onDelete={onDelete}
        onRename={onRename}
      />

      {!isReading && collections.length === 0 && (
        <EmptyState
          icon="clipboard"
          title="No saved collections"
          description="Save what you've ticked as a collection and it lands here, ready to load back into the basket on another day."
        />
      )}

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

export default CollectionsPane;
