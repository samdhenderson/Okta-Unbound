import type {
  ClauseGroupReference,
  LeafClauseNode,
} from '../../../../shared/rules/explainExpression';
import { assessRule, type UndeterminedReason } from '../../../../shared/membership/ruleAssessment';
import type { RuleGroupContext } from '../../../../shared/ruleEvaluator';
import { groupContextOf } from '../../../../shared/membership/groupContext';
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

export type { UndeterminedReason };

export interface AccessCause {
  readonly groupId: string;
  readonly groupName: string;
  readonly remedy: AccessRemedy;
  readonly undeterminedReason?: UndeterminedReason;
  readonly ruleId?: string;
  readonly ruleName?: string;
  readonly failingClauses: readonly LeafClauseNode[];
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
