import React from 'react';
import Icon from '../shared/Icon';
import Button from './Button';
import IconButton from './IconButton';
import { type StatusType } from './status';

export interface AlertMessageData {
  text: string;
  type: StatusType;
}

export interface AlertAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'danger';
}

interface AlertMessageProps {
  message: AlertMessageData;
  onDismiss?: () => void;
  action?: AlertAction;
  className?: string;
}

const typeStyles = {
  info: {
    bg: 'bg-info-light border-primary-highlight',
    icon: 'text-primary-text',
    text: 'text-primary-dark',
  },
  success: {
    bg: 'bg-success-light border-success-light',
    icon: 'text-success',
    text: 'text-success-text',
  },
  warning: {
    bg: 'bg-warning-light border-warning-light',
    icon: 'text-warning',
    text: 'text-warning-text',
  },
  danger: {
    bg: 'bg-danger-light border-danger-light',
    icon: 'text-danger',
    text: 'text-danger-text',
  },
};

const AlertMessage: React.FC<AlertMessageProps> = ({
  message,
  onDismiss,
  action,
  className = '',
}) => {
  const status = message.type;
  const styles = typeStyles[status];

  return (
    <div
      className={`p-4 rounded-md border flex items-start justify-between gap-4 ${styles.bg} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3 flex-1">
        <svg
          className={`w-5 h-5 shrink-0 mt-0.5 ${styles.icon}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {status === 'success' ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ) : status === 'danger' ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ) : status === 'warning' ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
        </svg>

        <span className={`text-sm ${styles.text}`}>{message.text}</span>

        {action && (
          <Button
            variant={action.variant === 'danger' || status === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={action.onClick}
            className="ml-3"
          >
            {action.label}
          </Button>
        )}
      </div>

      {onDismiss && (
        <IconButton label="Dismiss message" variant="ghost" size="md" onClick={onDismiss}>
          <Icon type="close" size="md" />
        </IconButton>
      )}
    </div>
  );
};

export default AlertMessage;
