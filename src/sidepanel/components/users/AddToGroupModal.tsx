import React from 'react';
import { Button, Modal, Input, LoadingSpinner } from '../shared';
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
        <div className="relative">
          <Input
            label="Search for a group"
            type="text"
            value={groupSearchQuery}
            onChange={onGroupSearchQueryChange}
            placeholder="Type to search by group name..."
            trailing={isSearchingGroups ? <LoadingSpinner size="sm" /> : undefined}
          />

          {showGroupDropdown && groupSearchResults.length > 0 && !selectedGroup && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {groupSearchResults.map((group) => (
                <button
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className="press-subtle w-full text-left px-(--sp-row-x) py-(--sp-row-y) hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                >
                  <div className="text-sm font-medium text-neutral-900">{group.name}</div>
                  <div className="text-xs text-neutral-500">{group.type}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedGroup && (
          <div className="flex items-center justify-between p-(--sp-card) bg-primary-light border border-primary-highlight rounded-md">
            <div>
              <div className="text-sm font-medium text-neutral-900">{selectedGroup.name}</div>
              <div className="text-xs text-neutral-500">{selectedGroup.type}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClearSelectedGroup}>
              Clear
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddToGroupModal;
