import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import {
  explainRuleExpression,
  DEFAULT_MAX_CLAUSES,
  type ClauseStatus,
  type ClauseTreeNode,
  type ConnectiveNode,
  type LeafClauseNode,
} from './explainExpression';
import { tryEvaluateRuleExpression } from '../ruleEvaluator';
import type { OktaUser } from '../types';

const user: OktaUser = {
  id: '00uFAKE0000000000000',
  status: 'ACTIVE',
  profile: {
    login: 'user@example.com',
    email: 'user@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
    title: 'Intern',
    city: 'San Francisco',
    headcount: 42,
    isContractor: true,
    nullable: null,
    roles: ['admin', 'dev'],
    'cost center': 'CC-9',
  },
};

function requirements(tree: ClauseTreeNode): readonly ClauseTreeNode[] {
  return tree.node === 'connective' && tree.kind === 'and' ? tree.children : [tree];
}

function leafAt(tree: ClauseTreeNode, index: number): LeafClauseNode {
  const node = requirements(tree)[index];
  if (!node) throw new Error(`no requirement at index ${index}`);
  if (node.node !== 'leaf') throw new Error(`requirement ${index} is a ${node.kind} group`);
  return node;
}

function groupAt(tree: ClauseTreeNode, index: number): ConnectiveNode {
  const node = requirements(tree)[index];
  if (!node) throw new Error(`no requirement at index ${index}`);
  if (node.node !== 'connective') throw new Error(`requirement ${index} is a leaf`);
  return node;
}

function statusOf(node: ClauseTreeNode): ClauseStatus {
  return node.node === 'leaf' ? node.status : node.verdict;
}

function leafOf(node: ClauseTreeNode | undefined): LeafClauseNode {
  if (!node) throw new Error('expected a node, got nothing');
  if (node.node !== 'leaf') throw new Error(`expected a leaf, got a ${node.kind} group`);
  return node;
}

function leavesOf(node: ClauseTreeNode): readonly LeafClauseNode[] {
  return node.node === 'leaf' ? [node] : node.children.flatMap(leavesOf);
}

function rowOf(node: LeafClauseNode): Omit<LeafClauseNode, 'node' | 'reads'> {
  return {
    expressionText: node.expressionText,
    resolvedValue: node.resolvedValue,
    status: node.status,
    ...(node.reasonCode !== undefined ? { reasonCode: node.reasonCode } : {}),
    ...(node.groupReferences ? { groupReferences: node.groupReferences } : {}),
    ...(node.groupRequirement ? { groupRequirement: node.groupRequirement } : {}),
  };
}

describe('explainRuleExpression — the §H example', () => {
  const expression = 'user.department == "Engineering" && user.title != "Intern"';

  it('reports one row per clause, with the profile values that drove each outcome', () => {
    const { tree } = explainRuleExpression(expression, user);

    expect(requirements(tree)).toHaveLength(2);
    expect(rowOf(leafAt(tree, 0))).toEqual({
      expressionText: 'user.department == "Engineering"',
      resolvedValue: 'Engineering',
      status: 'pass',
    });
    expect(rowOf(leafAt(tree, 1))).toEqual({
      expressionText: 'user.title != "Intern"',
      resolvedValue: 'Intern',
      status: 'fail',
    });
  });

  it('summarises the rule the way the UI renders it', () => {
    const { summary } = explainRuleExpression(expression, user);

    expect(summary.totalClauses).toBe(2);
    expect(summary.evaluatedClauses).toBe(2);
    expect(summary.passedClauses).toBe(1);
    expect(summary.failedClauses).toBe(1);
    expect(summary.notEvaluatedClauses).toBe(0);
    expect(summary.needsGroupContext).toBe(0);
    expect(summary.truncated).toBe(false);
    expect(summary.result).toEqual({ outcome: 'no-match' });
  });

  it('agrees with the engine every other consumer acts on', () => {
    expect(explainRuleExpression(expression, user).summary.result.outcome).toBe(
      tryEvaluateRuleExpression(expression, user),
    );
  });
});

