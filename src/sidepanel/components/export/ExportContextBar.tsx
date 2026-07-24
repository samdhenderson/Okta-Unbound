import React from 'react';
import { SearchDropdown } from '../shared';
import { useSearchWithDropdown } from '../../hooks/useSearchWithDropdown';
import type { EntityContextOption } from '../../export/types';

interface ExportContextBarProps {
  label: string;
  placeholder: string;
  search: (query: string) => Promise<EntityContextOption[]>;
  onSelect: (option: EntityContextOption | null) => void;
  initialSelected?: EntityContextOption | null;
}

const ExportContextBar: React.FC<ExportContextBarProps> = ({
  label,
  placeholder,
  search,
  onSelect,
  initialSelected = null,
}) => {
  const dropdown = useSearchWithDropdown<EntityContextOption>({
    searchFn: search,
    onSelect,
    initialSelected,
  });

  return (
    <SearchDropdown<EntityContextOption>
      label={label}
      placeholder={placeholder}
      query={dropdown.query}
      onQueryChange={dropdown.setQuery}
      isSearching={dropdown.isSearching}
      results={dropdown.results}
      showDropdown={dropdown.showDropdown}
      onSelect={dropdown.selectItem}
      selectedItem={dropdown.selectedItem}
      onClear={() => {
        dropdown.clearSearch();
        onSelect(null);
      }}
      renderResult={(option) => (
        <div>
          <div className="font-medium text-neutral-900">{option.label}</div>
          {option.sublabel && <div className="text-xs text-neutral-500">{option.sublabel}</div>}
        </div>
      )}
      renderSelected={(option) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-900">{option.label}</span>
          {option.sublabel && <span className="text-xs text-neutral-500">{option.sublabel}</span>}
        </div>
      )}
    />
  );
};

export default ExportContextBar;
