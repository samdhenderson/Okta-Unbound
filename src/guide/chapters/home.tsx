import React, { createContext, useContext, useMemo, useState } from 'react';
import ChapterPage, { type ShowSpec } from '../shell/ChapterPage';
import Band from '../shell/Band';
import Scene from '../shell/Scene';
import { Marker } from '../shell/Callout';
import FeedbackLink from '../shell/FeedbackLink';
import Assemble from '../show/Assemble';
import { useTyped } from '../show/useTyped';
import { homeReportIssueUrl } from '../links';
import JumpBar from '../../sidepanel/components/home/JumpBar';
import JumpResultRow from '../../sidepanel/components/home/JumpResultRow';
import OrgSnapshotCard from '../../sidepanel/components/home/OrgSnapshotCard';
import FigureNumber from '../../sidepanel/components/home/FigureNumber';
import { RowDisclosure } from '../../sidepanel/components/home/ReportRow';
import { EntityChoiceRow, type EntityChoice } from '../../sidepanel/components/home/EntityChooser';
import MfaCoverageLauncher from '../../sidepanel/components/home/MfaCoverageLauncher';
import Eyebrow from '../../sidepanel/components/shared/Eyebrow';
import WorkingSet from '../../sidepanel/components/home/WorkingSet';
import {
  buildBox,
  buildFigure,
  buildSubCount,
  type FigureSource,
} from '../../sidepanel/components/home/orgFigures';
import { buildReport, type HomeReport } from '../../sidepanel/components/home/homeReports';
import { useCountUp } from '../../sidepanel/hooks/useCountUp';
import type {
  JumpMode,
  JumpResult,
  UseJumpResolverResult,
} from '../../sidepanel/hooks/useJumpResolver';
import type { WorkingSetRef } from '../../shared/storage/workingSetStore';
import { DEMO_COMPARISON_PAIR, demoUsersById } from '../../sidepanel/demo/users';
import { DEMO_ORIGIN, fakeId } from '../../sidepanel/demo/org';
import {
  currentGroups,
  demoAppGroups,
  demoApps,
  demoRules,
  DEMO_HERO_GROUP_ID,
} from '../../sidepanel/demo/snapshot';
import { GROUP } from '../../sidepanel/demo/memberships';

const noop = () => {};

const phrase = (n: number, one: string, many: string): string =>
  `${n.toLocaleString()} ${n === 1 ? one : many}`;

const amara = demoUsersById.get(DEMO_COMPARISON_PAIR.left) ?? missingUser();
function missingUser(): never {
  throw new Error('Demo comparison user is missing');
}

const groups = currentGroups();
type DemoGroup = (typeof groups)[number];
const nameOf = (g: DemoGroup): string => g.profile?.name ?? g.id;
const memberCount = (g: DemoGroup): number => g._embedded?.stats?.usersCount ?? 0;
function groupById(id: string): DemoGroup {
  const found = groups.find((g) => g.id === id);
  if (!found) throw new Error(`Demo group ${id} is missing`);
  return found;
}
const hero = groupById(DEMO_HERO_GROUP_ID);
const awsAdmin = groupById(fakeId('00g', GROUP.awsProdAdmin));

const jumpHits: JumpResult[] = [
  { kind: 'group', id: hero.id, name: nameOf(hero), secondary: hero.profile?.description },
  {
    kind: 'rule',
    id: fakeId('0pr', 2),
    name: 'Engineering by department',
    secondary: 'user.department == "Engineering"',
  },
  {
    kind: 'user',
    id: amara.id,
    name: `${amara.profile.firstName} ${amara.profile.lastName}`,
    secondary: amara.profile.login,
  },
];

const READ_AT = Date.now() - 20 * 60 * 1000;
const walked = (count: number): FigureSource => ({
  isReading: false,
  complete: true,
  lastFullWalkAt: READ_AT,
  count,
  error: null,
});

const ruleTargets = new Set(
  demoRules.flatMap((r) => r.actions?.assignUserToGroups?.groupIds ?? []),
);
const emptyUnfilled = groups.filter((g) => memberCount(g) === 0 && !ruleTargets.has(g.id));
const paused = demoRules.filter((r) => r.status === 'INACTIVE').length;

const groupsNamed = { source: walked(groups.length), noun: 'groups' };
const rulesNamed = { source: walked(demoRules.length), noun: 'group rules' };
const appsNamed = { source: walked(demoApps.length), noun: 'applications' };
const appGroupsNamed = { source: walked(demoAppGroups.length), noun: 'app group assignments' };

