import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  message?: string;
  centered?: boolean;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-6 w-6 border-3',
  xl: 'h-8 w-8 border-3',
  '2xl': 'h-12 w-12 border-4',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'xl',
  message,
  centered = false,
  className = '',
}) => {
  const spinner = (
    <div
      className={`inline-block animate-spin rounded-full border-neutral-200 border-t-primary ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );

  if (!centered && !message) {
    return spinner;
  }

  return (
    <div className={`${centered ? 'flex items-center justify-center py-12' : ''}`}>
      <div className="text-center">
        {spinner}
        {message && <p className="mt-4 text-neutral-600 text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
