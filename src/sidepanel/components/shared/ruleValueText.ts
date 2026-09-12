import type { RuleExprValue } from '../../../shared/ruleEvaluator';

export function formatRuleValue(value: RuleExprValue): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return value.map(formatRuleValue).join(', ');
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}
