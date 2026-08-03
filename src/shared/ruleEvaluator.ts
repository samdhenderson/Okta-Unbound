import jsep from 'jsep';
import { createLogger } from './utils/logger';
import type { OktaUser } from './types';

const log = createLogger('RuleEvaluator');

const WORD_BINARY_OPERATORS: ReadonlyArray<readonly [string, number]> = [
  ['or', 1],
  ['OR', 1],
  ['and', 2],
  ['AND', 2],
  ['eq', 6],
  ['ne', 6],
];

for (const [operator, precedence] of WORD_BINARY_OPERATORS) {
  jsep.addBinaryOp(operator, precedence);
}

const MAX_EXPRESSION_LENGTH = 4096;

type ExprValue = string | number | boolean | null;

const UNRESOLVED: unique symbol = Symbol('unresolved');
type Unresolved = typeof UNRESOLVED;

type EvalResult = ExprValue | Unresolved;

function isUnresolved(result: EvalResult): result is Unresolved {
  return result === UNRESOLVED;
}

const EQUALITY_OPERATORS = new Set(['==', '===', 'eq']);
const INEQUALITY_OPERATORS = new Set(['!=', '!==', 'ne']);
const RELATIONAL_OPERATORS = new Set(['<', '>', '<=', '>=']);
const AND_OPERATORS = new Set(['&&', 'and', 'AND']);
const OR_OPERATORS = new Set(['||', 'or', 'OR']);

const SUPPORTED_BINARY_OPERATORS: ReadonlySet<string> = new Set([
  ...EQUALITY_OPERATORS,
  ...INEQUALITY_OPERATORS,
  ...RELATIONAL_OPERATORS,
  ...AND_OPERATORS,
  ...OR_OPERATORS,
]);

interface SupportedFunction {
  arity: number;
  evaluate: (args: readonly ExprValue[]) => EvalResult;
}

function asString(value: ExprValue | undefined): string | Unresolved {
  return typeof value === 'string' ? value : UNRESOLVED;
}

function withTwoStrings(
  args: readonly ExprValue[],
  fn: (a: string, b: string) => ExprValue,
): EvalResult {
  const first = asString(args[0]);
  const second = asString(args[1]);
  if (isUnresolved(first) || isUnresolved(second)) return UNRESOLVED;
  return fn(first, second);
}

function withOneString(args: readonly ExprValue[], fn: (a: string) => ExprValue): EvalResult {
  const first = asString(args[0]);
  return isUnresolved(first) ? UNRESOLVED : fn(first);
}

export const SUPPORTED_FUNCTIONS: ReadonlyMap<string, SupportedFunction> = new Map<
  string,
  SupportedFunction
>([
  ['String.toUpperCase', { arity: 1, evaluate: (a) => withOneString(a, (s) => s.toUpperCase()) }],
  ['String.toLowerCase', { arity: 1, evaluate: (a) => withOneString(a, (s) => s.toLowerCase()) }],
  ['String.len', { arity: 1, evaluate: (a) => withOneString(a, (s) => s.length) }],
  [
    'String.stringContains',
    { arity: 2, evaluate: (a) => withTwoStrings(a, (s, search) => s.includes(search)) },
  ],
  [
    'String.startsWith',
    { arity: 2, evaluate: (a) => withTwoStrings(a, (s, prefix) => s.startsWith(prefix)) },
  ],
  [
    'String.endsWith',
    { arity: 2, evaluate: (a) => withTwoStrings(a, (s, suffix) => s.endsWith(suffix)) },
  ],
  ['String.append', { arity: 2, evaluate: (a) => withTwoStrings(a, (s, suffix) => s + suffix) }],
]);

export const GROUP_MEMBERSHIP_FUNCTIONS: ReadonlySet<string> = new Set([
  'isMemberOfGroup',
  'isMemberOfGroupName',
  'isMemberOfAnyGroup',
  'isMemberOfAnyGroupName',
  'isMemberOfGroupNameStartsWith',
  'isMemberOfGroupNameContains',
  'isMemberOfGroupNameRegex',
]);

