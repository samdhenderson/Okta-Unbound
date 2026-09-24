import React, { useCallback, useEffect, useRef, useState } from 'react';
import ChapterPage, { type ShowSpec } from '../shell/ChapterPage';
import Scene from '../shell/Scene';
import Assemble from '../show/Assemble';
import TabNavigation from '../../sidepanel/components/TabNavigation';
import TabJumpPalette, {
  type CommandRow,
  type SectionMeta,
} from '../../sidepanel/components/TabJumpPalette';
import OrgSnapshotCard from '../../sidepanel/components/home/OrgSnapshotCard';
import {
  buildBox,
  buildFigure,
  buildSubCount,
  type FigureSource,
} from '../../sidepanel/components/home/orgFigures';
import type { JumpKind, JumpMode, JumpResult } from '../../sidepanel/hooks/useJumpResolver';
import { useReducedMotion } from '../../sidepanel/hooks/useReducedMotion';
import { TAB_DEFS } from '../../sidepanel/tabs';
import { DEMO_COMPARISON_PAIR, demoUsersById } from '../../sidepanel/demo/users';
import {
  DEMO_HERO_GROUP_ID,
  currentGroups,
  currentGroupsById,
  demoApps,
  demoRules,
} from '../../sidepanel/demo/snapshot';
import { DEMO_ORIGIN } from '../../sidepanel/demo/org';

const noop = () => {};

const engineering = currentGroupsById().get(DEMO_HERO_GROUP_ID)!;
const engineeringRule = demoRules.find((rule) =>
  rule.actions?.assignUserToGroups?.groupIds.includes(DEMO_HERO_GROUP_ID),
)!;
const salesforce = demoApps[0];
const amara = demoUsersById.get(DEMO_COMPARISON_PAIR.left)!;

const searchHits: JumpResult[] = [
  {
    kind: 'group',
    id: engineering.id,
    name: engineering.profile?.name ?? engineering.id,
    secondary: engineering.profile?.description,
  },
  {
    kind: 'app',
    id: salesforce.id,
    name: salesforce.label ?? salesforce.id,
    appName: salesforce.name,
  },
  { kind: 'rule', id: engineeringRule.id, name: engineeringRule.name, secondary: 'Active' },
  {
    kind: 'user',
    id: amara.id,
    name: `${amara.profile.firstName} ${amara.profile.lastName}`,
    secondary: amara.profile.email,
  },
];

const sectionMeta: Partial<Record<JumpKind, SectionMeta>> = {
  group: { fromSnapshot: true, complete: true },
  app: { fromSnapshot: true, complete: true },
  rule: { fromSnapshot: true, complete: true },
  user: { fromSnapshot: false, complete: true },
};

const commands: ReadonlyArray<CommandRow> = [
  { id: 'open-guide', label: 'Open the user guide', icon: 'book', run: noop },
  { id: 'show-welcome', label: 'Show the welcome screen again', icon: 'sparkles', run: noop },
];

const reachable = () => true;

const SEARCH_MIN_CHARS = 3;

const READ_AT = Date.now() - 20 * 60 * 1000;
const walked = (count: number): FigureSource => ({
  isReading: false,
  complete: true,
  lastFullWalkAt: READ_AT,
  count,
  error: null,
});

const groups = currentGroups();
const ruleTargets = new Set(
  demoRules.flatMap((rule) => rule.actions?.assignUserToGroups?.groupIds ?? []),
);
const emptyUnfilled = groups.filter(
  (group) => (group._embedded?.stats?.usersCount ?? 0) === 0 && !ruleTargets.has(group.id),
).length;
const paused = demoRules.filter((rule) => rule.status === 'INACTIVE').length;

const groupsNamed = { source: walked(groups.length), noun: 'groups' };
const rulesNamed = { source: walked(demoRules.length), noun: 'group rules' };

