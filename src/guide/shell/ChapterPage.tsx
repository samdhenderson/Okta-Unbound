import React from 'react';
import Icon from '../../sidepanel/components/shared/Icon';
import { chapterById, type ChapterId, hashFor, nextChapter, previousChapter } from '../chapters';
import { chapterIssueUrl } from '../links';
import { standingOf } from '../status';
import Show, { type ShowProps } from '../show/Show';
import FeedbackLink from './FeedbackLink';
import { useRevealOnView } from './useRevealOnView';

export type ShowSpec = Omit<ShowProps, 'id' | 'children'> & {
  render: ShowProps['children'];
};

export interface ChapterPageProps {
  id: ChapterId;
  show: ShowSpec | null;
  children: React.ReactNode;
}

const ChapterPage: React.FC<ChapterPageProps> = ({ id, show, children }) => {
  const def = chapterById(id);
  const standing = standingOf(id);
  const previous = previousChapter(id);
  const next = nextChapter(id);
  const footerRef = useRevealOnView();

  return (
    <article className="guide-article flex flex-col gap-20 lg:gap-28" data-chapter={id}>
      {show ? (
        <Show
          id={id}
          beats={show.beats}
          stageLabel={show.stageLabel}
          minHeight={show.minHeight}
          hero={show.hero}
          opening={show.opening}
        >
          {show.render}
        </Show>
      ) : null}

      <div className="guide-article-body flex flex-col gap-16 lg:gap-20" data-testid="guide-body">
        {bands(children)}
      </div>

      <footer
        ref={footerRef}
        className="guide-scene flex flex-col gap-8 border-t border-neutral-200 pt-8"
      >
        {standing ? (
          <p className="max-w-(--guide-prose-w) text-sm leading-relaxed text-neutral-700">
            {standing.note ? <>{standing.note} </> : null}
            <FeedbackLink href={chapterIssueUrl(def)}>Have an opinion? Open an issue</FeedbackLink>
          </p>
        ) : null}
        <nav className="flex flex-col gap-6" aria-label="Chapter">
          {next ? (
            <a href={hashFor(next.id)} className={CONTINUE_LINK}>
              <span className="text-sm text-neutral-600">Next, {next.title}</span>
              <span className="text-2xl font-semibold leading-tight tracking-tight text-balance text-neutral-900 sm:text-3xl">
                {next.headline}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Continue
                <Icon type="chevron-right" size="sm" className="shrink-0" />
              </span>
            </a>
          ) : null}
          {previous ? (
            <a href={hashFor(previous.id)} className={BACK_LINK}>
              <Icon type="chevron-left" size="sm" className="shrink-0 text-neutral-500" />
              <span>
                <span className="block text-xs text-neutral-500">Previous</span>
                {previous.title}
              </span>
            </a>
          ) : null}
        </nav>
      </footer>
    </article>
  );
};

function bands(children: React.ReactNode): React.ReactNode[] {
  const grouped: React.ReactNode[][] = [];
  let run: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    run.push(child);
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      grouped.push(run);
      run = [];
    }
  });
  if (run.length) grouped.push(run);
  return grouped.map((band, index) => (
    <div key={index} className="guide-band flex flex-col gap-5">
      {band}
    </div>
  ));
}

const CONTINUE_LINK =
  'press-subtle flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white px-6 py-6 no-underline transition-colors duration-(--dur-instant) hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:px-8 sm:py-8';

const BACK_LINK =
  'press-subtle inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

export default ChapterPage;
