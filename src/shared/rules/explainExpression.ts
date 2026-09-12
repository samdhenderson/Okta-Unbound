import type jsep from 'jsep';
import {
  RULE_CONJUNCTIVE_OPERATORS,
  RULE_DISJUNCTIVE_OPERATORS,
  RULE_NEGATION_OPERATORS,
  checkRuleNodeSupport,
  evaluateParsedRule,
  evaluateRuleNode,
  parseRuleExpression,
  type RuleExprValue,
  type RuleGroupContext,
  type RuleGroupContextEntry,
  type RuleMatchResult,
  type RuleNodeEvaluation,
  type RuleUnevaluableReason,
} from '../ruleEvaluator';
import { compileSafeRegex, matchCompiled } from './safeRegex';
import type { OktaUser } from '../types';

export const DEFAULT_MAX_CLAUSES = 64;

export type ClauseStatus = 'pass' | 'fail' | 'not-evaluated';

export type ClauseGroupMatch = 'id' | 'name' | 'nameStartsWith' | 'nameContains' | 'nameRegex';

export type ClauseGroupRequirement = 'member' | 'non-member';

export interface ClauseGroupReference {
  readonly match: ClauseGroupMatch;
  readonly value: string;
  readonly satisfied: boolean;
  readonly matchedGroupName?: string;
}

export const ATTRIBUTE_ABSENT: unique symbol = Symbol('attribute-absent');

export interface AttributeRead {
  readonly path: string;
  readonly value: RuleExprValue | typeof ATTRIBUTE_ABSENT;
}

export type SubjectTransform =
  'toLowerCase' | 'toUpperCase' | 'removeSpaces' | 'len' | 'size' | 'toCsvString';

export interface SubjectDescription {
  readonly path: string;
  readonly transforms: readonly SubjectTransform[];
}

export type ComparisonOperator = 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';

export type LeafPredicate =
  | {
      readonly form: 'compare';
      readonly subject: SubjectDescription;
      readonly operator: ComparisonOperator;
      readonly operand: RuleExprValue;
    }
  | {
      readonly form: 'compare-subjects';
      readonly left: SubjectDescription;
      readonly operator: ComparisonOperator;
      readonly right: SubjectDescription;
    }
  | {
      readonly form: 'contains' | 'starts-with' | 'ends-with';
      readonly subject: SubjectDescription;
      readonly operand: string;
      readonly negated: boolean;
    }
  | {
      readonly form: 'array-contains';
      readonly subject: SubjectDescription;
      readonly operand: RuleExprValue;
      readonly negated: boolean;
    }
  | { readonly form: 'empty'; readonly subject: SubjectDescription; readonly negated: boolean }
  | {
      readonly form: 'boolean-attribute';
      readonly subject: SubjectDescription;
      readonly negated: boolean;
    };

export interface LeafClauseNode {
  readonly node: 'leaf';
  readonly expressionText: string;
  readonly resolvedValue: RuleExprValue | undefined;
  readonly status: ClauseStatus;
  readonly reasonCode?: RuleUnevaluableReason;
  readonly groupReferences?: readonly ClauseGroupReference[];
  readonly groupRequirement?: ClauseGroupRequirement;
  readonly reads: readonly AttributeRead[];
  readonly predicate?: LeafPredicate;
}

export type ClauseConnectiveKind = 'and' | 'or';

export type ClauseTruncation = 'depth' | 'clause-cap';

export interface ConnectiveNode {
  readonly node: 'connective';
  readonly kind: ClauseConnectiveKind;
  readonly children: readonly ClauseTreeNode[];
  readonly verdict: ClauseStatus;
  readonly decidedByChildIndices: readonly number[];
  readonly undecidedChildCount: number;
  readonly depth: number;
  readonly truncation?: ClauseTruncation;
}

export type ClauseTreeNode = ConnectiveNode | LeafClauseNode;

export const MAX_TREE_DEPTH = 8;

export interface RuleExplanationSummary {
  readonly totalClauses: number;
  readonly evaluatedClauses: number;
  readonly passedClauses: number;
  readonly failedClauses: number;
  readonly notEvaluatedClauses: number;
  readonly needsGroupContext: number;
  readonly result: RuleMatchResult;
  readonly truncated: boolean;
}