const boxes = [
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
  buildBox(buildFigure('groups', 'Groups', 'users', groupsNamed.source), 'groups', 'groups', [
    buildSubCount({
      key: 'groups-empty-unfilled',
      label: 'Groups with no members that no rule fills',
      icon: 'users',
      counted: groupsNamed,
      gates: [rulesNamed],
      count: emptyUnfilled.length,
      request: { tab: 'groups', view: 'empty-no-rules' },
    }),
  ]),
];

const appLabel = new Map(demoApps.map((a) => [a.id, a.label]));

const unmaintainedAccess = demoAppGroups
  .filter(({ assignment }) => !ruleTargets.has(assignment.id))
  .map(({ appId, assignment }) => {
    const group = groups.find((g) => g.id === assignment.id);
    return group
      ? {
          id: group.id,
          name: nameOf(group),
          detail: `${memberCount(group)} members · ${appLabel.get(appId) ?? 'an app'}`,
        }
      : null;
  })
  .filter((finding) => finding !== null);

const PUSH_APPS_ONLY = 'Only apps with group push enabled are read.';
const CANNOT_SEE =
  'Okta Workflows, SCIM and HR provisioning, direct API writes, and IdP group sync can all ' +
  `fill a group without leaving anything here to see. ${PUSH_APPS_ONLY}`;

const reports: HomeReport[] = [
  buildReport({
    key: 'group-cleanup',
    label: 'Empty groups nothing fills',
    counted: groupsNamed,
    gates: [rulesNamed, appGroupsNamed],
    findings: emptyUnfilled.map((g) => ({
      id: g.id,
      name: nameOf(g),
      detail: 'No members · no rule fills it · no app assigned',
    })),
    caveat: `Findings, not a delete list. ${CANNOT_SEE}`,
  }),
  buildReport({
    key: 'unmaintained-app-access',
    label: 'App access no rule maintains',
    counted: groupsNamed,
    floors: [appGroupsNamed, appsNamed],
    gates: [rulesNamed],
    findings: unmaintainedAccess,
    caveat: CANNOT_SEE,
  }),
];

const groupChoices: EntityChoice[] = groups.map((g) => ({
  id: g.id,
  name: nameOf(g),
  detail: `${memberCount(g)} members`,
}));

const HOUR = 60 * 60 * 1000;
const pinned: WorkingSetRef[] = [
  {
    kind: 'group',
    id: awsAdmin.id,
    name: nameOf(awsAdmin),
    lastSeenAt: Date.now() - 3 * HOUR,
  },
];
const recent: WorkingSetRef[] = [
  {
    kind: 'user',
    id: amara.id,
    name: `${amara.profile.firstName} ${amara.profile.lastName}`,
    lastPane: 'Groups',
    lastSeenAt: Date.now() - 26 * HOUR,
  },
  {
    kind: 'group',
    id: hero.id,
    name: nameOf(hero),
    lastPane: 'Members',
    lastSeenAt: Date.now() - 50 * HOUR,
  },
];

const CARD = 'rounded-md border border-neutral-200 bg-white';
const PROSE = 'max-w-(--guide-prose-w) text-sm leading-relaxed text-neutral-700';

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

const RING = {
  around: 'rounded-md ring-primary-highlight ring-offset-1 ring-offset-canvas data-hot:ring-2',
  within: 'overflow-hidden data-hot:inset-ring-2 data-hot:inset-ring-primary-highlight',
} as const;

const HotTarget: React.FC<{
  n: number;
  ring?: keyof typeof RING;
  children: React.ReactNode;
}> = ({ n, ring = 'around', children }) => {
  const { isHot, handlers } = useHot(n);
  return (
    <div
      data-guide-target={n}
      data-hot={isHot || undefined}
      className={`${RING[ring]} transition-shadow duration-(--dur-instant) ease-(--ease-standard) [&+span]:transition-shadow [&+span]:duration-(--dur-instant) [&[data-hot]+span]:ring-4 [&[data-hot]+span]:ring-primary-highlight`}
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
      className="-mx-1.5 -my-0.5 block box-decoration-clone rounded px-1.5 py-0.5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-hot:bg-primary-light"
      {...handlers}
    >
      {children}
    </span>
  );
};

