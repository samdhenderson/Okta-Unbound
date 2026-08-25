import React from 'react';
import { AlertMessage, Button, Modal, SearchDropdown } from '../../shared';
import type { GroupSummary } from '../../../../shared/types';

export interface CompareGroupModalProps {
  isOpen: boolean;
  group: GroupSummary;
  query: string;
  onQueryChange: (value: string) => void;
  results: GroupSummary[];
  isSearching: boolean;
  searchError?: string | null;
  selected: GroupSummary | null;
  onSelect: (hit: GroupSummary) => void;
  onClearSelected: () => void;
  canSearch: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const groupRow = (hit: GroupSummary): React.ReactNode => (
  <span className="flex min-w-0 flex-col items-start text-left">
    <span className="truncate text-sm text-neutral-900">{hit.name}</span>
    <span className="text-xs text-neutral-600">
      {hit.type} · {hit.memberCount.toLocaleString()} member{hit.memberCount === 1 ? '' : 's'}
    </span>
  </span>
);

const CompareGroupModal: React.FC<CompareGroupModalProps> = ({
  isOpen,
  group,
  query,
  onQueryChange,
  results,
  isSearching,
  searchError,
  selected,
  onSelect,
  onClearSelected,
  canSearch,
  onClose,
  onConfirm,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Compare with another group"
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" disabled={!selected} onClick={onConfirm}>
          Compare
        </Button>
      </>
    }
  >
    <div className="space-y-3">
      <p className="text-sm text-neutral-600">
        Reports who is in both groups, who is unique to each, and how far they overlap. Reading each
        roster costs one pass per group.
      </p>

      <SearchDropdown
        label={`Compare ${group.name} with`}
        placeholder="Search groups by name…"
        query={query}
        onQueryChange={onQueryChange}
        isSearching={isSearching}
        results={results}
        showDropdown={!selected && results.length > 0 && query.trim().length > 0}
        onSelect={onSelect}
        renderResult={groupRow}
        selectedItem={selected}
        renderSelected={groupRow}
        onClear={onClearSelected}
        disabled={!canSearch}
        hint={canSearch ? undefined : 'Connect an Okta tab to search groups.'}
      />

      {searchError && <AlertMessage message={{ text: searchError, type: 'danger' }} />}
    </div>
  </Modal>
);

export default CompareGroupModal;
