import React from 'react';

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  disabled?: boolean;
  inactiveClassName?: string;
}

const FilterPill: React.FC<FilterPillProps> = ({
  active,
  onClick,
  children,
  title,
  disabled = false,
  inactiveClassName = 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:border-neutral-400',
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-pressed={active}
    disabled={disabled}
    className={`px-2.5 py-1.5 rounded-md text-xs font-medium press active:brightness-90 focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:opacity-50 disabled:cursor-not-allowed ${
      active ? 'bg-primary text-white' : inactiveClassName
    }`}
  >
    {children}
  </button>
);

export default FilterPill;
