import React from 'react';
import { AlertMessage, Button, FilterPill, Input } from '../../shared';
import type { ComparisonEditSide } from '../../../hooks/useComparisonProfileEdit';

export type AttributeFilter = 'differences' | 'shared' | 'all';

export interface ComparisonAttributesToolbarProps {
  filter: AttributeFilter;
  onFilterChange: (filter: AttributeFilter) => void;
  differenceCount: number;
  sharedCount: number;
  totalCount: number;
  query: string;
  onQueryChange: (query: string) => void;
  hiddenDifferences: number;
  revealHidden: boolean;
  onToggleHidden: () => void;
  contextEdit?: ComparisonEditSide;
  comparedEdit?: ComparisonEditSide;
}

const scopedLabel = (visible: string, spoken: string): React.ReactNode => (
  <>
    <span aria-hidden="true">{visible}</span>
    <span className="sr-only">{spoken}</span>
  </>
);

const SideEditControls: React.FC<{ side: ComparisonEditSide }> = ({ side }) => {
  if (!side.canEdit) return null;

  return (
    <div className="min-w-0 flex-1 space-y-1">
      {side.isEditing ? (
        <div className="flex items-start gap-2">
          <Button variant="ghost" size="sm" onClick={side.cancel} disabled={side.isSaving}>
            {scopedLabel('Cancel', `Cancel editing ${side.userName}`)}
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            loading={side.isSaving}
            disabled={!side.hasChanges || side.hasInvalid}
            title={
              side.hasInvalid
                ? 'Some values are not valid. Fix them before saving.'
                : !side.hasChanges
                  ? 'Nothing has been changed yet.'
                  : undefined
            }
            onClick={side.requestSave}
          >
            {scopedLabel('Save', `Save changes to ${side.userName}`)}
          </Button>
        </div>
      ) : (
        <Button variant="secondary" size="sm" fullWidth onClick={side.begin}>
          Edit {side.userName}
        </Button>
      )}
      {side.message && (
        <AlertMessage message={{ type: side.message.type, text: side.message.text }} />
      )}
    </div>
  );
};

const ComparisonAttributesToolbar: React.FC<ComparisonAttributesToolbarProps> = ({
  filter,
  onFilterChange,
  differenceCount,
  sharedCount,
  totalCount,
  query,
  onQueryChange,
  hiddenDifferences,
  revealHidden,
  onToggleHidden,
  contextEdit,
  comparedEdit,
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-wrap items-center gap-1.5">
      <FilterPill active={filter === 'differences'} onClick={() => onFilterChange('differences')}>
        Differences {differenceCount}
      </FilterPill>
      <FilterPill active={filter === 'shared'} onClick={() => onFilterChange('shared')}>
        Shared {sharedCount}
      </FilterPill>
      <FilterPill active={filter === 'all'} onClick={() => onFilterChange('all')}>
        All {totalCount}
      </FilterPill>
    </div>

    <Input
      type="search"
      value={query}
      onChange={onQueryChange}
      placeholder="Filter attributes…"
      ariaLabel="Filter attributes by name or value"
    />

    {hiddenDifferences > 0 && (
      <p className="flex flex-wrap items-center gap-1 text-xs text-neutral-600">
        <span>
          {hiddenDifferences === 1
            ? '1 differing attribute hidden by your display config'
            : `${hiddenDifferences} differing attributes hidden by your display config`}
        </span>
        <Button variant="ghost" size="sm" onClick={onToggleHidden}>
          {revealHidden ? 'Hide' : 'Show'}
        </Button>
      </p>
    )}

    {(contextEdit?.canEdit || comparedEdit?.canEdit) && (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        {contextEdit && <SideEditControls side={contextEdit} />}
        {comparedEdit && <SideEditControls side={comparedEdit} />}
      </div>
    )}
  </div>
);

export default ComparisonAttributesToolbar;
