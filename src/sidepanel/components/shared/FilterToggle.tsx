import React from 'react';
import Icon from './Icon';

export interface FilterToggleProps {
  open: boolean;
  activeCount: number;
  onToggle: () => void;
  size?: 'md' | 'lg';
  label?: string;
  title?: string;
  controls?: string;
}

const BOX: Record<'md' | 'lg', string> = {
  md: 'size-[38px]',
  lg: 'size-[46px]',
};

const GLYPH: Record<'md' | 'lg', 'sm' | 'md'> = {
  md: 'sm',
  lg: 'md',
};

const FilterToggle: React.FC<FilterToggleProps> = ({
  open,
  activeCount,
  onToggle,
  size = 'md',
  label = 'Filters',
  title,
  controls,
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={controls ? undefined : open}
    aria-expanded={controls ? open : undefined}
    aria-controls={controls}
    aria-label={activeCount > 0 ? `${label}, ${activeCount} applied` : label}
    className={`press relative flex shrink-0 items-center justify-center rounded-md border text-sm font-medium ${
      BOX[size]
    } ${
      open || activeCount > 0
        ? 'bg-primary-light border-primary text-primary-text'
        : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400'
    }`}
    title={title ?? (open ? 'Hide filters' : 'Show filters')}
  >
    <Icon type="filter" size={GLYPH[size]} />
    {activeCount > 0 && (
      <span
        aria-hidden="true"
        className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-primary px-1 text-center text-xs font-bold leading-[18px] tabular-nums text-white ring-1 ring-white"
      >
        {activeCount}
      </span>
    )}
  </button>
);

export default FilterToggle;
