import React from 'react';
import type { StatusType } from './status';

export type BadgeVariant = StatusType | 'neutral' | 'primary';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  solid?: boolean;
  title?: string;
  className?: string;
  testId?: string;
}

const softClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-light text-primary-text border-primary-highlight',
  info: 'bg-primary-light text-primary-text border-primary-highlight',
  success: 'bg-success-light text-success-text border-success-light',
  warning: 'bg-warning-light text-warning-text border-warning-light',
  danger: 'bg-danger-light text-danger-text border-danger-light',
  neutral: 'bg-neutral-50 text-neutral-700 border-neutral-200',
};

const solidClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary text-white border-primary',
  info: 'bg-primary text-white border-primary',
  success: 'bg-success text-white border-success',
  warning: 'bg-warning text-white border-warning',
  danger: 'bg-danger text-white border-danger',
  neutral: 'bg-neutral-700 text-white border-neutral-700',
};

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  solid = false,
  title,
  className = '',
  testId,
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium whitespace-nowrap ${
      solid ? solidClasses[variant] : softClasses[variant]
    } ${className}`}
    title={title}
    data-testid={testId}
  >
    {children}
  </span>
);

export default Badge;