describe('clauses that need group context', () => {
  const expression = 'isMemberOfGroup("00gFAKE0000000000000") && user.department == "Engineering"';

  it('reports the group-membership clause as not-evaluated while its sibling still answers', () => {
    const { tree, summary } = explainRuleExpression(expression, user);

    expect(requirements(tree)).toHaveLength(2);
    expect(rowOf(leafAt(tree, 0))).toEqual({
      expressionText: 'isMemberOfGroup("00gFAKE0000000000000")',
      resolvedValue: undefined,
      status: 'not-evaluated',
      reasonCode: 'group-membership-fn',
    });
    expect(leafAt(tree, 1).status).toBe('pass');
    expect(leafAt(tree, 1).resolvedValue).toBe('Engineering');

    expect(summary.evaluatedClauses).toBe(1);
    expect(summary.totalClauses).toBe(2);
    expect(summary.needsGroupContext).toBe(1);
    expect(summary.result).toEqual({ outcome: 'unevaluable', reasonCode: 'group-membership-fn' });
  });

  it('counts every group-membership flavour toward needsGroupContext', () => {
    const { tree, summary } = explainRuleExpression(
      'isMemberOfGroupName("Engineering") || isMemberOfAnyGroup("00gFAKE1", "00gFAKE2") || user.city == "San Francisco"',
      user,
    );

    expect(summary.totalClauses).toBe(1);
    expect(summary.needsGroupContext).toBe(1);
    expect(groupAt(tree, 0).children.map(statusOf)).toEqual([
      'not-evaluated',
      'not-evaluated',
      'pass',
    ]);
    expect(summary.result).toEqual({ outcome: 'unevaluable', reasonCode: 'group-membership-fn' });
  });
});

describe('isMemberOfGroupNameRegex references (ADR-0002)', () => {
  const groups = [
    { id: '00gFAKEgroup0001', name: 'SecOps-Alpha' },
    { id: '00gFAKEgroup0002', name: 'Engineering' },
  ];

  it('carries the pattern as a structured reference, satisfied by the name that matched', () => {
    const { tree } = explainRuleExpression('isMemberOfGroupNameRegex("^SecOps-.*")', user, {
      groups,
    });

    expect(leafAt(tree, 0).status).toBe('pass');
    expect(leafAt(tree, 0).groupRequirement).toBe('member');
    expect(leafAt(tree, 0).groupReferences).toEqual([
      {
        match: 'nameRegex',
        value: '^SecOps-.*',
        satisfied: true,
        matchedGroupName: 'SecOps-Alpha',
      },
    ]);
  });

  it('reports an unsatisfied pattern as unsatisfied, with no group named', () => {
    const { tree } = explainRuleExpression('isMemberOfGroupNameRegex("^Finance-.*")', user, {
      groups,
    });

    expect(leafAt(tree, 0).status).toBe('fail');
    expect(leafAt(tree, 0).groupReferences).toEqual([
      { match: 'nameRegex', value: '^Finance-.*', satisfied: false },
    ]);
  });

  it('carries no references at all when the engine declined the pattern', () => {
    const { tree } = explainRuleExpression('isMemberOfGroupNameRegex("(?=Sec).*")', user, {
      groups,
    });

    expect(leafAt(tree, 0).status).toBe('not-evaluated');
    expect(leafAt(tree, 0).reasonCode).toBe('regex-unsupported-syntax');
    expect(leafAt(tree, 0).groupReferences).toBeUndefined();
    expect(leafAt(tree, 0).groupRequirement).toBeUndefined();
  });

  it('looks through a negation, like the other membership forms', () => {
    const { tree } = explainRuleExpression('!isMemberOfGroupNameRegex("^SecOps-.*")', user, {
      groups,
    });

    expect(leafAt(tree, 0).status).toBe('fail');
    expect(leafAt(tree, 0).groupRequirement).toBe('non-member');
    expect(leafAt(tree, 0).groupReferences?.map((r) => r.satisfied)).toEqual([true]);
  });
});

