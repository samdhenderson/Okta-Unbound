import type { RuleGroupContext, RuleMatchResult } from '../ruleEvaluator';
import type { MembershipRule, OktaUser } from '../types';
import { exclusionRouteOf } from '../utils/membershipAnalysis';
import { assessRule } from './ruleAssessment';
import { conditionExpressionOf, targetGroupIdsOf } from './ruleExpression';
import type {
  GroupUserVerdict,
  RuleUserVerdict,
  TargetCoverage,
  TargetGroupFact,
} from './qualificationTypes';

export interface QualificationSubject {
  readonly user: OktaUser;
  readonly groupContext: RuleGroupContext;
}

export interface GroupQualificationInput {
  readonly group: {
    readonly id: string;
    readonly type?: string;
  };
  readonly feedingRules: readonly MembershipRule[] | null;
  readonly subject: QualificationSubject;
  readonly groupNames?: ReadonlyMap<string, string>;
}

const NO_CONDITION: RuleMatchResult = { outcome: 'unevaluable', reasonCode: 'empty' };

export function assessRuleForUser(
  rule: MembershipRule,
  subject: QualificationSubject,
  groupNames?: ReadonlyMap<string, string>,
  missingGroupIds?: readonly string[],
): RuleUserVerdict {
  const { user, groupContext } = subject;
  const active = rule.status === 'ACTIVE';
  const expression = conditionExpressionOf(rule);
  const exclusion = exclusionRouteOf(rule, user.id, groupContext);
  const assessment = assessRule(rule, user, groupContext);

  const base = {
    ruleId: rule.id,
    ruleName: rule.name,
    status: rule.status,
    active,
    expression,
    exclusion,
    ...targetsOf(rule, groupContext, groupNames, missingGroupIds),
  };

  switch (assessment.kind) {
    case 'excluded':
      return {
        ...base,
        headline: 'excluded',
        condition: conditionVerdictIgnoringExclusion(rule, subject),
      };
    case 'grants':
      return {
        ...base,
        headline: active ? 'grants' : 'inactive-would-match',
        condition: { outcome: 'match' },
      };
    case 'blocked':
      return {
        ...base,
        headline: 'does-not-match',
        condition: { outcome: 'no-match' },
        failure: {
          failingClauses: assessment.failingClauses,
          onlyGroupClausesFailed: assessment.onlyGroupClausesFailed,
          requiredGroups: assessment.requiredGroups,
          blockingGroups: assessment.blockingGroups,
        },
      };
    case 'unknown':
      return {
        ...base,
        headline: 'undetermined',
        condition: assessment.condition ?? NO_CONDITION,
        undeterminedReason:
          assessment.reason === 'no-condition' ? 'no-condition' : 'unevaluable-clause',
      };
  }
}

export function assessGroupForUser(input: GroupQualificationInput): GroupUserVerdict {
  const { group, feedingRules, subject, groupNames } = input;

  if (group.type === 'APP_GROUP') return { kind: 'app-managed' };

  const isMember = subject.groupContext.some((entry) => entry.id === group.id);
  const rules =
    feedingRules
      ?.filter((rule) => targetGroupIdsOf(rule).includes(group.id))
      .map((rule) => assessRuleForUser(rule, subject, groupNames)) ?? null;

  if (isMember) return { kind: 'already-member', rules: rules ?? [] };
  if (rules === null) return { kind: 'inventory-unavailable' };
  if (rules.length === 0) return { kind: 'no-feeding-rule' };

  const grantingRuleIds = rules
    .filter((verdict) => verdict.headline === 'grants')
    .map((verdict) => verdict.ruleId);
  if (grantingRuleIds.length > 0) return { kind: 'would-be-added', grantingRuleIds, rules };
  if (rules.some((verdict) => verdict.headline === 'undetermined')) {
    return { kind: 'undetermined', rules };
  }
  return { kind: 'not-qualified', rules };
}

function targetsOf(
  rule: MembershipRule,
  groupContext: RuleGroupContext,
  groupNames: ReadonlyMap<string, string> | undefined,
  missingGroupIds: readonly string[] | undefined,
): { targets: readonly TargetGroupFact[]; coverage: TargetCoverage } {
  const held = new Set(groupContext.map((entry) => entry.id));
  const targets: TargetGroupFact[] = targetGroupIdsOf(rule).map((groupId) => {
    const fact: TargetGroupFact = { groupId, member: held.has(groupId) };
    const groupName = groupNames?.get(groupId);
    if (groupName !== undefined)
      return withMissing({ ...fact, groupName }, groupId, missingGroupIds);
    return withMissing(fact, groupId, missingGroupIds);
  });
  return { targets, coverage: coverageOf(targets) };
}

function withMissing(
  fact: TargetGroupFact,
  groupId: string,
  missingGroupIds: readonly string[] | undefined,
): TargetGroupFact {
  if (missingGroupIds === undefined) return fact;
  return { ...fact, missing: missingGroupIds.includes(groupId) };
}

function coverageOf(targets: readonly TargetGroupFact[]): TargetCoverage {
  if (targets.length === 0) return 'no-targets';
  const held = targets.filter((target) => target.member).length;
  if (held === 0) return 'none';
  return held === targets.length ? 'all' : 'some';
}

function conditionVerdictIgnoringExclusion(
  rule: MembershipRule,
  subject: QualificationSubject,
): RuleMatchResult {
  const stripped: MembershipRule = {
    ...rule,
    excludedUserIds: [],
    excludedGroupIds: [],
    conditions: rule.conditions ? { ...rule.conditions, people: undefined } : undefined,
  };
  const assessment = assessRule(stripped, subject.user, subject.groupContext);
  switch (assessment.kind) {
    case 'grants':
      return { outcome: 'match' };
    case 'blocked':
      return { outcome: 'no-match' };
    case 'unknown':
      return assessment.condition ?? NO_CONDITION;
    case 'excluded':
      return NO_CONDITION;
  }
}
