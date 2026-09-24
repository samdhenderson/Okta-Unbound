import React, { useId, useState } from 'react';
import ChapterPage, { type ShowSpec } from '../shell/ChapterPage';
import Scene from '../shell/Scene';
import { Marker } from '../shell/Callout';
import Assemble from '../show/Assemble';
import SelectionPane from '../../sidepanel/components/selection/panes/SelectionPane';
import VerbList from '../../sidepanel/components/selection/panes/VerbList';
import VerbRunner from '../../sidepanel/components/selection/run/VerbRunner';
import type { VerbRun } from '../../sidepanel/components/selection/run/useVerbRun';
import {
  Badge,
  Button,
  IconButton,
  ListRow,
  SelectionSummaryButton,
  Tabs,
  type TabItem,
  typeNounForms,
} from '../../sidepanel/components/shared';
import Icon from '../../sidepanel/components/shared/Icon';
import { useCountUp } from '../../sidepanel/hooks/useCountUp';
import type { BasketVerb } from '../../sidepanel/selection/verbs/types';
import type {
  SelectionBasket,
  SelectionKind,
  SelectionRef,
} from '../../sidepanel/selection/selectionStore';
import { demoUsers } from '../../sidepanel/demo/users';
import { GROUP } from '../../sidepanel/demo/memberships';
import { fakeId } from '../../sidepanel/demo/org';
import { userDisplayName } from '../../shared/utils/userDisplay';
import { pluralNoun } from '../../shared/utils/plural';
import { formatDateShort } from '../../shared/utils/dateFormat';

const marketing = demoUsers
  .filter((user) => user.profile.department === 'Marketing' && user.status === 'ACTIVE')
  .slice(0, 4);

const salesAll: Omit<SelectionRef, 'pickedAt'> = {
  kind: 'group',
  id: fakeId('00g', GROUP.sales),
  name: 'Sales - All',
};

const basketOf = (refs: Omit<SelectionRef, 'pickedAt'>[]): SelectionBasket => ({
  picked: refs.map((ref, index) => ({ ...ref, pickedAt: 1_700_000_000_000 + index })),
});

const countsOf = (basket: SelectionBasket): Partial<Record<SelectionKind, number>> => {
  const counts: Partial<Record<SelectionKind, number>> = {};
  for (const ref of basket.picked) counts[ref.kind] = (counts[ref.kind] ?? 0) + 1;
  return counts;
};

const usersAndGroup = basketOf([
  ...marketing.map<Omit<SelectionRef, 'pickedAt'>>((user) => ({
    kind: 'user',
    id: user.id,
    name: userDisplayName(user),
  })),
  salesAll,
]);
const usersAndGroupCounts = countsOf(usersAndGroup);

const usersOnly = basketOf(usersAndGroup.picked.filter((ref) => ref.kind === 'user'));
const usersOnlyCounts = countsOf(usersOnly);

const partition = (basket: SelectionBasket, kind: SelectionKind) =>
  basket.picked.filter((ref) => ref.kind === kind).length;

const verb = (
  overrides: Partial<BasketVerb> & Pick<BasketVerb, 'id' | 'label' | 'title' | 'needs'>,
): BasketVerb => ({
  path: 'write',
  cost: () => ({ requests: 1, writes: 1 }),
  run: async () => ({ status: 'done', summary: 'Done.' }),
  ...overrides,
});

const perPair = (basket: SelectionBasket) => {
  const n = partition(basket, 'user') * partition(basket, 'group');
  return { requests: n, writes: n };
};

const addToGroups = verb({
  id: 'add-users-to-groups',
  label: 'Add to groups',
  title: 'Add these users to these groups',
  needs: ['user', 'group'],
  cost: perPair,
});

const removeFromGroups = verb({
  id: 'remove-users-from-groups',
  label: 'Remove from groups',
  title: 'Remove these users from these groups',
  needs: ['user', 'group'],
  cost: perPair,
});

const setProfileAttribute = verb({
  id: 'bulk-update-user-profile',
  label: 'Set a profile attribute',
  title: 'Set one profile attribute on these users',
  needs: ['user'],
  cost: (basket) => ({ requests: partition(basket, 'user'), writes: partition(basket, 'user') }),
});

const removeInactiveMembers = verb({
  id: 'remove-inactive-members',
  label: 'Remove inactive members',
  title: 'Remove deactivated, suspended and locked-out members from these groups',
  needs: ['group'],
  cost: (basket) => ({
    requests: 0,
    walks: [{ count: partition(basket, 'group'), kind: 'membership' }],
    writes: 0,
  }),
});