describe('clauses the grammar gate rejects', () => {
  it.each([
    {
      name: 'an unsupported operator',
      expression: 'user.department + "x" == "Engineeringx"',
      expressionText: '(user.department + "x") == "Engineeringx"',
      reasonCode: 'unsupported-operator',
    },
    {
      name: 'a function outside the allow-list',
      expression: 'String.replaceFirst(user.email, "a", "b") == "ada"',
      expressionText: 'String.replaceFirst(user.email, "a", "b") == "ada"',
      reasonCode: 'unknown-fn',
    },
    {
      name: 'an allow-listed function at the wrong arity',
      expression: 'String.startsWith(user.firstName)',
      expressionText: 'String.startsWith(user.firstName)',
      reasonCode: 'fn-arity',
    },
    {
      name: 'a non-literal computed member access',
      expression: 'user[user.department] == "Engineering"',
      expressionText: 'user[user.department] == "Engineering"',
      reasonCode: 'unsupported-node',
    },
    {
      name: 'app context',
      expression: 'app.clientId == "0oaFAKE"',
      expressionText: 'app.clientId == "0oaFAKE"',
      reasonCode: 'unsupported-node',
    },
  ])('reports $name as not-evaluated, never fail', ({ expression, expressionText, reasonCode }) => {
    const { tree, summary } = explainRuleExpression(expression, user);

    expect(requirements(tree)).toHaveLength(1);
    expect(leafAt(tree, 0).status).toBe('not-evaluated');
    expect(leafAt(tree, 0).expressionText).toBe(expressionText);
    expect(leafAt(tree, 0).reasonCode).toBe(reasonCode);
    expect(summary.evaluatedClauses).toBe(0);
    expect(summary.failedClauses).toBe(0);
  });

  it('still resolves what it can from a rejected clause', () => {
    const { tree } = explainRuleExpression('user.department == "Eng" + "x"', user);

    expect(leafAt(tree, 0).status).toBe('not-evaluated');
    expect(leafAt(tree, 0).resolvedValue).toBe('Engineering');
  });

  it('reports a clause that is allow-listed but is not a condition', () => {
    const { tree } = explainRuleExpression('user.department && user.city == "Berlin"', user);

    expect(rowOf(leafAt(tree, 0))).toEqual({
      expressionText: 'user.department',
      resolvedValue: 'Engineering',
      status: 'not-evaluated',
      reasonCode: 'not-a-boolean',
    });
    expect(leafAt(tree, 1).status).toBe('fail');
  });

  it('reports an operand-type mismatch as not-evaluated', () => {
    const { tree } = explainRuleExpression('user.department > "A"', user);

    expect(leafAt(tree, 0).status).toBe('not-evaluated');
    expect(leafAt(tree, 0).reasonCode).toBe('operand-type');
  });
});

describe('nesting, parentheses and negation', () => {
  it('keeps a parenthesised OR group whole and names its alternatives', () => {
    const { tree, summary } = explainRuleExpression(
      '(user.department == "Engineering" || user.department == "Sales") && user.city == "Berlin"',
      user,
    );

    expect(requirements(tree)).toHaveLength(2);
    expect(leafAt(tree, 1).expressionText).toBe('user.city == "Berlin"');
    expect(requirements(tree).map(statusOf)).toEqual(['pass', 'fail']);

    expect(groupAt(tree, 0).children.map((alt) => leafOf(alt).expressionText)).toEqual([
      'user.department == "Engineering"',
      'user.department == "Sales"',
    ]);
    expect(groupAt(tree, 0).children.map(statusOf)).toEqual(['pass', 'fail']);
    expect(requirements(tree)[1]?.node).toBe('leaf');

    expect(summary.result).toEqual({ outcome: 'no-match' });
  });

  it('flattens a nested OR into one list of alternatives', () => {
    const { tree } = explainRuleExpression(
      'user.city == "Berlin" || (user.city == "Paris" || user.city == "Seattle")',
      user,
    );

    expect(requirements(tree)).toHaveLength(1);
    expect(groupAt(tree, 0).children.map((alt) => leafOf(alt).expressionText)).toEqual([
      'user.city == "Berlin"',
      'user.city == "Paris"',
      'user.city == "Seattle"',
    ]);
  });

  it('keeps a negated group whole rather than inverting its parts', () => {
    const { tree } = explainRuleExpression(
      '!(user.department == "Engineering" && user.title == "Intern")',
      user,
    );

    expect(requirements(tree)).toHaveLength(1);
    expect(leafAt(tree, 0).expressionText).toBe(
      '!((user.department == "Engineering") && (user.title == "Intern"))',
    );
    expect(leafAt(tree, 0).status).toBe('fail');
  });

  it('explains a negated leaf with the value it negated, not the negation', () => {
    const { tree } = explainRuleExpression(
      '!(user.department == "Sales") && !user.isContractor',
      user,
    );

    expect(rowOf(leafAt(tree, 0))).toEqual({
      expressionText: '!(user.department == "Sales")',
      resolvedValue: 'Engineering',
      status: 'pass',
    });
    expect(rowOf(leafAt(tree, 1))).toEqual({
      expressionText: '!user.isContractor',
      resolvedValue: true,
      status: 'fail',
    });
  });

  it('explains the word forms and String calls Okta actually uses', () => {
    const { tree, summary } = explainRuleExpression(
      'String.startsWith(user.firstName, "Ad") and user.city ne "Berlin"',
      user,
    );

    expect(rowOf(leafAt(tree, 0))).toEqual({
      expressionText: 'String.startsWith(user.firstName, "Ad")',
      resolvedValue: 'Ada',
      status: 'pass',
    });
    expect(leafAt(tree, 1).status).toBe('pass');
    expect(summary.result).toEqual({ outcome: 'match' });
  });

  it('distinguishes an attribute present-and-null from one that is absent', () => {
    const present = leafOf(explainRuleExpression('user.nullable == null', user).tree);
    expect(present.resolvedValue).toBeNull();
    expect(present.status).toBe('pass');

    const absent = leafOf(explainRuleExpression('user.costCenter == null', user).tree);
    expect(absent.status).toBe('not-evaluated');
    expect(absent.reasonCode).toBe('attribute-absent');

    const nothing = leafOf(explainRuleExpression('isMemberOfGroupName("Engineering")', user).tree);
    expect(nothing.resolvedValue).toBeUndefined();
  });
});

