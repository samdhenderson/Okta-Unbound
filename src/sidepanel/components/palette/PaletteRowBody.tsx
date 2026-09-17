import React from 'react';
import Icon, { type IconType } from '../shared/Icon';

export interface PaletteRowBodyProps {
  icon: IconType;
  label: string;
  secondary?: string;
  trailing?: React.ReactNode;
  isCurrent?: boolean;
  mono?: boolean;
}

const PaletteRowBody: React.FC<PaletteRowBodyProps> = ({
  icon,
  label,
  secondary,
  trailing,
  isCurrent = false,
  mono = false,
}) => (
  <>
    <Icon
      type={icon}
      size="sm"
      className={`shrink-0 ${isCurrent ? 'text-primary-text' : 'text-neutral-500'}`}
    />
    <span className="flex-1 min-w-0">
      <span className={`block truncate ${mono ? 'font-mono' : ''}`}>{label}</span>
      {secondary && <span className="block truncate text-xs text-neutral-600">{secondary}</span>}
    </span>
    {trailing && <span className="shrink-0 text-xs font-medium">{trailing}</span>}
  </>
);

export default PaletteRowBody;
