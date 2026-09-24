import React, { createContext, useContext, useMemo, useState } from 'react';
import ChapterPage, { type ShowSpec } from '../shell/ChapterPage';
import { BulkFixScene, MfaCoverageScene, ProfileHealthScene } from './parts/groupHealth';
import Scene from '../shell/Scene';
import { Marker } from '../shell/Callout';
import Assemble from '../show/Assemble';
import {
  ActionBar,
  Button,
  Eyebrow,
  IconButton,
  ListRow,
  type ActionDescriptor,
} from '../../sidepanel/components/shared';
import Icon from '../../sidepanel/components/shared/Icon';
import GroupListItemSignal from '../../sidepanel/components/groups/GroupListItemSignal';
import GroupListItemDetails from '../../sidepanel/components/groups/GroupListItemDetails';
import GroupOverviewPane from '../../sidepanel/components/groups/detail/GroupOverviewPane';
import MemberSourceNotes from '../../sidepanel/components/groups/detail/MemberSourceNotes';
import MemberSourceFilterBar from '../../sidepanel/components/members/MemberSourceFilterBar';
import {
  toMemberSourceSegments,
  type MemberSourceBucket,
} from '../../sidepanel/components/groups/memberSourceBuckets';
import AddGroupMemberModal from '../../sidepanel/components/groups/detail/AddGroupMemberModal';
import { summarizeGroupRow } from '../../sidepanel/components/groups/groupSourceSummary';
import { toGroupSummary } from '../../sidepanel/components/groups/groupSummary';
import { annotateGroupsWithRuleCounts } from '../../shared/rules/groupRuleIndex';
import type { GroupSummary, OktaUser } from '../../shared/types';
import type { MemberSourceBreakdown } from '../../shared/membership/groupSource';
import {
  DEMO_HERO_GROUP_ID,
  currentGroups,
  demoAppGroups,
  demoRules,
} from '../../sidepanel/demo/snapshot';
import { GROUP } from '../../sidepanel/demo/memberships';
import { fakeId } from '../../sidepanel/demo/org';
import { demoUsers } from '../../sidepanel/demo/users';
import { userDisplayName } from '../../shared/utils/userDisplay';
import { useCountUp } from '../../sidepanel/hooks/useCountUp';

const groups: GroupSummary[] = annotateGroupsWithRuleCounts(
  currentGroups().map(toGroupSummary),
  demoRules.map((r) => ({
    groupIds: r.actions?.assignUserToGroups?.groupIds ?? [],
    conditionExpression: r.conditions?.expression?.value,
  })),
);

const groupById = (id: string): GroupSummary => groups.find((g) => g.id === id)!;

const engineering = groupById(DEMO_HERO_GROUP_ID);
const salesforce = groupById(fakeId('00g', GROUP.salesforceSalesUsers));
const onCall = groupById(fakeId('00g', GROUP.onCallEngineering));

const feedingRule = demoRules.find((r) =>
  r.actions?.assignUserToGroups?.groupIds.includes(DEMO_HERO_GROUP_ID),
)!;
const appsGranted = demoAppGroups.filter((a) => a.assignment.id === DEMO_HERO_GROUP_ID).length;

const HAND_ADDED = 4;

const splitOf = (ruleBased: number, direct: number): MemberSourceBreakdown => ({
  total: ruleBased + direct,
  direct,
  ruleBased,
  unattributed: 0,
  byRule: [{ ruleId: feedingRule.id, ruleName: feedingRule.name, count: ruleBased }],
  byRuleMembers: [
    {
      ruleId: feedingRule.id,
      ruleName: feedingRule.name,
      soleCount: ruleBased,
      oktaAttributedCount: ruleBased,
      clientAttributedCount: 0,
    },
  ],
  multiRuleMembers: 0,
});

const engineeringSplit: MemberSourceBreakdown = splitOf(
  engineering.memberCount - HAND_ADDED,
  HAND_ADDED,
);

const noop = () => {};

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
      className="rounded-md ring-primary-highlight ring-offset-1 ring-offset-canvas transition-shadow duration-(--dur-instant) ease-(--ease-standard) data-hot:ring-2 [&+span]:transition-shadow [&+span]:duration-(--dur-instant) [&[data-hot]+span]:ring-4 [&[data-hot]+span]:ring-primary-highlight"
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

interface GroupRowProps {
  group: GroupSummary;
  breakdown: MemberSourceBreakdown | null;
  expanded: boolean;
  onToggle: () => void;
  idPrefix?: string;
}