function isLiteral(node: jsep.Expression): node is jsep.Literal {
  return node.type === 'Literal';
}

function isIdentifier(node: jsep.Expression): node is jsep.Identifier {
  return node.type === 'Identifier';
}

function isMemberExpression(node: jsep.Expression): node is jsep.MemberExpression {
  return node.type === 'MemberExpression';
}

function isCallExpression(node: jsep.Expression): node is jsep.CallExpression {
  return node.type === 'CallExpression';
}

function isUnaryExpression(node: jsep.Expression): node is jsep.UnaryExpression {
  return node.type === 'UnaryExpression';
}

function isBinaryExpression(node: jsep.Expression): node is jsep.BinaryExpression {
  return node.type === 'BinaryExpression';
}

function calleeName(node: jsep.CallExpression): string | undefined {
  const callee = node.callee;
  if (isIdentifier(callee)) return callee.name;
  if (isMemberExpression(callee) && !callee.computed) {
    const { object, property } = callee;
    if (isIdentifier(object) && isIdentifier(property)) return `${object.name}.${property.name}`;
  }
  return undefined;
}

function parseExpression(expression: string): jsep.Expression | undefined {
  if (!expression || !expression.trim()) return undefined;
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    log.debug('Rule expression rejected', { reason: 'too-long', length: expression.length });
    return undefined;
  }
  try {
    return jsep(expression.trim());
  } catch {
    log.debug('Rule expression rejected', { reason: 'parse-error' });
    return undefined;
  }
}

function truthiness(result: EvalResult): boolean | Unresolved {
  return isUnresolved(result) ? UNRESOLVED : Boolean(result);
}

function resolveMember(node: jsep.MemberExpression, user: OktaUser): EvalResult {
  if (node.computed) return UNRESOLVED;
  const { object, property } = node;
  if (!isIdentifier(object) || object.name !== 'user') return UNRESOLVED;
  if (!isIdentifier(property)) return UNRESOLVED;

  const raw = (user.profile as Record<string, unknown>)[property.name];
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') return raw;
  return String(raw);
}

function evaluateAnd(left: EvalResult, right: EvalResult): EvalResult {
  const a = truthiness(left);
  const b = truthiness(right);
  if (a === false || b === false) return false;
  if (isUnresolved(a) || isUnresolved(b)) return UNRESOLVED;
  return true;
}

function evaluateOr(left: EvalResult, right: EvalResult): EvalResult {
  const a = truthiness(left);
  const b = truthiness(right);
  if (a === true || b === true) return true;
  if (isUnresolved(a) || isUnresolved(b)) return UNRESOLVED;
  return false;
}

function evaluateRelational(operator: string, left: EvalResult, right: EvalResult): EvalResult {
  if (typeof left !== 'number' || typeof right !== 'number') return UNRESOLVED;
  switch (operator) {
    case '<':
      return left < right;
    case '>':
      return left > right;
    case '<=':
      return left <= right;
    case '>=':
      return left >= right;
    default:
      return UNRESOLVED;
  }
}

function evaluateBinary(node: jsep.BinaryExpression, user: OktaUser): EvalResult {
  const { operator } = node;
  const left = evaluateNode(node.left, user);
  const right = evaluateNode(node.right, user);

  if (AND_OPERATORS.has(operator)) return evaluateAnd(left, right);
  if (OR_OPERATORS.has(operator)) return evaluateOr(left, right);

  if (isUnresolved(left) || isUnresolved(right)) return UNRESOLVED;

  if (EQUALITY_OPERATORS.has(operator)) return left === right;
  if (INEQUALITY_OPERATORS.has(operator)) return left !== right;
  if (RELATIONAL_OPERATORS.has(operator)) return evaluateRelational(operator, left, right);

  log.debug('Rule expression not evaluable', { reason: 'unsupported-operator' });
  return UNRESOLVED;
}

