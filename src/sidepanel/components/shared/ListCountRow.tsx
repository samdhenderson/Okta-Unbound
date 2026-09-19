import React from 'react';
import Button from './Button';
import ListCountLine, { type ListCountLineProps } from './ListCountLine';

export type SelectAllBoundary = 'available' | 'all-taken' | 'none-selectable';

export interface ListCountRowSelection {
  boundary: SelectAllBoundary;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  selectAllTitle: string;
  deselectAllTitle: string;
}

export interface ListCountRowProps extends ListCountLineProps {
  selection?: ListCountRowSelection;
  className?: string;
}

const ListCountRow: React.FC<ListCountRowProps> = ({
  shown,
  of,
  selected = 0,
  selection,
  className = '',
  testId,
}) => (
  <div
    className={`flex flex-wrap-reverse items-baseline gap-x-(--sp-inline) gap-y-1 mb-(--sp-toolbar) ${className}`}
  >
    <ListCountLine shown={shown} of={of} selected={selected} testId={testId} />
    {selection && (
      <div className="ml-auto flex shrink-0 items-baseline gap-x-(--sp-inline)">
        {selected > 0 && (
          <Button
            variant="link"
            size="xs"
            onClick={selection.onDeselectAll}
            title={selection.deselectAllTitle}
          >
            Deselect all
          </Button>
        )}
        <Button
          variant="link"
          size="xs"
          onClick={selection.onSelectAll}
          disabled={selection.boundary !== 'available'}
          title={selection.selectAllTitle}
        >
          Select all
        </Button>
      </div>
    )}
  </div>
);

export default ListCountRow;
