import React, { useEffect, useRef, useState } from 'react';
import pkg from '../../../package.json' with { type: 'json' };
import { CHAPTERS, type ChapterId, hashFor } from '../chapters';
import { EXTERNAL_LINK_PROPS, GITHUB_HOME_URL } from '../links';
import { IS_HOSTED_GUIDE } from '../host';
import InstallCta from './InstallCta';
import { motionAvailable, readDurToken } from '../show/motion';
import Icon from '../../sidepanel/components/shared/Icon';
import { useReducedMotion } from '../../sidepanel/hooks/useReducedMotion';
import { useStaggerReveal } from '../../sidepanel/hooks/useStaggerReveal';
import { useSceneRegistry } from './sceneRegistry';
import { useScrolled } from './useScrolled';

export interface DockProps {
  chapter: ChapterId;
  formsOnScroll?: boolean;
  install?: boolean;
}

const ROW =
  'guide-dock-row press-subtle flex items-center gap-2.5 rounded-md py-1.5 text-sm text-neutral-700 no-underline transition-colors duration-(--dur-instant) hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

const FEATURE =
  'guide-dock-feature press-subtle block rounded-md py-1 pr-2 pl-3 text-xs leading-5 text-neutral-600 no-underline transition-colors duration-(--dur-instant) hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

function goTo(event: React.MouseEvent<HTMLAnchorElement>, id: string, reduced: boolean) {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({
    block: 'start',
    behavior: reduced ? 'auto' : 'smooth',
  });
}

function overtureBand(): { leaveAt: number } | null {
  const seat = document.querySelector<HTMLElement>('[data-guide-seat]');
  const band = seat?.closest<HTMLElement>('.guide-show');
  if (!band) return null;
  const margin = parseFloat(getComputedStyle(band).scrollMarginTop);
  const gap = Number.isFinite(margin) ? margin : 0;
  const rect = band.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const settled = rect.top + window.scrollY - gap;
  return { leaveAt: settled + Math.max(0, rect.height + gap - viewport) };
}

function formFromRail(list: HTMLElement): boolean {
  const seats = document.querySelectorAll<HTMLElement>('[data-guide-seat]');
  const frame = overtureBand();
  if (!seats.length || !frame) return false;
  const duration = readDurToken('--dur-tell');
  const easing = getComputedStyle(document.documentElement)
    .getPropertyValue('--ease-standard')
    .trim();
  if (!duration || !easing) return false;
  const travelled = window.scrollY - frame.leaveAt;
  const step = duration / 30;
  let flew = false;
  const release = () => {
    list.style.overflow = '';
  };
  seats.forEach((seat, index) => {
    const title = seat.getAttribute('data-guide-seat');
    const from = seat.querySelector<HTMLElement>('[data-overture-glyph]');
    const to = list.querySelector<HTMLElement>(`[data-dock-glyph="${title}"]`);
    const row = to?.closest<HTMLElement>('a');
    if (!from || !to || !row) return;
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    if (!a.height || !b.height) return;
    const scale = a.height / b.height;
    const box = row.getBoundingClientRect();
    const dx = a.left + a.width / 2 - (b.left + b.width / 2);
    const dy = a.top + travelled + a.height / 2 - (b.top + b.height / 2);
    row.style.transformOrigin = `${b.left + b.width / 2 - box.left}px ${
      b.top + b.height / 2 - box.top
    }px`;
    row
      .animate(
        [{ transform: `translate(${dx}px, ${dy}px) scale(${scale})` }, { transform: 'none' }],
        { duration, easing, delay: index * step, fill: 'backwards' },
      )
      .addEventListener('finish', () => {
        row.style.transformOrigin = '';
      });
    flew = true;
  });
  if (flew) {
    list.style.overflow = 'visible';
    window.setTimeout(release, duration + seats.length * step + duration);
    document
      .querySelectorAll<HTMLElement>('[data-guide-tile]')
      .forEach((tile) => tile.setAttribute('data-flown', ''));
  }
  return flew;
}

