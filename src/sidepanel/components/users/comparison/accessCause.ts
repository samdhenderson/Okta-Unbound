import {
  explainRuleExpression,
  type ClauseExplanation,
  type ClauseGroupReference,
  type ClauseGroupRequirement,
} from '../../../../shared/rules/explainExpression';
import type { RuleGroupContext } from '../../../../shared/ruleEvaluator';
import { groupContextOf } from '../../../../shared/membership/groupContext';
import { conditionExpressionOf } from '../../../../shared/membership/ruleExpression';
import { isDeducedAttribution } from '../../../../shared/utils/membershipAnalysis';
import type { GroupMembership, MembershipRule, OktaUser } from '../../../../shared/types';

export type AccessRemedy =
  | 'blocked-by-attribute'
  | 'needs-group-membership'
  | 'blocked-by-group-membership'
  | 'excluded-by-rule'
  | 'manual-add'
  | 'app-managed'
  | 'cannot-determine';

export type UndeterminedReason =
  | 'unevaluable-clause'
  | 'needs-group-context'
  | 'ambiguous-attribution'
  | 'no-rule-inventory'
  | 'no-condition';

export interface AccessCause {
  readonly groupId: string;
  readonly groupName: string;
  readonly remedy: AccessRemedy;
  readonly undeterminedReason?: UndeterminedReason;
  readonly ruleId?: string;
  readonly ruleName?: string;
  readonly failingClauses: readonly ClauseExplanation[];
  readonly requiredGroups?: readonly ClauseGroupReference[];
  readonly blockingGroups?: readonly ClauseGroupReference[];
}

export interface AccessCauseInput {
  readonly onlyCompared: readonly GroupMembership[];
  readonly contextUser: OktaUser;
  readonly contextGroups?: readonly GroupMembership[];
  readonly rules: readonly MembershipRule[] | null;
}

export function classifyAccessCauses(input: AccessCauseInput): AccessCause[] {
  const { onlyCompared, contextUser, rules, contextGroups } = input;
  const groupContext = contextGroups ? groupContextOf(contextGroups) : undefined;
  return onlyCompared.map((membership) =>
    classifyOne(membership, contextUser, rules, groupContext),
  );
}

function rulesTargeting(rules: readonly MembershipRule[], groupId: string): MembershipRule[] {
  return rules.filter((rule) => {
    if (rule.status !== 'ACTIVE') return false;
    const groupIds = rule.groupIds || rule.actions?.assignUserToGroups?.groupIds || [];
    return groupIds.includes(groupId);
  });
}

function isUserExcludedFromRule(rule: MembershipRule, userId: string): boolean {
  return (rule.conditions?.people?.users?.exclude || []).includes(userId);
}

type RuleAssessment =
  | { readonly kind: 'excluded'; readonly rule: MembershipRule }
  | {
      readonly kind: 'blocked';
      readonly rule: MembershipRule;
      readonly failingClauses: readonly ClauseExplanation[];
      readonly onlyGroupClausesFailed: boolean;
      readonly requiredGroups: readonly ClauseGroupReference[];
      readonly blockingGroups: readonly ClauseGroupReference[];
    }
  | { readonly kind: 'grants'; readonly rule: MembershipRule }
  | {
      readonly kind: 'unknown';
      readonly rule: MembershipRule;
      readonly reason: UndeterminedReason;
    };

function assessRule(
  rule: MembershipRule,
  contextUser: OktaUser,
  groupContext: RuleGroupContext | undefined,
): RuleAssessment {
  if (isUserExcludedFromRule(rule, contextUser.id)) return { kind: 'excluded', rule };

  const expression = conditionExpressionOf(rule);
  if (expression.trim() === '') return { kind: 'unknown', rule, reason: 'no-condition' };

  const { clauses, summary } = explainRuleExpression(expression, contextUser, {
    groups: groupContext,
  });
  if (summary.result.outcome === 'match') return { kind: 'grants', rule };

  const failingClauses = clauses.filter((clause) => clause.status === 'fail');
  if (summary.result.outcome === 'no-match' && failingClauses.length > 0) {
    return {
      kind: 'blocked',
      rule,
      failingClauses,
      onlyGroupClausesFailed: failingClauses.every(
        (clause) => (clause.groupReferences?.length ?? 0) > 0,
      ),
      requiredGroups: groupsFromClauses(failingClauses, 'member', () => true),
      blockingGroups: groupsFromClauses(
        failingClauses,
        'non-member',
        (reference) => reference.satisfied,
      ),
    };
  }

  return {
    kind: 'unknown',
    rule,
    reason: summary.needsGroupContext > 0 ? 'needs-group-context' : 'unevaluable-clause',
  };
}