describe('String.stringSwitch — matched cases and the required default', () => {
  it('stringifies the call generically and reports the matched value', () => {
    const { tree } = explainRuleExpression(
      'String.stringSwitch(user.department, "Other", "Eng", "yes") == "yes"',
      user,
    );
    expect(rowOf(leafAt(tree, 0))).toEqual({
      expressionText: 'String.stringSwitch(user.department, "Other", "Eng", "yes") == "yes"',
      resolvedValue: 'yes',
      status: 'pass',
    });
  });

  it('reports the default value when no pair matches', () => {
    const { tree } = explainRuleExpression(
      'String.stringSwitch(user.department, "Other", "Sales", "yes") == "Other"',
      user,
    );
    expect(rowOf(leafAt(tree, 0))).toEqual({
      expressionText: 'String.stringSwitch(user.department, "Other", "Sales", "yes") == "Other"',
      resolvedValue: 'Other',
      status: 'pass',
    });
  });

  it('is not-evaluated with fn-arity for a lone trailing key, never a guess', () => {
    const { tree } = explainRuleExpression(
      'String.stringSwitch(user.department, "Other", "Eng") == "Other"',
      user,
    );
    expect(leafAt(tree, 0).status).toBe('not-evaluated');
    expect(leafAt(tree, 0).reasonCode).toBe('fn-arity');
  });
});

describe('unary minus and computed member access', () => {
  it('stringifies a negative literal faithfully', () => {
    const { tree, summary } = explainRuleExpression('user.headcount >= -1', user);

    expect(rowOf(leafAt(tree, 0))).toEqual({
      expressionText: 'user.headcount >= -1',
      resolvedValue: 42,
      status: 'pass',
    });
    expect(summary.result).toEqual({ outcome: 'match' });
  });

  it('stringifies computed member access with its original quoting', () => {
    const { tree, summary } = explainRuleExpression('user["cost center"] == "CC-9"', user);

    expect(rowOf(leafAt(tree, 0))).toEqual({
      expressionText: 'user["cost center"] == "CC-9"',
      resolvedValue: 'CC-9',
      status: 'pass',
    });
    expect(summary.result).toEqual({ outcome: 'match' });
  });

  it('reports a failing computed-access clause, never as not-evaluated', () => {
    const { tree } = explainRuleExpression('user["cost center"] == "CC-1"', user);
    expect(rowOf(leafAt(tree, 0))).toEqual({
      expressionText: 'user["cost center"] == "CC-1"',
      resolvedValue: 'CC-9',
      status: 'fail',
    });
  });

  it('reports attribute-absent for a computed key the profile does not carry', () => {
    const { tree } = explainRuleExpression('user["cost centre"] == "CC-9"', user);
    expect(leafAt(tree, 0).status).toBe('not-evaluated');
    expect(leafAt(tree, 0).reasonCode).toBe('attribute-absent');
  });
});

