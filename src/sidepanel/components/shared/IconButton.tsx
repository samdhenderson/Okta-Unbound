import React from 'react';

export type IconButtonVariant = 'ghost' | 'subtle' | 'danger';
export type IconButtonSize = 'sm' | 'md';

interface IconButtonProps {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  active?: boolean;
  expanded?: boolean;
  controls?: string;
  className?: string;
}

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50',
  subtle: 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100',
  danger: 'text-neutral-400 hover:text-danger hover:bg-danger-light',
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'p-1',
  md: 'p-1.5',
};

const IconButton: React.FC<IconButtonProps> = ({
  label,
  onClick,
  children,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  type = 'button',
  title,
  active,
  expanded,
  controls,
  className = '',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={active}
    aria-expanded={expanded}
    aria-controls={controls}
    title={title ?? label}
    className={`inline-flex items-center justify-center rounded-md transition-colors duration-100 focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
  >
    {children}
  </button>
);

export default IconButton;
