import React, { useId, useState } from 'react';
import ChapterPage, { type ShowSpec } from '../shell/ChapterPage';
import Scene from '../shell/Scene';
import { Marker } from '../shell/Callout';
import Assemble from '../show/Assemble';
import AuditLogUndoModal from '../../sidepanel/components/AuditLogUndoModal';
import ActivityBarView from '../../sidepanel/components/ActivityBarView';
import { Badge, Button, IconButton, ListRow } from '../../sidepanel/components/shared';
import Icon from '../../sidepanel/components/shared/Icon';
import type {
  ActionType,
  CapturedAttribute,
  UndoAction,
  UndoActionMetadata,
} from '../../shared/undoTypes';
import type { ActivityView } from '../../sidepanel/hooks/useActivityBar';
import { clock, estimateEta } from '../../sidepanel/hooks/activityEta';
import { useCountUp } from '../../sidepanel/hooks/useCountUp';
import { DEMO_COMPARISON_PAIR, demoUsersById } from '../../sidepanel/demo/users';
import { DEMO_HERO_GROUP_ID, currentGroupsById } from '../../sidepanel/demo/snapshot';

const amara = demoUsersById.get(DEMO_COMPARISON_PAIR.left)!;
const amaraName = `${amara.profile.firstName} ${amara.profile.lastName}`;

const heroGroup = currentGroupsById().get(DEMO_HERO_GROUP_ID)!;
const heroGroupName = heroGroup.profile?.name ?? 'Engineering - All';

const minutesAgo = (minutes: number): number => Date.now() - minutes * 60 * 1000;

