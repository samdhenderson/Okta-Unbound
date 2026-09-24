import React, { useCallback, useState } from 'react';
import ChapterPage, { type ShowSpec } from '../shell/ChapterPage';
import Scene from '../shell/Scene';
import { Marker } from '../shell/Callout';
import Assemble from '../show/Assemble';
import RuleCard from '../../sidepanel/components/RuleCard';
import RuleImpactModal from '../../sidepanel/components/RuleImpactModal';
import RuleConsolidationModal from '../../sidepanel/components/RuleConsolidationModal';
import RuleActionBar from '../../sidepanel/components/rules/RuleActionBar';
import RulesDuplicatesPanel from '../../sidepanel/components/rules/RulesDuplicatesPanel';
import { ClauseLedger, DetailSection, FilterPill } from '../../sidepanel/components/shared';
import { formatRuleForDisplay } from '../../shared/ruleUtils';
import { consolidatedRuleName, findMergeableRuleGroups } from '../../shared/rules/consolidation';
import {
  summarizeRuleImpact,
  toImpactRule,
  type TargetGroupMembers,
} from '../../shared/membership/ruleImpact';
import type { ConsolidationPreview } from '../../sidepanel/hooks/useRuleConsolidation';
import type { RuleImpactMode } from '../../sidepanel/hooks/useRuleImpact';
import type { OktaGroupRule, OktaUser } from '../../shared/types';
import type { RuleGroupContext } from '../../shared/ruleEvaluator';
import { DEMO_COMPARISON_PAIR, demoUsersById } from '../../sidepanel/demo/users';
import { currentGroupsById, demoRules } from '../../sidepanel/demo/snapshot';
import { demoGroupMembers } from '../../sidepanel/demo/memberships';
import { fakeId } from '../../sidepanel/demo/org';

const noop = () => {};

const demoRule = (n: number): OktaGroupRule => {
  const found = demoRules.find((r) => r.id === fakeId('0pr', n));
  if (!found) throw new Error(`Demo rule ${n} is missing`);
  return found;
};

const LEDGER_EXPRESSION = [
  'String.toLowerCase(user.department) == "engineering"',
  'user.employeeType != "CONTRACTOR"',
  '(user.countryCode == "US" || user.countryCode == "CA")',
  'String.stringContains(user.title, "Engineer")',
  `!isMemberOfAnyGroup("${fakeId('00g', 15)}", "${fakeId('00g', 16)}")`,
].join(' && ');

const githubRule: OktaGroupRule = {
  ...demoRule(3),
  name: 'Engineering staff in North America → GitHub',
  conditions: { expression: { value: LEDGER_EXPRESSION, type: 'urn:okta:expression:1.0' } },
};
const internRule = demoRule(9);
const regionalRule = demoRule(22);
const engineeringRule = formatRuleForDisplay(demoRule(2));

const listRows = [internRule, githubRule, regionalRule].map((rule) => formatRuleForDisplay(rule));

const demoPerson = (id: string): OktaUser => {
  const found = demoUsersById.get(id);
  if (!found) throw new Error(`Demo person ${id} is missing`);
  return found;
};

const people = {
  tomas: demoPerson(DEMO_COMPARISON_PAIR.right),
  amara: demoPerson(DEMO_COMPARISON_PAIR.left),
} as const satisfies Record<string, OktaUser>;

type PersonKey = keyof typeof people;

const VERDICT_LINE: Record<PersonKey, string> = {
  tomas:
    'Tomas passes two clauses: his department lowercases to engineering, and his title has Engineer in it. Three fail: he is a CONTRACTOR, he is in DE rather than US or CA, and he is in Contractors - EMEA, which the last clause excludes. One failed clause settles the rule: no match.',
  amara:
    'Amara passes all five: her department lowercases to engineering, her employee type is FULL_TIME, her country is US, her title has Engineer in it, and she is in neither contractor group. Every clause holds, so the rule matches her and GitHub is hers by rule.',
};

const expressionOf = (rule: OktaGroupRule): string => rule.conditions?.expression?.value ?? '';

function engineeringImpact() {
  const membersById = demoGroupMembers();
  const groupsById = currentGroupsById();
  const targets: TargetGroupMembers[] = engineeringRule.groupIds.map((groupId) => {
    const group = groupsById.get(groupId);
    return {
      groupId,
      groupName: group?.profile?.name ?? groupId,
      groupType: group?.type,
      members: (membersById.get(groupId) ?? [])
        .map((id) => demoUsersById.get(id))
        .filter((u): u is OktaUser => Boolean(u)),
    };
  });
  return summarizeRuleImpact(
    engineeringRule.id,
    engineeringRule.name,
    targets,
    demoRules.map(toImpactRule),
  );
}

