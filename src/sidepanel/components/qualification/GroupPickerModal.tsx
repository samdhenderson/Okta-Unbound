import React from 'react';
import { Modal, SearchDropdown } from '../shared';
import type { GroupSearchResult } from '../../hooks/useAddToGroup';
import type { UseGroupPickerReturn } from '../../hooks/useGroupPicker';

export interface GroupPickerModalProps {
  picker: UseGroupPickerReturn;
  title: string;
  hint?: string;
}

const groupRow = (group: GroupSearchResult) => (
  <>
    <div className="text-sm font-medium text-neutral-900">{group.name}</div>
    <div className="text-xs text-neutral-500">{group.type}</div>
  </>
);

const GroupPickerModal: React.FC<GroupPickerModalProps> = ({ picker, title, hint }) => (
  <Modal isOpen={picker.isOpen} onClose={picker.close} title={title} size="md">
    <SearchDropdown<GroupSearchResult>
      label="Search for a group"
      placeholder="Search groups..."
      query={picker.query}
      onQueryChange={picker.setQuery}
      isSearching={picker.isSearching}
      results={picker.results}
      showDropdown={picker.results.length > 0}
      onSelect={picker.pick}
      getKey={(group) => group.id}
      renderResult={groupRow}
      hint={hint}
      error={picker.searchError}
    />
  </Modal>
);

export default GroupPickerModal;
