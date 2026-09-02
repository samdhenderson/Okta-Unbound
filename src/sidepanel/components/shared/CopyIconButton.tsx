import React from 'react';
import IconButton from './IconButton';
import Icon from '../shared/Icon';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

export interface CopyIconButtonProps {
  value: string;
  label: string;
  className?: string;
}

const CopyIconButton: React.FC<CopyIconButtonProps> = ({
  value,
  label,
  className = 'shrink-0',
}) => {
  const { copied, copy } = useCopyToClipboard();

  return (
    <IconButton
      label={copied ? 'Copied!' : label}
      onClick={() => copy(value)}
      variant="ghost"
      size="sm"
      className={className}
    >
      <Icon
        type={copied ? 'clipboard-check' : 'clipboard'}
        size="sm"
        className={copied ? 'text-success-text' : ''}
      />
    </IconButton>
  );
};

export default CopyIconButton;
