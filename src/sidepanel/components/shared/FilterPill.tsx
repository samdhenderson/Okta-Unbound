import React, { useId } from 'react';

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  disabled?: boolean;
  unavailableReason?: string;
  inactiveClassName?: string;
}

const FilterPill: React.FC<FilterPillProps> = ({
  active,
  onClick,
  children,
  title,
  disabled = false,
  unavailableReason,
  inactiveClassName = 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:border-neutral-400',
}) => {
  const reasonId = useId();
  const unavailable = unavailableReason !== undefined;

  return (
    <>
      <button
        type="button"
        onClick={unavailable ? undefined : onClick}
        title={title}
        aria-pressed={active}
        disabled={disabled}
        aria-disabled={unavailable || undefined}
        aria-describedby={unavailable ? reasonId : undefined}
        className={`px-2.5 py-1.5 rounded-md text-xs font-medium press active:brightness-90 focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed ${
          active ? 'bg-primary text-white' : inactiveClassName
        }`}
      >
        {children}
      </button>
      {unavailable && (
        <span id={reasonId} className="sr-only">
          {unavailableReason}
        </span>
      )}
    </>
  );
};

export default FilterPill;
