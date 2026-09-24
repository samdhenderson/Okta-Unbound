import React from 'react';
import { chapterById, type ChapterId } from '../chapters';
import { standingOf } from '../status';
import FitBox from '../shell/FitBox';
import Stage from '../shell/Stage';
import StatusChip from '../shell/StatusChip';
import Headline from './Headline';
import { useShowPlayer } from './useShowPlayer';

export interface Beat {
  caption: string;
  hold?: number;
}

export interface ShowProps {
  id: ChapterId;
  beats: ReadonlyArray<Beat>;
  stageLabel?: string;
  minHeight?: number;
  hero?: boolean;
  opening?: { greeting: React.ReactNode; card: React.ReactNode };
  children: (beat: number) => React.ReactNode;
}

const Show: React.FC<ShowProps> = ({
  id,
  beats,
  stageLabel,
  minHeight,
  hero,
  opening,
  children,
}) => {
  const def = chapterById(id);
  const standing = standingOf(id);
  const {
    beat,
    state,
    ref: watch,
  } = useShowPlayer(
    beats.length,
    beats.map((b) => b.hold),
  );
  const caption = beats[beat]?.caption ?? '';

  const words = (
    <div className="flex min-w-0 flex-col justify-center gap-6">
      <p className="guide-eyebrow flex flex-wrap items-center gap-3 text-sm text-neutral-600">
        <span>{def.title}</span>
        {standing ? <StatusChip status={standing.status} /> : null}
      </p>
      <Headline
        id={`show-${id}`}
        size={hero ? 'hero' : 'chapter'}
        text={def.headline}
        subline={def.subline}
      />
    </div>
  );

  const line = (
    <p className="guide-caption h-6 text-sm leading-6 text-neutral-600" data-testid="guide-caption">
      <span key={beat} className="inline-block animate-rise-in">
        {caption}
      </span>
    </p>
  );

  return stageLabel ? (
    <section
      className="guide-show grid gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-12"
      aria-labelledby={`show-${id}`}
      data-show-state={state}
    >
      <div className="flex min-w-0 flex-col justify-center lg:col-span-5">{words}</div>
      <div className="flex min-h-0 min-w-0 flex-col items-stretch gap-4 lg:col-span-7">
        <FitBox className="guide-stage-lens min-h-0 flex-1">
          <Stage label={stageLabel} minHeight={minHeight} lit stageRef={watch}>
            {children(beat)}
          </Stage>
        </FitBox>
        <div className="flex justify-center">{line}</div>
      </div>
    </section>
  ) : (
    <>
      {opening ? (
        <>
          <div className="guide-show flex flex-col justify-center">
            <div className="max-w-(--guide-prose-w)">{opening.greeting}</div>
          </div>
          <section
            className="guide-show guide-show-card flex flex-col justify-center gap-6"
            aria-labelledby={`show-${id}`}
          >
            <h2
              id={`show-${id}`}
              className="text-4xl font-semibold leading-none tracking-tight text-balance text-neutral-900 sm:text-5xl lg:sr-only"
            >
              {def.headline}
            </h2>
            {opening.card}
          </section>
        </>
      ) : (
        <section className="guide-show flex flex-col justify-center" aria-labelledby={`show-${id}`}>
          <div className="max-w-(--guide-prose-w)">{words}</div>
        </section>
      )}
      <section
        className="guide-show guide-show-pieces flex flex-col justify-center gap-6"
        aria-label={def.title}
        data-show-state={state}
      >
        <FitBox align="start" className="min-h-0 w-full flex-1">
          <div ref={watch}>{children(beat)}</div>
        </FitBox>
        {line}
      </section>
    </>
  );
};

export default Show;