const turnRulesOff = verb({
  id: 'deactivate-rules',
  label: 'Turn rules off',
  title: 'Turn these group rules off',
  needs: ['rule'],
});

const groupOverlap = verb({
  id: 'group-overlap',
  label: 'Members these groups share',
  title: 'Report which members these groups share',
  path: 'read',
  needs: ['group'],
  isAvailable: (basket) => partition(basket, 'group') >= 2,
  unavailableReason: 'Needs at least two groups: an overlap of one group is not a question.',
  cost: (basket) => ({ requests: partition(basket, 'group'), writes: 0 }),
});

const actions = [addToGroups, removeFromGroups, setProfileAttribute, removeInactiveMembers];

const noop = () => {};

const profileConfirm = (close: () => void): VerbRun => ({
  verb: setProfileAttribute,
  stage: 'confirm',
  preflight: {
    cost: { requests: 3, writes: 3 },
    items: 3,
    lines: [
      '3 of 4 users will have Department set to Advertising',
      'Overwrites Marketing (3)',
      '1 user already holds that value, and costs no write',
      '3 users would stop matching Marketing by department, so Okta drops them from Marketing - All',
    ],
  },
  progress: '',
  outcome: null,
  error: null,
  fields: [],
  values: {},
  setValue: noop,
  isComposed: true,
  isRefreshing: false,
  submitFields: noop,
  start: noop,
  confirm: close,
  close,
});

interface SavedCollection {
  id: string;
  name: string;
  counts: Partial<Record<SelectionKind, number>>;
  savedAt: number;
}

const collections: SavedCollection[] = [
  {
    id: 'colFAKE0001',
    name: 'Marketing to Advertising',
    counts: usersAndGroupCounts,
    savedAt: Date.UTC(2026, 8, 14, 9, 30),
  },
  {
    id: 'colFAKE0002',
    name: 'Contractor access review',
    counts: { user: 12, group: 2, policy: 1 },
    savedAt: Date.UTC(2026, 8, 2, 16, 5),
  },
];

const KIND_ORDER: readonly SelectionKind[] = ['user', 'group', 'app', 'rule', 'policy'];

const summarise = (counts: Partial<Record<SelectionKind, number>>): string =>
  KIND_ORDER.filter((kind) => (counts[kind] ?? 0) > 0)
    .map((kind) => `${counts[kind]} ${pluralNoun(counts[kind] ?? 0, typeNounForms[kind])}`)
    .join(' · ');

const mergeCounts = (
  entries: readonly Partial<Record<SelectionKind, number>>[],
): Partial<Record<SelectionKind, number>> => {
  const merged: Partial<Record<SelectionKind, number>> = {};
  for (const counts of entries)
    for (const kind of KIND_ORDER) {
      const n = counts[kind] ?? 0;
      if (n > 0) merged[kind] = (merged[kind] ?? 0) + n;
    }
  return merged;
};

const SavedCollections: React.FC<{ count: number; children: React.ReactNode }> = ({
  count,
  children,
}) => {
  const headingId = useId();
  return (
    <section
      className="rounded-md border border-neutral-200 bg-white px-4 py-3"
      aria-labelledby={headingId}
    >
      <h4
        id={headingId}
        className="flex items-center gap-(--sp-inline) text-xs font-semibold uppercase tracking-wide text-neutral-600"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        <span>Saved collections</span>
        <Badge variant="neutral">{count}</Badge>
      </h4>
      <div className="mt-3">{children}</div>
    </section>
  );
};

const ContextStrip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-9 items-center gap-2 rounded-md border border-neutral-200 bg-white px-(--sp-gutter) py-1.5">
    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-900">
      {salesAll.name}
    </span>
    <div className="relative flex shrink-0 items-center gap-1">
      {children}
      <IconButton label="Refresh" variant="ghost" size="sm" title="Refresh">
        <Icon type="refresh" size="sm" />
      </IconButton>
    </div>
  </div>
);

type HotSpot = `${string}:${number}` | null;

interface HotProps {
  hot: HotSpot;
  onHot: (spot: HotSpot) => void;
}

function useHotSpot(): HotProps {
  const [hot, setHot] = useState<HotSpot>(null);
  return { hot, onHot: setHot };
}

interface HotSpotProps extends HotProps {
  scene: string;
  n: number;
  children: React.ReactNode;
}