export interface RuleExplanation {
  readonly tree: ClauseTreeNode;
  readonly summary: RuleExplanationSummary;
}

export interface ExplainRuleOptions {
  readonly maxClauses?: number;
  readonly groups?: RuleGroupContext;
}

function asLiteral(node: jsep.Expression): jsep.Literal | undefined {
  return node.type === 'Literal' ? (node as jsep.Literal) : undefined;
}

function asIdentifier(node: jsep.Expression): jsep.Identifier | undefined {
  return node.type === 'Identifier' ? (node as jsep.Identifier) : undefined;
}

function asMemberExpression(node: jsep.Expression): jsep.MemberExpression | undefined {
  return node.type === 'MemberExpression' ? (node as jsep.MemberExpression) : undefined;
}

function asCallExpression(node: jsep.Expression): jsep.CallExpression | undefined {
  return node.type === 'CallExpression' ? (node as jsep.CallExpression) : undefined;
}

function asUnaryExpression(node: jsep.Expression): jsep.UnaryExpression | undefined {
  return node.type === 'UnaryExpression' ? (node as jsep.UnaryExpression) : undefined;
}

function asBinaryExpression(node: jsep.Expression): jsep.BinaryExpression | undefined {
  return node.type === 'BinaryExpression' ? (node as jsep.BinaryExpression) : undefined;
}

function asCompound(node: jsep.Expression): jsep.Compound | undefined {
  return node.type === 'Compound' ? (node as jsep.Compound) : undefined;
}

function asArrayExpression(node: jsep.Expression): jsep.ArrayExpression | undefined {
  return node.type === 'ArrayExpression' ? (node as jsep.ArrayExpression) : undefined;
}

function asConditionalExpression(node: jsep.Expression): jsep.ConditionalExpression | undefined {
  return node.type === 'ConditionalExpression' ? (node as jsep.ConditionalExpression) : undefined;
}

const UNPRINTABLE_NODE = '[unsupported expression]';

function stringifyNode(node: jsep.Expression): string {
  const literal = asLiteral(node);
  if (literal) return typeof literal.raw === 'string' ? literal.raw : String(literal.value);

  const identifier = asIdentifier(node);
  if (identifier) return identifier.name;

  const member = asMemberExpression(node);
  if (member) {
    const object = stringifyNode(member.object);
    return member.computed
      ? `${object}[${stringifyNode(member.property)}]`
      : `${object}.${stringifyNode(member.property)}`;
  }

  const call = asCallExpression(node);
  if (call) {
    const args = call.arguments.map(stringifyNode).join(', ');
    return `${stringifyNode(call.callee)}(${args})`;
  }

  const unary = asUnaryExpression(node);
  if (unary) return `${unary.operator}${stringifyOperand(unary.argument)}`;

  const binary = asBinaryExpression(node);
  if (binary) {
    return `${stringifyOperand(binary.left)} ${binary.operator} ${stringifyOperand(binary.right)}`;
  }

  const compound = asCompound(node);
  if (compound) return compound.body.map(stringifyNode).join(' ');

  const array = asArrayExpression(node);
  if (array) {
    return `[${array.elements.map((el) => (el ? stringifyNode(el) : '')).join(', ')}]`;
  }

  const conditional = asConditionalExpression(node);
  if (conditional) {
    return `${stringifyOperand(conditional.test)} ? ${stringifyOperand(conditional.consequent)} : ${stringifyOperand(conditional.alternate)}`;
  }

  if (node.type === 'ThisExpression') return 'this';
  return UNPRINTABLE_NODE;
}

function stringifyOperand(node: jsep.Expression): string {
  const text = stringifyNode(node);
  return asBinaryExpression(node) ? `(${text})` : text;
}

type ClauseCore = Omit<LeafClauseNode, 'node' | 'reads'>;

interface ExplainContext {
  readonly user: OktaUser;
  readonly groups: RuleGroupContext | undefined;
  readonly clauseCache: WeakMap<jsep.Expression, ClauseCore>;
  readonly valueCache: WeakMap<jsep.Expression, RuleNodeEvaluation>;
}

