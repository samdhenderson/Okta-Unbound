import { useState, useMemo, useCallback } from 'react';
import type { GroupSummary } from '../../shared/types';

export function useGroupSelection(groups: GroupSummary[]) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((groupId: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const replaceSelection = useCallback((ids: string[]) => {
    setSelectedGroupIds(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedGroupIds(new Set());
  }, []);

  const selectedGroups = useMemo(
    () => groups.filter((g) => selectedGroupIds.has(g.id)),
    [groups, selectedGroupIds],
  );

  return { selectedGroupIds, selectedGroups, toggleSelect, replaceSelection, deselectAll };
}
