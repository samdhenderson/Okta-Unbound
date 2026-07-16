import React from 'react';
import Button from '../shared/Button';

export type ActivePanel = 'none' | 'bulk' | 'crossSearch' | 'collections' | 'cleanup';

interface GroupSelectionBarProps {
  selectedCount: number;
  filteredCount: number;
  activePanel: ActivePanel;
  crossSearchBadge: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCompare: () => void;
  onMerge: () => void;
  onTogglePanel: (panel: ActivePanel) => void;
  onExportSelection: () => void;
  onExportGroupsList: () => void;
}

const GroupSelectionBar: React.FC<GroupSelectionBarProps> = ({
  selectedCount,
  filteredCount,
  activePanel,
  crossSearchBadge,
  onSelectAll,
  onDeselectAll,
  onCompare,
  onMerge,
  onTogglePanel,
  onExportSelection,
  onExportGroupsList,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-50 rounded-md border border-neutral-200">
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-neutral-700">
        {selectedCount} of {filteredCount} selected
      </span>
      <Button variant="ghost" size="sm" onClick={onSelectAll}>
        Select All
      </Button>
      <Button variant="ghost" size="sm" onClick={onDeselectAll}>
        Deselect All
      </Button>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      {selectedCount >= 2 && selectedCount <= 5 && (
        <Button variant="secondary" size="sm" icon="chart" onClick={onCompare}>
          Compare ({selectedCount})
        </Button>
      )}

      {selectedCount >= 2 && (
        <Button variant="secondary" size="sm" icon="link" onClick={onMerge}>
          Merge ({selectedCount})
        </Button>
      )}

      {selectedCount > 0 && (
        <Button
          variant="secondary"
          size="sm"
          icon="list"
          onClick={() => onTogglePanel('bulk')}
          className={activePanel === 'bulk' ? 'ring-2 ring-primary/20' : ''}
        >
          Bulk Actions
        </Button>
      )}

      <Button
        variant="secondary"
        size="sm"
        icon="search"
        onClick={() => onTogglePanel('crossSearch')}
        className={activePanel === 'crossSearch' ? 'ring-2 ring-primary/20' : ''}
        badge={crossSearchBadge > 0 ? String(crossSearchBadge) : undefined}
      >
        Cross-Search
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon="clipboard"
        onClick={() => onTogglePanel('collections')}
        className={activePanel === 'collections' ? 'ring-2 ring-primary/20' : ''}
      >
        Collections
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon="sparkles"
        onClick={() => onTogglePanel('cleanup')}
        className={activePanel === 'cleanup' ? 'ring-2 ring-primary/20' : ''}
      >
        Cleanup
      </Button>

      {selectedCount > 0 && (
        <Button variant="secondary" size="sm" icon="download" onClick={onExportSelection}>
          Export ({selectedCount})
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        icon="download"
        onClick={onExportGroupsList}
        disabled={filteredCount === 0}
        title="Export the current groups list as CSV"
      >
        Export List
      </Button>
    </div>
  </div>
);

export default GroupSelectionBar;
