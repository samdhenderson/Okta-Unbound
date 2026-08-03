import { useState, useMemo, useCallback } from 'react';

export interface EntitySelection<T extends { id: string }> {
  selectedIds: Set<string>;
  selectedEntities: T[];
  toggleSelect: (id: string) => void;
  replaceSelection: (ids: string[]) => void;
  deselectAll: () => void;
}

export function useEntitySelection<T extends { id: string }>(entities: T[]): EntitySelection<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const replaceSelection = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedEntities = useMemo(
    () => entities.filter((entity) => selectedIds.has(entity.id)),
    [entities, selectedIds],
  );

  return { selectedIds, selectedEntities, toggleSelect, replaceSelection, deselectAll };
}
