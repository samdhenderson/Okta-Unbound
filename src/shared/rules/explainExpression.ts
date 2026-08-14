import type jsep from 'jsep';
import {
  RULE_CONNECTIVE_OPERATORS,
  checkRuleNodeSupport,
  evaluateParsedRule,
  evaluateRuleNode,
  parseRuleExpression,
  type RuleExprValue,
  type RuleGroupContext,
  type RuleGroupContextEntry,
  type RuleMatchResult,
  type RuleUnevaluableReason,
} from '../ruleEvaluator';
import type { OktaUser } from '../types';

export const DEFAULT_MAX_CLAUSES = 64;

export type ClauseStatus = 'pass' | 'fail' | 'not-evaluated';

export type ClauseGroupMatch = 'id' | 'name' | 'nameStartsWith' | 'nameContains';

export type ClauseGroupRequirement = 'member' | 'non-member';

export interface ClauseGroupReference {
  readonly match: ClauseGroupMatch;
  readonly value: string;
  readonly satisfied: boolean;
  readonly matchedGroupName?: string;
}

export interface ClauseExplanation {
  readonly expressionText: string;
  readonly resolvedValue: RuleExprValue | undefined;
  readonly status: ClauseStatus;
  readonly reasonCode?: RuleUnevaluableReason;
  readonly groupReferences?: readonly ClauseGroupReference[];
  readonly groupRequirement?: ClauseGroupRequirement;
}

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
  readonly clauses: readonly ClauseExplanation[];
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
  if (binary && RULE_CONNECTIVE_OPERATORS.has(binary.operator)) {
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

function resolveClauseValue(node: jsep.Expression, user: OktaUser): RuleExprValue | undefined {
  for (const operand of operandsOf(node)) {
    if (asLiteral(operand)) continue;
    const evaluation = evaluateRuleNode(operand, { user });
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
]);

function findMatchingGroup(
  match: ClauseGroupMatch,
  value: string,
  groups: RuleGroupContext,
): RuleGroupContextEntry | undefined {
  return groups.find((group) => {
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
    const matched = findMatchingGroup(match, value, groups);
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

function explainClause(
  node: jsep.Expression,
  user: OktaUser,
  groups: RuleGroupContext | undefined,
): ClauseExplanation {
  const expressionText = stringifyNode(node);
  const resolvedValue = resolveClauseValue(node, user);
  const groupFacts = groupClauseFactsOf(node, groups);
  const base = {
    expressionText,
    resolvedValue,
    ...(groupFacts
      ? { groupReferences: groupFacts.references, groupRequirement: groupFacts.requirement }
      : {}),
  };

  const support = checkRuleNodeSupport(node, { hasGroupContext: groups !== undefined });
  if (!support.supported) {
    return { ...base, status: 'not-evaluated', reasonCode: support.reasonCode };
  }

  const evaluation = evaluateRuleNode(node, { user, groups });
  if (!evaluation.resolved) {
    return { ...base, status: 'not-evaluated', reasonCode: evaluation.reasonCode };
  }
  if (typeof evaluation.value !== 'boolean') {
    return { ...base, status: 'not-evaluated', reasonCode: 'not-a-boolean' };
  }

  return { ...base, status: evaluation.value ? 'pass' : 'fail' };
}

function summarise(
  clauses: readonly ClauseExplanation[],
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
    clauses: [],
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
    const collection: ClauseCollection = { nodes: [], truncated: false };
    collectClauseNodes(parsed.ast, collection, clauseLimit(options?.maxClauses));
    const groups = options?.groups;
    const clauses = collection.nodes.map((node) => explainClause(node, user, groups));
    return {
      clauses,
      summary: summarise(
        clauses,
        evaluateParsedRule(parsed.ast, { user, groups }),
        collection.truncated,
      ),
    };
  } catch {
    return unparsedExplanation('walk-failed');
  }
}