const impactSummary = engineeringImpact();

const duplicateSets = findMergeableRuleGroups(demoRules);

const duplicateCount = duplicateSets[0].rules.length;

function mergePreview(): ConsolidationPreview {
  const set = duplicateSets[0];
  const base = set.rules[0];
  return {
    mode: 'merge',
    baseName: base.name,
    resultingName: consolidatedRuleName(base.name),
    resultingGroupIds: set.unionGroupIds,
    addedGroupIds: [],
    addedGroupNames: [],
    retireRules: set.rules.map((r) => ({ id: r.id, name: r.name, status: r.status })),
    willActivate: set.rules.some((r) => r.status === 'ACTIVE'),
  };
}

const preview = mergePreview();

const LINKED_FRAME =
  'rounded-md outline outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-(--dur-instant) ease-(--ease-standard) data-[hot=true]:outline-primary/40 ' +
  '[&+span]:transition-shadow [&+span]:duration-(--dur-instant) [&[data-hot=true]+span]:ring-4 [&[data-hot=true]+span]:ring-primary/25';

const LINKED_ROW =
  '-mx-2 -my-1 block rounded-md px-2 py-1 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-[hot=true]:bg-primary-light/60';

function useLinked() {
  const [hot, setHot] = useState<number | null>(null);
  return useCallback(
    (n: number) => ({
      'data-hot': hot === n ? 'true' : 'false',
      onPointerEnter: () => setHot(n),
      onPointerLeave: () => setHot((current) => (current === n ? null : current)),
      onFocusCapture: () => setHot(n),
      onBlurCapture: () => setHot((current) => (current === n ? null : current)),
    }),
    [hot],
  );
}

type Bind = ReturnType<typeof useLinked>;

interface LinkProps {
  n: number;
  bind: Bind;
  children: React.ReactNode;
}

const Linked: React.FC<LinkProps> = ({ n, bind, children }) => (
  <div {...bind(n)} className={LINKED_FRAME}>
    {children}
  </div>
);

const Row: React.FC<LinkProps> = ({ n, bind, children }) => (
  <span {...bind(n)} className={LINKED_ROW}>
    {children}
  </span>
);

const RuleList: React.FC<{ bind: Bind }> = ({ bind }) => (
  <Assemble className="flex flex-col gap-(--sp-rung)">
    {listRows.map((rule, index) =>
      index < 2 ? (
        <Marker key={rule.id} n={index + 1} align="top">
          <Linked n={index + 1} bind={bind}>
            <RuleCard rule={rule} onOpenRule={noop} selected={false} onToggleSelect={noop} />
          </Linked>
        </Marker>
      ) : (
        <RuleCard
          key={rule.id}
          rule={rule}
          onOpenRule={noop}
          selected={false}
          onToggleSelect={noop}
        />
      ),
    )}
  </Assemble>
);

const LedgerCard: React.FC<{
  rule: OktaGroupRule;
  user: OktaUser;
  groups?: RuleGroupContext;
  rise?: boolean;
}> = ({ rule, user, groups, rise = true }) => (
  <div
    className={rise ? 'animate-rise-in' : undefined}
    style={rise ? { animationFillMode: 'backwards' } : undefined}
  >
    <DetailSection>
      <p className="mb-2 text-sm font-semibold text-neutral-900">{rule.name}</p>
      <ClauseLedger
        expression={expressionOf(rule)}
        user={user}
        groupContext={groups}
        resolveGroupName={nameGroup}
      />
    </DetailSection>
  </div>
);

const PersonPicker: React.FC<{ person: PersonKey; onPick: (key: PersonKey) => void }> = ({
  person,
  onPick,
}) => (
  <div className="flex items-center gap-2" role="group" aria-label="Check against">
    <span className="text-xs font-medium text-neutral-600">Check against</span>
    {(Object.keys(people) as PersonKey[]).map((key) => (
      <FilterPill key={key} active={person === key} onClick={() => onPick(key)}>
        {people[key].profile.firstName}
      </FilterPill>
    ))}
  </div>
);

const personOnBeat = (beat: number): PersonKey => (beat >= 2 ? 'amara' : 'tomas');

