import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import ChapterPage, { type ShowSpec } from '../shell/ChapterPage';
import Scene from '../shell/Scene';
import { Marker } from '../shell/Callout';
import Assemble from '../show/Assemble';
import {
  Badge,
  CopyableId,
  IconButton,
  ListRow,
  OpenInOktaLink,
  StretchedButton,
} from '../../sidepanel/components/shared';
import Icon from '../../sidepanel/components/shared/Icon';
import { formatDate, formatDateShort } from '../../shared/utils/dateFormat';
import GroupAppRow from '../../sidepanel/components/groups/detail/GroupAppRow';
import UserAppRow from '../../sidepanel/components/users/UserAppRow';
import { toGroupAppRows } from '../../sidepanel/components/groups/groupAppSource';
import { summarizeAppSources } from '../../sidepanel/components/users/appSourceSummary';
import { appDisplayLabel, appStatusVariant } from '../../sidepanel/components/apps/appFilters';
import type { AppGrant } from '../../sidepanel/hooks/useGroupAccessGrants';
import type { UserAppAssignment } from '../../sidepanel/hooks/useOktaApi/userOperations';
import type { GroupMembership, PushGroupMapping } from '../../shared/types';
import type { OktaAppListItem } from '../../shared/schemas/okta';
import { demoAppGroups, demoApps } from '../../sidepanel/demo/snapshot';
import { GROUP } from '../../sidepanel/demo/memberships';
import { DEMO_ORIGIN, fakeId } from '../../sidepanel/demo/org';

const demoApp = (n: number): OktaAppListItem => {
  const app = demoApps.find((a) => a.id === fakeId('0oa', n));
  if (!app) throw new Error(`demo app ${n} is not in the inventory`);
  return app;
};

const inventory: OktaAppListItem[] = [demoApp(1), demoApp(3), demoApp(8), demoApp(11)];

const showInventory: OktaAppListItem[] = [demoApp(1), demoApp(3), demoApp(11)];

const GITHUB_ENGINEERING = fakeId('00g', GROUP.githubEngineering);
const ENGINEERING_ALL = fakeId('00g', GROUP.engineering);

const pushMappings: PushGroupMapping[] = demoAppGroups
  .filter(({ assignment }) => assignment.id === GITHUB_ENGINEERING)
  .map(({ appId, assignment }) => ({
    mappingId: `0pmFAKE${appId.slice(-6)}`,
    sourceUserGroupId: assignment.id,
    targetGroupName: assignment.profile?.groupName ?? '',
    priority: assignment.priority,
    appId,
    appName: demoApps.find((a) => a.id === appId)?.name,
  }));

const grant = (n: number): AppGrant => {
  const app = demoApp(n);
  return {
    id: app.id,
    label: appDisplayLabel(app),
    name: app.name,
    status: app.status,
    signOnMode: app.signOnMode,
    lastUpdated: app.lastUpdated ? new Date(app.lastUpdated) : undefined,
  };
};

const groupAppRows = toGroupAppRows([grant(3), grant(4)], pushMappings);

const memberships: GroupMembership[] = [
  {
    group: { id: ENGINEERING_ALL, type: 'OKTA_GROUP', profile: { name: 'Engineering - All' } },
    membershipType: 'RULE_BASED',
    attribution: 'exact',
    rules: [
      {
        id: fakeId('0pr', 2),
        name: 'Engineering by department',
        status: 'ACTIVE',
        conditionExpression: 'user.department == "Engineering"',
      },
    ],
  },
  {
    group: {
      id: GITHUB_ENGINEERING,
      type: 'OKTA_GROUP',
      profile: { name: 'GitHub - Engineering' },
    },
    membershipType: 'RULE_BASED',
    attribution: 'exact',
    rules: [
      {
        id: fakeId('0pr', 3),
        name: 'Engineering to GitHub (excludes contractors)',
        status: 'ACTIVE',
        conditionExpression:
          'user.department == "Engineering" && user.employeeType != "CONTRACTOR"',
      },
    ],
  },
];

const assignment = (n: number, over: Partial<UserAppAssignment> = {}): UserAppAssignment => {
  const app = demoApp(n);
  return {
    id: app.id,
    label: appDisplayLabel(app),
    name: app.name,
    isProfileSource: false,
    ...over,
  };
};

const userApps = summarizeAppSources(
  [
    assignment(5, { scope: 'USER' }),
    assignment(4, { scope: 'USER', grantGroupId: ENGINEERING_ALL }),
    assignment(3, { scope: 'GROUP', grantGroupId: GITHUB_ENGINEERING }),
    assignment(12, { scope: 'GROUP' }),
  ],
  memberships,
);

