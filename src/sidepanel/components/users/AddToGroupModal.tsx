import React from 'react';
import { Button, Modal, SearchDropdown } from '../shared';
import type { GroupSearchResult } from '../../hooks/useAddToGroup';

interface AddToGroupModalProps {
  isOpen: boolean;
  userFirstName?: string;
  groupSearchQuery: string;
  onGroupSearchQueryChange: (value: string) => void;
  groupSearchResults: GroupSearchResult[];
  isSearchingGroups: boolean;
  showGroupDropdown: boolean;
  selectedGroup: GroupSearchResult | null;
  onSelectGroup: (group: GroupSearchResult) => void;
  onClearSelectedGroup: () => void;
  isAddingToGroup: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const groupRow = (group: GroupSearchResult) => (
  <>
    <div className="text-sm font-medium text-neutral-900">{group.name}</div>
    <div className="text-xs text-neutral-500">{group.type}</div>
  </>
);

const AddToGroupModal: React.FC<AddToGroupModalProps> = ({
  isOpen,
  userFirstName,
  groupSearchQuery,
  onGroupSearchQueryChange,
  groupSearchResults,
  isSearchingGroups,
  showGroupDropdown,
  selectedGroup,
  onSelectGroup,
  onClearSelectedGroup,
  isAddingToGroup,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add ${userFirstName || 'User'} to Group`}
      size="md"
      footer={
        <div className="flex justify-end gap-(--sp-field)">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={!selectedGroup || isAddingToGroup}
            loading={isAddingToGroup}
          >
            Add to Group
          </Button>
        </div>
      }
    >
      <div className="space-y-(--sp-field)">
        <SearchDropdown<GroupSearchResult>
          label="Search for a group"
          placeholder="Type to search by group name..."
          query={groupSearchQuery}
          onQueryChange={onGroupSearchQueryChange}
          isSearching={isSearchingGroups}
          results={groupSearchResults}
          showDropdown={showGroupDropdown}
          onSelect={onSelectGroup}
          getKey={(group) => group.id}
          renderResult={groupRow}
          selectedItem={selectedGroup}
          renderSelected={groupRow}
          onClear={onClearSelectedGroup}
        />
      </div>
    </Modal>
  );
};

export default AddToGroupModal;
