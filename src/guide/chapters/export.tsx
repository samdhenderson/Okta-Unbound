import React, { useEffect, useState } from 'react';
import ChapterPage, { type ShowSpec } from '../shell/ChapterPage';
import Scene from '../shell/Scene';
import { Marker, type LegendItem } from '../shell/Callout';
import Assemble from '../show/Assemble';
import { motionAvailable, readDurToken } from '../show/motion';
import { useTyped } from '../show/useTyped';
import { ActionBar, Button, type ActionDescriptor } from '../../sidepanel/components/shared';
import EntityPicker from '../../sidepanel/components/export/EntityPicker';
import ExportContextBar from '../../sidepanel/components/export/ExportContextBar';
import ExportFilterBox from '../../sidepanel/components/export/ExportFilterBox';
import ColumnPicker from '../../sidepanel/components/export/ColumnPicker';
import ExportPreviewTable from '../../sidepanel/components/export/ExportPreviewTable';
import GroupExportModal from '../../sidepanel/components/groups/GroupExportModal';
import { toGroupSummary } from '../../sidepanel/components/groups/groupSummary';
import { usersDescriptor } from '../../sidepanel/export/descriptors/users';
import { groupMembershipsDescriptor } from '../../sidepanel/export/descriptors/groupMemberships';
import type { EntityContextOption } from '../../sidepanel/export/types';
import type { GroupSummary } from '../../shared/types';
import { demoUsers } from '../../sidepanel/demo/users';
import { DEMO_HERO_GROUP_ID, currentGroups } from '../../sidepanel/demo/snapshot';
import { DEMO_ORIGIN } from '../../sidepanel/demo/org';
import { useCountUp } from '../../sidepanel/hooks/useCountUp';
import { useReducedMotion } from '../../sidepanel/hooks/useReducedMotion';

const usersFilter = usersDescriptor.filter.kind === 'none' ? null : usersDescriptor.filter;

const groupContext =
  groupMembershipsDescriptor.context.kind === 'search-to-select'
    ? groupMembershipsDescriptor.context
    : null;

const FILTER = 'status eq "ACTIVE" and profile.department eq "Legal"';

const matchingUsers = demoUsers.filter(
  (u) => u.status === 'ACTIVE' && u.profile.department === 'Legal',
);

const matchCount = {
  count: matchingUsers.length,
  hasMore: matchingUsers.length > Number(usersDescriptor.defaultQuery.limit),
};

const groupOptions: EntityContextOption[] = currentGroups().map((group) => ({
  id: group.id,
  label: group.profile?.name ?? group.id,
  sublabel: group.type,
}));

const pickedGroup = groupOptions.find((option) => option.id === DEMO_HERO_GROUP_ID) ?? null;

const searchGroups = (query: string): Promise<EntityContextOption[]> => {
  const needle = query.trim().toLowerCase();
  return Promise.resolve(
    needle ? groupOptions.filter((option) => option.label.toLowerCase().includes(needle)) : [],
  );
};

const tickedGroups: GroupSummary[] = currentGroups()
  .filter((group) => group.type === 'OKTA_GROUP')
  .slice(0, 3)
  .map(toGroupSummary);

const listedGroupCount = currentGroups().length;

const defaultColumns = new Set(
  usersDescriptor.columnCatalog
    .filter((column) => column.defaultEnabled)
    .map((column) => column.id),
);

const noop = () => {};

const SHOW_FILTER = 'profile.department eq "Legal"';

const showMatches = demoUsers.filter((u) => u.profile.department === 'Legal');

const TICKED_COLUMNS = ['department', 'title'] as const;

const CARD_PIECES = '[role="button"]';

function useTickedColumns(beat: number): Set<string> {
  const reduced = useReducedMotion();
  const ticking = beat >= 2;
  const animates = !reduced && motionAvailable();
  const [secondOn, setSecondOn] = useState(false);

  useEffect(() => {
    if (!ticking || !animates) return;
    const id = window.setTimeout(() => setSecondOn(true), readDurToken('--dur-tell'));
    return () => window.clearTimeout(id);
  }, [ticking, animates]);

  const enabled = new Set(defaultColumns);
  if (ticking) {
    enabled.add(TICKED_COLUMNS[0]);
    if (secondOn || !animates) enabled.add(TICKED_COLUMNS[1]);
  }
  return enabled;
}

