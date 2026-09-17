import React from 'react';
import type { IconType } from '../shared/Icon';
import PaletteRowBody from './PaletteRowBody';
import { paletteRowClassName } from './paletteRowStyles';

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
  const body = (
    <PaletteRowBody
      icon={icon}
      label={label}
      secondary={secondary}
      trailing={trailing}
      isCurrent={isCurrent}
    />
  );

  const shared = {
    ref: rowRef,
    tabIndex,
    'aria-current': isCurrent ? ('page' as const) : undefined,
    'aria-label': ariaLabel,
    onKeyDown,
    className: paletteRowClassName(isCurrent),
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