const ReportsSurface: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-2">
    <Eyebrow as="h3">Reports</Eyebrow>
    <div
      className={`divide-y divide-neutral-100 ${CARD} [&>*:first-child>*]:rounded-t-md [&>*:last-child>*]:rounded-b-md`}
    >
      {children}
    </div>
  </div>
);

const ReportRow: React.FC<{ report: HomeReport }> = ({ report }) => (
  <ul>
    <RowDisclosure
      rowKey={report.key}
      figure={<FigureNumber value={report.value} />}
      label={report.label}
      note={report.note}
    >
      <div className="animate-rise-in" data-testid={`guide-report-${report.key}`}>
        <p className="text-xs text-neutral-600">{report.caveat}</p>
        <ul className="rise-in-stagger mt-2 space-y-px">
          {report.findings.map((finding) => (
            <EntityChoiceRow
              key={finding.id}
              choice={finding}
              actionLabel="Open this group"
              onChoose={noop}
            />
          ))}
        </ul>
        {report.value !== null && report.value > report.findings.length && (
          <p className="mt-2 text-xs text-neutral-600">
            Showing the first {report.findings.length.toLocaleString()} of{' '}
            {report.value.toLocaleString()}.
          </p>
        )}
      </div>
    </RowDisclosure>
  </ul>
);

const TYPED_QUERY = 'eng';

const jumpModeFor = (beat: number, typed: string): JumpMode => {
  if (beat >= 2) return 'results';
  return typed.length >= 3 ? 'searching' : 'idle';
};

const TypedJumpBar: React.FC<{ beat: number }> = ({ beat }) => {
  const typed = useTyped(TYPED_QUERY, beat >= 1);
  const jump: UseJumpResolverResult = {
    query: typed,
    setQuery: noop,
    mode: jumpModeFor(beat, typed),
    results: beat >= 2 ? jumpHits : [],
    error: null,
    isIdQuery: false,
    resolution: null,
    submit: noop,
    clear: noop,
  };
  return (
    <Assemble selector="ul > li" live={beat >= 2}>
      <JumpBar jump={jump} onSelect={noop} canReach={() => true} oktaOrigin={DEMO_ORIGIN} />
    </Assemble>
  );
};

const CountedSnapshot: React.FC = () => {
  const rulesCount = useCountUp(demoRules.length).value;
  const groupsCount = useCountUp(groups.length).value;
  const pausedCount = useCountUp(paused).value;
  const emptyCount = useCountUp(emptyUnfilled.length).value;
  const rulesCounting = { source: walked(rulesCount), noun: 'group rules' };
  const groupsCounting = { source: walked(groupsCount), noun: 'groups' };
  const counted = [
    buildBox(
      buildFigure('rules', 'Group rules', 'bolt', rulesCounting.source),
      'rules',
      'group rules',
      [
        buildSubCount({
          key: 'rules-paused-show',
          label: 'Group rules paused',
          icon: 'pause',
          counted: rulesCounting,
          count: pausedCount,
          request: { tab: 'rules', view: 'paused' },
        }),
      ],
    ),
    buildBox(buildFigure('groups', 'Groups', 'users', groupsCounting.source), 'groups', 'groups', [
      buildSubCount({
        key: 'groups-empty-unfilled-show',
        label: 'Groups with no members that no rule fills',
        icon: 'users',
        counted: groupsCounting,
        gates: [rulesCounting],
        count: emptyCount,
        request: { tab: 'groups', view: 'empty-no-rules' },
      }),
    ]),
  ];
  return (
    <OrgSnapshotCard
      boxes={counted}
      readAt={READ_AT}
      isRefreshing={false}
      onRefresh={noop}
      canRefresh
      onOpenTab={noop}
      onOpenListView={noop}
    />
  );
};

const DAY = 24 * HOUR;
const DORMANT_DAYS = 180;
const DORMANT_LABEL = 'App access with no membership change in 6 months';
const DORMANT_CAVEAT =
  'Measured from the last complete read of your groups, not from today. Okta Workflows, ' +
  "SCIM and HR provisioning, direct API writes and IdP group sync all move a group's " +
  'membership date, so none of them has written to these groups either. What the date ' +
  'cannot show is a maintainer who reviewed the roster and changed nothing. ' +
  PUSH_APPS_ONLY;

const describeSilence = (days: number): string => {
  const years = Math.floor(days / 365);
  if (years >= 1) return `${years} ${years === 1 ? 'year' : 'years'}`;
  const months = Math.max(1, Math.floor(days / 30));
  return `${months} ${months === 1 ? 'month' : 'months'}`;
};