describe('nothing is short-circuited', () => {
  it('reports the right side of an && whose left side already failed', () => {
    const { tree, summary } = explainRuleExpression(
      'user.department == "Sales" && user.title == "Intern"',
      user,
    );

    expect(leafAt(tree, 0).status).toBe('fail');
    expect(leafAt(tree, 1).status).toBe('pass');
    expect(summary.evaluatedClauses).toBe(2);
    expect(summary.result).toEqual({ outcome: 'no-match' });
  });

  it('reports the right side of an || whose left side already matched', () => {
    const { tree, summary } = explainRuleExpression(
      'user.department == "Engineering" || user.city == "Berlin"',
      user,
    );

    expect(requirements(tree)).toHaveLength(1);
    expect(statusOf(requirements(tree)[0])).toBe('pass');
    expect(groupAt(tree, 0).children.map(statusOf)).toEqual(['pass', 'fail']);
    expect(summary.result).toEqual({ outcome: 'match' });
  });

  it('evaluates both sides of an && whose left side already failed', () => {
    const { tree, summary } = explainRuleExpression(
      'user.department == "Sales" && user.city == "Berlin"',
      user,
    );

    expect(requirements(tree).map(statusOf)).toEqual(['fail', 'fail']);
    expect(summary.result).toEqual({ outcome: 'no-match' });
  });
});

describe('expressions that never become clauses', () => {
  it('rejects an oversized expression before parsing it', () => {
    const huge = `user.department == "${'x'.repeat(5000)}"`;
    const { tree, summary } = explainRuleExpression(huge, user);

    expect(rowOf(leafOf(tree))).toEqual({
      expressionText: '',
      resolvedValue: undefined,
      status: 'not-evaluated',
      reasonCode: 'too-long',
    });
    expect(summary.result).toEqual({ outcome: 'unevaluable', reasonCode: 'too-long' });
    expect(summary.totalClauses).toBe(0);
    expect(summary.failedClauses).toBe(0);
  });

  it('reports an ungrammatical expression as a parse error', () => {
    const { tree, summary } = explainRuleExpression('user.department == ', user);

    expect(summary.totalClauses).toBe(0);
    expect(leafOf(tree).reasonCode).toBe('parse-error');
    expect(summary.result).toEqual({ outcome: 'unevaluable', reasonCode: 'parse-error' });
  });

  it('reports an empty or whitespace-only expression', () => {
    expect(explainRuleExpression('', user).summary.result).toEqual({
      outcome: 'unevaluable',
      reasonCode: 'empty',
    });
    expect(explainRuleExpression('   ', user).summary.result).toEqual({
      outcome: 'unevaluable',
      reasonCode: 'empty',
    });
  });
});

describe('bounded output', () => {
  it('caps clause rows and says so', () => {
    const { tree, summary } = explainRuleExpression(
      'user.department == "1" && user.title == "2" && user.city == "3"',
      user,
      { maxClauses: 2 },
    );

    expect(requirements(tree)).toHaveLength(2);
    expect(summary.totalClauses).toBe(2);
    expect(summary.truncated).toBe(true);
    expect(summary.result).toEqual({ outcome: 'no-match' });
  });

  it('ignores a nonsensical cap and falls back to the default', () => {
    const expression = Array.from(
      { length: DEFAULT_MAX_CLAUSES + 5 },
      (_, i) => `user.a${i} == "x"`,
    ).join(' && ');

    for (const maxClauses of [0, -1, Number.NaN]) {
      const { tree, summary } = explainRuleExpression(expression, user, { maxClauses });
      expect(requirements(tree)).toHaveLength(DEFAULT_MAX_CLAUSES);
      expect(summary.truncated).toBe(true);
    }
  });
});

describe('an unresolvable clause is never a failure', () => {
  const unevaluable = [
    'isMemberOfGroup("00gFAKE0000000000000")',
    'isMemberOfGroupNameStartsWith("Eng") && user.department == "Engineering"',
    'app.clientId == "0oaFAKE" || user.city == "Berlin"',
    'session.amr == "pwd"',
    'user[user.department] == "Engineering"',
    'user.department + "x" == "Engineeringx"',
    'String.replaceFirst(user.email, "a", "b") == "ada"',
    'Arrays.flatten(user.roles)',
    'Arrays.contains(user.department, "Eng")',
    'user.costCenter == "1234"',
    'user.roles == "admin,dev"',
    'String.startsWith(user.headcount, "4")',
    'user.department > "A"',
    'user.department',
    '"Engineering"',
    'String.toUpperCase(user.department)',
    'this.foo == 1',
    'user.constructor.constructor("return 1")()',
  ];

  it.each(unevaluable)('never reports %s as fail', (expression) => {
    const { tree, summary } = explainRuleExpression(expression, user);

    for (const clause of leavesOf(tree)) {
      if (clause.status === 'not-evaluated') {
        expect(clause.reasonCode).toBeDefined();
      } else {
        expect(clause.status === 'pass' || clause.status === 'fail').toBe(true);
      }
    }

    expect(summary.result.outcome).not.toBe('no-match');
    expect(summary.result.outcome).toBe(tryEvaluateRuleExpression(expression, user));
  });

  it('never fails a clause whose only problem is a sibling it cannot resolve', () => {
    const { tree } = explainRuleExpression(
      'isMemberOfGroup("00gFAKE0000000000000") && user.department == "Sales"',
      user,
    );

    expect(leafAt(tree, 0).status).toBe('not-evaluated');
    expect(leafAt(tree, 1).status).toBe('fail');
  });
});

