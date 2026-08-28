import React from 'react';
import { AlertMessage, Button, Modal, Input, LoadingSpinner } from '../../shared';
import type { OktaUser } from '../../../../shared/types';
import { userDisplayName } from '../../../../shared/utils/userDisplay';

interface AddGroupMemberModalProps {
  isOpen: boolean;
  groupName?: string;
  addQuery: string;
  onAddQueryChange: (value: string) => void;
  addResults: OktaUser[];
  isSearchingToAdd: boolean;
  addSearchError?: string | null;
  selectedUser: OktaUser | null;
  onSelectUser: (user: OktaUser) => void;
  onClearSelectedUser: () => void;
  isAddingMember: boolean;
  onClose: () => void;
  onConfirm: () => void;
  addMemberError?: string | null;
}

const AddGroupMemberModal: React.FC<AddGroupMemberModalProps> = ({
  isOpen,
  groupName,
  addQuery,
  onAddQueryChange,
  addResults,
  isSearchingToAdd,
  addSearchError,
  selectedUser,
  onSelectUser,
  onClearSelectedUser,
  isAddingMember,
  onClose,
  onConfirm,
  addMemberError,
}) => {
  const showDropdown = addResults.length > 0 && !selectedUser;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add member to ${groupName || 'Group'}`}
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
            disabled={!selectedUser || isAddingMember}
            loading={isAddingMember}
          >
            Add member
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Input
            label="Search for a user"
            type="text"
            value={addQuery}
            onChange={onAddQueryChange}
            placeholder="Type to search by name, email, or login..."
            trailing={isSearchingToAdd ? <LoadingSpinner size="sm" /> : undefined}
          />

          {addSearchError && (
            <AlertMessage message={{ text: addSearchError, type: 'danger' }} className="mt-1" />
          )}

          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {addResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className="press press-subtle w-full text-left px-(--sp-row-x) py-(--sp-row-y) hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                >
                  <div className="text-sm font-medium text-neutral-900">
                    {userDisplayName(user)}
                  </div>
                  <div className="text-xs text-neutral-500">{user.profile.email}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="flex items-center justify-between p-(--sp-card) bg-primary-light border border-primary-highlight rounded-md">
            <div>
              <div className="text-sm font-medium text-neutral-900">
                {userDisplayName(selectedUser)}
              </div>
              <div className="text-xs text-neutral-500">{selectedUser.profile.email}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClearSelectedUser}>
              Clear
            </Button>
          </div>
        )}

        {addMemberError && <AlertMessage message={{ text: addMemberError, type: 'danger' }} />}
      </div>
    </Modal>
  );
};

export default AddGroupMemberModal;