function groupsFromClauses(
  clauses: readonly ClauseExplanation[],
  requirement: ClauseGroupRequirement,
  keep: (reference: ClauseGroupReference) => boolean,
): readonly ClauseGroupReference[] {
  return clauses
    .filter((clause) => clause.groupRequirement === requirement)
    .flatMap((clause) => clause.groupReferences ?? [])
    .filter(keep);
}

function causeFor(membership: GroupMembership): Pick<AccessCause, 'groupId' | 'groupName'> {
  return { groupId: membership.group.id, groupName: membership.group.profile.name };
}

function plainCause(membership: GroupMembership, remedy: AccessRemedy): AccessCause {
  return { ...causeFor(membership), remedy, failingClauses: [] };
}

function undetermined(
  membership: GroupMembership,
  reason: UndeterminedReason,
  rule?: MembershipRule,
): AccessCause {
  return {
    ...causeFor(membership),
    remedy: 'cannot-determine',
    undeterminedReason: reason,
    ...(rule ? { ruleId: rule.id, ruleName: rule.name } : {}),
    failingClauses: [],
  };
}

function classifyOne(
  membership: GroupMembership,
  contextUser: OktaUser,
  rules: readonly MembershipRule[] | null,
  groupContext: RuleGroupContext | undefined,
): AccessCause {
  if (membership.group.type === 'APP_GROUP') return plainCause(membership, 'app-managed');

  if (rules === null) return undetermined(membership, 'no-rule-inventory');

  const deduced = isDeducedAttribution(membership.attribution);

  if (!deduced && membership.membershipType === 'DIRECT') {
    return plainCause(membership, 'manual-add');
  }

  const targeting = rulesTargeting(rules, membership.group.id);
  if (targeting.length === 0) {
    return undetermined(membership, deduced ? 'ambiguous-attribution' : 'no-rule-inventory');
  }

  const assessments = targeting.map((rule) => assessRule(rule, contextUser, groupContext));

  const excluded = assessments.find((a) => a.kind === 'excluded');
  if (excluded) {
    return {
      ...causeFor(membership),
      remedy: 'excluded-by-rule',
      ...ruleRef(excluded.rule),
      failingClauses: [],
    };
  }

  const blocked = assessments.filter((a) => a.kind === 'blocked');
  if (blocked.length > 0) {
    const requiredGroups = blocked.flatMap((b) => b.requiredGroups);
    const blockingGroups = blocked.flatMap((b) => b.blockingGroups);
    const onlyGroups = blocked.every((b) => b.onlyGroupClausesFailed);
    const groupRemedy: AccessRemedy =
      blockingGroups.length > 0 ? 'blocked-by-group-membership' : 'needs-group-membership';
    return {
      ...causeFor(membership),
      remedy: onlyGroups ? groupRemedy : 'blocked-by-attribute',
      ...(blocked.length === 1 ? ruleRef(blocked[0].rule) : {}),
      failingClauses: blocked.flatMap((b) => b.failingClauses),
      requiredGroups,
      blockingGroups,
    };
  }

  const unknown = assessments.filter((a) => a.kind === 'unknown');
  if (unknown.length > 0) {
    const reason =
      unknown.find((u) => u.reason === 'needs-group-context')?.reason ?? unknown[0].reason;
    return undetermined(membership, reason, unknown.length === 1 ? unknown[0].rule : undefined);
  }

  return undetermined(membership, 'unevaluable-clause');
}

function ruleRef(rule: MembershipRule): Pick<AccessCause, 'ruleId' | 'ruleName'> {
  return { ruleId: rule.id, ruleName: rule.name };
}

export function groupCausesByRemedy(
  causes: readonly AccessCause[],
): { remedy: AccessRemedy; causes: AccessCause[] }[] {
  const order: AccessRemedy[] = [
    'blocked-by-attribute',
    'needs-group-membership',
    'blocked-by-group-membership',
    'excluded-by-rule',
    'manual-add',
    'app-managed',
    'cannot-determine',
  ];
  return order
    .map((remedy) => ({ remedy, causes: causes.filter((c) => c.remedy === remedy) }))
    .filter((entry) => entry.causes.length > 0);
}
