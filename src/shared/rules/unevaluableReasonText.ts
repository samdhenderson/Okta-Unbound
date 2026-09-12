import type { RuleUnevaluableReason } from '../ruleEvaluator';

export const UNEVALUABLE_REASON_TEXT: Record<RuleUnevaluableReason, string> = {
  empty: 'This rule carries no condition expression, so there was nothing to check.',
  'too-long': 'The condition is longer than this panel will analyze.',
  'parse-error': 'The condition could not be parsed here.',
  'unsupported-operator': 'Uses an operator this panel cannot evaluate.',
  'group-membership-fn': "Needs the user's full group list, which this panel does not have.",
  'regex-unsupported-syntax':
    'Matches group names with a regular expression using syntax this panel does not implement, so it was not run.',
  'regex-too-complex':
    'The group-name regular expression is past the size this panel will run, so it was not run.',
  'unknown-fn': 'Calls a function this panel cannot evaluate.',
  'fn-arity': 'Calls a function with an unexpected number of arguments.',
  'unsupported-node': 'Uses a form of expression this panel cannot evaluate.',
  'operand-type': "A value's type does not fit the comparison, so no verdict was reached.",
  'attribute-absent':
    'Reads an attribute this user does not have, so there was nothing to compare.',
  'not-a-boolean': 'Does not resolve to true or false on its own.',
  'walk-failed': 'The condition was too deeply nested to analyze.',
};

export function unevaluableReasonText(reason: RuleUnevaluableReason | undefined): string {
  if (reason === undefined) return 'This panel could not evaluate the condition.';
  return UNEVALUABLE_REASON_TEXT[reason] ?? 'This panel could not evaluate the condition.';
}
