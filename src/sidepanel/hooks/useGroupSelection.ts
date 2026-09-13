import type { GroupSummary } from '../../shared/types';
import { useRungSelection } from '../selection/useRungSelection';

const groupName = (group: GroupSummary) => group.name;

export function useGroupSelection(groups: GroupSummary[]) {
  const { selectedIds, selectedEntities, toggleSelect, replaceSelection, deselectAll } =
    useRungSelection('group', groups, groupName);

  return {
    selectedGroupIds: selectedIds,
    selectedGroups: selectedEntities,
    toggleSelect,
    replaceSelection,
    deselectAll,
  };
}
