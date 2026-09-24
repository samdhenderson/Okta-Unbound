import React, { Suspense, useEffect } from 'react';
import { CHAPTER_COMPONENTS } from './chapters/index';
import GuideShell from './shell/GuideShell';
import { useHashRoute } from './useHashRoute';
import LoadingSpinner from '../sidepanel/components/shared/LoadingSpinner';

const GuideApp: React.FC = () => {
  const { chapter } = useHashRoute();
  const Chapter = CHAPTER_COMPONENTS[chapter];

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [chapter]);

  return (
    <GuideShell chapter={chapter}>
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <Chapter key={chapter} />
      </Suspense>
    </GuideShell>
  );
};

export default GuideApp;
