import React from 'react';
import IconButton from './IconButton';
import Icon from '../shared/Icon';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

export interface CopyableIdProps {
  value: string;
  label: string;
  className?: string;
}

const CopyableId: React.FC<CopyableIdProps> = ({ value, label, className = '' }) => {
  const { copied, copy } = useCopyToClipboard();

  return (
    <span className={`inline-flex min-w-0 items-center gap-1 ${className}`}>
      <code className="min-w-0 truncate font-mono text-xs text-neutral-500">{value}</code>
      <IconButton
        label={copied ? 'Copied!' : label}
        onClick={() => copy(value)}
        variant="ghost"
        size="sm"
        className="shrink-0"
      >
        <Icon
          type={copied ? 'clipboard-check' : 'clipboard'}
          size="sm"
          className={copied ? 'text-success-text' : ''}
        />
      </IconButton>
    </span>
  );
};

export default CopyableId;