const ShowStage: React.FC<{ beat: number }> = ({ beat }) => {
  const typed = useTyped(SHOW_FILTER, beat >= 1);
  const typedOut = typed.length === SHOW_FILTER.length;
  const counted = useCountUp(typedOut ? showMatches.length : 0).value;
  const enabled = useTickedColumns(beat);
  const columns = usersDescriptor.columnCatalog.filter((column) => enabled.has(column.id));

  if (beat === 0) {
    return (
      <Assemble selector={CARD_PIECES}>
        <EntityPicker descriptors={[usersDescriptor, groupMembershipsDescriptor]} onSelect={noop} />
      </Assemble>
    );
  }

  return (
    <div className="flex flex-col gap-(--sp-rung)">
      <Assemble className="flex flex-col gap-(--sp-rung)">
        <ExportFilterBox
          value={typed}
          onChange={noop}
          help={usersFilter?.help ?? ''}
          placeholder={usersFilter?.placeholder ?? ''}
          matchCount={counted > 0 ? { count: counted, hasMore: false } : null}
          matchCountLoading={counted === 0}
        />
        <ColumnPicker catalog={usersDescriptor.columnCatalog} enabled={enabled} onToggle={noop} />
      </Assemble>
      {beat >= 3 ? (
        <div className="animate-rise-in">
          <ExportPreviewTable
            columns={columns}
            rows={showMatches}
            fetched={showMatches.length}
            dropped={0}
            capped={false}
            linkify={usersDescriptor.linkify}
            oktaOrigin={DEMO_ORIGIN}
          />
        </div>
      ) : null}
    </div>
  );
};

const SHOW: ShowSpec = {
  stageLabel: 'Export',
  minHeight: 840,
  beats: [
    {
      caption: 'The tab opens on every export it offers. A card says what one row holds.',
      hold: 2,
    },
    {
      caption:
        'Narrow Users with an Okta search expression. The first page is counted as you type.',
      hold: 10,
    },
    {
      caption: 'Tick Department and Title on. The figure beside Columns follows every chip.',
      hold: 3,
    },
    { caption: 'Preview lays out the first rows in the columns you left on.' },
  ],
  render: (beat) => <ShowStage beat={beat} />,
};

interface HotLink {
  hot: number | null;
  setHot: (n: number | null) => void;
}

function useHotLink(): HotLink {
  const [hot, setHot] = useState<number | null>(null);
  return { hot, setHot };
}

interface HotTargetProps {
  n: number;
  link: HotLink;
  children: React.ReactNode;
}

const HotTarget: React.FC<HotTargetProps> = ({ n, link, children }) => {
  const hot = link.hot === n;
  return (
    <div
      data-hot={hot ? 'true' : undefined}
      className={`rounded-md transition-shadow duration-(--dur-instant) ease-(--ease-standard) ${
        hot ? 'ring-2 ring-primary/40 ring-offset-2 ring-offset-canvas' : ''
      }`}
      onPointerEnter={() => link.setHot(n)}
      onPointerLeave={() => link.setHot(null)}
      onFocus={() => link.setHot(n)}
      onBlur={() => link.setHot(null)}
    >
      {children}
    </div>
  );
};

function hotRow(link: HotLink, n: number, text: React.ReactNode): LegendItem {
  const hot = link.hot === n;
  return {
    text: (
      <span
        data-hot={hot ? 'true' : undefined}
        className={`-mx-1.5 rounded px-1.5 py-0.5 box-decoration-clone transition-colors duration-(--dur-instant) ease-(--ease-standard) ${
          hot ? 'bg-primary-light' : ''
        }`}
        onPointerEnter={() => link.setHot(n)}
        onPointerLeave={() => link.setHot(null)}
      >
        {text}
      </span>
    ),
  };
}