const appsByGroup = new Map<string, string[]>();
for (const { appId, assignment } of demoAppGroups) {
  const names = appsByGroup.get(assignment.id) ?? [];
  names.push(appLabel.get(appId) ?? 'an app');
  appsByGroup.set(assignment.id, names);
}
const dormant = groups
  .filter((g) => memberCount(g) > 0 && !ruleTargets.has(g.id) && appsByGroup.has(g.id))
  .map((g) => ({
    group: g,
    silentFor: g.lastMembershipUpdated ? READ_AT - Date.parse(g.lastMembershipUpdated) : Number.NaN,
  }))
  .filter(({ silentFor }) => Number.isFinite(silentFor) && silentFor >= DORMANT_DAYS * DAY)
  .sort((a, b) => b.silentFor - a.silentFor);

const longestSilence = describeSilence((dormant[0]?.silentFor ?? DORMANT_DAYS * DAY) / DAY);

const dormantFindings = dormant.map(({ group, silentFor }) => ({
  id: group.id,
  name: nameOf(group),
  detail: [
    `${memberCount(group)} ${memberCount(group) === 1 ? 'member' : 'members'}`,
    (appsByGroup.get(group.id) ?? []).join(', '),
    `no membership change in ${describeSilence(silentFor / DAY)}`,
  ].join(' · '),
}));

const dormantReport = buildReport({
  key: 'dormant-app-access',
  label: DORMANT_LABEL,
  counted: groupsNamed,
  floors: [appGroupsNamed, appsNamed],
  gates: [rulesNamed],
  findings: dormantFindings,
  caveat: DORMANT_CAVEAT,
});

const DormantReport: React.FC = () => (
  <ReportsSurface>
    <ReportRow report={dormantReport} />
  </ReportsSurface>
);

const SNAPSHOT_PIECES = ':scope > section > div, :scope > section > ul > li, :scope > section > p';

const SHOW: ShowSpec = {
  stageLabel: 'Home',
  minHeight: 528,
  beats: [
    { caption: 'Home opens on one field. Type a name, or paste an id.', hold: 2 },
    { caption: 'Three characters in, the org is searched. Fewer, and nothing is sent.', hold: 2 },
    {
      caption: `Three kinds answer at once: ${nameOf(hero)}, the rule that fills it, and ${amara.profile.firstName}. Each row names the tab it opens.`,
      hold: 3,
    },
    {
      caption: `Under it, the snapshot you already hold counts what to fix: ${phrase(paused, 'group rule paused', 'group rules paused')}, ${phrase(emptyUnfilled.length, 'group no rule fills', 'groups no rule fills')}.`,
      hold: 3,
    },
    {
      caption: `Reports answer with names. This one counted ${phrase(dormantFindings.length, 'app group', 'app groups')} whose membership has not moved in ${longestSilence}.`,
    },
  ],
  render: (beat) => (
    <div className="flex flex-col gap-(--sp-rung)">
      <TypedJumpBar beat={beat} />
      {beat >= 3 ? (
        <Assemble selector={SNAPSHOT_PIECES}>
          <CountedSnapshot />
        </Assemble>
      ) : null}
      {beat >= 4 ? (
        <Assemble>
          <DormantReport />
        </Assemble>
      ) : null}
    </div>
  ),
};