function evaluateNodeValue(node: jsep.Expression, ctx: ExplainContext): RuleNodeEvaluation {
  const cached = ctx.valueCache.get(node);
  if (cached) return cached;
  const evaluation = evaluateRuleNode(node, { user: ctx.user });
  ctx.valueCache.set(node, evaluation);
  return evaluation;
}

interface ClauseCollection {
  readonly nodes: jsep.Expression[];
  truncated: boolean;
}

function collectClauseNodes(
  node: jsep.Expression,
  collection: ClauseCollection,
  limit: number,
): void {
  const binary = asBinaryExpression(node);
  if (binary && RULE_CONJUNCTIVE_OPERATORS.has(binary.operator)) {
    collectClauseNodes(binary.left, collection, limit);
    collectClauseNodes(binary.right, collection, limit);
    return;
  }
  if (collection.nodes.length >= limit) {
    collection.truncated = true;
    return;
  }
  collection.nodes.push(node);
}

function operandsOf(node: jsep.Expression): readonly jsep.Expression[] {
  const binary = asBinaryExpression(node);
  if (binary) return [binary.left, binary.right];

  const unary = asUnaryExpression(node);
  if (unary) return operandsOf(unary.argument);

  const call = asCallExpression(node);
  if (call) return call.arguments;

  return [node];
}

function resolveClauseValue(node: jsep.Expression, ctx: ExplainContext): RuleExprValue | undefined {
  for (const operand of operandsOf(node)) {
    if (asLiteral(operand)) continue;
    const evaluation = evaluateNodeValue(operand, ctx);
    if (evaluation.resolved) return evaluation.value;
  }
  return undefined;
}

const GROUP_MATCH_BY_FUNCTION = new Map<string, ClauseGroupMatch>([
  ['isMemberOfGroup', 'id'],
  ['isMemberOfAnyGroup', 'id'],
  ['isMemberOfGroupName', 'name'],
  ['isMemberOfAnyGroupName', 'name'],
  ['isMemberOfGroupNameStartsWith', 'nameStartsWith'],
  ['isMemberOfGroupNameContains', 'nameContains'],
  ['isMemberOfGroupNameRegex', 'nameRegex'],
]);

type ReferenceResolution =
  | { readonly kind: 'resolved'; readonly matched?: RuleGroupContextEntry }
  | { readonly kind: 'declined' };

function findMatchingGroup(
  match: ClauseGroupMatch,
  value: string,
  groups: RuleGroupContext,
): ReferenceResolution {
  if (match === 'nameRegex') return findMatchingGroupByRegex(value, groups);
  const matched = groups.find((group) => {
    switch (match) {
      case 'id':
        return group.id === value;
      case 'name':
        return group.name === value;
      case 'nameStartsWith':
        return group.name.startsWith(value);
      case 'nameContains':
        return group.name.includes(value);
    }
  });
  return { kind: 'resolved', ...(matched ? { matched } : {}) };
}

function findMatchingGroupByRegex(pattern: string, groups: RuleGroupContext): ReferenceResolution {
  const program = compileSafeRegex(pattern);
  if (program.kind === 'declined') return { kind: 'declined' };
  let declined = false;
  for (const group of groups) {
    const result = matchCompiled(program, group.name);
    if (result.kind === 'declined') {
      declined = true;
      continue;
    }
    if (result.matched) return { kind: 'resolved', matched: group };
  }
  return declined ? { kind: 'declined' } : { kind: 'resolved' };
}

interface GroupClauseFacts {
  readonly requirement: ClauseGroupRequirement;
  readonly references: readonly ClauseGroupReference[];
}

