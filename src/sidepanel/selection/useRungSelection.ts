import { useCallback, useMemo } from 'react';
import { useSelection } from './useSelection';
import type { AddOutcome, SelectionKind } from './selectionStore';

export interface RungSelection<T extends { id: string }> {
  selectedIds: Set<string>;
  selectedEntities: T[];
  toggleSelect: (id: string) => void;
  replaceSelection: (ids: string[]) => AddOutcome;
  deselectAll: () => void;
}

export function useRungSelection<T extends { id: string }>(
  kind: SelectionKind,
  entities: T[],
  nameOf: (entity: T) => string,
): RungSelection<T> {
  const { basket, isPicked, toggle, remove, replaceKind, clearKind } = useSelection();

  const selectedIds = useMemo(
    () => new Set(basket.picked.filter((ref) => ref.kind === kind).map((ref) => ref.id)),
    [basket, kind],
  );

  const selectedEntities = useMemo(
    () => entities.filter((entity) => selectedIds.has(entity.id)),
    [entities, selectedIds],
  );

  const toggleSelect = useCallback(
    (id: string) => {
      if (isPicked(kind, id)) {
        remove({ kind, id });
        return;
      }
      const entity = entities.find((candidate) => candidate.id === id);
      if (!entity) return;
      toggle({ kind, id, name: nameOf(entity) });
    },
    [entities, isPicked, kind, nameOf, remove, toggle],
  );

  const replaceSelection = useCallback(
    (ids: string[]) => {
      const wanted = new Set(ids);
      return replaceKind(
        kind,
        entities
          .filter((entity) => wanted.has(entity.id))
          .map((entity) => ({ kind, id: entity.id, name: nameOf(entity) })),
      );
    },
    [entities, kind, nameOf, replaceKind],
  );

  const deselectAll = useCallback(() => {
    clearKind(kind);
  }, [clearKind, kind]);

  return { selectedIds, selectedEntities, toggleSelect, replaceSelection, deselectAll };
}
