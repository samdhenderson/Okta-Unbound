import React, { useCallback, useState } from 'react';
import FitBox from './FitBox';
import Stage from './Stage';
import { Legend, type LegendItem } from './Callout';
import { useRevealOnView } from './useRevealOnView';
import { sceneHeadingId, sceneId, useRegisterScene } from './sceneRegistry';

export interface SceneProps {
  title: string;
  stageLabel?: string;
  children: React.ReactNode;
  legend: ReadonlyArray<LegendItem>;
  intro?: React.ReactNode;
  outro?: React.ReactNode;
  minHeight?: number;
}

const Scene: React.FC<SceneProps> = ({
  title,
  stageLabel,
  children,
  legend,
  intro,
  outro,
  minHeight,
}) => {
  const reveal = useRevealOnView();
  const heading = sceneHeadingId(title);
  const id = sceneId(title);
  const [element, setElement] = useState<HTMLElement | null>(null);
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
      className="guide-scene flex flex-col gap-5"
      aria-labelledby={heading}
    >
      <div className="flex max-w-(--guide-prose-w) flex-col gap-1.5">
        <h3 id={heading} className="text-lg font-semibold tracking-tight text-neutral-900">
          {title}
        </h3>
        {intro ? <p className="text-sm leading-relaxed text-neutral-700">{intro}</p> : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-8">
        <FitBox className="w-full lg:w-(--guide-frame-w) lg:shrink-0">
          <Stage label={stageLabel} minHeight={minHeight}>
            {children}
          </Stage>
        </FitBox>
        <div className="flex min-w-0 flex-col gap-4 lg:flex-1 lg:self-center lg:pt-3">
          <Legend items={legend} />
          {outro ? (
            <p className="max-w-(--guide-prose-w) text-sm leading-relaxed text-neutral-700">
              {outro}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default Scene;