function groupClauseFactsOf(
  node: jsep.Expression,
  groups: RuleGroupContext | undefined,
): GroupClauseFacts | undefined {
  if (!groups) return undefined;

  const unary = asUnaryExpression(node);
  const negated = unary?.operator === '!';
  const call = asCallExpression(negated && unary ? unary.argument : node);
  if (!call) return undefined;
  const match = GROUP_MATCH_BY_FUNCTION.get(asIdentifier(call.callee)?.name ?? '');
  if (!match) return undefined;

  const references: ClauseGroupReference[] = [];
  for (const argument of call.arguments) {
    const value = asLiteral(argument)?.value;
    if (typeof value !== 'string') return undefined;
    const resolution = findMatchingGroup(match, value, groups);
    if (resolution.kind === 'declined') return undefined;
    const { matched } = resolution;
    references.push({
      match,
      value,
      satisfied: matched !== undefined,
      ...(matched ? { matchedGroupName: matched.name } : {}),
    });
  }
  if (references.length === 0) return undefined;
  return { requirement: negated ? 'non-member' : 'member', references };
}

function calleeNameOf(call: jsep.CallExpression): string | undefined {
  const identifier = asIdentifier(call.callee);
  if (identifier) return identifier.name;
  const member = asMemberExpression(call.callee);
  if (!member || member.computed) return undefined;
  const object = asIdentifier(member.object);
  const property = asIdentifier(member.property);
  return object && property ? `${object.name}.${property.name}` : undefined;
}

const SUBJECT_TRANSFORM_BY_FUNCTION = new Map<string, SubjectTransform>([
  ['String.toLowerCase', 'toLowerCase'],
  ['String.toUpperCase', 'toUpperCase'],
  ['String.removeSpaces', 'removeSpaces'],
  ['String.len', 'len'],
  ['Arrays.size', 'size'],
  ['Arrays.toCsvString', 'toCsvString'],
]);

const COMPARISON_OPERATORS = new Map<string, ComparisonOperator>([
  ['==', 'eq'],
  ['===', 'eq'],
  ['eq', 'eq'],
  ['!=', 'ne'],
  ['!==', 'ne'],
  ['ne', 'ne'],
  ['<', 'lt'],
  ['<=', 'lte'],
  ['>', 'gt'],
  ['>=', 'gte'],
]);

function subjectDescriptionOf(node: jsep.Expression): SubjectDescription | undefined {
  const path = attributePathOf(node);
  if (path !== undefined) return { path, transforms: [] };

  const call = asCallExpression(node);
  if (!call || call.arguments.length !== 1) return undefined;
  const name = calleeNameOf(call);
  const transform = name === undefined ? undefined : SUBJECT_TRANSFORM_BY_FUNCTION.get(name);
  if (!transform) return undefined;

  const argument = call.arguments[0];
  const inner = argument ? subjectDescriptionOf(argument) : undefined;
  if (!inner) return undefined;
  return { path: inner.path, transforms: [...inner.transforms, transform] };
}

function scalarLiteralValueOf(node: jsep.Expression): RuleExprValue | undefined {
  const literal = asLiteral(node);
  if (!literal) return undefined;
  const { value } = literal;
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return undefined;
}

function mirrorOperator(operator: ComparisonOperator): ComparisonOperator {
  switch (operator) {
    case 'lt':
      return 'gt';
    case 'lte':
      return 'gte';
    case 'gt':
      return 'lt';
    case 'gte':
      return 'lte';
    default:
      return operator;
  }
}

function complementOperator(operator: ComparisonOperator): ComparisonOperator {
  switch (operator) {
    case 'eq':
      return 'ne';
    case 'ne':
      return 'eq';
    case 'lt':
      return 'gte';
    case 'gte':
      return 'lt';
    case 'gt':
      return 'lte';
    case 'lte':
      return 'gt';
  }
}

function negatePredicate(predicate: LeafPredicate): LeafPredicate {
  switch (predicate.form) {
    case 'compare':
      return { ...predicate, operator: complementOperator(predicate.operator) };
    case 'compare-subjects':
      return { ...predicate, operator: complementOperator(predicate.operator) };
    default:
      return { ...predicate, negated: !predicate.negated };
  }
}

