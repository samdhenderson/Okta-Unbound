import React from 'react';
import { Modal, SearchDropdown } from '../shared';
import type { OktaUser } from '../../../shared/types';
import { userDisplayName } from '../../../shared/utils/userDisplay';
import type { UseUserPickerReturn } from '../../hooks/useUserPicker';

export interface UserPickerModalProps {
  picker: UseUserPickerReturn;
  title: string;
  hint?: string;
}

const userRow = (user: OktaUser) => (
  <>
    <div className="text-sm font-medium text-neutral-900">{userDisplayName(user)}</div>
    <div className="text-xs text-neutral-500">{user.profile.login}</div>
  </>
);

const UserPickerModal: React.FC<UserPickerModalProps> = ({ picker, title, hint }) => (
  <Modal isOpen={picker.isOpen} onClose={picker.close} title={title} size="md">
    <SearchDropdown<OktaUser>
      label="Search for a user"
      placeholder="Search users..."
      query={picker.query}
      onQueryChange={picker.setQuery}
      isSearching={picker.isSearching}
      results={picker.results}
      showDropdown={picker.results.length > 0}
      onSelect={picker.pick}
      getKey={(user) => user.id}
      renderResult={userRow}
      hint={hint}
      error={picker.searchError}
    />
  </Modal>
);

export default UserPickerModal;
