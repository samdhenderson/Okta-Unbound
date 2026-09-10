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

const WORD_UNARY_OPERATORS: readonly string[] = ['not', 'NOT'];

for (const operator of WORD_UNARY_OPERATORS) {
  jsep.addUnaryOp(operator);
}

const NEGATION_OPERATORS: ReadonlySet<string> = new Set(['!', ...WORD_UNARY_OPERATORS]);

const MAX_EXPRESSION_LENGTH = 4096;

type ExprScalar = string | number | boolean | null;

type ExprValue = ExprScalar | readonly ExprScalar[];

export type RuleExprValue = ExprValue;

export type RuleUnevaluableReason =
  | 'empty'
  | 'too-long'
  | 'parse-error'
  | 'unsupported-operator'
  | 'group-membership-fn'
  | 'group-name-regex'
  | 'unknown-fn'
  | 'fn-arity'
  | 'unsupported-node'
  | 'operand-type'
  | 'attribute-absent'
  | 'not-a-boolean'
  | 'walk-failed';

export interface RuleGroupContextEntry {
  readonly id: string;
  readonly name: string;
}

export type RuleGroupContext = readonly RuleGroupContextEntry[];

export interface RuleEvaluationOptions {
  readonly user: OktaUser;
  readonly groups?: RuleGroupContext;
}

interface EvaluationWalkOptions extends RuleEvaluationOptions {
  readonly onUnresolved?: (reason: RuleUnevaluableReason) => void;
}

interface GrammarWalkOptions {
  readonly onUnsupported?: (reason: RuleUnevaluableReason) => void;
  readonly hasGroupContext?: boolean;
}

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

export const RULE_CONNECTIVE_OPERATORS: ReadonlySet<string> = new Set([
  ...AND_OPERATORS,
  ...OR_OPERATORS,
]);

export const RULE_CONJUNCTIVE_OPERATORS: ReadonlySet<string> = new Set([...AND_OPERATORS]);

export const RULE_DISJUNCTIVE_OPERATORS: ReadonlySet<string> = new Set([...OR_OPERATORS]);

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

function asInteger(value: ExprValue | undefined): number | Unresolved {
  return typeof value === 'number' && Number.isInteger(value) ? value : UNRESOLVED;
}

function asArray(value: ExprValue | undefined): readonly ExprScalar[] | Unresolved {
  return Array.isArray(value) ? value : UNRESOLVED;
}

function withTwoStrings(
  args: readonly ExprValue[],
  fn: (a: string, b: string) => EvalResult,
): EvalResult {
  const first = asString(args[0]);
  const second = asString(args[1]);
  if (isUnresolved(first) || isUnresolved(second)) return UNRESOLVED;
  return fn(first, second);
}

function withOneString(args: readonly ExprValue[], fn: (a: string) => EvalResult): EvalResult {
  const first = asString(args[0]);
  return isUnresolved(first) ? UNRESOLVED : fn(first);
}

function evaluateOverArray(
  args: readonly ExprValue[],
  fn: (items: readonly ExprScalar[]) => ExprValue,
): EvalResult {
  const items = asArray(args[0]);
  return isUnresolved(items) ? UNRESOLVED : fn(items);
}

function evaluateArraysContains(args: readonly ExprValue[]): EvalResult {
  const items = asArray(args[0]);
  if (isUnresolved(items)) return UNRESOLVED;
  const needle = args[1];
  if (Array.isArray(needle) || needle === undefined) return UNRESOLVED;
  return items.some((item) => item === needle);
}

function evaluateJoin(args: readonly ExprValue[]): EvalResult {
  const separator = asString(args[0]);
  const first = asString(args[1]);
  const second = asString(args[2]);
  if (isUnresolved(separator) || isUnresolved(first) || isUnresolved(second)) return UNRESOLVED;
  return `${first}${separator}${second}`;
}

function evaluateReplace(args: readonly ExprValue[]): EvalResult {
  const source = asString(args[0]);
  const target = asString(args[1]);
  const replacement = asString(args[2]);
  if (isUnresolved(source) || isUnresolved(target) || isUnresolved(replacement)) return UNRESOLVED;
  if (target === '') return UNRESOLVED;
  return source.split(target).join(replacement);
}

