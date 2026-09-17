import { tryEvaluateRuleExpressionDetailed, type RuleUnevaluableReason } from '../ruleEvaluator';
import { conditionExpressionOf } from './ruleExpression';
import { draftedUser } from './blastRadius';
import type { RuleInventoryState } from './blastRadiusTypes';
import type { MembershipRule, OktaUser } from '../types';

export interface CohortRuleFlip {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly transition: 'starts-matching' | 'stops-matching';
  readonly userCount: number;
  readonly targetGroupIds: readonly string[];
}

export interface CohortRuleUndetermined {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly reason: RuleUnevaluableReason;
  readonly userCount: number;
  readonly targetGroupIds: readonly string[];
}

export type CohortRuleImpact =
  | {
      readonly status: 'not-computed';
      readonly reason: 'rules-unresolved' | 'rules-unavailable';
    }
  | {
      readonly status: 'computed';
      readonly flips: readonly CohortRuleFlip[];
      readonly undetermined: readonly CohortRuleUndetermined[];
    };

export interface CohortRuleImpactInput {
  readonly attributeName: string;
  readonly newValue: unknown;
  readonly targets: readonly OktaUser[];
  readonly rules: RuleInventoryState;
}

function excludedUserIdsOf(rule: MembershipRule): ReadonlySet<string> {
  const formatted = rule.excludedUserIds ?? [];
  const raw = rule.conditions?.people?.users?.exclude ?? [];
  return new Set([...formatted, ...raw]);
}

function needsGroupContext(rule: MembershipRule): boolean {
  const formatted = rule.excludedGroupIds ?? [];
  const raw = rule.conditions?.people?.groups?.exclude ?? [];
  return formatted.length > 0 || raw.length > 0;
}

function targetGroupIdsOf(rule: MembershipRule): readonly string[] {
  return rule.groupIds ?? rule.actions?.assignUserToGroups?.groupIds ?? [];
}

export function analyzeCohortRuleImpact(input: CohortRuleImpactInput): CohortRuleImpact {
  const { attributeName, newValue, targets, rules } = input;

  if (rules.status === 'unresolved') return { status: 'not-computed', reason: 'rules-unresolved' };
  if (rules.status === 'unavailable')
    return { status: 'not-computed', reason: 'rules-unavailable' };

  const candidates = rules.rules.filter(
    (rule) => rule.status === 'ACTIVE' && (rule.userAttributes ?? []).includes(attributeName),
  );

  const flips: CohortRuleFlip[] = [];
  const undetermined: CohortRuleUndetermined[] = [];
  const draft = { [attributeName]: newValue };

  for (const rule of candidates) {
    const expression = conditionExpressionOf(rule);
    const excluded = excludedUserIdsOf(rule);
    const targetGroupIds = targetGroupIdsOf(rule);
    const groupGated = needsGroupContext(rule);

    let starts = 0;
    let stops = 0;
    let unknown = 0;
    let reason: RuleUnevaluableReason | undefined;

    for (const user of targets) {
      if (excluded.has(user.id)) continue;

      if (groupGated) {
        unknown += 1;
        reason ??= 'group-membership-fn';
        continue;
      }

      const before = tryEvaluateRuleExpressionDetailed(expression, user);
      const after = tryEvaluateRuleExpressionDetailed(expression, draftedUser(user, draft));

      if (before.outcome === 'unevaluable' || after.outcome === 'unevaluable') {
        unknown += 1;
        reason ??=
          before.outcome === 'unevaluable'
            ? before.reasonCode
            : (after as { reasonCode: RuleUnevaluableReason }).reasonCode;
        continue;
      }
      if (before.outcome === after.outcome) continue;
      if (after.outcome === 'match') starts += 1;
      else stops += 1;
    }

    if (starts > 0) {
      flips.push({
        ruleId: rule.id,
        ruleName: rule.name,
        transition: 'starts-matching',
        userCount: starts,
        targetGroupIds,
      });
    }
    if (stops > 0) {
      flips.push({
        ruleId: rule.id,
        ruleName: rule.name,
        transition: 'stops-matching',
        userCount: stops,
        targetGroupIds,
      });
    }
    if (unknown > 0 && reason !== undefined) {
      undetermined.push({
        ruleId: rule.id,
        ruleName: rule.name,
        reason,
        userCount: unknown,
        targetGroupIds,
      });
    }
  }

  flips.sort((a, b) => b.userCount - a.userCount || a.ruleName.localeCompare(b.ruleName));
  undetermined.sort((a, b) => b.userCount - a.userCount || a.ruleName.localeCompare(b.ruleName));

  return { status: 'computed', flips, undetermined };
}
