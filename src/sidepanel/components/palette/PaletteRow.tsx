import React from 'react';
import Icon, { type IconType } from '../shared/Icon';

export interface PaletteRowProps {
  icon: IconType;
  label: string;
  secondary?: string;
  trailing?: React.ReactNode;
  isCurrent?: boolean;
  tabIndex: number;
  rowRef?: (element: HTMLElement | null) => void;
  href?: string;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  ariaLabel?: string;
}

const PaletteRow: React.FC<PaletteRowProps> = ({
  icon,
  label,
  secondary,
  trailing,
  isCurrent = false,
  tabIndex,
  rowRef,
  href,
  onClick,
  onKeyDown,
  ariaLabel,
}) => {
  const className = `press press-subtle w-full flex items-center gap-(--sp-inline) px-(--sp-row-x) py-(--sp-row-y) rounded-md text-left text-sm
      transition-colors duration-(--dur-instant)
      focus:outline-2 focus:outline-offset-2 focus:outline-primary
      ${isCurrent ? 'bg-primary-light text-primary-text font-semibold' : 'text-neutral-900 hover:bg-neutral-50'}`;

  const body = (
    <>
      <Icon
        type={icon}
        size="sm"
        className={`shrink-0 ${isCurrent ? 'text-primary-text' : 'text-neutral-500'}`}
      />
      <span className="flex-1 min-w-0">
        <span className="block truncate">{label}</span>
        {secondary && <span className="block truncate text-xs text-neutral-600">{secondary}</span>}
      </span>
      {trailing && <span className="shrink-0 text-xs font-medium">{trailing}</span>}
    </>
  );

  const shared = {
    ref: rowRef,
    tabIndex,
    'aria-current': isCurrent ? ('page' as const) : undefined,
    'aria-label': ariaLabel,
    onKeyDown,
    className,
  };

  return href ? (
    <a {...shared} href={href} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <button {...shared} type="button" onClick={onClick}>
      {body}
    </button>
  );
};

export default PaletteRow;
