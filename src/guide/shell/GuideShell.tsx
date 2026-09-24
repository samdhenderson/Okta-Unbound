import React, { useState } from 'react';
import { type ChapterId } from '../chapters';
import Dock from './Dock';
import { SceneRegistryProvider } from './sceneRegistry';

export interface GuideShellProps {
  chapter: ChapterId;
  children: React.ReactNode;
}

const GuideShell: React.FC<GuideShellProps> = ({ chapter, children }) => {
  const [arrival, setArrival] = useState<'first' | 'change'>('first');
  const [shown, setShown] = useState(chapter);
  if (chapter !== shown) {
    setShown(chapter);
    setArrival('change');
  }
  const overture = arrival === 'first' && chapter === 'welcome';

  return (
    <SceneRegistryProvider>
      <div
        className="min-h-screen bg-canvas text-neutral-900"
        data-guide-arrival={arrival}
        data-guide-overture={overture || undefined}
      >
        <p className="px-6 pt-5 text-sm text-neutral-600 lg:hidden">
          <span className="font-semibold text-neutral-900">Okta Unbound</span> user guide
        </p>
        <div className="lg:flex lg:items-start">
          <div className="lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0">
            <Dock chapter={chapter} formsOnScroll={overture} />
          </div>
          <main className="min-w-0 px-6 pt-4 pb-28 sm:px-10 lg:flex-1 lg:px-12 lg:py-0">
            <div className="lg:mx-auto lg:max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </SceneRegistryProvider>
  );
};

export default GuideShell;
