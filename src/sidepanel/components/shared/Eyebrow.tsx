import React from 'react';

export interface EyebrowProps {
  children: React.ReactNode;
  as?: 'span' | 'div' | 'h3';
  className?: string;
  title?: string;
  id?: string;
  testId?: string;
}

const eyebrowClasses = 'text-xs font-semibold uppercase tracking-wide text-neutral-600';

const Eyebrow: React.FC<EyebrowProps> = ({
  children,
  as: Component = 'span',
  className = '',
  title,
  testId,
  id,
}) => (
  <Component
    id={id}
    className={`${eyebrowClasses} ${className}`}
    title={title}
    data-testid={testId}
  >
    {children}
  </Component>
);

export default Eyebrow;