function evaluateSubstring(args: readonly ExprValue[]): EvalResult {
  const source = asString(args[0]);
  const start = asInteger(args[1]);
  const end = asInteger(args[2]);
  if (isUnresolved(source) || isUnresolved(start) || isUnresolved(end)) return UNRESOLVED;
  if (start < 0 || end > source.length || start > end) return UNRESOLVED;
  return source.slice(start, end);
}

function substringAfter(source: string, separator: string): ExprValue | Unresolved {
  const at = source.indexOf(separator);
  return at === -1 ? UNRESOLVED : source.slice(at + separator.length);
}

function substringBefore(source: string, separator: string): ExprValue | Unresolved {
  const at = source.indexOf(separator);
  return at === -1 ? UNRESOLVED : source.slice(0, at);
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
  ['String.join', { arity: 3, evaluate: (a) => evaluateJoin(a) }],
  [
    'String.removeSpaces',
    { arity: 1, evaluate: (a) => withOneString(a, (s) => s.replace(/ /g, '')) },
  ],
  ['String.replace', { arity: 3, evaluate: (a) => evaluateReplace(a) }],
  ['String.substring', { arity: 3, evaluate: (a) => evaluateSubstring(a) }],
  [
    'String.substringAfter',
    { arity: 2, evaluate: (a) => withTwoStrings(a, (s, sep) => substringAfter(s, sep)) },
  ],
  [
    'String.substringBefore',
    { arity: 2, evaluate: (a) => withTwoStrings(a, (s, sep) => substringBefore(s, sep)) },
  ],
  ['Arrays.contains', { arity: 2, evaluate: (a) => evaluateArraysContains(a) }],
  ['Arrays.size', { arity: 1, evaluate: (a) => evaluateOverArray(a, (items) => items.length) }],
  [
    'Arrays.isEmpty',
    { arity: 1, evaluate: (a) => evaluateOverArray(a, (items) => items.length === 0) },
  ],
  [
    'Arrays.toCsvString',
    { arity: 1, evaluate: (a) => evaluateOverArray(a, (items) => items.join(',')) },
  ],
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

const GROUP_NAME_REGEX_FUNCTION = 'isMemberOfGroupNameRegex';

interface GroupMembershipFunction {
  readonly matches: (group: RuleGroupContextEntry, argument: string) => boolean;
  readonly variadic: boolean;
}

const GROUP_MEMBERSHIP_IMPLEMENTATIONS: ReadonlyMap<string, GroupMembershipFunction> = new Map([
  ['isMemberOfGroup', { matches: (g, a) => g.id === a, variadic: false }],
  ['isMemberOfAnyGroup', { matches: (g, a) => g.id === a, variadic: true }],
  ['isMemberOfGroupName', { matches: (g, a) => g.name === a, variadic: false }],
  ['isMemberOfAnyGroupName', { matches: (g, a) => g.name === a, variadic: true }],
  ['isMemberOfGroupNameStartsWith', { matches: (g, a) => g.name.startsWith(a), variadic: false }],
  ['isMemberOfGroupNameContains', { matches: (g, a) => g.name.includes(a), variadic: false }],
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

const PARSE_CACHE_LIMIT = 128;

const parseCache = new Map<string, jsep.Expression | undefined>();

function rememberParse(
  expression: string,
  ast: jsep.Expression | undefined,
): jsep.Expression | undefined {
  if (parseCache.size >= PARSE_CACHE_LIMIT) {
    const oldest = parseCache.keys().next();
    if (!oldest.done) parseCache.delete(oldest.value);
  }
  parseCache.set(expression, ast);
  return ast;
}

function parseExpression(expression: string): jsep.Expression | undefined {
  if (!expression || !expression.trim()) return undefined;
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    log.debug('Rule expression rejected', { reason: 'too-long', length: expression.length });
    return undefined;
  }
  if (parseCache.has(expression)) return parseCache.get(expression);
  try {
    return rememberParse(expression, jsep(expression.trim()));
  } catch {
    log.debug('Rule expression rejected', { reason: 'parse-error' });
    return rememberParse(expression, undefined);
  }
}

function truthiness(result: EvalResult): boolean | Unresolved {
  if (isUnresolved(result) || Array.isArray(result)) return UNRESOLVED;
  return Boolean(result);
}

function giveUp(reason: RuleUnevaluableReason, options: EvaluationWalkOptions): Unresolved {
  options.onUnresolved?.(reason);
  return UNRESOLVED;
}

function giveUpLogged(reason: RuleUnevaluableReason, options: EvaluationWalkOptions): Unresolved {
  log.debug('Rule expression not evaluable', { reason });
  return giveUp(reason, options);
}

const USER_TOP_LEVEL_FIELDS: ReadonlySet<string> = new Set([
  'id',
  'status',
  'created',
  'activated',
  'statusChanged',
  'lastLogin',
  'lastUpdated',
  'passwordChanged',
]);

function asOperand(raw: unknown, options: EvaluationWalkOptions): EvalResult {
  if (raw === null) return null;
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') return raw;
  if (Array.isArray(raw)) {
    const scalars: ExprScalar[] = [];
    for (const item of raw) {
      if (item === null) {
        scalars.push(null);
      } else if (
        typeof item === 'string' ||
        typeof item === 'number' ||
        typeof item === 'boolean'
      ) {
        scalars.push(item);
      } else {
        return giveUp('operand-type', options);
      }
    }
    return scalars;
  }
  return giveUp('operand-type', options);
}

function resolveMember(node: jsep.MemberExpression, options: EvaluationWalkOptions): EvalResult {
  if (node.computed) return giveUp('unsupported-node', options);
  const { object, property } = node;
  if (!isIdentifier(object) || object.name !== 'user') return giveUp('unsupported-node', options);
  if (!isIdentifier(property)) return giveUp('unsupported-node', options);

  const profile = options.user.profile as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(profile, property.name)) {
    return asOperand(profile[property.name], options);
  }
  if (USER_TOP_LEVEL_FIELDS.has(property.name)) {
    const raw = (options.user as unknown as Record<string, unknown>)[property.name];
    if (raw === undefined) return giveUp('attribute-absent', options);
    return asOperand(raw, options);
  }
  return giveUp('attribute-absent', options);
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

function evaluateRelational(
  operator: string,
  left: EvalResult,
  right: EvalResult,
  options: EvaluationWalkOptions,
): EvalResult {
  if (typeof left !== 'number' || typeof right !== 'number') {
    return giveUp('operand-type', options);
  }
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
      return giveUp('unsupported-operator', options);
  }
}

function evaluateBinary(node: jsep.BinaryExpression, options: EvaluationWalkOptions): EvalResult {
  const { operator } = node;
  const left = evaluateNode(node.left, options);
  const right = evaluateNode(node.right, options);

  if (AND_OPERATORS.has(operator)) return evaluateAnd(left, right);
  if (OR_OPERATORS.has(operator)) return evaluateOr(left, right);

  if (isUnresolved(left) || isUnresolved(right)) return UNRESOLVED;

  if (Array.isArray(left) || Array.isArray(right)) return giveUp('operand-type', options);

  if (EQUALITY_OPERATORS.has(operator)) return left === right;
  if (INEQUALITY_OPERATORS.has(operator)) return left !== right;
  if (RELATIONAL_OPERATORS.has(operator)) {
    return evaluateRelational(operator, left, right, options);
  }

  return giveUpLogged('unsupported-operator', options);
}

function evaluateGroupMembershipCall(
  node: jsep.CallExpression,
  name: string,
  options: EvaluationWalkOptions,
): EvalResult {
  if (name === GROUP_NAME_REGEX_FUNCTION) return giveUpLogged('group-name-regex', options);

  const { groups } = options;
  if (!groups) return giveUpLogged('group-membership-fn', options);

  const fn = GROUP_MEMBERSHIP_IMPLEMENTATIONS.get(name);
  if (!fn) return giveUpLogged('group-membership-fn', options);

  const wrongArity = fn.variadic ? node.arguments.length < 1 : node.arguments.length !== 1;
  if (wrongArity) return giveUpLogged('fn-arity', options);

  const targets: string[] = [];
  for (const argument of node.arguments) {
    const value = evaluateNode(argument, options);
    if (isUnresolved(value)) return UNRESOLVED;
    if (typeof value !== 'string') return giveUp('operand-type', options);
    targets.push(value);
  }

  return targets.some((target) => groups.some((group) => fn.matches(group, target)));
}

function evaluateCall(node: jsep.CallExpression, options: EvaluationWalkOptions): EvalResult {
  const name = calleeName(node);
  const fn = name ? SUPPORTED_FUNCTIONS.get(name) : undefined;
  if (!name || !fn) {
    if (name && GROUP_MEMBERSHIP_FUNCTIONS.has(name)) {
      return evaluateGroupMembershipCall(node, name, options);
    }
    return giveUpLogged('unknown-fn', options);
  }
  if (node.arguments.length !== fn.arity) {
    return giveUpLogged('fn-arity', options);
  }

  const args: ExprValue[] = [];
  for (const argument of node.arguments) {
    const value = evaluateNode(argument, options);
    if (isUnresolved(value)) return UNRESOLVED;
    args.push(value);
  }
  const result = fn.evaluate(args);
  return isUnresolved(result) ? giveUp('operand-type', options) : result;
}

function evaluateNode(node: jsep.Expression, options: EvaluationWalkOptions): EvalResult {
  if (isLiteral(node)) {
    const { value } = node;
    if (value === null) return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    return giveUp('unsupported-node', options); // e.g. a regular-expression literal
  }
  if (isMemberExpression(node)) return resolveMember(node, options);
  if (isCallExpression(node)) return evaluateCall(node, options);
  if (isBinaryExpression(node)) return evaluateBinary(node, options);
  if (isUnaryExpression(node)) {
    if (!NEGATION_OPERATORS.has(node.operator)) return giveUp('unsupported-node', options);
    const argument = truthiness(evaluateNode(node.argument, options));
    return isUnresolved(argument) ? UNRESOLVED : !argument;
  }
  return giveUpLogged('unsupported-node', options);
}

function evaluateAst(ast: jsep.Expression, options: EvaluationWalkOptions): EvalResult {
  try {
    return evaluateNode(ast, options);
  } catch {
    return giveUpLogged('walk-failed', options);
  }
}

export type RuleMatchOutcome = 'match' | 'no-match' | 'unevaluable';

export function tryEvaluateRuleExpression(
  expression: string,
  user: OktaUser,
  groups?: RuleGroupContext,
): RuleMatchOutcome {
  const ast = parseExpression(expression);
  if (!ast) return 'unevaluable';

  if (!canEvaluateAst(ast, { hasGroupContext: groups !== undefined })) return 'unevaluable';

  const result = evaluateAst(ast, { user, groups });
  if (typeof result !== 'boolean') return 'unevaluable';
  return result ? 'match' : 'no-match';
}

function reject(reason: RuleUnevaluableReason, options: GrammarWalkOptions): false {
  options.onUnsupported?.(reason);
  return false;
}

function isSupportedNode(node: jsep.Expression, options: GrammarWalkOptions = {}): boolean {
  if (isLiteral(node)) {
    const { value } = node;
    const supported =
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean';
    return supported || reject('unsupported-node', options);
  }
  if (isMemberExpression(node)) {
    const supported =
      !node.computed &&
      isIdentifier(node.object) &&
      node.object.name === 'user' &&
      isIdentifier(node.property);
    return supported || reject('unsupported-node', options);
  }
  if (isCallExpression(node)) {
    const name = calleeName(node);
    const fn = name ? SUPPORTED_FUNCTIONS.get(name) : undefined;
    if (!fn) {
      if (!name || !GROUP_MEMBERSHIP_FUNCTIONS.has(name)) return reject('unknown-fn', options);
      if (name === GROUP_NAME_REGEX_FUNCTION) return reject('group-name-regex', options);
      if (!options.hasGroupContext) return reject('group-membership-fn', options);
      const membershipFn = GROUP_MEMBERSHIP_IMPLEMENTATIONS.get(name);
      if (!membershipFn) return reject('group-membership-fn', options);
      const wrongArity = membershipFn.variadic
        ? node.arguments.length < 1
        : node.arguments.length !== 1;
      if (wrongArity) return reject('fn-arity', options);
      return node.arguments.every((argument) => isSupportedNode(argument, options));
    }
    if (node.arguments.length !== fn.arity) return reject('fn-arity', options);
    return node.arguments.every((argument) => isSupportedNode(argument, options));
  }
  if (isUnaryExpression(node)) {
    if (!NEGATION_OPERATORS.has(node.operator)) return reject('unsupported-node', options);
    return isSupportedNode(node.argument, options);
  }
  if (isBinaryExpression(node)) {
    if (!SUPPORTED_BINARY_OPERATORS.has(node.operator)) {
      return reject('unsupported-operator', options);
    }
    return isSupportedNode(node.left, options) && isSupportedNode(node.right, options);
  }
  return reject('unsupported-node', options);
}

function canEvaluateAst(ast: jsep.Expression, options: GrammarWalkOptions = {}): boolean {
  try {
    return isSupportedNode(ast, options);
  } catch {
    return reject('walk-failed', options);
  }
}

export type ParsedRuleExpression =
  | {
      readonly ok: true;
      readonly ast: jsep.Expression;
    }
  | {
      readonly ok: false;
      readonly reasonCode: Extract<RuleUnevaluableReason, 'empty' | 'too-long' | 'parse-error'>;
    };

export function parseRuleExpression(expression: string): ParsedRuleExpression {
  const ast = parseExpression(expression);
  if (ast) return { ok: true, ast };
  if (!expression || !expression.trim()) return { ok: false, reasonCode: 'empty' };
  if (expression.length > MAX_EXPRESSION_LENGTH) return { ok: false, reasonCode: 'too-long' };
  return { ok: false, reasonCode: 'parse-error' };
}

export type RuleNodeSupport =
  | { readonly supported: true }
  | { readonly supported: false; readonly reasonCode: RuleUnevaluableReason };

export function checkRuleNodeSupport(
  node: jsep.Expression,
  options: { readonly hasGroupContext?: boolean } = {},
): RuleNodeSupport {
  let reasonCode: RuleUnevaluableReason | undefined;
  const supported = canEvaluateAst(node, {
    hasGroupContext: options.hasGroupContext,
    onUnsupported: (reason) => {
      reasonCode ??= reason;
    },
  });
  return supported
    ? { supported: true }
    : { supported: false, reasonCode: reasonCode ?? 'walk-failed' };
}

export type RuleNodeEvaluation =
  | { readonly resolved: true; readonly value: RuleExprValue }
  | { readonly resolved: false; readonly reasonCode: RuleUnevaluableReason };

export function evaluateRuleNode(
  node: jsep.Expression,
  options: RuleEvaluationOptions,
): RuleNodeEvaluation {
  let reasonCode: RuleUnevaluableReason | undefined;
  const result = evaluateAst(node, {
    ...options,
    onUnresolved: (reason) => {
      reasonCode ??= reason;
    },
  });
  return isUnresolved(result)
    ? { resolved: false, reasonCode: reasonCode ?? 'operand-type' }
    : { resolved: true, value: result };
}

export type RuleMatchResult =
  | { readonly outcome: 'match' }
  | { readonly outcome: 'no-match' }
  | { readonly outcome: 'unevaluable'; readonly reasonCode: RuleUnevaluableReason };

export function evaluateParsedRule(
  ast: jsep.Expression,
  options: RuleEvaluationOptions,
): RuleMatchResult {
  const support = checkRuleNodeSupport(ast, { hasGroupContext: options.groups !== undefined });
  if (!support.supported) return { outcome: 'unevaluable', reasonCode: support.reasonCode };

  const evaluation = evaluateRuleNode(ast, options);
  if (!evaluation.resolved) {
    return { outcome: 'unevaluable', reasonCode: evaluation.reasonCode };
  }
  if (typeof evaluation.value !== 'boolean') {
    return { outcome: 'unevaluable', reasonCode: 'not-a-boolean' };
  }
  return { outcome: evaluation.value ? 'match' : 'no-match' };
}

export function tryEvaluateRuleExpressionDetailed(
  expression: string,
  user: OktaUser,
  groups?: RuleGroupContext,
): RuleMatchResult {
  const parsed = parseRuleExpression(expression);
  if (!parsed.ok) return { outcome: 'unevaluable', reasonCode: parsed.reasonCode };
  return evaluateParsedRule(parsed.ast, { user, groups });
}
