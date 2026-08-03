import type { GroupSummary } from '../../shared/types';
import { useEntitySelection } from './useEntitySelection';

export function useGroupSelection(groups: GroupSummary[]) {
  const { selectedIds, selectedEntities, toggleSelect, replaceSelection, deselectAll } =
    useEntitySelection(groups);

  return {
    selectedGroupIds: selectedIds,
    selectedGroups: selectedEntities,
    toggleSelect,
    replaceSelection,
    deselectAll,
  };
}
