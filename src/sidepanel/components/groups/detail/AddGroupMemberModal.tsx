import React from 'react';
import { AlertMessage, Button, Modal, SearchDropdown } from '../../shared';
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

const userRow = (user: OktaUser) => (
  <>
    <div className="text-sm font-medium text-neutral-900">{userDisplayName(user)}</div>
    <div className="text-xs text-neutral-500">{user.profile.email}</div>
  </>
);

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
        <SearchDropdown<OktaUser>
          label="Search for a user"
          placeholder="Type to search by name, email, or login..."
          query={addQuery}
          onQueryChange={onAddQueryChange}
          isSearching={isSearchingToAdd}
          results={addResults}
          showDropdown={addResults.length > 0}
          onSelect={onSelectUser}
          getKey={(user) => user.id}
          renderResult={userRow}
          selectedItem={selectedUser}
          renderSelected={userRow}
          onClear={onClearSelectedUser}
          error={addSearchError}
        />

        {addMemberError && <AlertMessage message={{ text: addMemberError, type: 'danger' }} />}
      </div>
    </Modal>
  );
};

export default AddGroupMemberModal;
