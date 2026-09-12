import {
  tryEvaluateRuleExpressionDetailed,
  type RuleGroupContext,
  type RuleMatchResult,
} from '../ruleEvaluator';
import {
  explainRuleExpression,
  type ClauseGroupReference,
  type ClauseTreeNode,
} from '../rules/explainExpression';
import { matchSafeRegex } from '../rules/safeRegex';
import { groupContextOf } from './groupContext';
import { conditionExpressionOf } from './ruleExpression';
import {
  isMembershipAttributionDeduced,
  membershipBucket,
} from '../../sidepanel/components/users/membershipVerdict';
import type { GroupMembership, MembershipRule, OktaUser } from '../types';
import type {
  BlastRadiusCounts,
  BlastRadiusInput,
  BlastRadiusReport,
  GroupEffect,
  GroupEffectKind,
  RuleEffect,
  RuleTransition,
  WithheldReason,
} from './blastRadiusTypes';

function targetGroupIdsOf(rule: MembershipRule): readonly string[] {
  return rule.groupIds || rule.actions?.assignUserToGroups?.groupIds || [];
}

function draftedUser(user: OktaUser, draft: Readonly<Record<string, unknown>>): OktaUser {
  return { ...user, profile: { ...user.profile, ...draft } as OktaUser['profile'] };
}

const USER_ATTRIBUTE_PATTERN = /\buser\.([A-Za-z_$][A-Za-z0-9_$]*)/g;

function touchedAttributesOf(
  rule: MembershipRule,
  expression: string,
  draftKeys: ReadonlySet<string>,
): readonly string[] {
  const named = new Set(rule.userAttributes ?? []);
  for (const match of expression.matchAll(USER_ATTRIBUTE_PATTERN)) named.add(match[1]);
  return [...named].filter((name) => draftKeys.has(name)).sort();
}

function transitionOf(before: RuleMatchResult, after: RuleMatchResult): RuleTransition {
  if (before.outcome === 'unevaluable' || after.outcome === 'unevaluable') return 'undetermined';
  if (before.outcome === after.outcome) {
    return before.outcome === 'match' ? 'unchanged-match' : 'unchanged-no-match';
  }
  return after.outcome === 'match' ? 'starts-matching' : 'stops-matching';
}

interface RuleEvaluation {
  readonly effect: RuleEffect;
  readonly after: RuleMatchResult;
  readonly targetGroupIds: readonly string[];
}

function evaluateRule(
  rule: MembershipRule,
  user: OktaUser,
  drafted: OktaUser,
  context: RuleGroupContext,
  groupNames: ReadonlyMap<string, string>,
  draftKeys: ReadonlySet<string>,
): RuleEvaluation {
  const expression = conditionExpressionOf(rule);
  const before = tryEvaluateRuleExpressionDetailed(expression, user, context);
  const after = tryEvaluateRuleExpressionDetailed(expression, drafted, context);
  const targetGroupIds = targetGroupIdsOf(rule);

  return {
    after,
    targetGroupIds,
    effect: {
      ruleId: rule.id,
      ruleName: rule.name,
      expression,
      transition: transitionOf(before, after),
      ...(before.outcome === 'unevaluable' ? { beforeReason: before.reasonCode } : {}),
      ...(after.outcome === 'unevaluable' ? { afterReason: after.reasonCode } : {}),
      targetGroupIds,
      targetGroupNames: targetGroupIds.map((id) => groupNames.get(id) ?? id),
      touchedAttributes: touchedAttributesOf(rule, expression, draftKeys),
      active: rule.status === 'ACTIVE',
      status: rule.status,
    },
  };
}

interface GroupPassContext {
  readonly evaluations: readonly RuleEvaluation[];
  readonly membershipByGroupId: ReadonlyMap<string, GroupMembership>;
  readonly groupNames: ReadonlyMap<string, string>;
}

function baseEffect(
  groupId: string,
  candidates: readonly RuleEvaluation[],
  context: GroupPassContext,
): Omit<GroupEffect, 'kind'> {
  const held = context.membershipByGroupId.get(groupId);
  return {
    groupId,
    groupName: held?.group.profile.name ?? context.groupNames.get(groupId) ?? groupId,
    contributingRuleIds: candidates.map((candidate) => candidate.effect.ruleId),
    ...(candidates.length === 1
      ? { ruleId: candidates[0].effect.ruleId, ruleName: candidates[0].effect.ruleName }
      : {}),
    ...(held ? { currentBucket: membershipBucket(held) } : {}),
    currentlyHeld: held !== undefined,
  };
}

