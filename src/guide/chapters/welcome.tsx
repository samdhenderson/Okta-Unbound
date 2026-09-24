import React, { createContext, useContext, useMemo, useState } from 'react';
import ChapterPage, { type ShowSpec } from '../shell/ChapterPage';
import Band from '../shell/Band';
import Scene from '../shell/Scene';
import { Marker } from '../shell/Callout';
import Assemble from '../show/Assemble';
import Headline from '../show/Headline';
import KeysTitle from '../show/KeysTitle';
import { CHAPTERS, chapterById, hashFor } from '../chapters';
import TabNavigation, { type TabType } from '../../sidepanel/components/TabNavigation';
import Icon from '../../sidepanel/components/shared/Icon';
import { RAIL_TAB_DEFS, TAB_DEFS } from '../../sidepanel/tabs';

const noop = () => {};

const labelOf = (id: TabType): string => RAIL_TAB_DEFS.find((def) => def.id === id)?.label ?? id;

const SEAT_COUNT = RAIL_TAB_DEFS.length;

const NUMBER_WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

const seats = (n: number): string => NUMBER_WORD[n] ?? String(n);

const opens = (n: number): string => {
  const word = seats(n);
  return word.charAt(0).toUpperCase() + word.slice(1);
};

const SEATLESS = TAB_DEFS.filter((def) => def.railHidden).map((def) => def.label);
const seatlessList =
  SEATLESS.length > 1
    ? `${SEATLESS.slice(0, -1).join(', ')} and ${SEATLESS[SEATLESS.length - 1]}`
    : (SEATLESS[0] ?? '');

interface HotState {
  hot: number | null;
  setHot: React.Dispatch<React.SetStateAction<number | null>>;
}

const HotContext = createContext<HotState>({ hot: null, setHot: noop });

const HotScope: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hot, setHot] = useState<number | null>(null);
  const value = useMemo(() => ({ hot, setHot }), [hot]);
  return <HotContext.Provider value={value}>{children}</HotContext.Provider>;
};

function useHot(n: number) {
  const { hot, setHot } = useContext(HotContext);
  return {
    isHot: hot === n,
    handlers: {
      onPointerEnter: () => setHot(n),
      onPointerLeave: () => setHot((current) => (current === n ? null : current)),
      onFocus: () => setHot(n),
      onBlur: (event: React.FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHot((current) => (current === n ? null : current));
        }
      },
    },
  };
}

const HotTarget: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => {
  const { isHot, handlers } = useHot(n);
  return (
    <div
      data-guide-target={n}
      data-hot={isHot || undefined}
      className="ring-primary-highlight ring-offset-1 ring-offset-canvas transition-shadow duration-(--dur-instant) ease-(--ease-standard) data-hot:ring-2 [&+span]:transition-shadow [&+span]:duration-(--dur-instant) [&[data-hot]+span]:ring-4 [&[data-hot]+span]:ring-primary-highlight"
      {...handlers}
    >
      {children}
    </div>
  );
};

const HotText: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => {
  const { isHot, handlers } = useHot(n);
  return (
    <span
      data-guide-legend={n}
      data-hot={isHot || undefined}
      className="-mx-1.5 -my-0.5 block rounded px-1.5 py-0.5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-hot:bg-primary-light"
      {...handlers}
    >
      {children}
    </span>
  );
};

const Rail: React.FC<{ active: TabType; onChange: (id: TabType) => void }> = ({
  active,
  onChange,
}) => <TabNavigation activeTab={active} onTabChange={onChange} onOpenCommandPalette={noop} />;

const RailScene: React.FC = () => {
  const [active, setActive] = useState<TabType>('home');
  return (
    <div className="flex flex-col gap-2">
      <Marker n={1}>
        <HotTarget n={1}>
          <Rail active={active} onChange={setActive} />
        </HotTarget>
      </Marker>
      <p className="mt-1 h-5 text-xs leading-5 text-neutral-600" aria-live="polite">
        <span key={active} className="inline-block animate-rise-in">
          <span className="font-medium text-neutral-900">{labelOf(active)}</span> is the active
          seat, so it is the one wearing its name.
        </span>
      </p>
    </div>
  );
};

const SEAT = 'flex items-center gap-3.5 py-2';

const GLYPH = 'flex shrink-0 items-center justify-center rounded-lg';