const HomeChapter: React.FC = () => {
  const [query, setQuery] = useState('');
  const jump: UseJumpResolverResult = {
    query,
    setQuery,
    mode: 'idle',
    results: [],
    error: null,
    isIdQuery: false,
    resolution: null,
    submit: noop,
    clear: () => setQuery(''),
  };

  return (
    <ChapterPage id="home" show={SHOW}>
      <HotScope>
        <Scene
          title="Launcher"
          intro="Home is where the panel opens. It reads the org snapshot the extension already holds, so the findings and reports on it cost no requests, and it keeps whatever you pinned and whatever you had open last. One field sits at the top of the tab: it searches names and emails as you type, and resolves an Okta id exactly. Rest on a number to light the sentence beside it."
          legend={[
            {
              text: (
                <HotText n={1}>
                  Type three characters and your org is searched; type fewer and nothing is sent.
                  Paste an id instead, press Enter, and only that entity is resolved.
                </HotText>
              ),
            },
            {
              text: (
                <HotText n={2}>
                  One search, three kinds of answer: the group, the rule that fills it, the person.
                  Each row wears its kind on the left and names the tab it opens on the right.
                </HotText>
              ),
            },
          ]}
        >
          <div className="flex flex-col gap-2">
            <Marker n={1}>
              <HotTarget n={1}>
                <JumpBar
                  jump={jump}
                  onSelect={noop}
                  canReach={() => true}
                  oktaOrigin={DEMO_ORIGIN}
                />
              </HotTarget>
            </Marker>
            <Marker n={2} align="top">
              <HotTarget n={2}>
                <ul className="space-y-1">
                  {jumpHits.map((result) => (
                    <li key={result.id}>
                      <JumpResultRow result={result} onSelect={noop} oktaOrigin={DEMO_ORIGIN} />
                    </li>
                  ))}
                </ul>
              </HotTarget>
            </Marker>
          </div>
        </Scene>
      </HotScope>

      <HotScope>
        <Scene
          title="Org Snapshot"
          intro="The card counts findings rather than totals: each row is one thing you can act on. A finding whose collection has not finished a read states no number and names the read it is missing; one walked to zero is a plain row with nothing to open."
          legend={[
            {
              text: (
                <HotText n={1}>
                  Press Group rules paused and the Rules tab opens showing only those. The totals
                  underneath open the same tab unfiltered, the footnote dates the oldest read behind
                  the card, and Refresh walks every collection again.
                </HotText>
              ),
            },
          ]}
        >
          <Marker n={1} align="top">
            <HotTarget n={1}>
              <OrgSnapshotCard
                boxes={boxes}
                readAt={READ_AT}
                isRefreshing={false}
                onRefresh={noop}
                canRefresh
                onOpenTab={noop}
                onOpenListView={noop}
              />
            </HotTarget>
          </Marker>
        </Scene>
      </HotScope>

      <HotScope>
        <Scene
          title="Reports"
          intro="Three rows on one card. The first two answer with names rather than a number, so they open in place; the last one needs a group before it can answer at all. Press a row to open it."
          legend={[
            {
              text: (
                <HotText n={1}>
                  Empty groups nothing fills: no members, no rule assigning into it, no app pushed
                  to it. The caveat above the names says what the join cannot see.
                </HotText>
              ),
            },
            {
              text: (
                <HotText n={2}>
                  App access no rule maintains:{' '}
                  {phrase(unmaintainedAccess.length, 'pushed app group', 'pushed app groups')} whose
                  members were all put there by hand. Each name opens that group.
                </HotText>
              ),
            },
            {
              text: (
                <HotText n={3}>
                  MFA coverage is the one report that costs requests, a factor read per member. It
                  asks for a group first, then opens the Insights pane for that group with the scan
                  armed and not started.
                </HotText>
              ),
            },
          ]}
          minHeight={320}
        >
          <ReportsSurface>
            {reports.map((report, index) => (
              <Marker key={report.key} n={index + 1} align="top">
                <HotTarget n={index + 1} ring="within">
                  <ReportRow report={report} />
                </HotTarget>
              </Marker>
            ))}
            <Marker n={3} align="top">
              <HotTarget n={3} ring="within">
                <ul>
                  <MfaCoverageLauncher choices={groupChoices} status="ok" onScan={noop} />
                </ul>
              </HotTarget>
            </Marker>
          </ReportsSurface>
        </Scene>
      </HotScope>

      <HotScope>
        <Scene
          title="Working Set"
          intro="The bottom of the tab is yours: what you chose to keep, and what you were just looking at."
          legend={[
            {
              text: (
                <HotText n={1}>
                  Pin a group or a user from the corner of its header and it stays here until you
                  unpin it. Recent fills itself as you open things, newest first, and remembers the
                  pane you left on.
                </HotText>
              ),
            },
          ]}
        >
          <Marker n={1} align="top">
            <HotTarget n={1}>
              <WorkingSet
                pinned={pinned}
                recent={recent}
                onOpen={noop}
                onUnpin={noop}
                onForget={noop}
              />
            </HotTarget>
          </Marker>
        </Scene>
      </HotScope>

      <Band title="What Home Should Show">
        <p className={PROSE}>
          Home is the least settled tab in the panel. The two findings and the three reports above
          are a first draft, and what belongs there is your call more than ours. Tell us what you
          would want to see the moment you open the panel, and what you would want it to have
          noticed for you.
        </p>
        <FeedbackLink href={homeReportIssueUrl()}>Suggest a Home report</FeedbackLink>
      </Band>
    </ChapterPage>
  );
};

export default HomeChapter;
