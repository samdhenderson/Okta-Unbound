import React from 'react';

export interface StableWidthProps {
  reserve: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

const ALIGNMENT: Record<NonNullable<StableWidthProps['align']>, string> = {
  start: 'justify-self-start',
  center: 'justify-self-center',
  end: 'justify-self-end',
};

const StableWidth: React.FC<StableWidthProps> = ({
  reserve,
  children,
  align = 'start',
  className = '',
}) => (
  <span className={`grid ${className}`.trim()}>
    <span
      aria-hidden="true"
      data-reserve-width="true"
      className="invisible col-start-1 row-start-1 select-none whitespace-nowrap"
    >
      {reserve}
    </span>
    <span className={`col-start-1 row-start-1 ${ALIGNMENT[align]}`}>{children}</span>
  </span>
);

export default StableWidth;
