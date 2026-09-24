import React from 'react';
import { useFitToView } from './useFitToView';

export interface FitBoxProps {
  className?: string;
  align?: 'center' | 'start';
  children: React.ReactNode;
}

const FitBox: React.FC<FitBoxProps> = ({ className, align = 'center', children }) => {
  const ref = useFitToView();
  return (
    <div
      ref={ref}
      className={`guide-fit ${align === 'start' ? 'guide-fit-start ' : ''}${className ?? ''}`}
    >
      <div className="guide-fit-inner">{children}</div>
    </div>
  );
};

export default FitBox;