function groupsOf(user: OktaUser): RuleGroupContext {
  const groupsById = currentGroupsById();
  return [...demoGroupMembers().entries()]
    .filter(([, memberIds]) => memberIds.includes(user.id))
    .map(([id]) => ({ id, name: groupsById.get(id)?.profile?.name ?? id }));
}

const groupContextOf: Record<PersonKey, RuleGroupContext> = {
  tomas: groupsOf(people.tomas),
  amara: groupsOf(people.amara),
};

const nameGroup = (id: string): string | undefined => currentGroupsById().get(id)?.profile?.name;

const PREVIEW_PIECES =
  '[role="dialog"] .grid > *, [role="dialog"] [class*="space-y-(--sp-rung)"] > *';

const ShowStage: React.FC<{ beat: number }> = ({ beat }) => {
  const person = personOnBeat(beat);
  return (
    <div className="flex flex-col gap-(--sp-rung)">
      {beat === 0 ? (
        <Assemble className="flex flex-col gap-(--sp-rung)">
          {listRows.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onOpenRule={noop}
              selected={false}
              onToggleSelect={noop}
            />
          ))}
        </Assemble>
      ) : (
        <>
          <PersonPicker person={person} onPick={noop} />
          <Assemble key={person} className="flex flex-col gap-(--sp-rung)">
            <LedgerCard
              rule={githubRule}
              user={people[person]}
              groups={groupContextOf[person]}
              rise={false}
            />
            <LedgerCard
              rule={regionalRule}
              user={people[person]}
              groups={groupContextOf[person]}
              rise={false}
            />
          </Assemble>
        </>
      )}
      {beat >= 3 ? (
        <Assemble selector={PREVIEW_PIECES}>
          <RuleImpactModal
            isOpen
            ruleName={engineeringRule.name}
            mode="deactivate"
            status="done"
            summary={impactSummary}
            error={null}
            progress={null}
            onClose={noop}
            onConfirmDeactivate={noop}
          />
        </Assemble>
      ) : null}
    </div>
  );
};

const STILL_CAPTION = `Deactivate measures before it writes: ${impactSummary.totalHeldSolely} ${
  impactSummary.totalHeldSolely === 1 ? 'person is' : 'people are'
} held by this rule alone. Nobody is removed; they stay.`;

const SHOW: ShowSpec = {
  stageLabel: 'Rules',
  minHeight: 740,
  beats: [
    {
      caption: 'Every rule is one row: its name, its status, and its condition in plain words.',
      hold: 2,
    },
    {
      caption:
        'Open one and check it against Tomas. Every clause gets a verdict, and so does the rule.',
      hold: 3,
    },
    {
      caption: 'Switch to Amara. GitHub turns to a match, and the contractor rule turns away.',
      hold: 3,
    },
    { caption: STILL_CAPTION },
  ],
  render: (beat) => <ShowStage beat={beat} />,
};