describe('parse reuse', () => {
  let debugSpy: MockInstance;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  const parseAttempts = (): number =>
    debugSpy.mock.calls.filter(
      (args) =>
        args[1] === 'Rule expression rejected' &&
        (args[2] as { reason?: string } | undefined)?.reason === 'parse-error',
    ).length;

  it('parses an expression at most once across the explainer and the evaluator', () => {
    const bad = 'user.explainerParseReuse ==';

    expect(explainRuleExpression(bad, user).summary.result).toEqual({
      outcome: 'unevaluable',
      reasonCode: 'parse-error',
    });
    expect(parseAttempts()).toBe(1);

    explainRuleExpression(bad, user);
    tryEvaluateRuleExpression(bad, user);
    expect(parseAttempts()).toBe(1);
  });

  it('is a pure function: repeated explanations of the same expression agree', () => {
    const expression =
      'String.toUpperCase(user.department) == "ENGINEERING" && user.title != "Intern"';
    const first = explainRuleExpression(expression, user);
    const second = explainRuleExpression(expression, user);

    expect(second).toEqual(first);
  });

  it('explains the same shared AST differently for different users', () => {
    const expression = 'user.department == "Engineering" && user.title != "Intern"';
    const other: OktaUser = {
      ...user,
      id: '00uFAKE0000000000001',
      profile: { ...user.profile, department: 'Sales', title: 'Manager' },
    };

    const mine = explainRuleExpression(expression, user);
    const theirs = explainRuleExpression(expression, other);

    expect(requirements(mine.tree).map(statusOf)).toEqual(['pass', 'fail']);
    expect(requirements(theirs.tree).map(statusOf)).toEqual(['fail', 'pass']);
    expect(leafAt(theirs.tree, 0).resolvedValue).toBe('Sales');
  });
});

describe('conditional expressions are a single clause', () => {
  it('stringifies a conditional faithfully, parenthesising a binary part', () => {
    const { tree } = explainRuleExpression(
      'user.department == "Engineering" ? "EMEA" : "AMER"',
      user,
    );

    expect(requirements(tree)).toHaveLength(1);
    expect(leafAt(tree, 0).expressionText).toBe(
      '(user.department == "Engineering") ? "EMEA" : "AMER"',
    );
    expect(leafAt(tree, 0).status).toBe('not-evaluated');
    expect(leafAt(tree, 0).reasonCode).toBe('not-a-boolean');
  });

  it('does not split a conditional whose branches contain connectives', () => {
    const { tree } = explainRuleExpression(
      'user.isContractor ? (user.department == "Engineering" && user.title == "Intern") : false',
      user,
    );

    expect(requirements(tree)).toHaveLength(1);
    expect(leafAt(tree, 0).status).toBe('pass');
  });

  it('passes, fails, and withholds on the chosen branch', () => {
    const pass = explainRuleExpression(
      'user.isContractor ? user.department == "Engineering" : false',
      user,
    );
    const fail = explainRuleExpression(
      'user.isContractor ? user.department == "Sales" : false',
      user,
    );
    const withheld = explainRuleExpression(
      'user.isContractor ? user.department > "A" : false',
      user,
    );

    expect(leafOf(pass.tree).status).toBe('pass');
    expect(leafOf(fail.tree).status).toBe('fail');
    expect(leafOf(withheld.tree).status).toBe('not-evaluated');
    expect(leafOf(withheld.tree).reasonCode).toBe('operand-type');
  });

  it('is one clause among the conjuncts around it', () => {
    const { tree, summary } = explainRuleExpression(
      'user.city == "San Francisco" && (user.isContractor ? user.title == "Manager" : false)',
      user,
    );

    expect(requirements(tree).map((node) => leafOf(node).expressionText)).toEqual([
      'user.city == "San Francisco"',
      'user.isContractor ? (user.title == "Manager") : false',
    ]);
    expect(requirements(tree).map(statusOf)).toEqual(['pass', 'fail']);
    expect(summary.result).toEqual({ outcome: 'no-match' });
  });
});