const ExportChapter: React.FC = () => {
  const [enabled, setEnabled] = useState<Set<string>>(defaultColumns);
  const [previewRun, setPreviewRun] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const choose = useHotLink();
  const scope = useHotLink();
  const run = useHotLink();
  const groups = useHotLink();

  const toggleColumn = (id: string) =>
    setEnabled((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const enabledColumns = usersDescriptor.columnCatalog.filter((column) => enabled.has(column.id));

  const listActions: ActionDescriptor[] = [
    {
      id: 'export-list',
      label: 'Export list',
      icon: 'download',
      variant: 'primary',
      onClick: () => setModalOpen(true),
      title: 'Export the current groups list as CSV',
    },
  ];
  const selectionActions: ActionDescriptor[] = [
    {
      id: 'compare',
      label: 'Compare',
      icon: 'chart',
      onClick: noop,
      title: `Compare the ${tickedGroups.length} selected groups`,
    },
    {
      id: 'export-selection',
      label: 'Export',
      icon: 'download',
      onClick: () => setModalOpen(true),
      title: `Export the ${tickedGroups.length} selected groups`,
      priority: 'tier',
    },
  ];

  return (
    <ChapterPage id="export" show={SHOW}>
      <Scene
        title="Pick an Export"
        intro="Sooner or later someone asks for the list. The Export tab turns any answer the panel can give into a CSV, and it opens on everything it can export. A card carries the icon, the name, and one line saying what a row of that export holds."
        legend={[
          hotRow(
            choose,
            1,
            'Users reads the whole org, so there is nothing to pick first. A filter is the only thing that narrows it.',
          ),
          hotRow(
            choose,
            2,
            'Group Memberships has no rows until you name a group, so choosing it opens a group search before anything else.',
          ),
        ]}
      >
        <div className="flex flex-col gap-3">
          <Marker n={1}>
            <HotTarget n={1} link={choose}>
              <EntityPicker descriptors={[usersDescriptor]} onSelect={noop} />
            </HotTarget>
          </Marker>
          <Marker n={2}>
            <HotTarget n={2} link={choose}>
              <EntityPicker descriptors={[groupMembershipsDescriptor]} onSelect={noop} />
            </HotTarget>
          </Marker>
        </div>
      </Scene>

      <Scene
        title="Scope"
        intro="A whole-org export takes an optional filter. A search-to-select export takes a parent entity first. One of each is shown here."
        legend={[
          hotRow(
            scope,
            1,
            'Search the group by name and pick it. The rows are its members and nobody else.',
          ),
          hotRow(
            scope,
            2,
            <>
              Type an Okta search expression and it reaches Okta as you wrote it. The line under the
              box counted {matchCount.count} rows on the first page, so a typo reads No matches
              before you download.
            </>,
          ),
        ]}
      >
        <div className="flex flex-col gap-(--sp-rung)">
          <Marker n={1}>
            <HotTarget n={1} link={scope}>
              <ExportContextBar
                label={groupContext?.label ?? 'Group'}
                placeholder={groupContext?.placeholder ?? 'Search groups by name'}
                search={searchGroups}
                onSelect={noop}
                initialSelected={pickedGroup}
              />
            </HotTarget>
          </Marker>
          <Marker n={2}>
            <HotTarget n={2} link={scope}>
              <ExportFilterBox
                value={FILTER}
                onChange={noop}
                help={usersFilter?.help ?? ''}
                placeholder={usersFilter?.placeholder ?? ''}
                matchCount={matchCount}
                matchCountLoading={false}
              />
            </HotTarget>
          </Marker>
        </div>
      </Scene>

      <Scene
        title="Columns and Run"
        intro="Columns are chips, grouped by where the value lives. Tick a chip and the preview under it redraws in the columns that are on."
        outro="Every cell is escaped on the way out, so a value that starts with an equals sign opens as text in a spreadsheet, not as a formula. The filename carries the export, the scope and the date, so the file explains itself after it has left your downloads folder. A row that Okta returned in a shape the panel does not recognise is counted as skipped, never silently dropped."
        legend={[
          hotRow(
            run,
            1,
            <>
              Identity chips read the user record. Profile chips read the profile, including any
              attribute your org added. The figure beside Columns is how many are on,{' '}
              {enabledColumns.length} right now.
            </>,
          ),
          hotRow(
            run,
            2,
            'Preview reads the rows and lays out the first hundred. Download CSV writes every row it matched to a file.',
          ),
          hotRow(
            run,
            3,
            <>
              The line above the table says how many rows the file will hold: the {matchCount.count}{' '}
              the filter matched, in the columns you left on. An export that reaches the cap of
              50,000 rows says so here and stops there.
            </>,
          ),
        ]}
      >
        <div className="flex flex-col gap-(--sp-rung)">
          <Marker n={1} align="top">
            <HotTarget n={1} link={run}>
              <ColumnPicker
                catalog={usersDescriptor.columnCatalog}
                enabled={enabled}
                onToggle={toggleColumn}
              />
            </HotTarget>
          </Marker>
          <Marker n={2}>
            <HotTarget n={2} link={run}>
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => setPreviewRun((n) => n + 1)}>
                  Preview
                </Button>
                <Button variant="primary" icon="download" onClick={noop}>
                  Download CSV
                </Button>
              </div>
            </HotTarget>
          </Marker>
          <Marker n={3} align="top">
            <HotTarget n={3} link={run}>
              <div key={previewRun} className="animate-rise-in">
                <ExportPreviewTable
                  columns={enabledColumns}
                  rows={matchingUsers}
                  fetched={matchingUsers.length}
                  dropped={0}
                  capped={false}
                  linkify={usersDescriptor.linkify}
                  oktaOrigin={DEMO_ORIGIN}
                />
              </div>
            </HotTarget>
          </Marker>
        </div>
      </Scene>

      <Scene
        title="Tab Exports"
        stageLabel="Groups, selection"
        intro={`Three of the ${listedGroupCount} groups on the list are ticked, so the strip has grown the verbs that act on them. Open More and click Export to open the same modal here, where Include member list adds a second CSV holding every member of every ticked group.`}
        legend={[
          hotRow(
            groups,
            1,
            <>
              Export list writes the {listedGroupCount} groups the filter left on screen. Export,
              behind More, writes only the {tickedGroups.length} you ticked.
            </>,
          ),
        ]}
        minHeight={modalOpen ? 760 : 160}
      >
        <Marker n={1} align="top">
          <HotTarget n={1} link={groups}>
            <ActionBar
              ariaLabel="Actions for the groups list"
              sticky={false}
              actions={listActions}
              register={{
                ariaLabel: 'Selection actions for the groups list',
                actions: selectionActions,
              }}
            />
          </HotTarget>
        </Marker>
        <GroupExportModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          groups={tickedGroups}
          targetTabId={null}
          exportType="selection"
          onFetchMembers={() => Promise.resolve([])}
        />
      </Scene>
    </ChapterPage>
  );
};

export default ExportChapter;
