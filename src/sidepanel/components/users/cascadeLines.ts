import type {
  BlastRadiusReport,
  CascadeDirection,
  GroupCascadeRule,
  RuleEffect,
} from '../../../shared/membership/blastRadiusTypes';
import type { ClauseGroupMatch } from '../../../shared/rules/explainExpression';

export interface CascadeLine {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly direction: CascadeDirection;
  readonly matchedBy: ClauseGroupMatch;
  readonly targetGroupNames: readonly string[];
}

const LITERAL_MATCHES: ReadonlySet<ClauseGroupMatch> = new Set<ClauseGroupMatch>(['id', 'name']);

export function isPatternMatch(line: CascadeLine): boolean {
  return !LITERAL_MATCHES.has(line.matchedBy);
}

export function cascadeLinesByGroupId(
  report: BlastRadiusReport,
): ReadonlyMap<string, readonly CascadeLine[]> {
  if (report.cascades.length === 0) return new Map();

  const byRuleId = new Map<string, RuleEffect>(report.rules.map((rule) => [rule.ruleId, rule]));
  const resolved = new Map<string, readonly CascadeLine[]>();

  for (const cascade of report.cascades) {
    const lines = cascade.rules
      .map((rule: GroupCascadeRule): CascadeLine | undefined => {
        const effect = byRuleId.get(rule.ruleId);
        if (!effect) return undefined;
        return {
          ruleId: rule.ruleId,
          ruleName: effect.ruleName,
          direction: rule.direction,
          matchedBy: rule.matchedBy,
          targetGroupNames: effect.targetGroupNames,
        };
      })
      .filter((line): line is CascadeLine => line !== undefined);

    if (lines.length > 0) resolved.set(cascade.groupId, lines);
  }

  return resolved;
}