const HotTarget: React.FC<HotSpotProps> = ({ scene, n, hot, onHot, children }) => {
  const spot: HotSpot = `${scene}:${n}`;
  return (
    <div
      className="rounded-md ring-primary-highlight transition-shadow duration-(--dur-instant) ease-(--ease-standard) data-lit:ring-2"
      data-spot={spot}
      data-lit={hot === spot || undefined}
      onPointerEnter={() => onHot(spot)}
      onPointerLeave={() => onHot(null)}
      onFocus={() => onHot(spot)}
      onBlur={() => onHot(null)}
    >
      {children}
    </div>
  );
};

const HotLine: React.FC<HotSpotProps> = ({ scene, n, hot, onHot, children }) => {
  const spot: HotSpot = `${scene}:${n}`;
  return (
    <span
      className="-mx-1.5 -my-0.5 box-decoration-clone rounded-sm px-1.5 py-0.5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-lit:bg-primary-light"
      data-spot={spot}
      data-lit={hot === spot || undefined}
      onPointerEnter={() => onHot(spot)}
      onPointerLeave={() => onHot(null)}
    >
      {children}
    </span>
  );
};

const nothing = basketOf([]);

const paneTabs = (total: number): TabItem[] => [
  { key: 'selection', label: 'Selection', count: total, countDisplay: 'nonzero' },
  { key: 'actions', label: 'Actions' },
  { key: 'reports', label: 'Reports' },
  { key: 'collections', label: 'Collections', count: collections.length, countDisplay: 'nonzero' },
];

const PANE_PIECES = 'section h2, section .space-y-\\(--sp-inline\\) > *';

const VERB_PIECES = ':scope > div > *';

const CONFIRM_PIECES = '[role="dialog"] li';

const ShowStage: React.FC<{ beat: number }> = ({ beat }) => {
  const filled = beat >= 1;
  const users = useCountUp(filled ? partition(usersAndGroup, 'user') : 0).value;
  const groups = useCountUp(filled ? partition(usersAndGroup, 'group') : 0).value;
  const total = users + groups;
  const counts: Partial<Record<SelectionKind, number>> = {
    ...(users > 0 ? { user: users } : {}),
    ...(groups > 0 ? { group: groups } : {}),
  };
  const pane = beat >= 2 ? 'actions' : 'selection';

  return (
    <div className="flex flex-col gap-(--sp-gutter)">
      <ContextStrip>
        <span key={String(filled)} className="inline-flex animate-rise-in">
          <SelectionSummaryButton counts={counts} total={total} onOpen={noop} />
        </span>
      </ContextStrip>
      <div>
        <Tabs
          tabs={paneTabs(total)}
          activeKey={pane}
          onChange={noop}
          variant="underline"
          ariaLabel="Selection sections"
        />
        <div className="mt-(--sp-rung)">
          {pane === 'selection' ? (
            filled ? (
              <Assemble selector={PANE_PIECES}>
                <SelectionPane
                  basket={usersAndGroup}
                  counts={usersAndGroupCounts}
                  query=""
                  onRemove={noop}
                  onClearKind={noop}
                />
              </Assemble>
            ) : (
              <SelectionPane
                basket={nothing}
                counts={{}}
                query=""
                onRemove={noop}
                onClearKind={noop}
              />
            )
          ) : (
            <Assemble selector={VERB_PIECES}>
              <VerbList
                verbs={[...actions, groupOverlap]}
                basket={usersAndGroup}
                counts={usersAndGroupCounts}
                onRun={noop}
                emptyIcon="bolt"
                emptyTitle="No actions yet"
                emptyDescription="None are wired yet."
              />
            </Assemble>
          )}
        </div>
      </div>
      {beat >= 3 ? (
        <Assemble selector={CONFIRM_PIECES}>
          <VerbRunner run={profileConfirm(noop)} basket={usersAndGroup} />
        </Assemble>
      ) : null}
    </div>
  );
};

const SHOW: ShowSpec = {
  stageLabel: 'Selection',
  minHeight: 470,
  beats: [
    { caption: 'Nothing ticked, so there is no count beside Refresh and no verb to run.', hold: 2 },
    {
      caption: 'Tick four people in Marketing and the Sales group. One basket holds both.',
      hold: 4,
    },
    {
      caption:
        'Actions prices every verb from the basket: four users into one group, four requests.',
      hold: 3,
    },
    { caption: 'Set a profile attribute counts first, then the confirm quotes what it found.' },
  ],
  render: (beat) => <ShowStage beat={beat} />,
};

