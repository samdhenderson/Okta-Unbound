import React from 'react';
import Icon, { type IconType } from '../overview/shared/Icon';
import Button from './Button';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  icon: IconType;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light mb-4">
        <Icon type={icon} size="xl" className="text-primary-text" />
      </div>

      <h3
        className="text-xl font-semibold text-neutral-900 mb-2"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h3>

      <p className="text-neutral-600 max-w-md mx-auto mb-6">{description}</p>

      {actions && actions.length > 0 && (
        <div className="flex gap-3 justify-center">
          {actions.map((action, index) => (
            <Button key={index} variant={action.variant || 'primary'} onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
