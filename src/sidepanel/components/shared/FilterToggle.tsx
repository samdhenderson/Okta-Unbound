import React from 'react';
import Icon from './Icon';
import StableWidth from './StableWidth';

export interface FilterToggleProps {
  open: boolean;
  activeCount: number;
  onToggle: () => void;
  size?: 'md' | 'lg';
  label?: string;
  title?: string;
  controls?: string;
}

const PADDING: Record<'md' | 'lg', string> = {
  md: 'px-4 py-2',
  lg: 'px-4 py-3',
};

const FilterToggle: React.FC<FilterToggleProps> = ({
  open,
  activeCount,
  onToggle,
  size = 'md',
  label = 'Filters',
  title = 'Toggle filters',
  controls,
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={controls ? undefined : open}
    aria-expanded={controls ? open : undefined}
    aria-controls={controls}
    aria-label={activeCount > 0 ? `${label}, ${activeCount} applied` : label}
    className={`press flex shrink-0 items-center gap-(--sp-inline) rounded-md border text-sm font-medium ${
      PADDING[size]
    } ${
      open || activeCount > 0
        ? 'bg-primary-light border-primary text-primary-text'
        : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400'
    }`}
    title={title}
  >
    <Icon type="filter" size="sm" />
    {label}
    <StableWidth
      reserve={
        <span className="min-w-[20px] px-1.5 py-0.5 text-xs font-bold">
          {Math.max(activeCount, 1)}
        </span>
      }
      align="center"
    >
      {activeCount > 0 && (
        <span
          aria-hidden="true"
          className="min-w-[20px] rounded-full bg-primary px-1.5 py-0.5 text-center text-xs font-bold tabular-nums text-white"
        >
          {activeCount}
        </span>
      )}
    </StableWidth>
  </button>
);

export default FilterToggle;
