import React, { Suspense, useLayoutEffect, useRef } from 'react';
import { LoadingSpinner } from './shared';
import { useScrollPreservation } from '../hooks/useScrollPreservation';

export interface TabPanelProps {
  isActive: boolean;
  scrollRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ isActive, scrollRef, children }) => {
  useScrollPreservation(scrollRef, isActive);

  const didResetOnMount = useRef(false);
  useLayoutEffect(() => {
    if (didResetOnMount.current || !isActive) return;
    didResetOnMount.current = true;
    const node = scrollRef.current;
    if (node) node.scrollTop = 0;
  }, [isActive, scrollRef]);

  return (
    <div className={isActive ? 'tab-content active' : 'tab-content'} hidden={!isActive}>
      <Suspense fallback={<LoadingSpinner size="lg" message="Loading tab..." centered />}>
        {children}
      </Suspense>
    </div>
  );
};

export default TabPanel;