function comparisonPredicateOf(binary: jsep.BinaryExpression): LeafPredicate | undefined {
  const operator = COMPARISON_OPERATORS.get(binary.operator);
  if (!operator) return undefined;

  const left = subjectDescriptionOf(binary.left);
  const right = subjectDescriptionOf(binary.right);
  if (left && right) return { form: 'compare-subjects', left, operator, right };

  if (left) {
    const operand = scalarLiteralValueOf(binary.right);
    return operand === undefined
      ? undefined
      : { form: 'compare', subject: left, operator, operand };
  }
  if (right) {
    const operand = scalarLiteralValueOf(binary.left);
    return operand === undefined
      ? undefined
      : { form: 'compare', subject: right, operator: mirrorOperator(operator), operand };
  }
  return undefined;
}

function callPredicateOf(call: jsep.CallExpression): LeafPredicate | undefined {
  const name = calleeNameOf(call);
  if (name === undefined) return undefined;

  const [first, second] = call.arguments;
  const subject = first ? subjectDescriptionOf(first) : undefined;
  if (!subject) return undefined;

  if (name === 'Arrays.isEmpty' && call.arguments.length === 1) {
    return { form: 'empty', subject, negated: false };
  }
  if (call.arguments.length !== 2 || !second) return undefined;

  if (name === 'Arrays.contains') {
    const operand = scalarLiteralValueOf(second);
    return operand === undefined
      ? undefined
      : { form: 'array-contains', subject, operand, negated: false };
  }

  const stringForm =
    name === 'String.stringContains'
      ? 'contains'
      : name === 'String.startsWith'
        ? 'starts-with'
        : name === 'String.endsWith'
          ? 'ends-with'
          : undefined;
  if (!stringForm) return undefined;
  const operand = scalarLiteralValueOf(second);
  if (typeof operand !== 'string') return undefined;
  return { form: stringForm, subject, operand, negated: false };
}

function positivePredicateOf(node: jsep.Expression): LeafPredicate | undefined {
  const binary = asBinaryExpression(node);
  if (binary) return comparisonPredicateOf(binary);

  const call = asCallExpression(node);
  if (call) return callPredicateOf(call);

  const subject = subjectDescriptionOf(node);
  return subject && subject.transforms.length === 0
    ? { form: 'boolean-attribute', subject, negated: false }
    : undefined;
}

function leafPredicateOf(node: jsep.Expression): LeafPredicate | undefined {
  const unary = asUnaryExpression(node);
  if (unary && RULE_NEGATION_OPERATORS.has(unary.operator)) {
    const inner = positivePredicateOf(unary.argument);
    return inner ? negatePredicate(inner) : undefined;
  }
  return positivePredicateOf(node);
}

function clauseCore(node: jsep.Expression, ctx: ExplainContext): ClauseCore {
  const cached = ctx.clauseCache.get(node);
  if (cached) return cached;
  const core = computeClauseCore(node, ctx);
  ctx.clauseCache.set(node, core);
  return core;
}

function computeClauseCore(node: jsep.Expression, ctx: ExplainContext): ClauseCore {
  const { groups } = ctx;
  const groupFacts = groupClauseFactsOf(node, groups);
  const predicate = leafPredicateOf(node);
  const base = {
    expressionText: stringifyNode(node),
    resolvedValue: resolveClauseValue(node, ctx),
    ...(predicate ? { predicate } : {}),
    ...(groupFacts
      ? { groupReferences: groupFacts.references, groupRequirement: groupFacts.requirement }
      : {}),
  };

  const support = checkRuleNodeSupport(node, { hasGroupContext: groups !== undefined });
  if (!support.supported) {
    return { ...base, status: 'not-evaluated', reasonCode: support.reasonCode };
  }

  const evaluation = evaluateRuleNode(node, { user: ctx.user, groups });
  if (!evaluation.resolved) {
    return { ...base, status: 'not-evaluated', reasonCode: evaluation.reasonCode };
  }
  if (typeof evaluation.value !== 'boolean') {
    return { ...base, status: 'not-evaluated', reasonCode: 'not-a-boolean' };
  }

  return { ...base, status: evaluation.value ? 'pass' : 'fail' };
}

