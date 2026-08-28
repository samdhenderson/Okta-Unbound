import React from 'react';
import Icon, { type IconType } from './Icon';
import { useCountUp } from '../../hooks/useCountUp';

interface StatCardProps {
  title: string;
  value: number | string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  icon?: IconType;
  subtitle?: string;
  onClick?: () => void;
  countUp?: boolean;
}

const colorConfigs = {
  primary: {
    iconBg: 'bg-primary-light',
    iconColor: 'text-primary-text',
    cardBg: 'bg-white',
    border: 'border-primary-highlight',
    textColor: 'text-neutral-900',
  },
  success: {
    iconBg: 'bg-success-light',
    iconColor: 'text-success-text',
    cardBg: 'bg-white',
    border: 'border-neutral-200',
    textColor: 'text-neutral-900',
  },
  warning: {
    iconBg: 'bg-warning-light',
    iconColor: 'text-warning-text',
    cardBg: 'bg-white',
    border: 'border-neutral-200',
    textColor: 'text-neutral-900',
  },
  danger: {
    iconBg: 'bg-danger-light',
    iconColor: 'text-danger-text',
    cardBg: 'bg-white',
    border: 'border-neutral-200',
    textColor: 'text-neutral-900',
  },
  neutral: {
    iconBg: 'bg-neutral-100',
    iconColor: 'text-neutral-600',
    cardBg: 'bg-white',
    border: 'border-neutral-200',
    textColor: 'text-neutral-900',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  color = 'neutral',
  icon,
  subtitle,
  onClick,
  countUp = false,
}) => {
  const config = colorConfigs[color];

  const numericValue = typeof value === 'number' ? value : null;
  const { value: countedValue, justResolved } = useCountUp(numericValue ?? 0, {
    enabled: countUp && numericValue !== null,
  });
  const displayValue = numericValue === null ? value : countedValue.toLocaleString();

  const interactive = Boolean(onClick);

  const baseClasses = `
    relative overflow-hidden rounded-md border p-4
    ${config.cardBg} ${config.border}
    ${
      interactive
        ? 'press lift cursor-pointer hover:border-neutral-300 active:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        : 'transition-colors duration-(--dur-instant) ease-standard'
    }
  `.trim();

  const handleKeyDown = interactive
    ? (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onClick?.();
      }
    : undefined;

  return (
    <div
      className={baseClasses}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={{ fontFamily: 'var(--font-primary)' }}
    >
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</p>
          <p
            className={`mt-2 text-3xl font-bold tracking-tight truncate tabular-nums transition-colors duration-(--dur-tell) ${
              justResolved ? 'text-success-text' : config.textColor
            }`}
            style={{ fontFamily: 'var(--font-primary)' }}
          >
            {displayValue}
          </p>
          {subtitle && (
            <p className="mt-1.5 text-xs font-medium text-neutral-500 truncate">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`${config.iconBg} p-2.5 rounded-md flex-shrink-0`}>
            <Icon type={icon} className={config.iconColor} size="lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