const HOME_BOXES = [
  buildBox(buildFigure('groups', 'Groups', 'users', groupsNamed.source), 'groups', 'groups', [
    buildSubCount({
      key: 'groups-empty-unfilled',
      label: 'Groups with no members that no rule fills',
      icon: 'users',
      counted: groupsNamed,
      gates: [rulesNamed],
      count: emptyUnfilled,
      request: { tab: 'groups', view: 'empty-no-rules' },
    }),
  ]),
  buildBox(buildFigure('rules', 'Group rules', 'bolt', rulesNamed.source), 'rules', 'group rules', [
    buildSubCount({
      key: 'rules-paused',
      label: 'Group rules paused',
      icon: 'pause',
      counted: rulesNamed,
      count: paused,
      request: { tab: 'rules', view: 'paused' },
    }),
  ]),
];

const RESULT_PIECES = 'ul > li:not(:has(button, a)):has(> span), ul > li:has(> [aria-label])';

const showMode = (beat: number): JumpMode => {
  if (beat >= 3) return 'results';
  if (beat === 2) return 'searching';
  return 'idle';
};

const SHOW: ShowSpec = {
  stageLabel: 'Command palette',
  minHeight: 1120,
  beats: [
    { caption: 'You are on Home. Press Command K, or Ctrl K off a Mac.', hold: 3 },
    { caption: 'It opens over Home without leaving it, every section listed.', hold: 3 },
    { caption: 'The field spins while your org is searched. The sections never wait.', hold: 3 },
    { caption: 'Rows from your org, under their kind, each heading saying where it came from.' },
  ],
  render: (beat) => (
    <div className="flex flex-col gap-3">
      <div className="-mx-3 -mt-3">
        <TabNavigation
          activeTab="home"
          onTabChange={noop}
          onOpenCommandPalette={noop}
          shortcutPlatform="apple"
        />
      </div>
      <OrgSnapshotCard
        boxes={HOME_BOXES}
        readAt={READ_AT}
        isRefreshing={false}
        onRefresh={noop}
        canRefresh
        onOpenTab={noop}
        onOpenListView={noop}
      />
      <Assemble selector={RESULT_PIECES}>
        <TabJumpPalette
          isOpen={beat >= 1}
          onClose={noop}
          activeTab="home"
          onSelect={noop}
          onEntityQueryChange={noop}
          entityMode={showMode(beat)}
          entityResults={beat >= 3 ? searchHits : []}
          sectionMeta={sectionMeta}
          commands={commands}
          canReach={reachable}
          onEntitySelect={noop}
          oktaOrigin={DEMO_ORIGIN}
          entityMinChars={SEARCH_MIN_CHARS}
        />
      </Assemble>
    </div>
  ),
};

function searchBeatMs(reduced: boolean): number {
  if (reduced || typeof document === 'undefined' || typeof window.getComputedStyle !== 'function') {
    return 0;
  }
  if (document.querySelector('[data-motion="off"]')) return 0;
  const raw = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--dur-tell')
    .trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 0;
  return raw.endsWith('ms') ? value : value * 1000;
}

const SearchingPalette: React.FC = () => {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<JumpMode>('results');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleQuery = useCallback(
    (query: string) => {
      window.clearTimeout(timer.current);
      if (query.trim().length < SEARCH_MIN_CHARS) {
        setMode('idle');
        return;
      }
      const beat = searchBeatMs(reduced);
      if (beat === 0) {
        setMode('results');
        return;
      }
      setMode('searching');
      timer.current = window.setTimeout(() => setMode('results'), beat);
    },
    [reduced],
  );

  return (
    <TabJumpPalette
      isOpen
      onClose={noop}
      activeTab="home"
      onSelect={noop}
      onEntityQueryChange={handleQuery}
      entityMode={mode}
      entityResults={searchHits}
      sectionMeta={sectionMeta}
      commands={commands}
      canReach={reachable}
      onEntitySelect={noop}
      oktaOrigin={DEMO_ORIGIN}
      entityMinChars={SEARCH_MIN_CHARS}
    />
  );
};

