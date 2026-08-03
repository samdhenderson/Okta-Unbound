import React from 'react';
import Button, { type ButtonVariant, type ButtonSize } from './Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

interface CopyButtonProps {
  getText: () => string;
  label: string;
  copiedLabel?: string;
  disabled?: boolean;
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  getText,
  label,
  copiedLabel = 'Copied',
  disabled = false,
  title,
  variant = 'secondary',
  size = 'sm',
  className,
}) => {
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = () => {
    copy(getText());
  };

  return (
    <Button
      variant={copied ? 'success' : variant}
      size={size}
      icon={copied ? 'clipboard-check' : 'clipboard'}
      onClick={handleCopy}
      disabled={disabled}
      title={title}
      className={className}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
};

export default CopyButton;
