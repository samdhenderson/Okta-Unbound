import React from 'react';

export interface ActionBarProps {
  children: React.ReactNode;
  ariaLabel: string;
  sticky?: boolean;
  className?: string;
  testId?: string;
}

const ActionBar: React.FC<ActionBarProps> = ({
  children,
  ariaLabel,
  sticky = true,
  className = '',
  testId,
}) => (
  <div
    role="group"
    aria-label={ariaLabel}
    data-testid={testId}
    className={`
      flex flex-wrap items-center gap-2
      rounded-md border border-neutral-200 bg-white p-2
      ${sticky ? 'sticky top-0 z-10' : ''}
      ${className}
    `
      .trim()
      .replace(/\s+/g, ' ')}
  >
    {children}
  </div>
);

export default ActionBar;