const Contents: React.FC = () => (
  <div aria-hidden="true">
    <Assemble as="ul" selector="[data-guide-seat]" className="flex flex-col">
      {CHAPTERS.map((def) => {
        const current = def.id === 'welcome';
        return (
          <li key={def.id} data-guide-tile>
            <span data-guide-seat={def.title} className={SEAT}>
              <span
                data-overture-glyph
                className={`${GLYPH} h-10 w-10 ${
                  current ? 'bg-primary-light text-primary-text' : 'text-neutral-500'
                }`}
              >
                <Icon type={def.icon} size="lg" />
              </span>
              <span
                className={`text-xl leading-6 tracking-tight ${
                  current ? 'font-semibold text-neutral-900' : 'text-neutral-700'
                }`}
              >
                {def.title}
              </span>
            </span>
          </li>
        );
      })}
    </Assemble>
  </div>
);

const WELCOME = chapterById('welcome');

const LEAD_IN = (
  <p className="text-base leading-7 text-pretty text-neutral-800">
    Okta Unbound is a side panel that sits beside the Okta admin console. It answers the questions
    the console makes you work for: why does this person have this, who breaks if I change it, prove
    it, and now fix it. You never leave the page you are on.
  </p>
);

const Greeting: React.FC = () => (
  <div className="flex flex-col gap-8">
    <p className="guide-eyebrow text-sm text-neutral-600">Okta Unbound user guide</p>
    <Headline size="hero" text={WELCOME.title} subline={WELCOME.subline} />
    <p
      className="guide-subline flex items-center gap-1.5 text-sm text-neutral-500"
      style={{ '--guide-i': 3 } as React.CSSProperties}
    >
      Scroll to begin
      <Icon type="chevron-down" size="sm" className="shrink-0" />
    </p>
  </div>
);

const OVERTURE: ShowSpec = {
  hero: true,
  opening: {
    greeting: <Greeting />,
    card: <KeysTitle text={WELCOME.headline} passage={LEAD_IN} />,
  },
  beats: [
    {
      caption: `Every section of the panel, and every page of this guide. ${opens(SEAT_COUNT)} of them have a seat on the rail.`,
      hold: 4,
    },
    { caption: 'Scroll. They move to the edge and stay with you.' },
  ],
  render: () => <Contents />,
};

const contents = CHAPTERS.filter((def) => def.id !== 'welcome');

const PROSE = 'max-w-(--guide-prose-w) text-sm leading-relaxed text-neutral-700';
const LEAD = 'max-w-(--guide-prose-w) text-base leading-7 text-neutral-800';

const CONTENTS_LINK =
  'press-subtle -mx-3 flex flex-col gap-0.5 rounded-md px-3 py-2 no-underline transition-colors duration-(--dur-instant) hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

const WelcomeChapter: React.FC = () => (
  <ChapterPage id="welcome" show={OVERTURE}>
    <Band title="Open the Panel">
      <p className={LEAD}>
        Pin the extension from the puzzle-piece menu in the toolbar, then click its icon. Or
        right-click anywhere on an Okta admin page and choose <strong>Open Okta Unbound</strong>.
      </p>
      <p className={PROSE}>
        The panel reads the Okta admin tab in front of it and stays open while you move between tabs
        in that window. It works through the session you are already signed in with, so there is no
        token to paste and nothing of yours is stored.
      </p>
    </Band>

    <HotScope>
      <Scene
        title="Navigating Unbound"
        intro="The panel's own rail, live. Click a seat to move the selection, or rest on the number to see what it points at."
        legend={[
          {
            text: (
              <HotText n={1}>
                {opens(SEAT_COUNT)} seats, in the order the panel keeps them. The seat you are on
                unfurls its name and the rest stay down to a glyph, so all {seats(SEAT_COUNT)} still
                fit when you drag the panel in to 360px.
              </HotText>
            ),
          },
        ]}
        outro={
          <>
            The button at the trailing end prints the chord your own keyboard listens for, Command K
            on a Mac and Ctrl K everywhere else. It opens the command palette, which is how you
            reach {seatlessList}, the sections that keep no seat.
          </>
        }
      >
        <RailScene />
      </Scene>
    </HotScope>

    <Band title="Contents">
      <p className={PROSE}>
        One chapter per section, in the order the rail seats them, each built around the one
        question that section answers. Open any of them now, or take them in order from the
        contents.
      </p>
      <ol className="flex max-w-(--guide-prose-w) flex-col gap-1">
        {contents.map((def) => (
          <li key={def.id}>
            <a href={hashFor(def.id)} className={CONTENTS_LINK}>
              <span className="text-sm font-medium text-primary">{def.title}</span>
              <span className="text-sm leading-snug text-neutral-600">{def.question}</span>
            </a>
          </li>
        ))}
      </ol>
    </Band>
  </ChapterPage>
);

export default WelcomeChapter;