interface LegendTie {
  hint: string;
  targets: ReadonlyArray<string>;
  dot: string;
  on?: ReadonlyArray<string>;
  when?: string;
}

const rowAt = (position: number) => `ul > li:nth-child(${position})`;
const railHiddenRows = TAB_DEFS.map((def, index) => (def.railHidden ? index + 1 : null))
  .filter((position): position is number => position !== null)
  .map(rowAt);
const commandsHeading = rowAt(TAB_DEFS.length + 1);
const commandRows = commands.map((_, index) => rowAt(TAB_DEFS.length + 2 + index));

const UNFILTERED = ':has(input[type="search"]:placeholder-shown)';

const OPEN_TIES: ReadonlyArray<LegendTie> = [
  {
    hint: 'current',
    targets: ['[aria-current="page"]'],
    dot: 'ul > li:has(> [aria-current="page"])',
  },
  {
    hint: 'hidden',
    targets: railHiddenRows,
    dot: railHiddenRows.join(', '),
    when: UNFILTERED,
  },
  {
    hint: 'commands',
    targets: commandRows,
    dot: commandsHeading,
    when: UNFILTERED,
  },
  {
    hint: 'keys',
    targets: ['[role="dialog"] p:has(kbd)'],
    dot: '[role="dialog"] p:has(kbd)',
    on: [':has([role="dialog"] p:hover kbd)'],
  },
];

const SEARCH_TIES: ReadonlyArray<LegendTie> = [
  {
    hint: 'source',
    targets: ['ul > li:not(:has(button, a)):has(> span)'],
    dot: 'ul > li:nth-child(1 of :not(:has(button, a)):has(> span))',
    on: [':has(ul > li:hover > span)'],
  },
  {
    hint: 'edge',
    targets: ['ul > li > [aria-label] > span:last-of-type'],
    dot: 'ul > li:nth-child(1 of :has(> [aria-label]))',
    on: [':has(ul > li > [aria-label]:is(:hover, :focus-visible))'],
  },
  {
    hint: 'field',
    targets: ['[role="dialog"] input[type="search"]'],
    dot: '[role="dialog"] div:has(> input[type="search"])',
  },
];

const SCENE = '.guide-palette-scene';
const LEGEND_ROW = '.guide-legend > li';

const DOT_STYLE = [
  'position: absolute',
  'left: calc(var(--spacing) * -5.5)',
  'top: 50%',
  'translate: 0 -50%',
  'z-index: 10',
  'display: flex',
  'align-items: center',
  'justify-content: center',
  'width: calc(var(--spacing) * 5)',
  'height: calc(var(--spacing) * 5)',
  'border-radius: 9999px',
  'background-color: var(--color-primary)',
  'color: var(--color-white)',
  'font-size: 11px',
  'font-weight: 600',
  'line-height: 1',
  'box-shadow: var(--shadow-dock)',
  'pointer-events: none',
].join(';\n  ');

function tieRules(scene: string, ties: ReadonlyArray<LegendTie>): string {
  const root = `${SCENE}[data-scene="${scene}"]`;
  return ties
    .flatMap(({ hint, targets, dot, on, when = '' }, index) => {
      const n = index + 1;
      const row = `[data-guide-hint="${hint}"]`;
      const onTarget =
        on ??
        targets.map(
          (target) => `:has(${target}:hover, ${target}:focus-visible, ${target} :focus-visible)`,
        );
      const live = `${root}${when}:is(${[`:has(${LEGEND_ROW}:hover ${row})`, ...onTarget].join(', ')})`;
      const outlined = targets.map((target) => `${live} ${target}`).join(',\n');
      return [
        `${root}${when} :is(${dot}) {\n  position: relative;\n}`,
        `${root}${when} :is(${dot})::before {\n  content: "${n}";\n  ${DOT_STYLE};\n}`,
        `${outlined} {\n  outline: 2px solid var(--color-primary);\n  outline-offset: 2px;\n  border-radius: var(--radius-md, 0.375rem);\n}`,
        `${live} ${LEGEND_ROW}:has(${row}) {\n  background-color: var(--color-primary-light);\n  box-shadow: 0 0 0 6px var(--color-primary-light);\n}`,
        `${live} :is(${dot})::before {\n  box-shadow: 0 0 0 4px var(--color-primary-light);\n}`,
      ];
    })
    .join('\n');
}