const RulesChapter: React.FC = () => {
  const [impactMode, setImpactMode] = useState<RuleImpactMode | null>(null);
  const [tierOpen, setTierOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [person, setPerson] = useState<PersonKey>('tomas');
  const list = useLinked();
  const ledger = useLinked();
  const impact = useLinked();
  const merge = useLinked();

  return (
    <ChapterPage id="rules" show={SHOW}>
      <Scene
        title="The List"
        intro="A group rule is a sentence about people: whoever matches its condition goes into its target groups. The Rules tab shows you every rule in plain words, one row each, on the canvas the way the tab stacks them: the name, the status, and the condition with the syntax taken out. Press a row to open the rule's detail."
        legend={[
          {
            text: (
              <Row n={1} bind={list}>
                The status is a word, not a colour. The intern rule is paused, so it reads INACTIVE
                and places nobody; a rule Okta can no longer evaluate reads Broken.
              </Row>
            ),
          },
          {
            text: (
              <Row n={2} bind={list}>
                The condition drops the user. prefix, so the GitHub row opens{' '}
                <code className="font-mono text-xs">{'department == "Engineering"'}</code> where
                Okta stores <code className="font-mono text-xs">{'user.department'}</code>. Group
                functions are spelled out the same way.
              </Row>
            ),
          },
        ]}
      >
        <RuleList bind={list} />
      </Scene>

      <Scene
        title="Check a Person"
        intro="Open a rule and pick a person. The ledger walks the condition clause by clause, then states one verdict for the whole rule. This one is deliberately a hard read: a comparison made on a lowercased value, a negation, an either-or pair, a substring test, and a clause about group membership whose ids are printed as the groups they name. Press Tomas or Amara and watch both verdicts follow."
        legend={[
          {
            text: (
              <Row n={1} bind={ledger}>
                {VERDICT_LINE[person]}
              </Row>
            ),
          },
          {
            text: (
              <Row n={2} bind={ledger}>
                A clause that asks about group membership can only be answered from the
                person&apos;s group list. The ledger above is given it, so its last clause is a real
                pass or fail; this one is not, so its clause reads not evaluated, with the groups it
                cites still named rather than a guess either way.
              </Row>
            ),
          },
        ]}
      >
        <div className="flex flex-col gap-(--sp-rung)">
          <PersonPicker person={person} onPick={setPerson} />
          <Marker n={1} align="top">
            <Linked n={1} bind={ledger}>
              <LedgerCard
                key={person}
                rule={githubRule}
                user={people[person]}
                groups={groupContextOf[person]}
              />
            </Linked>
          </Marker>
          <Marker n={2} align="top">
            <Linked n={2} bind={ledger}>
              <LedgerCard key={person} rule={regionalRule} user={people[person]} />
            </Linked>
          </Marker>
        </div>
      </Scene>

      <Scene
        title="Impact"
        stageLabel="Rules, deactivate"
        intro={`This is the verb strip on ${engineeringRule.name}. Preview impact keeps the row because it writes nothing. Deactivate sits behind More, because pausing a rule is not something a second press takes back. Press either one.`}
        legend={[
          {
            text: (
              <Row n={1} bind={impact}>
                Preview impact reads every target group and writes nothing, so it keeps the row.
                Press More and Deactivate appears with its cost printed beside it: it stops adding
                members, and everyone it already added stays where they are.
              </Row>
            ),
          },
          {
            text: 'Either press opens the same measurement. Its headline count is the people this rule holds alone, and deactivating removes none of them from a group: they stay, with no rule left to explain them.',
          },
        ]}
        minHeight={impactMode ? 720 : undefined}
      >
        <Marker n={1} align="top">
          <Linked n={1} bind={impact}>
            <RuleActionBar
              rule={engineeringRule}
              sticky={false}
              onPreviewImpact={() => setImpactMode('preview')}
              tierOpen={tierOpen}
              onTierOpenChange={setTierOpen}
              isConfirmingActivate={false}
              onRequestActivate={noop}
              onCancelActivate={noop}
              onConfirmActivate={noop}
              onRequestDeactivate={() => setImpactMode('deactivate')}
            />
          </Linked>
        </Marker>
        <RuleImpactModal
          isOpen={impactMode !== null}
          ruleName={engineeringRule.name}
          mode={impactMode ?? 'preview'}
          status="done"
          summary={impactSummary}
          error={null}
          progress={null}
          onClose={() => setImpactMode(null)}
          onConfirmDeactivate={() => setImpactMode(null)}
        />
      </Scene>

      <Scene
        title="Duplicates"
        stageLabel="Rules, duplicates"
        intro={`${duplicateCount} rules in this org carry the same condition and feed different groups, so the strip offers Duplicates. Open the set to read the condition they share, then press Review and merge to see the single rule that would replace them.`}
        legend={[
          {
            text: (
              <Row n={1} bind={merge}>
                The closed row counts the rules and the target groups they add up to. Open it and
                the shared condition is printed in full, with each rule&apos;s status beside its
                name.
              </Row>
            ),
          },
          {
            text: 'The preview names the new rule, the union of their target groups, and the rules that retire once it is live. Nobody gains or loses access, and nothing is written until you confirm.',
          },
        ]}
        outro="Every write a rule verb makes lands in History with what it replaced, so a merge or a deactivation you regret is one Undo away."
        minHeight={mergeOpen ? 720 : undefined}
      >
        <Marker n={1} align="top">
          <Linked n={1} bind={merge}>
            <RulesDuplicatesPanel clusters={duplicateSets} onMerge={() => setMergeOpen(true)} />
          </Linked>
        </Marker>
        <RuleConsolidationModal
          phase={mergeOpen ? 'preview' : 'idle'}
          preview={preview}
          result={null}
          error={null}
          searchGroups={async () => []}
          onChooseGroup={noop}
          onExecute={() => setMergeOpen(false)}
          onClose={() => setMergeOpen(false)}
        />
      </Scene>
    </ChapterPage>
  );
};

export default RulesChapter;