const userAppRows = userApps.rows;

interface Lit {
  lit: number | null;
  set: (n: number | null) => void;
  bind: (n: number) => {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: (event: React.FocusEvent<HTMLElement>) => void;
  };
}

function useLit(): Lit {
  const [lit, setLit] = useState<number | null>(null);
  const bind = (n: number) => ({
    onPointerEnter: () => setLit(n),
    onPointerLeave: () => setLit((current) => (current === n ? null : current)),
    onFocus: () => setLit(n),
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
      setLit((current) => (current === n ? null : current));
    },
  });
  return { lit, set: setLit, bind };
}

const Target: React.FC<{ n: number; link: Lit; children: React.ReactNode }> = ({
  n,
  link,
  children,
}) => {
  const on = link.lit === n;
  return (
    <div
      data-lit={on || undefined}
      className={`rounded-md transition-shadow duration-(--dur-instant) ${on ? 'ring-2 ring-primary-highlight' : ''}`}
      {...link.bind(n)}
    >
      {children}
    </div>
  );
};

const LIT_ROW =
  '[&>li]:ring-primary-highlight [&>li]:transition-[background-color,border-color,box-shadow] [&>li]:duration-(--dur-instant) [&>li]:ease-standard ' +
  "[&[data-lit='1']>li:nth-child(1)]:ring-2 [&[data-lit='2']>li:nth-child(2)]:ring-2 " +
  "[&[data-lit='3']>li:nth-child(3)]:ring-2 [&[data-lit='4']>li:nth-child(4)]:ring-2";

const ROW_GAP = {
  access: 'gap-1.5',
  rung: 'gap-(--sp-rung)',
} as const;

const rowOf = (list: HTMLElement, target: unknown): number | null => {
  const row = target instanceof Element ? target.closest('li') : null;
  if (!row || row.parentElement !== list) return null;
  return Array.prototype.indexOf.call(list.children, row) + 1;
};