function ageOf(action: UndoAction): string {
  const seconds = Math.floor((Date.now() - action.timestamp) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

const entry = (
  id: string,
  minutes: number,
  description: string,
  metadata: UndoActionMetadata,
): UndoAction => ({
  id,
  type: metadata.type,
  timestamp: minutesAgo(minutes),
  description,
  status: 'completed',
  metadata,
});

const captured = (name: string, before: string, after: string): CapturedAttribute => ({
  name,
  label: name,
  beforeDisplay: before,
  beforeRaw: before,
  afterDisplay: after,
  restorable: true,
});

const addition = entry('action_add', 2, `Added ${amaraName} to ${heroGroupName}`, {
  type: 'ADD_USER_TO_GROUP',
  userId: amara.id,
  userEmail: amara.profile.email,
  userName: amaraName,
  groupId: heroGroup.id,
  groupName: heroGroupName,
});

const removal = entry('action_remove', 9, `Removed ${amaraName} from Incident Commanders`, {
  type: 'REMOVE_USER_FROM_GROUP',
  userId: amara.id,
  userEmail: amara.profile.email,
  userName: amaraName,
  groupId: '00gFAKE00000000000102',
  groupName: 'Incident Commanders',
});

const profileWrite = entry('action_profile', 14, `Updated department, title on ${amaraName}`, {
  type: 'UPDATE_USER_PROFILE',
  userId: amara.id,
  userLogin: amara.profile.login,
  userName: amaraName,
  changes: [
    captured('department', 'Platform', 'Engineering'),
    captured('title', 'Senior Engineer', 'Staff Engineer'),
  ],
});

const entries = [addition, removal, profileWrite];

const TYPE_LABEL: Partial<Record<ActionType, string>> = {
  ADD_USER_TO_GROUP: 'User Addition',
  REMOVE_USER_FROM_GROUP: 'User Removal',
  UPDATE_USER_PROFILE: 'Profile Updated',
};

const NO_UNDO_REASON: Partial<Record<ActionType, string>> = {
  ADD_USER_TO_GROUP:
    'Group additions cannot be undone here. Removing the user again could strip access a rule has ' +
    'since granted independently.',
  REMOVE_USER_FROM_GROUP:
    'Group removals cannot be undone here. Re-adding the user would record a direct membership, ' +
    'which is not necessarily how they held the group before.',
};

function whyNoUndo(action: UndoAction): string | null {
  if (action.metadata.type === 'UPDATE_USER_PROFILE') return null;
  return (
    NO_UNDO_REASON[action.type] ??
    'This write cannot be undone here. Putting it back would be a new operation of its own rather than a restore.'
  );
}

function detailRows(action: UndoAction): Array<[string, string]> {
  const metadata = action.metadata;
  if (metadata.type === 'ADD_USER_TO_GROUP' || metadata.type === 'REMOVE_USER_FROM_GROUP') {
    return [
      ['User', `${metadata.userName} (${metadata.userEmail})`],
      ['Group', metadata.groupName],
      ['User ID', metadata.userId],
      ['Group ID', metadata.groupId],
    ];
  }
  if (metadata.type === 'UPDATE_USER_PROFILE') {
    return [
      ['User', `${metadata.userName} (${metadata.userLogin})`],
      ['User ID', metadata.userId],
    ];
  }
  return [];
}

interface HistoryRowProps {
  action: UndoAction;
  isExpanded: boolean;
  onToggle: (actionId: string) => void;
  onUndo?: (action: UndoAction) => void;
}

const HistoryRow: React.FC<HistoryRowProps> = ({ action, isExpanded, onToggle, onUndo }) => {
  const disclosureId = useId();
  const reason = whyNoUndo(action);
  const metadata = action.metadata;

  return (
    <ListRow
      density="compact"
      body={
        <div
          id={disclosureId}
          className="disclose"
          data-open={isExpanded}
          inert={!isExpanded || undefined}
        >
          <div>
            <div
              className={`space-y-2 border-t border-neutral-200 px-(--sp-row-x) pb-(--sp-row-y) pt-2 ${isExpanded ? 'rise-in-stagger' : ''}`}
            >
              {detailRows(action).map(([label, value]) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="min-w-25 font-medium text-neutral-600">{label}:</span>
                  <span className="break-words text-neutral-900">{value}</span>
                </div>
              ))}
              {metadata.type === 'UPDATE_USER_PROFILE' && (
                <ul className="space-y-1">
                  {metadata.changes.map((change) => (
                    <li key={change.name} className="text-sm">
                      <span className="font-medium text-neutral-600">{change.label}:</span>{' '}
                      <span className="break-words text-neutral-900">
                        {change.beforeDisplay}
                        <span aria-hidden="true"> {'→'} </span>
                        <span className="sr-only"> changed to </span>
                        {change.afterDisplay}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {reason !== null && <p className="text-xs text-pretty text-neutral-600">{reason}</p>}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-(--sp-inline)">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">{action.description}</p>
          <div className="mt-1 flex flex-wrap items-center gap-(--sp-inline)">
            <Badge>{TYPE_LABEL[action.type]}</Badge>
            <span className="text-xs text-neutral-500">{ageOf(action)}</span>
          </div>
        </div>
        {reason === null && onUndo && (
          <Button size="sm" className="shrink-0" onClick={() => onUndo(action)}>
            Undo
          </Button>
        )}
        <IconButton
          label={`${isExpanded ? 'Hide' : 'Show'} details for ${action.description}`}
          variant="ghost"
          size="sm"
          expanded={isExpanded}
          controls={disclosureId}
          className="shrink-0"
          onClick={() => onToggle(action.id)}
        >
          <Icon
            type="chevron-right"
            size="sm"
            className={`transition-transform duration-(--dur-quick) ease-(--ease-standard) ${isExpanded ? 'rotate-90' : ''}`}
          />
        </IconButton>
      </div>
    </ListRow>
  );
};

const FIXED_NOW = 1_760_000_000_000;

const RUN_TOTAL = 120;
const RUN_FAILED = 1;
const RUN_SEEN_AT = 42;
const RUN_ELAPSED_AT_SEEN_MS = 18_000;
const RUN_REST_MS = 34_000;
const BUCKET_LIMIT = 600;
const BUCKET_REMAINING_AT_START = 330;

function runAt(done: number): ActivityView {
  const total = RUN_TOTAL;
  const left = total - done;
  const finished = left === 0;
  const elapsedMs = Math.round(
    RUN_ELAPSED_AT_SEEN_MS + (RUN_REST_MS * (done - RUN_SEEN_AT)) / (total - RUN_SEEN_AT),
  );
  const inFlight = finished ? 0 : 2;
  const queued = Math.min(6, left);
  const remaining = BUCKET_REMAINING_AT_START - done;
  return {
    statusLabel: 'Processing',
    statusColorVar: 'var(--color-info)',
    busy: true,
    operationActive: true,
    operationName: 'Removing members',
    current: done,
    total,
    percentage: Math.round((done / total) * 100),
    elapsedLabel: clock(Math.floor(elapsedMs / 1000)),
    eta: finished ? null : estimateEta({ done, total, elapsedMs, longestGateMs: 0 }),
    opCompleted: done - RUN_FAILED,
    opActive: inFlight,
    opFailed: RUN_FAILED,
    queueLength: queued,
    activeRequests: inFlight,
    rateLimit: { remaining, limit: BUCKET_LIMIT, low: false },
    processed: 0,
    failed: 0,
    isCancelling: false,
    canCancel: !finished,
    buckets: [
      {
        bucket: '/api/v1/groups',
        limit: BUCKET_LIMIT,
        remaining,
        resetAt: FIXED_NOW + 60_000,
        queued,
        active: inFlight,
        planned: left,
        gatedUntil: null,
        lastActiveAt: FIXED_NOW - 1_000,
      },
    ],
    lowThresholdPercent: 10,
    operations: [
      {
        id: 'remove',
        name: 'Removing members',
        startedAt: FIXED_NOW - elapsedMs,
        legs: [
          {
            id: 'groups-leg',
            bucket: '/api/v1/groups',
            method: 'DELETE',
            estimated: total,
            spent: done,
            remaining: left,
            approximate: false,
          },
        ],
        spent: done,
        estimated: total,
        remaining: left,
        approximate: false,
      },
    ],
    now: FIXED_NOW,
  };
}

const runInProgress: ActivityView = runAt(RUN_SEEN_AT);

const noop = () => {};

type HotSpot = `${string}:${number}` | null;

interface HotProps {
  hot: HotSpot;
  onHot: (spot: HotSpot) => void;
}

function useHotSpot(): HotProps {
  const [hot, setHot] = useState<HotSpot>(null);
  return { hot, onHot: setHot };
}

interface HotLineProps extends HotProps {
  scene: string;
  n: number;
  children: React.ReactNode;
}

interface HotTargetProps extends HotLineProps {
  lift?: boolean;
  arrive?: number;
}

const HotTarget: React.FC<HotTargetProps> = ({ scene, n, hot, onHot, lift, arrive, children }) => {
  const spot: HotSpot = `${scene}:${n}`;
  const lit = hot === spot;
  const arrival =
    arrive === undefined
      ? undefined
      : ({
          animation: 'var(--animate-rise-in)',
          animationFillMode: 'backwards',
          animationDelay: `calc(var(--guide-t0) + var(--guide-lead-stage) + var(--guide-cascade-step) * ${arrive})`,
        } as React.CSSProperties);
  return (
    <div
      className={`rounded-md ring-primary-highlight transition-shadow duration-(--dur-instant) ease-(--ease-standard) data-lit:ring-2 ${lift ? 'lift' : ''}`}
      style={arrival}
      data-spot={spot}
      data-lit={lit || undefined}
      onPointerEnter={() => onHot(spot)}
      onPointerLeave={() => onHot(null)}
      onFocus={() => onHot(spot)}
      onBlur={() => onHot(null)}
    >
      {children}
    </div>
  );
};

const HotLine: React.FC<HotLineProps> = ({ scene, n, hot, onHot, children }) => {
  const spot: HotSpot = `${scene}:${n}`;
  const lit = hot === spot;
  return (
    <span
      className="-mx-1.5 -my-0.5 box-decoration-clone rounded-sm px-1.5 py-0.5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-lit:bg-primary-light"
      data-lit={lit || undefined}
      onPointerEnter={() => onHot(spot)}
      onPointerLeave={() => onHot(null)}
    >
      {children}
    </span>
  );
};

const CountBand: React.FC = () => (
  <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-(--sp-card)">
    <span className="text-sm font-medium text-neutral-700">{entries.length} actions logged</span>
    <Button variant="secondary" size="sm" onClick={noop}>
      Clear History
    </Button>
  </div>
);

const CONFIRM_PIECES = '[role="dialog"] li';

const CountedRun: React.FC<{ home: boolean }> = ({ home }) => {
  const done = useCountUp(home ? RUN_TOTAL : RUN_SEEN_AT, { enabled: home }).value;
  return (
    <div className="contain-paint absolute inset-x-0 bottom-0 h-48 animate-rise-in [animation-fill-mode:backwards]">
      <ActivityBarView view={runAt(done)} onCancel={noop} onCancelOperation={noop} />
    </div>
  );
};

const ShowStage: React.FC<{ beat: number }> = ({ beat }) => {
  const opened = beat === 1 || beat === 2;
  return (
    <div className="flex flex-col gap-(--sp-rung)">
      <CountBand />
      <Assemble className="flex flex-col gap-(--sp-rung)">
        {entries.map((action) => (
          <HistoryRow
            key={action.id}
            action={action}
            isExpanded={opened && action.id === profileWrite.id}
            onToggle={noop}
            onUndo={noop}
          />
        ))}
      </Assemble>
      <Assemble selector={CONFIRM_PIECES}>
        <AuditLogUndoModal
          action={beat === 2 ? profileWrite : null}
          onClose={noop}
          onConfirm={noop}
          isUndoing={false}
        />
      </Assemble>
      {beat >= 3 ? <CountedRun home={beat >= 4} /> : null}
    </div>
  );
};

const SHOW: ShowSpec = {
  stageLabel: 'History',
  minHeight: 500,
  beats: [
    { caption: 'Three writes, newest first: a group add, a removal, a profile edit.', hold: 3 },
    { caption: 'Open the edit: department was Platform, title was Senior Engineer.', hold: 3 },
    { caption: 'Undo quotes both previous values before a single one is written.', hold: 3 },
    { caption: 'A bulk run reports at the foot: how far, how long, what failed.', hold: 3 },
    { caption: '120 of 120 settled, and the one that failed is still named.' },
  ],
  render: (beat) => <ShowStage beat={beat} />,
};

const CHANGED_LINES: ReadonlyArray<string> = [
  'An add, two minutes old. Open it for the user id and the group id, as Okta stores them.',
  'A removal. It offers no Undo, and the open row says why: re-adding would record a direct membership.',
  'A profile edit. It captured department and title before the write, so this is the row that offers Undo.',
];

const HistoryChapter: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (actionId: string) =>
    setOpen((current) => (current === actionId ? null : actionId));
  const [undoing, setUndoing] = useState<UndoAction | null>(profileWrite);
  const changed = useHotSpot();
  const putBack = useHotSpot();
  const running = useHotSpot();

  return (
    <ChapterPage id="history" show={SHOW}>
      <Scene
        title="The Log"
        intro="Every write this panel makes gets an entry in History: who, what, and when. The entries live in this browser only, for as long as the retention window in Settings says, and are never sent anywhere. History is not on the rail: open the command palette and type history. Newest first, with the kind of write on a badge and the age beside it. The chevron opens the ids and the values that went with it."
        legend={CHANGED_LINES.map((line, index) => ({
          text: (
            <HotLine scene="changed" n={index + 1} {...changed}>
              {line}
            </HotLine>
          ),
        }))}
      >
        <div className="flex flex-col gap-(--sp-rung)">
          {entries.map((action, index) => (
            <Marker key={action.id} n={index + 1} align="top">
              <HotTarget scene="changed" n={index + 1} arrive={index} lift {...changed}>
                <HistoryRow
                  action={action}
                  isExpanded={open === action.id}
                  onToggle={toggle}
                  onUndo={setUndoing}
                />
              </HotTarget>
            </Marker>
          ))}
        </div>
      </Scene>

      <Scene
        title="Undo"
        stageLabel="History, undo"
        intro="Undo is offered only where the reverse write exists and the panel captured what to write. Everywhere else the button is absent, and the open row says why. It opens a confirmation over the panel before anything is sent. Cancel closes it, and Undo on the row brings it back."
        legend={[
          {
            text: (
              <HotLine scene="put-back" n={1} {...putBack}>
                Undo, on the one row that captured what it overwrote. The dialog strikes through the
                value Okta holds now and puts the value it goes back to beside it, department and
                title both. Restore is a new write, so it gets its own entry in History, linked to
                this one.
              </HotLine>
            ),
          },
        ]}
        outro="If someone else changed one of those attributes since, the dialog refuses instead of overwriting them, and names the attribute. Nothing is written in that case."
        minHeight={440}
      >
        <Marker n={1} align="top">
          <HotTarget scene="put-back" n={1} lift {...putBack}>
            <HistoryRow
              action={profileWrite}
              isExpanded={false}
              onToggle={noop}
              onUndo={setUndoing}
            />
          </HotTarget>
        </Marker>
        <AuditLogUndoModal
          action={undoing}
          onClose={() => setUndoing(null)}
          onConfirm={noop}
          isUndoing={false}
        />
      </Scene>

      <Scene
        title="Progress"
        intro="A bulk write reports from the bar at the foot of the panel. It sits on a top border over whatever tab you are on, and Cancel stops what has not been sent."
        legend={[
          {
            text: (
              <HotLine scene="running" n={1} {...running}>
                The run by name, 42 of 120 done, how long is left, and the one item that failed.
                Under it the ledger: what this run has spent of your Okta rate limit, and what it
                still owes, per bucket.
              </HotLine>
            ),
          },
        ]}
        outro="Cancel stops what has not been sent yet; the writes already made stay made, and each one is in History with the rest."
      >
        <Marker n={1} align="top">
          <HotTarget scene="running" n={1} {...running}>
            <div className="contain-paint h-64">
              <ActivityBarView view={runInProgress} onCancel={noop} onCancelOperation={noop} />
            </div>
          </HotTarget>
        </Marker>
      </Scene>
    </ChapterPage>
  );
};

export default HistoryChapter;