function childExpressions(node: jsep.Expression): readonly jsep.Expression[] {
  const member = asMemberExpression(node);
  if (member) return member.computed ? [member.object, member.property] : [member.object];

  const call = asCallExpression(node);
  if (call) return [call.callee, ...call.arguments];

  const unary = asUnaryExpression(node);
  if (unary) return [unary.argument];

  const binary = asBinaryExpression(node);
  if (binary) return [binary.left, binary.right];

  const conditional = asConditionalExpression(node);
  if (conditional) return [conditional.test, conditional.consequent, conditional.alternate];

  const compound = asCompound(node);
  if (compound) return compound.body;

  const array = asArrayExpression(node);
  if (array) {
    return array.elements.filter((element): element is jsep.Expression => Boolean(element));
  }

  return [];
}

function attributePathOf(node: jsep.Expression): string | undefined {
  const member = asMemberExpression(node);
  if (!member) return undefined;
  if (asIdentifier(member.object)?.name !== 'user') return undefined;

  if (member.computed) {
    const key = asLiteral(member.property)?.value;
    return typeof key === 'string' ? `user[${JSON.stringify(key)}]` : undefined;
  }
  const property = asIdentifier(member.property);
  return property ? `user.${property.name}` : undefined;
}

function collectAttributeReads(
  node: jsep.Expression,
  ctx: ExplainContext,
): readonly AttributeRead[] {
  const reads: AttributeRead[] = [];
  const seen = new Set<string>();

  const visit = (current: jsep.Expression): void => {
    const path = attributePathOf(current);
    if (path !== undefined) {
      if (seen.has(path)) return;
      const evaluation = evaluateNodeValue(current, ctx);
      if (evaluation.resolved) {
        seen.add(path);
        reads.push({ path, value: evaluation.value });
      } else if (evaluation.reasonCode === 'attribute-absent') {
        seen.add(path);
        reads.push({ path, value: ATTRIBUTE_ABSENT });
      }
      return;
    }
    for (const child of childExpressions(current)) visit(child);
  };

  visit(node);
  return reads;
}

function connectiveKindOf(node: jsep.Expression): ClauseConnectiveKind | undefined {
  const binary = asBinaryExpression(node);
  if (!binary) return undefined;
  if (RULE_CONJUNCTIVE_OPERATORS.has(binary.operator)) return 'and';
  if (RULE_DISJUNCTIVE_OPERATORS.has(binary.operator)) return 'or';
  return undefined;
}

function collectConnectiveOperands(
  node: jsep.Expression,
  kind: ClauseConnectiveKind,
  into: jsep.Expression[],
): void {
  const binary = asBinaryExpression(node);
  if (binary && connectiveKindOf(node) === kind) {
    collectConnectiveOperands(binary.left, kind, into);
    collectConnectiveOperands(binary.right, kind, into);
    return;
  }
  into.push(node);
}

function treeNodeStatus(node: ClauseTreeNode): ClauseStatus {
  return node.node === 'leaf' ? node.status : node.verdict;
}

function decidedByChildIndices(
  kind: ClauseConnectiveKind,
  verdict: ClauseStatus,
  children: readonly ClauseTreeNode[],
): readonly number[] {
  let decisive: ClauseStatus | undefined;
  if (kind === 'or' && verdict === 'pass') decisive = 'pass';
  else if (kind === 'and' && verdict === 'fail') decisive = 'fail';
  if (decisive === undefined) return [];

  const indices: number[] = [];
  children.forEach((child, index) => {
    if (treeNodeStatus(child) === decisive) indices.push(index);
  });
  return indices;
}

interface TreeBuildState {
  leafBudget: number;
  truncated: boolean;
}

interface BuiltTreeNode {
  readonly node: ClauseTreeNode;
  readonly collapsed: boolean;
}

function buildLeafNode(node: jsep.Expression, ctx: ExplainContext): LeafClauseNode {
  return { node: 'leaf', ...clauseCore(node, ctx), reads: collectAttributeReads(node, ctx) };
}

