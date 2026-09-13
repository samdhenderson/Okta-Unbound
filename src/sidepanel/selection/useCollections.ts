import { useCallback, useEffect, useState } from 'react';
import {
  collectionStore,
  type Collection,
  type CollectionRow,
  type SaveOutcome,
} from './collectionStore';

export interface UseCollectionsResult {
  collections: Collection[];
  isReading: boolean;
  save: (name: string, rows: CollectionRow[]) => Promise<SaveOutcome>;
  rename: (id: string, name: string) => Promise<SaveOutcome>;
  remove: (id: string) => void;
}

export function useCollections(origin: string | null | undefined): UseCollectionsResult {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isReading, setIsReading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsReading(true);
    setCollections([]);
    void collectionStore
      .read(origin)
      .then((stored) => {
        if (!cancelled) setCollections(stored);
      })
      .finally(() => {
        if (!cancelled) setIsReading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin]);

  useEffect(() => {
    if (!origin) return;
    return collectionStore.subscribe((file) =>
      setCollections(collectionStore.select(file, origin)),
    );
  }, [origin]);

  const save = useCallback(
    async (name: string, rows: CollectionRow[]) => {
      const outcome = await collectionStore.save(origin, name, rows);
      if (outcome.refused === null) setCollections(outcome.collections);
      return outcome;
    },
    [origin],
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      const outcome = await collectionStore.rename(origin, id, name);
      if (outcome.refused === null) setCollections(outcome.collections);
      return outcome;
    },
    [origin],
  );

  const remove = useCallback(
    (id: string) => {
      void collectionStore.remove(origin, id).then(setCollections);
    },
    [origin],
  );

  return { collections, isReading, save, rename, remove };
}
