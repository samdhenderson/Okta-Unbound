import React from 'react';
import CopyIconButton from './CopyIconButton';

export interface CopyableIdProps {
  value: string;
  label: string;
  className?: string;
}

const CopyableId: React.FC<CopyableIdProps> = ({ value, label, className = '' }) => {
  return (
    <span className={`inline-flex min-w-0 items-center gap-1 ${className}`}>
      <code className="min-w-0 truncate font-mono text-xs text-neutral-500">{value}</code>
      <CopyIconButton value={value} label={label} />
    </span>
  );
};

export default CopyableId;