function buildTreeNode(
  node: jsep.Expression,
  depth: number,
  ctx: ExplainContext,
  state: TreeBuildState,
): BuiltTreeNode | undefined {
  const kind = connectiveKindOf(node);

  if (kind !== undefined && depth < MAX_TREE_DEPTH) {
    const operands: jsep.Expression[] = [];
    collectConnectiveOperands(node, kind, operands);

    const children: ClauseTreeNode[] = [];
    let truncation: ClauseTruncation | undefined;
    for (const operand of operands) {
      const built = buildTreeNode(operand, depth + 1, ctx, state);
      if (!built) {
        truncation = 'clause-cap';
        state.truncated = true;
        continue;
      }
      if (built.collapsed) {
        truncation ??= 'depth';
        state.truncated = true;
      }
      children.push(built.node);
    }
    if (children.length === 0) return undefined;

    const verdict = clauseCore(node, ctx).status;
    return {
      node: {
        node: 'connective',
        kind,
        children,
        verdict,
        decidedByChildIndices: decidedByChildIndices(kind, verdict, children),
        undecidedChildCount: children.filter((child) => treeNodeStatus(child) === 'not-evaluated')
          .length,
        depth,
        ...(truncation ? { truncation } : {}),
      },
      collapsed: false,
    };
  }

  if (state.leafBudget <= 0) {
    state.truncated = true;
    return undefined;
  }
  state.leafBudget -= 1;
  return { node: buildLeafNode(node, ctx), collapsed: kind !== undefined };
}

function buildTree(
  ast: jsep.Expression,
  ctx: ExplainContext,
  state: TreeBuildState,
): ClauseTreeNode {
  return buildTreeNode(ast, 0, ctx, state)?.node ?? buildLeafNode(ast, ctx);
}

function summarise(
  clauses: readonly ClauseCore[],
  result: RuleMatchResult,
  truncated: boolean,
): RuleExplanationSummary {
  let passedClauses = 0;
  let failedClauses = 0;
  let notEvaluatedClauses = 0;
  let needsGroupContext = 0;

  for (const clause of clauses) {
    if (clause.status === 'pass') passedClauses += 1;
    else if (clause.status === 'fail') failedClauses += 1;
    else {
      notEvaluatedClauses += 1;
      if (clause.reasonCode === 'group-membership-fn') needsGroupContext += 1;
    }
  }

  return {
    totalClauses: clauses.length,
    evaluatedClauses: passedClauses + failedClauses,
    passedClauses,
    failedClauses,
    notEvaluatedClauses,
    needsGroupContext,
    result,
    truncated,
  };
}

function unparsedExplanation(reasonCode: RuleUnevaluableReason): RuleExplanation {
  return {
    tree: {
      node: 'leaf',
      expressionText: '',
      resolvedValue: undefined,
      status: 'not-evaluated',
      reasonCode,
      reads: [],
    },
    summary: summarise([], { outcome: 'unevaluable', reasonCode }, false),
  };
}

function clauseLimit(maxClauses: number | undefined): number {
  if (maxClauses === undefined || !Number.isFinite(maxClauses) || maxClauses < 1) {
    return DEFAULT_MAX_CLAUSES;
  }
  return Math.floor(maxClauses);
}

export function explainRuleExpression(
  expression: string,
  user: OktaUser,
  options?: ExplainRuleOptions,
): RuleExplanation {
  const parsed = parseRuleExpression(expression);
  if (!parsed.ok) return unparsedExplanation(parsed.reasonCode);

  try {
    const limit = clauseLimit(options?.maxClauses);
    const collection: ClauseCollection = { nodes: [], truncated: false };
    collectClauseNodes(parsed.ast, collection, limit);

    const ctx: ExplainContext = {
      user,
      groups: options?.groups,
      clauseCache: new WeakMap(),
      valueCache: new WeakMap(),
    };
    const clauses = collection.nodes.map((node) => clauseCore(node, ctx));

    const treeState: TreeBuildState = { leafBudget: limit, truncated: false };
    const tree = buildTree(parsed.ast, ctx, treeState);

    return {
      tree,
      summary: summarise(
        clauses,
        evaluateParsedRule(parsed.ast, { user, groups: ctx.groups }),
        collection.truncated || treeState.truncated,
      ),
    };
  } catch {
    return unparsedExplanation('walk-failed');
  }
}
