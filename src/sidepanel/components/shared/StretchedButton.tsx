import React from 'react';

interface StretchedButtonProps {
  label: string;
  onClick: () => void;
  describedBy?: string;
  title?: string;
  disabled?: boolean;
  className?: string;
}

const StretchedButton: React.FC<StretchedButtonProps> = ({
  label,
  onClick,
  describedBy,
  title,
  disabled = false,
  className = '',
}) => (
  <button
    type="button"
    aria-label={label}
    aria-describedby={describedBy}
    title={title ?? label}
    onClick={onClick}
    disabled={disabled}
    className={`absolute inset-0 z-0 h-full w-full rounded-md focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed ${className}`}
  />
);

export default StretchedButton;