const GroupRow: React.FC<GroupRowProps> = ({
  group,
  breakdown,
  expanded,
  onToggle,
  idPrefix = 'guide-group-row',
}) => {
  const model = useMemo(() => summarizeGroupRow(group, breakdown), [group, breakdown]);
  const detailsId = `${idPrefix}-${group.id}`;
  const [everExpanded, setEverExpanded] = useState(false);
  if (expanded && !everExpanded) setEverExpanded(true);
  return (
    <ListRow
      density="compact"
      headerClassName="flex items-start gap-(--sp-field)"
      body={
        <div
          id={detailsId}
          className="disclose"
          data-open={expanded}
          inert={!expanded || undefined}
        >
          <div>
            {everExpanded && (
              <div
                key={String(expanded)}
                className={expanded ? 'animate-rise-in' : undefined}
                style={
                  expanded
                    ? { animationDelay: 'calc(var(--dur-quick) * var(--guide-motion, 1))' }
                    : undefined
                }
              >
                <GroupListItemDetails group={group} breakdown={breakdown} />
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-(--sp-inline)">
          <h3 className="min-w-0 truncate text-sm font-semibold text-neutral-900">{group.name}</h3>
          <span
            className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${model.typeBadge.className}`}
          >
            {model.typeBadge.label}
          </span>
          {model.sourceApp && (
            <span className="shrink-0 truncate rounded-md border border-primary-highlight bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-text">
              {model.sourceApp}
            </span>
          )}
          <div className="ml-auto flex shrink-0 items-center">
            <IconButton
              label={expanded ? `Collapse ${group.name}` : `Expand ${group.name}`}
              onClick={onToggle}
              expanded={expanded}
              controls={detailsId}
              size="sm"
            >
              <Icon
                type="chevron-right"
                size="sm"
                className={`transition-transform duration-(--dur-instant) ease-(--ease-standard) ${expanded ? 'rotate-90' : ''}`}
              />
            </IconButton>
          </div>
        </div>
        <p
          className={`mt-0.5 truncate text-xs ${
            model.identity.kind === 'id' ? 'font-mono text-neutral-500' : 'text-neutral-600'
          }`}
          title={model.identity.title}
        >
          {model.identity.text}
        </p>
        <GroupListItemSignal model={model} />
      </div>
    </ListRow>
  );
};

const listRows: ReadonlyArray<{ group: GroupSummary; breakdown: MemberSourceBreakdown | null }> = [
  { group: engineering, breakdown: engineeringSplit },
  { group: salesforce, breakdown: null },
  { group: onCall, breakdown: null },
];

const NO_SOURCE_FILTER: ReadonlySet<string> = new Set();

const sourceSegments = (split: MemberSourceBreakdown): MemberSourceBucket[] =>
  toMemberSourceSegments(split).map((segment) => ({
    ...segment,
    percent: Math.round(segment.percent),
  }));

const SourceBar: React.FC<{ split: MemberSourceBreakdown }> = ({ split }) => (
  <MemberSourceFilterBar
    segments={sourceSegments(split)}
    activeKeys={NO_SOURCE_FILTER}
    onToggle={noop}
    onClearAll={noop}
    total={split.total}
  />
);

const SOURCE_CARD =
  'space-y-(--sp-rung) rounded-md border border-neutral-200 bg-white p-(--sp-card)';

const SOURCE_CARD_BLED =
  'space-y-(--sp-rung) rounded-md border border-neutral-200 bg-white py-(--sp-card)';

const CountedMembers: React.FC = () => {
  const ruleBased = useCountUp(engineeringSplit.ruleBased).value;
  const direct = useCountUp(engineeringSplit.direct).value;
  const split = useMemo(() => splitOf(ruleBased, direct), [ruleBased, direct]);
  return (
    <div className={SOURCE_CARD}>
      <div className="space-y-3">
        <div className="guide-wipe">
          <SourceBar split={split} />
        </div>
        <MemberSourceNotes breakdown={split} onNavigateToRule={noop} />
      </div>
    </div>
  );
};

const Overview: React.FC = () => (
  <GroupOverviewPane
    group={engineering}
    breakdown={engineeringSplit}
    memberStatus="done"
    feedingRulesCount={engineering.ruleCount}
    rulesStatus="done"
    appsCount={appsGranted}
    appsStatus="done"
    rolesCount={0}
    rolesStatus="available"
    referencingRulesCount={engineering.usedInRuleCount ?? 0}
    referencingStatus="done"
    onNavigate={noop}
  />
);

const ShowStage: React.FC<{ beat: number }> = ({ beat }) => {
  if (beat <= 1) {
    return (
      <Assemble className="flex flex-col gap-(--sp-rung)">
        {listRows.map(({ group, breakdown }) => (
          <GroupRow
            key={group.id}
            group={group}
            breakdown={breakdown}
            expanded={beat === 1 && group.id === engineering.id}
            onToggle={noop}
            idPrefix="guide-show-group-row"
          />
        ))}
      </Assemble>
    );
  }
  return (
    <div className="flex flex-col gap-(--sp-rung)">
      <Assemble selector='[role="tabpanel"] button'>
        <Overview />
      </Assemble>
      {beat >= 3 ? (
        <Assemble>
          <CountedMembers />
        </Assemble>
      ) : null}
    </div>
  );
};

const SHOW: ShowSpec = {
  stageLabel: 'Groups',
  minHeight: 520,
  beats: [
    {
      caption: 'Three groups, one row each: the member count, where they came from, the rules.',
      hold: 3,
    },
    {
      caption:
        'The chevron opens the record in place: the description, where the members came from, the id, both dates.',
      hold: 3,
    },
    {
      caption: 'Open the group and Overview answers in three tiles, each one a claim.',
      hold: 2,
    },
    {
      caption:
        'Members draws the split as one pill per source, and names the rule those members are attributed to.',
    },
  ],
  render: (beat) => <ShowStage beat={beat} />,
};

const Verbs: React.FC = () => {
  const [adding, setAdding] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [addPick, setAddPick] = useState<OktaUser | null>(null);
  const close = () => setAdding(false);

  const addResults = useMemo(() => {
    const q = addQuery.trim().toLowerCase();
    if (!q) return [];
    return demoUsers
      .filter((u) => `${userDisplayName(u)} ${u.profile.email}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [addQuery]);

  const actions: ActionDescriptor[] = [
    {
      id: 'add-member',
      label: 'Add',
      icon: 'plus',
      variant: 'primary',
      onClick: () => setAdding(true),
      title: 'Add a member to this group',
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: 'users',
      priority: 'flex',
      onClick: noop,
      title: 'Compare this group with another group',
    },
    {
      id: 'why-not-member',
      label: 'Check membership',
      icon: 'search',
      priority: 'flex',
      onClick: noop,
      title: 'Pick a user and see whether the rules feeding this group qualify them',
    },
    {
      id: 'export-members',
      label: 'Export members',
      icon: 'download',
      priority: 'tier',
      onClick: noop,
      title: "Export this group's members from the Export tab",
    },
  ];

  return (
    <>
      <Marker n={1} align="top">
        <HotTarget n={1}>
          <ActionBar
            ariaLabel={`Actions for ${engineering.name}`}
            sticky={false}
            actions={actions}
            expansion={
              <div className="space-y-(--sp-rung)">
                <div className="space-y-(--sp-field)">
                  <div className="flex items-center justify-between gap-2">
                    <Eyebrow>Automated intake</Eyebrow>
                    <span className="text-xs text-neutral-600">Asks to confirm</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-(--sp-field)">
                    <span className="text-xs text-danger-text">
                      Memberships a rule grants outlive the rule
                    </span>
                    <Button variant="secondary" size="sm" icon="plus" onClick={noop}>
                      Create feeding rule
                    </Button>
                  </div>
                </div>
              </div>
            }
          />
        </HotTarget>
      </Marker>
      <AddGroupMemberModal
        isOpen={adding}
        groupName={engineering.name}
        addQuery={addQuery}
        onAddQueryChange={setAddQuery}
        addResults={addResults}
        isSearchingToAdd={false}
        selectedUser={addPick}
        onSelectUser={setAddPick}
        onClearSelectedUser={() => setAddPick(null)}
        isAddingMember={false}
        onClose={close}
        onConfirm={close}
      />
    </>
  );
};

const GroupsChapter: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (groupId: string) => setOpen((current) => (current === groupId ? null : groupId));

  return (
    <ChapterPage id="groups" show={SHOW}>
      <HotScope>
        <Scene
          title="The List"
          intro="A group is a list of people and a reason for each of them. The Groups tab gives you the list first, then the reason. Every row carries the same line: the exact member count Okta returns with the list, where those members came from, and the rules involved. Click a chevron to open a row's preview."
          legend={[
            {
              text: (
                <HotText n={1}>
                  Engineering - All is fed by a rule and has been analyzed, so the row keeps the
                  split: how many members the rule accounts for, and how many were added by hand.
                </HotText>
              ),
            },
            {
              text: (
                <HotText n={2}>
                  Salesforce - Sales Users is an app group. The chip names the app that owns the
                  roster, and Okta mirrors it.
                </HotText>
              ),
            },
            {
              text: (
                <HotText n={3}>
                  On-Call - Engineering has not been analyzed. The row says so rather than guessing
                  a split, because the answer costs one read of every member.
                </HotText>
              ),
            },
          ]}
        >
          <div className="flex flex-col gap-(--sp-rung)">
            {listRows.map(({ group, breakdown }, index) => (
              <Marker key={group.id} n={index + 1} align="top">
                <HotTarget n={index + 1}>
                  <GroupRow
                    group={group}
                    breakdown={breakdown}
                    expanded={open === group.id}
                    onToggle={() => toggle(group.id)}
                  />
                </HotTarget>
              </Marker>
            ))}
          </div>
        </Scene>
      </HotScope>

      <HotScope>
        <Scene
          title="Overview"
          intro="The preview costs nothing: every field in it arrived with the list, including the day the profile was last edited and the day the roster last changed, which is the pair that tells a reviewed group from a forgotten one. Click the row itself to open the group. Overview answers in tiles. Each one is a claim worked out from what has loaded, and each is a button into the pane that backs it."
          legend={[
            {
              text: (
                <HotText n={1}>
                  Three tiles here: where membership comes from, what the group grants, and which
                  rules assign into it or read it. Press one and the pane behind it opens. A tile
                  whose read has not finished is left out rather than shown as zero, so a figure on
                  screen is a figure the panel has.
                </HotText>
              ),
            },
          ]}
        >
          <Marker n={1} align="top">
            <HotTarget n={1}>
              <Overview />
            </HotTarget>
          </Marker>
        </Scene>
      </HotScope>

      <HotScope>
        <Scene
          title="Member Sources"
          intro="Members opens on its source card: the split as a bar, a pill for each source that narrows the roster to it, and the rule those members are attributed to."
          legend={[
            {
              text: (
                <HotText n={1}>
                  Every number the bar encodes is printed on a pill beside it, so nothing here is
                  only a colour. Press one in the panel and the roster below narrows to that source;
                  All puts everyone back.
                </HotText>
              ),
            },
            {
              text: (
                <HotText n={2}>
                  The rule those members are attributed to, how many it accounts for, and a chip
                  saying whether Okta reported the attribution or the panel worked it out. Click the
                  row to open that rule in the Rules tab.
                </HotText>
              ),
            },
          ]}
        >
          <div className={SOURCE_CARD_BLED}>
            <div className="space-y-3">
              <h4 className="px-(--sp-card) text-xs font-medium text-neutral-600">Source</h4>
              <Marker n={1} align="top">
                <HotTarget n={1}>
                  <div className="px-(--sp-card)">
                    <SourceBar split={engineeringSplit} />
                  </div>
                </HotTarget>
              </Marker>
              <Marker n={2} align="top">
                <HotTarget n={2}>
                  <div className="px-(--sp-card)">
                    <MemberSourceNotes breakdown={engineeringSplit} onNavigateToRule={noop} />
                  </div>
                </HotTarget>
              </Marker>
            </div>
          </div>
        </Scene>
      </HotScope>

      <HotScope>
        <Scene
          title="Verbs"
          stageLabel="Groups, detail"
          intro="The strip under the header holds every verb whose object is the whole group. Click Add to open its dialog."
          legend={[
            {
              text: (
                <HotText n={1}>
                  Add is the primary verb: it writes, and removing the member undoes it, so it asks
                  nothing more than the dialog. Compare and Check membership stay in the row because
                  they only read. More holds Export members, which hands the job to the Export tab,
                  and Create feeding rule, which states beside its button what a rule leaves behind
                  when you delete it.
                </HotText>
              ),
            },
          ]}
          outro="Add searches your org for a person and writes the membership when you confirm. Compare picks a second group and opens the comparison: who is in both, who is in only one, and which rules explain the difference."
          minHeight={420}
        >
          <Verbs />
        </Scene>
      </HotScope>

      <MfaCoverageScene />

      <ProfileHealthScene />

      <BulkFixScene />
    </ChapterPage>
  );
};

export default GroupsChapter;