const Dock: React.FC<DockProps> = ({
  chapter,
  formsOnScroll = false,
  install = IS_HOSTED_GUIDE,
}) => {
  const setRailRef = useStaggerReveal(!formsOnScroll);
  const listRef = useRef<HTMLOListElement | null>(null);
  const reduced = useReducedMotion();
  const scrolled = useScrolled(24);
  const { scenes, active } = useSceneRegistry();

  const [held, setHeld] = useState(() => formsOnScroll && !reduced && motionAvailable());

  useEffect(() => {
    if (!held) return;
    const read = () => {
      const frame = overtureBand();
      if (frame && window.scrollY > frame.leaveAt + 1) setHeld(false);
    };
    read();
    window.addEventListener('scroll', read, { passive: true });
    return () => window.removeEventListener('scroll', read);
  }, [held]);

  const formed = useRef(false);
  useEffect(() => {
    if (held || !formsOnScroll || formed.current || !listRef.current) return;
    formed.current = true;
    if (reduced || !motionAvailable()) return;
    formFromRail(listRef.current);
  }, [held, formsOnScroll, reduced]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const row = list.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row) return;
    const seat = row.getBoundingClientRect();
    const strip = list.getBoundingClientRect();
    list.scrollLeft += seat.left - strip.left - (strip.width - seat.width) / 2;
  }, [chapter, held]);

  const attach = (node: HTMLOListElement | null) => {
    listRef.current = node;
    setRailRef(node);
  };

  return (
    <nav
      aria-label="Contents"
      className="guide-dock fixed inset-x-3 bottom-3 z-30 rounded-full border border-neutral-200 px-2 py-1.5 lg:static lg:inset-auto lg:flex lg:h-full lg:flex-col lg:rounded-none lg:border-t-0 lg:border-r lg:border-b-0 lg:border-l-0 lg:bg-white lg:px-4 lg:py-6"
      data-scrolled={scrolled || undefined}
      data-held={held || undefined}
      data-formed={(formsOnScroll && !held) || undefined}
    >
      <div className="guide-dock-chrome sr-only lg:not-sr-only lg:mb-5 lg:flex lg:flex-col lg:gap-0.5 lg:border-b lg:border-neutral-200 lg:px-2 lg:pb-4">
        <p className="text-xs text-neutral-600">Okta Unbound</p>
        <h1 className="text-base font-semibold tracking-tight text-neutral-900">User guide</h1>
        <p className="text-[11px] tabular-nums text-neutral-500">Version {pkg.version}</p>
      </div>
      <ol
        ref={attach}
        className="guide-dock-list rise-in-stagger flex items-center justify-between gap-0.5 lg:min-h-0 lg:flex-1 lg:flex-col lg:items-stretch lg:justify-start lg:overflow-x-hidden lg:overflow-y-auto"
        data-testid="guide-rail"
      >
        {CHAPTERS.map((def, index) => {
          const current = def.id === chapter;
          return (
            <li
              key={def.id}
              className="group relative"
              style={{ '--guide-i': index } as React.CSSProperties}
            >
              <a
                href={hashFor(def.id)}
                aria-current={current ? 'page' : undefined}
                aria-label={def.title}
                className={`${ROW} lg:pl-2 ${
                  current ? 'font-semibold text-neutral-900' : ''
                } px-1.5 lg:pr-2`}
              >
                <span
                  aria-hidden="true"
                  data-dock-glyph={def.title}
                  className={`guide-dock-glyph flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                    current ? 'bg-primary-light text-primary-text' : 'text-neutral-500'
                  }`}
                >
                  <Icon type={def.icon} size="sm" />
                </span>
                <span
                  aria-hidden="true"
                  className="guide-dock-label pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-white lg:static lg:mb-0 lg:translate-x-0 lg:bg-transparent lg:px-0 lg:py-0 lg:text-sm lg:text-inherit"
                >
                  {def.title}
                </span>
              </a>
              {current && scenes.length ? (
                <ol className="guide-dock-features mt-0.5 mb-1.5 hidden flex-col gap-0.5 border-l border-neutral-200 lg:flex lg:ml-5.5 lg:pl-1.5">
                  {scenes.map((scene) => (
                    <li key={scene.id}>
                      <a
                        href={`#${scene.id}`}
                        aria-current={active === scene.id ? 'location' : undefined}
                        className={`${FEATURE} ${
                          active === scene.id ? 'font-medium text-primary-text' : ''
                        }`}
                        onClick={(event) => goTo(event, scene.id, reduced)}
                      >
                        {scene.title}
                      </a>
                    </li>
                  ))}
                </ol>
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="guide-dock-chrome hidden lg:mt-auto lg:block lg:border-t lg:border-neutral-200 lg:pt-4">
        {install ? <InstallCta variant="rail" /> : null}
        <p className="px-2 text-[11px] text-neutral-500">
          <a
            href={GITHUB_HOME_URL}
            {...EXTERNAL_LINK_PROPS}
            className="rounded-sm underline-offset-2 hover:text-neutral-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            Source and issues on GitHub
          </a>
        </p>
      </div>
    </nav>
  );
};

export default Dock;
