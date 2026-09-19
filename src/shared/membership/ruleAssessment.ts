import {
  explainRuleExpression,
  type ClauseGroupReference,
  type ClauseGroupRequirement,
  type ClauseTreeNode,
  type LeafClauseNode,
} from '../rules/explainExpression';
import type { RuleGroupContext, RuleMatchResult } from '../ruleEvaluator';
import { conditionExpressionOf } from './ruleExpression';
import { exclusionRouteOf, type ExclusionRoute } from '../utils/membershipAnalysis';
import type { MembershipRule, OktaUser } from '../types';

export type UndeterminedReason =
  | 'unevaluable-clause'
  | 'needs-group-context'
  | 'ambiguous-attribution'
  | 'no-rule-inventory'
  | 'no-condition';

export type RuleAssessment =
  | {
      readonly kind: 'excluded';
      readonly rule: MembershipRule;
      readonly route: Exclude<ExclusionRoute, 'none'>;
    }
  | {
      readonly kind: 'blocked';
      readonly rule: MembershipRule;
      readonly failingClauses: readonly LeafClauseNode[];
      readonly onlyGroupClausesFailed: boolean;
      readonly requiredGroups: readonly ClauseGroupReference[];
      readonly blockingGroups: readonly ClauseGroupReference[];
    }
  | { readonly kind: 'grants'; readonly rule: MembershipRule }
  | {
      readonly kind: 'unknown';
      readonly rule: MembershipRule;
      readonly reason: UndeterminedReason;
      readonly condition?: RuleMatchResult;
    };

export function assessRule(
  rule: MembershipRule,
  user: OktaUser,
  groupContext: RuleGroupContext | undefined,
): RuleAssessment {
  const route = exclusionRouteOf(rule, user.id, groupContext);
  if (route !== 'none') return { kind: 'excluded', rule, route };

  const expression = conditionExpressionOf(rule);
  if (expression.trim() === '') return { kind: 'unknown', rule, reason: 'no-condition' };

  const { tree, summary } = explainRuleExpression(expression, user, {
    groups: groupContext,
  });
  if (summary.result.outcome === 'match') return { kind: 'grants', rule };

  const failingClauses = collectFailingLeaves(tree);
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
    reason:
      groupContext === undefined && summary.needsGroupContext > 0
        ? 'needs-group-context'
        : 'unevaluable-clause',
    condition: summary.result,
  };
}

export function collectFailingLeaves(node: ClauseTreeNode): readonly LeafClauseNode[] {
  if (node.node === 'leaf') return node.status === 'fail' ? [node] : [];
  if (node.verdict !== 'fail') return [];
  return node.children.flatMap(collectFailingLeaves);
}

export function groupsFromClauses(
  clauses: readonly LeafClauseNode[],
  requirement: ClauseGroupRequirement,
  keep: (reference: ClauseGroupReference) => boolean,
): readonly ClauseGroupReference[] {
  return clauses
    .filter((clause) => clause.groupRequirement === requirement)
    .flatMap((clause) => clause.groupReferences ?? [])
    .filter(keep);
}