function withheld(
  groupId: string,
  candidates: readonly RuleEvaluation[],
  context: GroupPassContext,
  withheldReason: WithheldReason,
  blockingRuleName?: string,
): GroupEffect {
  return {
    ...baseEffect(groupId, candidates, context),
    kind: 'not-predicted',
    withheldReason,
    ...(blockingRuleName === undefined ? {} : { blockingRuleName }),
  };
}

function predicted(
  groupId: string,
  candidates: readonly RuleEvaluation[],
  context: GroupPassContext,
  kind: Extract<GroupEffectKind, 'added' | 'removed'>,
): GroupEffect {
  return { ...baseEffect(groupId, candidates, context), kind };
}

function additionEffect(
  groupId: string,
  candidates: readonly RuleEvaluation[],
  context: GroupPassContext,
): GroupEffect | undefined {
  if (context.membershipByGroupId.has(groupId)) return undefined;

  const active = candidates.filter((candidate) => candidate.effect.active);
  if (active.length === 0) return withheld(groupId, candidates, context, 'rule-inactive');

  return predicted(groupId, active, context, 'added');
}

function removalEffect(
  groupId: string,
  candidates: readonly RuleEvaluation[],
  context: GroupPassContext,
): GroupEffect | undefined {
  const held = context.membershipByGroupId.get(groupId);
  if (!held) return undefined;

  const active = candidates.filter((candidate) => candidate.effect.active);
  if (active.length === 0) return withheld(groupId, candidates, context, 'rule-inactive');

  const decline = (reason: WithheldReason, blockingRuleName?: string): GroupEffect =>
    withheld(groupId, active, context, reason, blockingRuleName);

  if (held.group.type === 'APP_GROUP') return decline('app-mastered-group');
  if (membershipBucket(held) !== 'rule') return decline('membership-not-credited-to-rule');
  if (isMembershipAttributionDeduced(held)) return decline('membership-attribution-deduced');

  const stopping = new Set(active.map((candidate) => candidate.effect.ruleId));
  const others = context.evaluations.filter(
    (evaluation) =>
      evaluation.effect.active &&
      !stopping.has(evaluation.effect.ruleId) &&
      evaluation.targetGroupIds.includes(groupId),
  );

  const blocker = others.find((evaluation) => evaluation.after.outcome === 'match');
  if (blocker) {
    return decline('another-active-rule-still-matches', blocker.effect.ruleName);
  }
  if (others.some((evaluation) => evaluation.after.outcome === 'unevaluable')) {
    return decline('rule-unevaluable-after');
  }

  return predicted(groupId, active, context, 'removed');
}

interface AffectedGroup {
  readonly id: string;
  readonly name: string;
}

function referenceNames(reference: ClauseGroupReference, group: AffectedGroup): boolean {
  switch (reference.match) {
    case 'id':
      return group.id === reference.value;
    case 'name':
      return group.name === reference.value;
    case 'nameStartsWith':
      return group.name.startsWith(reference.value);
    case 'nameContains':
      return group.name.includes(reference.value);
    case 'nameRegex': {
      const result = matchSafeRegex(reference.value, group.name);
      return result.kind === 'match' && result.matched;
    }
  }
}

function groupReferencesUnder(node: ClauseTreeNode): readonly ClauseGroupReference[] {
  if (node.node === 'leaf') return node.groupReferences ?? [];
  return node.children.flatMap(groupReferencesUnder);
}

const SECOND_ORDER_TRANSITIONS: ReadonlySet<RuleTransition> = new Set<RuleTransition>([
  'unchanged-match',
  'unchanged-no-match',
  'undetermined',
]);

