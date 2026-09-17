import { pluralize, pluralNoun, type Noun } from '@/shared/utils/plural';
import { userDisplayName } from '@/shared/utils/userDisplay';
import { extractReferencedGroupIds } from '@/shared/rules/groupRuleIndex';
import { loadCachedGroupIndex } from '@/sidepanel/hooks/fetchGroupRulesRequest';
import type { OktaGroupRule } from '@/shared/types';
import type { BasketVerb, VerbContext, VerbOutcome } from '../types';
import {
  countOfKind,
  type AddOutcome,
  type SelectionBasket,
  type SelectionKind,
  type SelectionRef,
} from '../../selectionStore';

type UnstampedRef = Omit<SelectionRef, 'pickedAt'>;

interface Shortfall {
  count: number;
  clause: string;
}

function pickedOfKind(basket: SelectionBasket, kind: SelectionKind): SelectionRef[] {
  return basket.picked.filter((ref) => ref.kind === kind);
}

function dedupeById(refs: UnstampedRef[]): UnstampedRef[] {
  const seen = new Set<string>();
  return refs.filter((ref) => (seen.has(ref.id) ? false : (seen.add(ref.id), true)));
}

function describeAdd(outcome: AddOutcome, noun: Noun, shortfall?: Shortfall): VerbOutcome {
  if (outcome.refused > 0) {
    return {
      status: 'refused',
      summary: `Added nothing: the selection cap refused all ${pluralize(outcome.refused, noun)}.`,
    };
  }

  const clauses = [`Added ${pluralize(outcome.added, noun)} to the selection`];
  if (outcome.alreadyPicked > 0) {
    clauses.push(
      `${pluralize(outcome.alreadyPicked, noun)} ${outcome.alreadyPicked === 1 ? 'was' : 'were'} already ticked`,
    );
  }
  if (shortfall) clauses.push(shortfall.clause);

  if (outcome.added === 0 && outcome.alreadyPicked === 0 && !shortfall) {
    return { status: 'nothing-to-do', summary: `Found no ${pluralNoun(0, noun)} to add.` };
  }
  return { status: shortfall ? 'partly-done' : 'done', summary: `${clauses.join('; ')}.` };
}

interface TickedRules {
  rules: OktaGroupRule[];
  unreadable: number;
}

async function readTickedRules(context: VerbContext, name: string): Promise<TickedRules> {
  const ticked = pickedOfKind(context.basket, 'rule');
  const outcome = await context.api.runOperation(
    name,
    ticked,
    (ref) => context.api.getRawGroupRule(ref.id),
    {
      message: (progress) => `Reading rules (${progress.completed}/${progress.total})`,
      plan: { endpoint: '/api/v1/groups/rules', method: 'GET' },
    },
  );

  const rules: OktaGroupRule[] = [];
  for (const result of outcome.results) {
    if (result.status === 'fulfilled' && result.value) rules.push(result.value);
  }
  context.report(`Read ${pluralize(rules.length, 'group rule')}.`);
  return { rules, unreadable: ticked.length - rules.length };
}

function unreadableRulesShortfall(unreadable: number): Shortfall | undefined {
  return unreadable === 0
    ? undefined
    : { count: unreadable, clause: `${pluralize(unreadable, 'group rule')} could not be read` };
}

interface NamedGroups {
  refs: UnstampedRef[];
  unnamed: number;
}

async function nameGroups(ids: string[], oktaOrigin: string | null): Promise<NamedGroups> {
  const { nameById } = await loadCachedGroupIndex(oktaOrigin);
  const refs: UnstampedRef[] = [];
  let unnamed = 0;
  for (const id of ids) {
    const name = nameById.get(id);
    if (name) refs.push({ kind: 'group', id, name });
    else unnamed += 1;
  }
  return { refs, unnamed };
}

function unnamedGroupsShortfall(unnamed: number): Shortfall | undefined {
  return unnamed === 0
    ? undefined
    : {
        count: unnamed,
        clause: `${pluralize(unnamed, 'group')} the org snapshot does not name ${unnamed === 1 ? 'was' : 'were'} left out`,
      };
}

