import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  countsByKind,
  isPicked as isPickedIn,
  selectionStore,
  type AddOutcome,
  type SelectionBasket,
  type SelectionKind,
  type SelectionRef,
} from './selectionStore';

export interface Selection {
  basket: SelectionBasket;
  total: number;
  counts: Partial<Record<SelectionKind, number>>;
  isPicked: (kind: SelectionKind, id: string) => boolean;
  toggle: (ref: Omit<SelectionRef, 'pickedAt'>) => void;
  addMany: (refs: Omit<SelectionRef, 'pickedAt'>[]) => AddOutcome;
  replaceKind: (kind: SelectionKind, refs: Omit<SelectionRef, 'pickedAt'>[]) => AddOutcome;
  remove: (ref: { kind: SelectionKind; id: string }) => void;
  clearKind: (kind: SelectionKind) => void;
  clearAll: () => void;
}

export function useSelection(): Selection {
  const basket = useSyncExternalStore(
    useCallback((listener: () => void) => selectionStore.subscribe(listener), []),
    useCallback(() => selectionStore.getSnapshot(), []),
  );

  const counts = useMemo(() => countsByKind(basket), [basket]);

  const isPicked = useCallback(
    (kind: SelectionKind, id: string) => isPickedIn(basket, kind, id),
    [basket],
  );

  const toggle = useCallback((ref: Omit<SelectionRef, 'pickedAt'>) => {
    selectionStore.toggle(ref);
  }, []);
  const addMany = useCallback(
    (refs: Omit<SelectionRef, 'pickedAt'>[]) => selectionStore.addMany(refs),
    [],
  );
  const replaceKind = useCallback(
    (kind: SelectionKind, refs: Omit<SelectionRef, 'pickedAt'>[]) =>
      selectionStore.replaceKind(kind, refs),
    [],
  );
  const remove = useCallback((ref: { kind: SelectionKind; id: string }) => {
    selectionStore.remove(ref);
  }, []);
  const clearKind = useCallback((kind: SelectionKind) => {
    selectionStore.clearKind(kind);
  }, []);
  const clearAll = useCallback(() => {
    selectionStore.clearAll();
  }, []);

  return {
    basket,
    total: basket.picked.length,
    counts,
    isPicked,
    toggle,
    addMany,
    replaceKind,
    remove,
    clearKind,
    clearAll,
  };
}
