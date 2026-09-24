import React, { useState } from 'react';
import Band from '../shell/Band';
import ChapterPage from '../shell/ChapterPage';
import StatusChip from '../shell/StatusChip';
import FeedbackLink from '../shell/FeedbackLink';
import Assemble from '../show/Assemble';
import Headline from '../show/Headline';
import { FilterPill } from '../../sidepanel/components/shared';
import { useCountUp } from '../../sidepanel/hooks/useCountUp';
import { CHAPTERS, type ChapterDef, chapterById, hashFor } from '../chapters';
import { type ChapterStanding, type ChapterStatus, STATUS_LABEL, standingOf } from '../status';
import { chapterIssueUrl, EXTERNAL_LINK_PROPS, GITHUB_HOME_URL } from '../links';

interface OpenItem {
  chapter: ChapterDef;
  standing: ChapterStanding;
}

const OPEN_STATUSES: ReadonlyArray<Exclude<ChapterStatus, 'shipped'>> = [
  'in-progress',
  'unresolved',
  'capped',
];

function openItems(): OpenItem[] {
  const items: OpenItem[] = [];
  for (const chapter of CHAPTERS) {
    const standing = standingOf(chapter.id);
    if (standing && standing.status !== 'shipped') items.push({ chapter, standing });
  }
  return items;
}

function featureChapterCount(): number {
  return CHAPTERS.filter((chapter) => standingOf(chapter.id) !== null).length;
}

const PARAGRAPH = 'max-w-(--guide-prose-w) text-sm leading-relaxed text-neutral-700';

const TEXT_LINK =
  'rounded-sm font-medium text-primary-text underline-offset-2 transition-colors duration-(--dur-instant) ease-(--ease-standard) hover:text-primary-dark hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

const DEF = chapterById('roadmap');

const RoadmapChapter: React.FC = () => {
  const items = openItems();
  const total = featureChapterCount();

  const movingCount = useCountUp(items.length).value;
  const totalCount = useCountUp(total).value;
  const shippedCount = totalCount - movingCount;
  const countOf = (status: ChapterStatus) =>
    items.filter((item) => item.standing.status === status).length;
  const pillCounts: Record<(typeof OPEN_STATUSES)[number], number> = {
    'in-progress': useCountUp(countOf('in-progress')).value,
    unresolved: useCountUp(countOf('unresolved')).value,
    capped: useCountUp(countOf('capped')).value,
  };

  const [hovered, setHovered] = useState<ChapterStatus | null>(null);
  const [held, setHeld] = useState<ChapterStatus | null>(null);
  const lit = hovered ?? held;

  return (
    <ChapterPage id="roadmap" show={null}>
      <div className="flex min-w-0 flex-col gap-6">
        <p className="guide-eyebrow text-sm text-neutral-600">{DEF.title}</p>
        <Headline id="show-roadmap" text={DEF.headline} subline={DEF.subline} />
      </div>

      <Band title="Still Moving">
        <p className={PARAGRAPH}>
          Every chapter carries a chip saying how settled its subject is. The chapters below are the
          ones that chip does not call shipped, in the order the guide covers them, each with the
          reason it is still moving. To move something on this list, open an issue on it: say what
          you want it to do, and why.
        </p>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-neutral-700 tabular-nums">
            <span className="font-semibold text-neutral-900">{movingCount}</span> of {totalCount}{' '}
            chapters are still moving. The other {shippedCount} are shipped and do not appear here.
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Highlight chapters by status">
            {OPEN_STATUSES.map((status) => {
              if (countOf(status) === 0) return null;
              const count = pillCounts[status];
              const label = STATUS_LABEL[status];
              return (
                <li
                  key={status}
                  className="inline-flex rounded-md ring-primary-highlight transition-shadow duration-(--dur-instant) ease-(--ease-standard) data-lit:ring-2"
                  data-lit={lit === status ? '' : undefined}
                  data-testid="roadmap-key-pill"
                  data-status={status}
                  onMouseEnter={() => setHovered(status)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(status)}
                  onBlur={() => setHovered(null)}
                >
                  <FilterPill
                    active={held === status}
                    onClick={() => setHeld((current) => (current === status ? null : status))}
                    title={`Keep the ${label.toLowerCase()} chapters highlighted`}
                  >
                    {label} <span className="tabular-nums">{count}</span>
                  </FilterPill>
                </li>
              );
            })}
          </ul>
        </div>
        <div data-testid="roadmap-items">
          <Assemble as="ul" className="flex flex-col gap-2 border-l border-neutral-200">
            {items.map(({ chapter, standing }) => (
              <li
                key={chapter.id}
                className="-ml-px flex flex-col gap-2 rounded-r-md border-l-2 border-transparent py-3 pr-4 pl-5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-lit:border-primary data-lit:bg-neutral-50"
                data-testid="roadmap-item"
                data-status={standing.status}
                data-lit={lit === standing.status ? '' : undefined}
                onMouseEnter={() => setHovered(standing.status)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(standing.status)}
                onBlur={() => setHovered(null)}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="text-base font-semibold tracking-tight text-neutral-900">
                    <a
                      href={hashFor(chapter.id)}
                      className="rounded-sm underline-offset-2 transition-colors duration-(--dur-instant) ease-(--ease-standard) hover:text-primary-text hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      {chapter.title}
                    </a>
                  </h4>
                  <StatusChip status={standing.status} />
                </div>
                {standing.note ? <p className={PARAGRAPH}>{standing.note}</p> : null}
                <p className="text-sm">
                  <FeedbackLink href={chapterIssueUrl(chapter)}>Weigh in</FeedbackLink>
                </p>
              </li>
            ))}
          </Assemble>
        </div>
      </Band>

      <Band title="Held Back">
        <p className={PARAGRAPH}>
          Two more parts are built and switched off: the API Explorer, and the SAML assertion reader
          it opens. A feature flag holds them back until they are ready, so the rail and the command
          palette do not offer them yet.
        </p>
        <p className={PARAGRAPH}>
          The code, the open issues and every release live at{' '}
          <a href={GITHUB_HOME_URL} {...EXTERNAL_LINK_PROPS} className={TEXT_LINK}>
            the project on GitHub
          </a>
          .
        </p>
      </Band>
    </ChapterPage>
  );
};

export default RoadmapChapter;