const TIE_STYLES = [
  `${SCENE} ${LEGEND_ROW} {\n  border-radius: var(--radius-md, 0.375rem);\n  transition:\n    background-color var(--dur-instant) var(--ease-standard),\n    box-shadow var(--dur-instant) var(--ease-standard);\n}`,
  `${SCENE} ${LEGEND_ROW}:hover {\n  background-color: var(--color-primary-light);\n  box-shadow: 0 0 0 6px var(--color-primary-light);\n}`,
  tieRules('open', OPEN_TIES),
  tieRules('search', SEARCH_TIES),
].join('\n');

const Hint: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => (
  <span data-guide-hint={name}>{children}</span>
);

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="font-sans">{children}</kbd>
);

const PaletteChapter: React.FC = () => (
  <ChapterPage id="palette" show={SHOW}>
    <style>{TIE_STYLES}</style>

    <div className="guide-palette-scene" data-scene="open">
      <Scene
        title="Sections"
        stageLabel="Command palette"
        intro={
          <>
            Press <Key>Cmd</Key> <Key>K</Key> on a Mac, or <Key>Ctrl</Key> <Key>K</Key> elsewhere,
            and the palette opens over the tab you were reading. Press the chord again to close it.
            Every section is listed the moment it opens, and the field already has the caret. Rest
            on a numbered line, or on the thing it describes, and both light.
          </>
        }
        legend={[
          {
            text: (
              <Hint name="current">
                Home is marked Current, so the palette says where you are before it takes you
                anywhere.
              </Hint>
            ),
          },
          {
            text: (
              <Hint name="hidden">
                History and Selection have no seat on the rail. This is how you reach them.
              </Hint>
            ),
          },
          {
            text: (
              <Hint name="commands">
                Under the sections sit the two commands: open this guide, or replay the welcome
                screen.
              </Hint>
            ),
          },
          {
            text: (
              <Hint name="keys">
                The foot of the palette names the keys: arrows to walk the list, Enter to jump, Esc
                to close.
              </Hint>
            ),
          },
        ]}
        outro="Sections filter on the first keystroke. The org search waits for three characters, then looks across groups, apps, rules, policies and people at once. The section rows never wait on it."
        minHeight={720}
      >
        <TabJumpPalette
          isOpen
          onClose={noop}
          activeTab="home"
          onSelect={noop}
          commands={commands}
        />
      </Scene>
    </div>

    <div className="guide-palette-scene" data-scene="search">
      <Scene
        title="Org Search"
        stageLabel="Command palette, searching"
        intro="Three characters in, rows from your org arrive under the sections, grouped by kind. Type in this frame: the four rows are fixed, the search behaves the way the panel does."
        legend={[
          {
            text: (
              <Hint name="source">
                Each heading says where its rows came from. Groups, apps and rules come from the
                snapshot you already hold; people are searched live, because the snapshot never
                holds them.
              </Hint>
            ),
          },
          {
            text: (
              <Hint name="edge">
                The right edge of every row names the tab it opens, so you know where Enter is about
                to put you.
              </Hint>
            ),
          },
          {
            text: (
              <Hint name="field">
                A spinner sits in the field while your org is searched, and the rows you already
                have stay put, so the list never empties mid word.
              </Hint>
            ),
          },
        ]}
        outro="The two commands at the foot of the list go nowhere in the panel. Open the user guide brings this page up in a new tab, and Show the welcome screen again puts the first run screen back on the panel. They filter on the same letters as the sections."
        minHeight={1120}
      >
        <SearchingPalette />
      </Scene>
    </div>
  </ChapterPage>
);

export default PaletteChapter;