const RowList: React.FC<{ link: Lit; gap: keyof typeof ROW_GAP; children: React.ReactNode }> = ({
  link,
  gap,
  children,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [heights, setHeights] = useState<number[]>([]);

  useLayoutEffect(() => {
    const list = ref.current;
    if (!list || typeof window.ResizeObserver !== 'function') return;
    const rows = Array.from(list.children) as HTMLElement[];
    const measure = () => setHeights(rows.map((row) => row.offsetHeight));
    const observer = new window.ResizeObserver(measure);
    rows.forEach((row) => observer.observe(row));
    measure();
    return () => observer.disconnect();
  }, []);

  const leave = (event: React.FocusEvent<HTMLElement>) => {
    const next: unknown = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    link.set(null);
  };

  return (
    <div className="relative">
      <ul
        ref={(node) => {
          ref.current = node;
        }}
        data-lit={link.lit ?? undefined}
        className={`flex flex-col ${ROW_GAP[gap]} ${LIT_ROW}`}
        onPointerOver={(event) => link.set(rowOf(event.currentTarget, event.target))}
        onPointerLeave={() => link.set(null)}
        onFocus={(event) => link.set(rowOf(event.currentTarget, event.target))}
        onBlur={leave}
      >
        {children}
      </ul>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex flex-col ${ROW_GAP[gap]}`}
      >
        {heights.map((height, index) => (
          <Marker key={index} n={index + 1} align="top">
            <div style={{ height }} />
          </Marker>
        ))}
      </div>
    </div>
  );
};

const Sentence: React.FC<{ n: number; link: Lit; children: React.ReactNode }> = ({
  n,
  link,
  children,
}) => {
  const on = link.lit === n;
  return (
    <span
      data-lit={on || undefined}
      className={`-mx-1.5 -my-0.5 block rounded-md px-1.5 py-0.5 transition-colors duration-(--dur-instant) ${on ? 'bg-primary-light' : ''}`}
      {...link.bind(n)}
    >
      {children}
    </span>
  );
};

const InventoryRow: React.FC<{ app: OktaAppListItem }> = ({ app }) => {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const labelId = useId();
  const toggle = () => setExpanded((current) => !current);
  const label = appDisplayLabel(app);

  return (
    <ListRow
      density="comfortable"
      className="group/item"
      body={
        <div
          id={detailsId}
          className="disclose"
          data-open={expanded}
          inert={!expanded || undefined}
        >
          <div>
            <div className="space-y-3 border-t border-neutral-100 px-4 pt-2 pb-4">
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
                  <div className="mb-0.5 text-xs font-medium text-neutral-600">Application ID</div>
                  <CopyableId
                    value={app.id}
                    label={`Copy application id for ${label}`}
                    className="w-full"
                  />
                </div>
                {app.created && (
                  <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
                    <div className="mb-0.5 text-xs font-medium text-neutral-600">Created</div>
                    <div className="text-xs text-neutral-900">{formatDate(app.created)}</div>
                  </div>
                )}
                {app.lastUpdated && (
                  <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
                    <div className="mb-0.5 text-xs font-medium text-neutral-600">Last updated</div>
                    <div className="text-xs text-neutral-900">{formatDate(app.lastUpdated)}</div>
                  </div>
                )}
              </div>
              <OpenInOktaLink
                oktaOrigin={DEMO_ORIGIN}
                target={{ type: 'app', id: app.id, name: app.name }}
              />
            </div>
          </div>
        </div>
      }
    >
      <div className="relative flex items-start gap-3">
        <StretchedButton
          label={expanded ? 'Hide details' : 'Show details'}
          describedBy={labelId}
          onClick={toggle}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span
                id={labelId}
                className="block truncate text-sm font-semibold text-neutral-900 transition-colors duration-(--dur-instant) group-hover/item:text-primary-text"
              >
                {label}
              </span>
              <div className="mt-1.5 flex flex-wrap items-center gap-(--sp-inline)">
                {app.status && <Badge variant={appStatusVariant(app.status)}>{app.status}</Badge>}
                {app.signOnMode && <Badge variant="neutral">{app.signOnMode}</Badge>}
              </div>
            </div>
            <IconButton
              label={expanded ? `Collapse ${label}` : `Expand ${label}`}
              onClick={toggle}
              variant="ghost"
              size="md"
              expanded={expanded}
              controls={detailsId}
              className="relative z-10 shrink-0"
            >
              <Icon
                type="chevron-right"
                size="sm"
                className={`transition-transform duration-(--dur-instant) ${expanded ? 'rotate-90' : ''}`}
              />
            </IconButton>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            {app.name && <span className="truncate font-mono text-neutral-500">{app.name}</span>}
            {app.created && (
              <span className="text-neutral-600" title="Created">
                Created {formatDateShort(app.created)}
              </span>
            )}
          </div>
        </div>
      </div>
    </ListRow>
  );
};

const AssignedAppsHeading: React.FC = () => (
  <h3 className="text-xs font-medium text-neutral-600">Assigned apps ({groupAppRows.length})</h3>
);

const AppSourceSummaryLine: React.FC = () => (
  <p className="text-xs text-neutral-600">{userApps.summary}</p>
);

const noop = () => {};

const SHOW: ShowSpec = {
  stageLabel: 'Apps',
  minHeight: 432,
  beats: [
    { caption: 'Every app in the org on one list, the deactivated ones included.', hold: 3 },
    { caption: 'Open a group, and Access lists every app that membership buys.', hold: 2 },
    {
      caption: 'GitHub Enterprise is pushed, so the row names the group it writes into.',
      hold: 3,
    },
    { caption: 'Open a person, and every app names the route she got it by.' },
  ],
  render: (beat) => {
    if (beat === 0) {
      return (
        <Assemble className={`flex flex-col ${ROW_GAP.rung}`}>
          {showInventory.map((app) => (
            <InventoryRow key={app.id} app={app} />
          ))}
        </Assemble>
      );
    }
    if (beat <= 2) {
      return (
        <div className={`flex flex-col ${ROW_GAP.access}`}>
          <AssignedAppsHeading />
          <Assemble as="ul" className={`flex flex-col ${ROW_GAP.access}`}>
            {groupAppRows.map((row) => (
              <GroupAppRow
                key={row.id}
                row={row}
                expanded={beat === 2 && row.push.state === 'pushed'}
                onToggle={noop}
                oktaOrigin={DEMO_ORIGIN}
              />
            ))}
          </Assemble>
        </div>
      );
    }
    return (
      <div className={`flex flex-col ${ROW_GAP.rung}`}>
        <AppSourceSummaryLine />
        <Assemble as="ul" className={`flex flex-col ${ROW_GAP.rung}`}>
          {userAppRows.map((row) => (
            <UserAppRow key={row.id} row={row} oktaOrigin={DEMO_ORIGIN} />
          ))}
        </Assemble>
      </div>
    );
  },
};

const AppsChapter: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (appId: string) => setOpen((current) => (current === appId ? null : appId));
  const inventoryLink = useLit();
  const groupLink = useLit();
  const userLink = useLit();

  return (
    <ChapterPage id="apps" show={SHOW}>
      <Scene
        title="Inventory"
        intro="An app is the thing people actually reach. The Apps tab lists every one in your org, live or not, and the Groups and Users tabs answer the question that matters: who can get in, and by which route. Search by label or app key, filter by status, and click a row to open it."
        legend={[
          {
            text: (
              <Sentence n={1} link={inventoryLink}>
                Salesforce, as an admin sees it: the display label, the sign-on mode beside its
                status, the app key in mono underneath, and when the instance was created.
              </Sentence>
            ),
          },
          {
            text: (
              <Sentence n={2} link={inventoryLink}>
                NetSuite is deactivated and still lists, badge and all. An app you are about to turn
                off is exactly the one you came here to find.
              </Sentence>
            ),
          },
        ]}
      >
        <div className={`flex flex-col ${ROW_GAP.rung}`}>
          {inventory.map((app, index) => {
            const marker = index === 0 ? 1 : index === inventory.length - 1 ? 2 : null;
            return marker ? (
              <Marker key={app.id} n={marker} align="top">
                <Target n={marker} link={inventoryLink}>
                  <InventoryRow app={app} />
                </Target>
              </Marker>
            ) : (
              <InventoryRow key={app.id} app={app} />
            );
          })}
        </div>
      </Scene>

      <Scene
        title="Group Apps"
        intro="Open a group and its Access tab lists every app the group is assigned to, under a count of them. Click a row's chevron to open it."
        legend={[
          {
            text: (
              <Sentence n={1} link={groupLink}>
                GitHub Enterprise is pushed: this group&apos;s membership is written into a group
                inside the app. Open the row for the group it writes into and its priority.
              </Sentence>
            ),
          },
          {
            text: (
              <Sentence n={2} link={groupLink}>
                Slack is assigned only: members can sign in, and nothing about the group is written
                into Slack.
              </Sentence>
            ),
          },
        ]}
        outro="Open a row in that pane and you get the app id to copy, the sign-on mode, the date Okta last updated the app, and the way out to it in Okta. Assignment and push are two different facts: a group can be assigned to an app it pushes nothing into, and pushed into an app it is not assigned to, so the Access pane annotates the apps it lists and the Push section stays the complete account."
        minHeight={300}
      >
        <div className={`flex flex-col ${ROW_GAP.access}`}>
          <AssignedAppsHeading />
          <RowList link={groupLink} gap="access">
            {groupAppRows.map((row) => (
              <GroupAppRow
                key={row.id}
                row={row}
                expanded={open === row.id}
                onToggle={toggle}
                oktaOrigin={DEMO_ORIGIN}
              />
            ))}
          </RowList>
        </div>
      </Scene>

      <Scene
        title="User Apps"
        intro="Open a person and the Apps pane lists each app with the way they got it, over a line counting the sources. Okta reports one scope per app, and the row says exactly what it reported."
        legend={[
          {
            text: (
              <Sentence n={1} link={userLink}>
                Zoom is direct: someone assigned it to her by hand, and Okta named no group.
              </Sentence>
            ),
          },
          {
            text: (
              <Sentence n={2} link={userLink}>
                Slack is direct and through a group. Okta reports the direct assignment and credits
                Engineering - All as well, so the row shows both.
              </Sentence>
            ),
          },
          {
            text: (
              <Sentence n={3} link={userLink}>
                GitHub Enterprise comes through GitHub - Engineering. Open the row to see how she
                came to be in that group.
              </Sentence>
            ),
          },
          {
            text: (
              <Sentence n={4} link={userLink}>
                PagerDuty comes through a group Okta did not name. The row says so rather than
                picking one.
              </Sentence>
            ),
          },
        ]}
        outro="Open a row here and you get the group that grants the app, the same source line the Groups pane shows for that group, and a link to the app in Okta. The Apps tab does not have a detail page of its own yet, so the routes into an app are read from the group and the person."
        minHeight={320}
      >
        <div className={`flex flex-col ${ROW_GAP.rung}`}>
          <AppSourceSummaryLine />
          <RowList link={userLink} gap="rung">
            {userAppRows.map((row) => (
              <UserAppRow key={row.id} row={row} oktaOrigin={DEMO_ORIGIN} />
            ))}
          </RowList>
        </div>
      </Scene>
    </ChapterPage>
  );
};

export default AppsChapter;