const sameRef = (ref: SelectionRef, target: { kind: SelectionKind; id: string }) =>
  ref.kind === target.kind && ref.id === target.id;

const SelectionChapter: React.FC = () => {
  const basketScene = useHotSpot();
  const verbScene = useHotSpot();
  const runScene = useHotSpot();
  const keepScene = useHotSpot();

  const [picked, setPicked] = useState<readonly SelectionRef[]>(usersAndGroup.picked);
  const basket: SelectionBasket = { picked: [...picked] };
  const counts = countsOf(basket);
  const total = picked.length;
  const thinned = total < usersAndGroup.picked.length;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const run = profileConfirm(() => setConfirmOpen(false));

  const [loadedIds, setLoadedIds] = useState<readonly string[]>([]);
  const loadedCounts = mergeCounts(
    collections.filter((entry) => loadedIds.includes(entry.id)).map((entry) => entry.counts),
  );
  const loadedTotal = Object.values(loadedCounts).reduce((sum, n) => sum + n, 0);

  return (
    <ChapterPage id="selection" show={SHOW}>
      <Scene
        title="The Basket"
        intro="Some changes are about a cohort, not a person. Tick rows wherever you find them, in Users results, in a group's members, in a rule's list, and every tick lands in one basket. The count sits beside Refresh at the top of the panel. Click it and the Selection pane lists what you ticked. This frame is live: untick a row and the count drops with it."
        outro="The basket keeps users, groups, apps, rules and policies apart, because a verb acts on a kind. Ticking a group does not tick its members; the Selection pane offers to add them when you want that."
        legend={[
          {
            text: (
              <HotLine scene="basket" n={1} {...basketScene}>
                The count is the whole basket. Hover it and the per-kind breakdown grows leftward
                over the tab name, never pushing Refresh out of its pixel. Untick everything and the
                control goes, rather than sitting there reading zero.
              </HotLine>
            ),
          },
          {
            text: (
              <HotLine scene="basket" n={2} {...basketScene}>
                One card per kind, titled with that kind's real count. The cross unticks one row.
                Clear empties the whole section and asks first, because nothing re-ticks it for you.
              </HotLine>
            ),
          },
        ]}
        minHeight={360}
      >
        <div className="flex flex-col gap-(--sp-gutter)">
          <Marker n={1}>
            <HotTarget scene="basket" n={1} {...basketScene}>
              <ContextStrip>
                <SelectionSummaryButton counts={counts} total={total} onOpen={noop} />
              </ContextStrip>
            </HotTarget>
          </Marker>
          <Marker n={2} align="top">
            <HotTarget scene="basket" n={2} {...basketScene}>
              <SelectionPane
                basket={basket}
                counts={counts}
                query=""
                onRemove={(target) =>
                  setPicked((current) => current.filter((ref) => !sameRef(ref, target)))
                }
                onClearKind={(kind) =>
                  setPicked((current) => current.filter((ref) => ref.kind !== kind))
                }
              />
            </HotTarget>
          </Marker>
          <div className="flex min-h-7 items-center justify-end">
            {thinned ? (
              <Button variant="ghost" size="xs" onClick={() => setPicked(usersAndGroup.picked)}>
                Put them back
              </Button>
            ) : null}
          </div>
        </div>
      </Scene>

      <Scene
        title="Verbs"
        intro="The Actions pane lists the verbs that can run against this basket, each one priced from what you ticked before you start it."
        outro="The verbs come in families. Membership adds ticked users to ticked groups or takes them out. Cleanup removes deactivated, suspended and locked-out members from ticked groups. Rules turn ticked group rules on or off. Reports, on their own pane, read and never write: which members ticked groups share, MFA enrolment across them, what ticked rules hold up."
        legend={[
          {
            text: (
              <HotLine scene="verb" n={1} {...verbScene}>
                A verb names what it does to the basket and prices itself from it: four users into
                one group is four requests and four changed entities. Only the verbs that write get
                the red control.
              </HotLine>
            ),
          },
          {
            text: (
              <HotLine scene="verb" n={2} {...verbScene}>
                The same basket with the group unticked. A verb whose object is missing is never
                offered, so the pane names the kinds it is waiting for instead of showing a control
                that cannot run.
              </HotLine>
            ),
          },
        ]}
      >
        <div className="flex flex-col gap-(--sp-rung)">
          <Marker n={1} align="top">
            <HotTarget scene="verb" n={1} {...verbScene}>
              <VerbList
                verbs={[...actions, groupOverlap]}
                basket={usersAndGroup}
                counts={usersAndGroupCounts}
                onRun={noop}
                emptyIcon="bolt"
                emptyTitle="No actions yet"
                emptyDescription="None are wired yet."
              />
            </HotTarget>
          </Marker>
          <Marker n={2} align="top">
            <HotTarget scene="verb" n={2} {...verbScene}>
              <VerbList
                verbs={[turnRulesOff, groupOverlap]}
                basket={usersOnly}
                counts={usersOnlyCounts}
                onRun={noop}
                emptyIcon="bolt"
                emptyTitle="No actions yet"
                emptyDescription="None are wired yet."
              />
            </HotTarget>
          </Marker>
        </div>
      </Scene>

      <Scene
        title="Preflight"
        stageLabel="Selection, Actions"
        intro="Every run counts before it changes anything. Click Set a profile attribute and the confirm opens on what the counting found, four ticked users in, three of them changing."
        legend={[
          {
            text: (
              <HotLine scene="run" n={1} {...runScene}>
                The profile verb sets one attribute to one value on every ticked user. Press it and
                nothing is written yet: the run measures the four users first, and the confirm
                quotes those counts back to you before the button that spends them.
              </HotLine>
            ),
          },
        ]}
        outro="The confirm quotes what was measured, never a projection: how many users will change, what values get overwritten, who already holds the value and costs no write, and which group rule reads that attribute and would move people out of a group. Then the exact cost, and a plain statement that the change cannot be undone from here. Escape closes the dialog; a run already going keeps going, and the activity bar is where you stop it."
        minHeight={440}
      >
        <Marker n={1} align="top">
          <HotTarget scene="run" n={1} {...runScene}>
            <VerbList
              verbs={[setProfileAttribute]}
              basket={usersOnly}
              counts={usersOnlyCounts}
              onRun={() => setConfirmOpen(true)}
              emptyIcon="bolt"
              emptyTitle="No actions yet"
              emptyDescription="None are wired yet."
            />
          </HotTarget>
        </Marker>
        {confirmOpen && <VerbRunner run={run} basket={usersOnly} />}
      </Scene>

      <Scene
        title="Saved Cohorts"
        intro="Save as collection names the basket and keeps it for this org. The Collections pane lists what you saved, newest first."
        legend={[
          {
            text: (
              <HotLine scene="keep" n={1} {...keepScene}>
                The count above is the basket, and Load is what grows it. Load the same collection
                twice and the count stays where it is, because the basket keys on the entity, not on
                the click.
              </HotLine>
            ),
          },
          {
            text: (
              <HotLine scene="keep" n={2} {...keepScene}>
                A row says what the collection holds by kind and the day you saved it. Load ticks
                all of it again, on top of whatever is already in the basket.
              </HotLine>
            ),
          },
        ]}
        outro="Collections live in this browser, for this org. A row is an id, so loading one later finds those same entities again. A user saved without a name costs one request to name again, and the pane says how many before it spends them."
      >
        <div className="flex flex-col gap-(--sp-gutter)">
          <Marker n={1}>
            <HotTarget scene="keep" n={1} {...keepScene}>
              <ContextStrip>
                <SelectionSummaryButton counts={loadedCounts} total={loadedTotal} onOpen={noop} />
              </ContextStrip>
            </HotTarget>
          </Marker>
          <Marker n={2} align="top">
            <HotTarget scene="keep" n={2} {...keepScene}>
              <SavedCollections count={collections.length}>
                <div className="space-y-(--sp-inline)">
                  {collections.map((collection) => (
                    <div key={collection.id} data-testid="guide-collection">
                      <ListRow density="compact">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-semibold text-neutral-900">
                              {collection.name}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {summarise(collection.counts)} · Saved{' '}
                              {formatDateShort(collection.savedAt)}
                            </span>
                          </span>
                          <Button
                            variant="secondary"
                            size="xs"
                            ariaLabel={`Load ${collection.name}`}
                            onClick={() =>
                              setLoadedIds((current) =>
                                current.includes(collection.id)
                                  ? current
                                  : [...current, collection.id],
                              )
                            }
                          >
                            Load
                          </Button>
                        </div>
                      </ListRow>
                    </div>
                  ))}
                </div>
              </SavedCollections>
            </HotTarget>
          </Marker>
        </div>
      </Scene>
    </ChapterPage>
  );
};

export default SelectionChapter;