function secondOrderScan(
  evaluations: readonly RuleEvaluation[],
  affected: readonly AffectedGroup[],
  drafted: OktaUser,
  context: RuleGroupContext,
): string[] {
  if (affected.length === 0) return [];

  const names = new Set<string>();
  for (const evaluation of evaluations) {
    if (!SECOND_ORDER_TRANSITIONS.has(evaluation.effect.transition)) continue;
    const { tree } = explainRuleExpression(evaluation.effect.expression, drafted, {
      groups: context,
    });
    const touches = groupReferencesUnder(tree).some((reference) =>
      affected.some((group) => referenceNames(reference, group)),
    );
    if (touches) names.add(evaluation.effect.ruleName);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

const KIND_ORDER: Record<GroupEffectKind, number> = {
  added: 0,
  removed: 1,
  'not-predicted': 2,
};

const TRANSITION_ORDER: Record<RuleTransition, number> = {
  'starts-matching': 0,
  'stops-matching': 1,
  undetermined: 2,
  'unchanged-match': 3,
  'unchanged-no-match': 4,
};

interface Ranked {
  readonly rank: number;
  readonly name: string;
  readonly id: string;
}

function compareRanked(a: Ranked, b: Ranked): number {
  return a.rank - b.rank || a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
}

const NO_COUNTS: BlastRadiusCounts = {
  added: 0,
  removed: 0,
  notPredicted: 0,
  starts: 0,
  stops: 0,
  undetermined: 0,
};

function emptyReport(status: 'not-computed' | 'unavailable'): BlastRadiusReport {
  return {
    status,
    groups: [],
    rules: [],
    counts: NO_COUNTS,
    secondOrderPossible: false,
    secondOrderRuleNames: [],
  };
}

function push<T>(index: Map<string, T[]>, key: string, value: T): void {
  const existing = index.get(key);
  if (existing) existing.push(value);
  else index.set(key, [value]);
}

export function analyzeBlastRadius(input: BlastRadiusInput): BlastRadiusReport {
  if (input.rules.status === 'unresolved') return emptyReport('not-computed');
  if (input.rules.status === 'unavailable') return emptyReport('unavailable');

  const groupContext = groupContextOf(input.memberships);
  const drafted = draftedUser(input.user, input.draft);
  const draftKeys = new Set(Object.keys(input.draft));

  const evaluations = input.rules.rules.map((rule) =>
    evaluateRule(rule, input.user, drafted, groupContext, input.groupNames, draftKeys),
  );

  const membershipByGroupId = new Map<string, GroupMembership>();
  for (const membership of input.memberships) {
    if (!membershipByGroupId.has(membership.group.id)) {
      membershipByGroupId.set(membership.group.id, membership);
    }
  }

  const context: GroupPassContext = {
    evaluations,
    membershipByGroupId,
    groupNames: input.groupNames,
  };

  const additions = new Map<string, RuleEvaluation[]>();
  const removals = new Map<string, RuleEvaluation[]>();
  for (const evaluation of evaluations) {
    const index =
      evaluation.effect.transition === 'starts-matching'
        ? additions
        : evaluation.effect.transition === 'stops-matching'
          ? removals
          : undefined;
    if (!index) continue;
    for (const groupId of evaluation.targetGroupIds) push(index, groupId, evaluation);
  }

  const groups: GroupEffect[] = [];
  for (const [groupId, candidates] of additions) {
    const effect = additionEffect(groupId, candidates, context);
    if (effect) groups.push(effect);
  }
  for (const [groupId, candidates] of removals) {
    const effect = removalEffect(groupId, candidates, context);
    if (effect) groups.push(effect);
  }

  const groupRank = (group: GroupEffect): Ranked => ({
    rank: KIND_ORDER[group.kind],
    name: group.groupName,
    id: group.groupId,
  });
  groups.sort((a, b) => compareRanked(groupRank(a), groupRank(b)));

  const ruleRank = (rule: RuleEffect): Ranked => ({
    rank: TRANSITION_ORDER[rule.transition],
    name: rule.ruleName,
    id: rule.ruleId,
  });
  const rules = evaluations
    .map((evaluation) => evaluation.effect)
    .sort((a, b) => compareRanked(ruleRank(a), ruleRank(b)));

  const affected: AffectedGroup[] = groups
    .filter((group) => group.kind !== 'not-predicted')
    .map((group) => ({ id: group.groupId, name: group.groupName }));
  const secondOrderRuleNames = secondOrderScan(evaluations, affected, drafted, groupContext);

  const countKind = (kind: GroupEffectKind): number =>
    groups.filter((group) => group.kind === kind).length;
  const countTransition = (transition: RuleTransition): number =>
    rules.filter((rule) => rule.transition === transition).length;

  return {
    status: 'computed',
    groups,
    rules,
    counts: {
      added: countKind('added'),
      removed: countKind('removed'),
      notPredicted: countKind('not-predicted'),
      starts: countTransition('starts-matching'),
      stops: countTransition('stops-matching'),
      undetermined: countTransition('undetermined'),
    },
    secondOrderPossible: secondOrderRuleNames.length > 0,
    secondOrderRuleNames,
  };
}
