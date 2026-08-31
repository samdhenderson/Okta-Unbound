import React from 'react';
import Icon from './Icon';

export interface FilterToggleProps {
  open: boolean;
  activeCount: number;
  onToggle: () => void;
  size?: 'md' | 'lg';
  label?: string;
  title?: string;
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
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={open}
    aria-label={activeCount > 0 ? `${label}, ${activeCount} applied` : label}
    className={`press flex items-center gap-(--sp-inline) rounded-md border text-sm font-medium ${
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
    {activeCount > 0 && (
      <span
        aria-hidden="true"
        className="min-w-[20px] rounded-full bg-primary px-1.5 py-0.5 text-center text-xs font-bold text-white"
      >
        {activeCount}
      </span>
    )}
  </button>
);

export default FilterToggle;