function evaluateCall(node: jsep.CallExpression, user: OktaUser): EvalResult {
  const name = calleeName(node);
  const fn = name ? SUPPORTED_FUNCTIONS.get(name) : undefined;
  if (!name || !fn) {
    log.debug('Rule expression not evaluable', {
      reason: name && GROUP_MEMBERSHIP_FUNCTIONS.has(name) ? 'group-membership-fn' : 'unknown-fn',
    });
    return UNRESOLVED;
  }
  if (node.arguments.length !== fn.arity) {
    log.debug('Rule expression not evaluable', { reason: 'fn-arity' });
    return UNRESOLVED;
  }

  const args: ExprValue[] = [];
  for (const argument of node.arguments) {
    const value = evaluateNode(argument, user);
    if (isUnresolved(value)) return UNRESOLVED;
    args.push(value);
  }
  return fn.evaluate(args);
}

function evaluateNode(node: jsep.Expression, user: OktaUser): EvalResult {
  if (isLiteral(node)) {
    const { value } = node;
    if (value === null) return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    return UNRESOLVED; // e.g. a regular-expression literal
  }
  if (isMemberExpression(node)) return resolveMember(node, user);
  if (isCallExpression(node)) return evaluateCall(node, user);
  if (isBinaryExpression(node)) return evaluateBinary(node, user);
  if (isUnaryExpression(node)) {
    if (node.operator !== '!') return UNRESOLVED;
    const argument = truthiness(evaluateNode(node.argument, user));
    return isUnresolved(argument) ? UNRESOLVED : !argument;
  }
  log.debug('Rule expression not evaluable', { reason: 'unsupported-node' });
  return UNRESOLVED;
}

function evaluate(expression: string, user: OktaUser): EvalResult {
  const ast = parseExpression(expression);
  if (!ast) return UNRESOLVED;
  try {
    return evaluateNode(ast, user);
  } catch {
    log.debug('Rule expression not evaluable', { reason: 'walk-failed' });
    return UNRESOLVED;
  }
}

export type RuleMatchOutcome = 'match' | 'no-match' | 'unevaluable';

export function tryEvaluateRuleExpression(expression: string, user: OktaUser): RuleMatchOutcome {
  if (!canEvaluateClientSide(expression)) return 'unevaluable';

  const result = evaluate(expression, user);
  if (typeof result !== 'boolean') return 'unevaluable';
  return result ? 'match' : 'no-match';
}

export function evaluateRuleExpression(expression: string, user: OktaUser): boolean {
  const result = evaluate(expression, user);
  return isUnresolved(result) ? false : Boolean(result);
}

function isSupportedNode(node: jsep.Expression): boolean {
  if (isLiteral(node)) {
    const { value } = node;
    return (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  }
  if (isMemberExpression(node)) {
    return (
      !node.computed &&
      isIdentifier(node.object) &&
      node.object.name === 'user' &&
      isIdentifier(node.property)
    );
  }
  if (isCallExpression(node)) {
    const name = calleeName(node);
    const fn = name ? SUPPORTED_FUNCTIONS.get(name) : undefined;
    if (!fn || node.arguments.length !== fn.arity) return false;
    return node.arguments.every(isSupportedNode);
  }
  if (isUnaryExpression(node)) {
    return node.operator === '!' && isSupportedNode(node.argument);
  }
  if (isBinaryExpression(node)) {
    return (
      SUPPORTED_BINARY_OPERATORS.has(node.operator) &&
      isSupportedNode(node.left) &&
      isSupportedNode(node.right)
    );
  }
  return false;
}

export function canEvaluateClientSide(expression: string): boolean {
  const ast = parseExpression(expression);
  if (!ast) return false;
  try {
    return isSupportedNode(ast);
  } catch {
    return false;
  }
}