export const groupMembersToUsers: BasketVerb = {
  id: 'group-members-to-users',
  label: "Add these groups' members",
  title: "Add these groups' members to the user selection",
  path: 'convert',
  needs: ['group'],
  cost: (basket) => ({
    requests: countOfKind(basket, 'group'),
    walks: [{ count: countOfKind(basket, 'group'), kind: 'membership' }],
    writes: 0,
  }),
  async run(context) {
    const groups = pickedOfKind(context.basket, 'group');
    const outcome = await context.api.runOperation(
      "Add groups' members to the selection",
      groups,
      (group, _index, planId) => context.api.getAllGroupMembers(group.id, { planId }),
      {
        message: (progress) => `Reading members (${progress.completed}/${progress.total})`,
        plan: { endpoint: '/api/v1/groups', method: 'GET' },
      },
    );

    const refs: UnstampedRef[] = [];
    let unreadable = 0;
    for (const result of outcome.results) {
      if (result.status === 'fulfilled' && result.value) {
        for (const member of result.value) {
          refs.push({ kind: 'user', id: member.id, name: userDisplayName(member) });
        }
      } else {
        unreadable += 1;
      }
    }

    const distinct = dedupeById(refs);
    context.report(`Read ${pluralize(distinct.length, 'member')}.`);
    return describeAdd(
      context.addMany(distinct),
      'user',
      unreadable === 0
        ? undefined
        : {
            count: unreadable,
            clause: `${pluralize(unreadable, 'group')} could not be read`,
          },
    );
  },
};

export const rulesToFedGroups: BasketVerb = {
  id: 'rules-to-fed-groups',
  label: 'Add the groups these rules feed',
  title: 'Add the groups these rules feed to the group selection',
  path: 'convert',
  needs: ['rule'],
  cost: (basket) => ({ requests: countOfKind(basket, 'rule'), writes: 0 }),
  async run(context) {
    const { rules, unreadable } = await readTickedRules(
      context,
      'Add the groups these rules feed to the selection',
    );

    const ids = [
      ...new Set(rules.flatMap((rule) => rule.actions?.assignUserToGroups?.groupIds ?? [])),
    ];
    const named = await nameGroups(ids, context.oktaOrigin);

    return describeAdd(
      context.addMany(named.refs),
      'group',
      unreadableRulesShortfall(unreadable) ?? unnamedGroupsShortfall(named.unnamed),
    );
  },
};

export const rulesToConditionGroups: BasketVerb = {
  id: 'rules-to-condition-groups',
  label: "Add the groups in these rules' conditions",
  title: "Add the groups named in these rules' conditions to the group selection",
  path: 'convert',
  needs: ['rule'],
  cost: (basket) => ({ requests: countOfKind(basket, 'rule'), writes: 0 }),
  async run(context) {
    const { rules, unreadable } = await readTickedRules(
      context,
      "Add these rules' condition groups to the selection",
    );

    const ids = conditionGroupIds(rules);
    const named = await nameGroups(ids, context.oktaOrigin);

    return describeAdd(
      context.addMany(named.refs),
      'group',
      unreadableRulesShortfall(unreadable) ?? unnamedGroupsShortfall(named.unnamed),
    );
  },
};

function conditionGroupIds(rules: readonly OktaGroupRule[]): string[] {
  return [
    ...new Set(
      rules.flatMap((rule) => extractReferencedGroupIds(rule.conditions?.expression?.value)),
    ),
  ];
}

export const rulesToUpstreamRules: BasketVerb = {
  id: 'rules-to-upstream-rules',
  label: 'Add the rules upstream of these rules',
  title: "Add the rules that feed these rules' condition groups to the rule selection",
  path: 'convert',
  needs: ['rule'],
  cost: (basket) => ({
    requests: countOfKind(basket, 'rule') + 1,
    walks: [{ count: 1, kind: 'membership' }],
    writes: 0,
  }),
  async run(context) {
    const { rules, unreadable } = await readTickedRules(
      context,
      'Add the rules upstream of these rules to the selection',
    );

    const groupIds = new Set(conditionGroupIds(rules));
    context.report(`Reading the rules that feed ${pluralize(groupIds.size, 'group')}.`);

    const allRules = await context.api.ensureGroupRulesLoaded();
    if (!allRules) {
      return {
        status: 'partly-done',
        summary: 'Added no rules: the org-wide rules listing could not be read.',
      };
    }

    const upstream = allRules.filter((rule) => rule.groupIds.some((id) => groupIds.has(id)));
    const refs = dedupeById(
      upstream.map((rule) => ({ kind: 'rule', id: rule.id, name: rule.name })),
    );

    return describeAdd(context.addMany(refs), 'group rule', unreadableRulesShortfall(unreadable));
  },
};

const converters: BasketVerb[] = [
  groupMembersToUsers,
  rulesToFedGroups,
  rulesToConditionGroups,
  rulesToUpstreamRules,
];

export default converters;
