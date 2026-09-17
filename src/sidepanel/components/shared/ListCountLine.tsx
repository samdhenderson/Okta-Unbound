import React from 'react';

export interface ListCountLineProps {
  shown: number;
  of?: number;
  selected?: number;
  className?: string;
  testId?: string;
}

const ListCountLine: React.FC<ListCountLineProps> = ({
  shown,
  of,
  selected = 0,
  className = '',
  testId,
}) => (
  <p className={`text-xs tabular-nums text-neutral-500 ${className}`} data-testid={testId}>
    Showing {shown.toLocaleString()}
    {of !== undefined && ` of ${of.toLocaleString()}`}
    {selected > 0 && (
      <span className="text-primary-text"> · {selected.toLocaleString()} selected</span>
    )}
  </p>
);

export default ListCountLine;
