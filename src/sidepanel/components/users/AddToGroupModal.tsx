import React from 'react';
import { Button, Modal, LoadingSpinner } from '../shared';
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
        <div className="flex justify-end gap-2">
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
      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Search for a group
          </label>
          <input
            type="text"
            value={groupSearchQuery}
            onChange={(e) => onGroupSearchQueryChange(e.target.value)}
            placeholder="Type to search by group name..."
            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {isSearchingGroups && (
            <div className="absolute right-3 top-8">
              <LoadingSpinner size="sm" />
            </div>
          )}

          {showGroupDropdown && groupSearchResults.length > 0 && !selectedGroup && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {groupSearchResults.map((group) => (
                <button
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                >
                  <div className="text-sm font-medium text-neutral-900">{group.name}</div>
                  <div className="text-xs text-neutral-500">{group.type}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedGroup && (
          <div className="flex items-center justify-between p-3 bg-primary-light border border-primary-highlight rounded-md">
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
