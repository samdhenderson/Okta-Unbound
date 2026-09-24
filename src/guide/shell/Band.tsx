import React, { useCallback, useState } from 'react';
import { useRevealOnView } from './useRevealOnView';
import { sceneHeadingId, sceneId, useRegisterScene } from './sceneRegistry';

export interface BandProps {
  title: string;
  children: React.ReactNode;
}

const Band: React.FC<BandProps> = ({ title, children }) => {
  const reveal = useRevealOnView();
  const [element, setElement] = useState<HTMLElement | null>(null);
  const id = sceneId(title);
  useRegisterScene({ id, title }, element);
  const ref = useCallback(
    (node: HTMLElement | null) => {
      reveal(node);
      setElement(node);
    },
    [reveal],
  );
  return (
    <section
      ref={ref}
      id={id}
      className="guide-scene flex flex-col gap-3"
      aria-labelledby={sceneHeadingId(title)}
    >
      <h3
        id={sceneHeadingId(title)}
        className="text-lg font-semibold tracking-tight text-neutral-900"
      >
        {title}
      </h3>
      {children}
    </section>
  );
};

export default Band;
