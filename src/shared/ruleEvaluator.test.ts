import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import {
  checkRuleNodeSupport,
  evaluateParsedRule,
  evaluateRuleNode,
  parseRuleExpression,
  tryEvaluateRuleExpression,
  tryEvaluateRuleExpressionDetailed,
  RULE_CONNECTIVE_OPERATORS,
  type RuleNodeEvaluation,
} from './ruleEvaluator';
import type { OktaUser } from './types';

const gateAccepts = (expression: string): boolean => {
  const parsed = parseRuleExpression(expression);
  return parsed.ok && checkRuleNodeSupport(parsed.ast).supported;
};

const walkUngated = (expression: string, user: OktaUser): RuleNodeEvaluation => {
  const parsed = parseRuleExpression(expression);
  if (!parsed.ok) return { resolved: false, reasonCode: parsed.reasonCode };
  return evaluateRuleNode(parsed.ast, { user });
};

describe('tryEvaluateRuleExpression', () => {
  const user: OktaUser = {
    id: '00uFAKE',
    status: 'ACTIVE',
    profile: {
      login: 'ada@example.com',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      department: 'Engineering',
      title: 'Developer',
      city: 'San Francisco',
      employeeNumber: 42,
      nullable: null,
    },
  } as unknown as OktaUser;

  describe('match', () => {
    it('returns match for a satisfied equality', () => {
      expect(tryEvaluateRuleExpression('user.department == "Engineering"', user)).toBe('match');
    });

    it('returns match for the eq/and word forms', () => {
      expect(
        tryEvaluateRuleExpression(
          'user.department eq "Engineering" and user.city eq "San Francisco"',
          user,
        ),
      ).toBe('match');
    });

    it('returns match for an allow-listed String function', () => {
      expect(tryEvaluateRuleExpression('String.startsWith(user.firstName, "Ad")', user)).toBe(
        'match',
      );
      expect(
        tryEvaluateRuleExpression('String.stringContains(user.email, "@example.com")', user),
      ).toBe('match');
      expect(
        tryEvaluateRuleExpression('String.toLowerCase(user.department) == "engineering"', user),
      ).toBe('match');
    });

    it('returns match for a satisfied numeric comparison', () => {
      expect(tryEvaluateRuleExpression('user.employeeNumber > 10', user)).toBe('match');
    });

    it('returns match for a negation of an unsatisfied condition', () => {
      expect(tryEvaluateRuleExpression('!(user.department == "Sales")', user)).toBe('match');
    });

    it('returns match when only the second disjunct of an `or` holds', () => {
      expect(
        tryEvaluateRuleExpression('user.department == "Sales" or user.title == "Developer"', user),
      ).toBe('match');
    });

    it('returns match for a parenthesised disjunction conjoined with a further clause', () => {
      expect(
        tryEvaluateRuleExpression(
          '(user.department == "Sales" or user.department == "Engineering") and user.city == "San Francisco"',
          user,
        ),
      ).toBe('match');
    });

    it('returns match for an attribute present and explicitly null', () => {
      expect(tryEvaluateRuleExpression('user.nullable == null', user)).toBe('match');
    });

    it('resolves a top-level user field, not just the profile', () => {
      expect(tryEvaluateRuleExpression('user.status == "ACTIVE"', user)).toBe('match');
    });
  });

  describe('no-match — reserved for expressions that were fully understood', () => {
    it('returns no-match for an unsatisfied equality', () => {
      expect(tryEvaluateRuleExpression('user.department == "Sales"', user)).toBe('no-match');
    });

    it('returns no-match when one conjunct fails', () => {
      expect(
        tryEvaluateRuleExpression(
          'user.department == "Engineering" && user.city == "Berlin"',
          user,
        ),
      ).toBe('no-match');
    });

    it('returns no-match for an unsatisfied top-level user field', () => {
      expect(tryEvaluateRuleExpression('user.status == "SUSPENDED"', user)).toBe('no-match');
    });

    it('returns no-match for an unsatisfied String function', () => {
      expect(tryEvaluateRuleExpression('String.endsWith(user.email, "@other.example")', user)).toBe(
        'no-match',
      );
    });
  });

  describe('unevaluable — every distinct route', () => {
    it('is unevaluable for a grammar error, NEVER no-match', () => {
      const outcome = tryEvaluateRuleExpression('user.department ==', user);
      expect(outcome).toBe('unevaluable');
      expect(outcome).not.toBe('no-match');
    });

    it('is unevaluable for two expressions juxtaposed without an operator', () => {
      expect(tryEvaluateRuleExpression('user.department == "Eng" user.city == "SF"', user)).toBe(
        'unevaluable',
      );
    });

    it('is unevaluable for an unbalanced parenthesis', () => {
      expect(tryEvaluateRuleExpression('(user.department == "Engineering"', user)).toBe(
        'unevaluable',
      );
    });

    it('is unevaluable when the gate rejects a group-membership function', () => {
      expect(gateAccepts('isMemberOfGroup("00gFAKE")')).toBe(false);
      expect(tryEvaluateRuleExpression('isMemberOfGroup("00gFAKE")', user)).toBe('unevaluable');
      expect(tryEvaluateRuleExpression('isMemberOfGroupName("Engineering")', user)).toBe(
        'unevaluable',
      );
      expect(tryEvaluateRuleExpression('isMemberOfAnyGroup("00gFAKE1", "00gFAKE2")', user)).toBe(
        'unevaluable',
      );
    });

    it('is unevaluable when a group-membership call is combined with a matching clause', () => {
      expect(
        tryEvaluateRuleExpression(
          'isMemberOfGroup("00gFAKE") || user.department == "Engineering"',
          user,
        ),
      ).toBe('unevaluable');
    });

    it('is unevaluable when the gate rejects app context', () => {
      expect(gateAccepts('app.clientId == "x"')).toBe(false);
      expect(tryEvaluateRuleExpression('app.clientId == "x"', user)).toBe('unevaluable');
    });

    it('is unevaluable for an attribute the profile does not carry', () => {
      expect(tryEvaluateRuleExpression('user.costCenter == "1234"', user)).toBe('unevaluable');
      expect(tryEvaluateRuleExpression('user.division == null', user)).toBe('unevaluable');
    });

    it('is unevaluable for a function outside the allow-list', () => {
      expect(
        tryEvaluateRuleExpression('String.replaceFirst(user.email, "a", "b") == "x"', user),
      ).toBe('unevaluable');
      expect(tryEvaluateRuleExpression('Arrays.flatten(user.roles) == "Eng"', user)).toBe(
        'unevaluable',
      );
      expect(tryEvaluateRuleExpression('Time.now() == "x"', user)).toBe('unevaluable');
    });

    it('is unevaluable for an allow-listed function called with the wrong arity', () => {
      expect(tryEvaluateRuleExpression('String.startsWith(user.firstName)', user)).toBe(
        'unevaluable',
      );
    });

    it('is unevaluable for an unsupported operator', () => {
      expect(tryEvaluateRuleExpression('user.department + "x" == "Engineeringx"', user)).toBe(
        'unevaluable',
      );
      expect(tryEvaluateRuleExpression('user.employeeNumber % 2 == 0', user)).toBe('unevaluable');
    });

    it('is unevaluable for an unsupported reference', () => {
      expect(tryEvaluateRuleExpression('session.amr == "pwd"', user)).toBe('unevaluable');
      expect(tryEvaluateRuleExpression('user["department"] == "Engineering"', user)).toBe(
        'unevaluable',
      );
    });

    it('is unevaluable for an empty or whitespace-only condition', () => {
      expect(tryEvaluateRuleExpression('', user)).toBe('unevaluable');
      expect(tryEvaluateRuleExpression('   ', user)).toBe('unevaluable');
    });

    it('is unevaluable for a condition that does not reduce to a boolean', () => {
      expect(tryEvaluateRuleExpression('user.department', user)).toBe('unevaluable');
      expect(tryEvaluateRuleExpression('"Engineering"', user)).toBe('unevaluable');
    });

    it('is unevaluable for an oversized expression rather than parsing it', () => {
      const huge = `user.department == "${'x'.repeat(5000)}"`;
      expect(tryEvaluateRuleExpression(huge, user)).toBe('unevaluable');
    });

    it('never evaluates code — an expression that would throw if executed is just unevaluable', () => {
      expect(tryEvaluateRuleExpression('user.constructor.constructor("return 1")()', user)).toBe(
        'unevaluable',
      );
      expect(tryEvaluateRuleExpression('this.foo == 1', user)).toBe('unevaluable');
    });
  });
});

describe('the grammar gate, over whole expressions', () => {
  it('accepts the supported subset', () => {
    expect(gateAccepts('user.department == "Engineering"')).toBe(true);
    expect(gateAccepts('user.a eq "x" or user.b ne "y"')).toBe(true);
    expect(gateAccepts('String.stringContains(user.email, "@example.com")')).toBe(true);
  });

  it('rejects group-membership and app-context expressions (historical contract)', () => {
    expect(gateAccepts('isMemberOfGroupName("Eng")')).toBe(false);
    expect(gateAccepts('app.id == "0oaFAKE"')).toBe(false);
  });

  it('rejects expressions that parse but use unsupported grammar', () => {
    expect(gateAccepts('user.department + "x" == "y"')).toBe(false);
    expect(gateAccepts('String.replaceFirst(user.email, "a", "b") == "x"')).toBe(false);
  });

  it('rejects unparseable and empty input', () => {
    expect(gateAccepts('user.department ==')).toBe(false);
    expect(gateAccepts('')).toBe(false);
  });

  it('accepts boolean and numeric literals', () => {
    expect(gateAccepts('user.active == true')).toBe(true);
    expect(gateAccepts('user.employeeNumber >= 10')).toBe(true);
  });
});

describe('supported subset', () => {
  const user: OktaUser = {
    id: '00uFAKE',
    status: 'ACTIVE',
    profile: {
      login: 'ada@example.com',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      department: 'Engineering',
      employeeNumber: 42,
      active: true,
      roles: ['admin', 'dev'],
      manager: { id: '00uFAKEMANAGER' },
      notes: null,
    },
  } as unknown as OktaUser;

  it('implements the allow-listed String functions', () => {
    expect(
      tryEvaluateRuleExpression('String.toUpperCase(user.department) == "ENGINEERING"', user),
    ).toBe('match');
    expect(tryEvaluateRuleExpression('String.len(user.firstName) == 3', user)).toBe('match');
    expect(tryEvaluateRuleExpression('String.append(user.firstName, " L") == "Ada L"', user)).toBe(
      'match',
    );
    expect(tryEvaluateRuleExpression('String.endsWith(user.email, "example.com")', user)).toBe(
      'match',
    );
  });

  it('rejects a String function applied to a non-string attribute', () => {
    expect(tryEvaluateRuleExpression('String.startsWith(user.employeeNumber, "4")', user)).toBe(
      'unevaluable',
    );
  });

  it('supports the numeric ordering operators, and only on numbers', () => {
    expect(tryEvaluateRuleExpression('user.employeeNumber < 100', user)).toBe('match');
    expect(tryEvaluateRuleExpression('user.employeeNumber <= 42', user)).toBe('match');
    expect(tryEvaluateRuleExpression('user.employeeNumber >= 43', user)).toBe('no-match');
    expect(tryEvaluateRuleExpression('user.department > "A"', user)).toBe('unevaluable');
  });

  it('supports inequality and boolean attributes', () => {
    expect(tryEvaluateRuleExpression('user.department != "Sales"', user)).toBe('match');
    expect(tryEvaluateRuleExpression('user.active == true', user)).toBe('match');
    expect(tryEvaluateRuleExpression('!user.active', user)).toBe('no-match');
  });

  it('refuses to compare a multi-valued attribute to its joined string', () => {
    expect(tryEvaluateRuleExpression('user.roles == "admin,dev"', user)).toBe('unevaluable');
  });

  it('answers a multi-valued attribute through the Arrays helpers instead', () => {
    expect(tryEvaluateRuleExpression('Arrays.contains(user.roles, "admin")', user)).toBe('match');
    expect(tryEvaluateRuleExpression('Arrays.contains(user.roles, "auditor")', user)).toBe(
      'no-match',
    );
    expect(tryEvaluateRuleExpression('Arrays.size(user.roles) == 2', user)).toBe('match');
  });

  it('refuses an object-valued attribute rather than reading [object Object]', () => {
    expect(tryEvaluateRuleExpression('user.manager == "[object Object]"', user)).toBe(
      'unevaluable',
    );
  });

  it('negates with the NOT word form as well as with !', () => {
    expect(tryEvaluateRuleExpression('NOT user.active', user)).toBe('no-match');
    expect(tryEvaluateRuleExpression('not user.active', user)).toBe('no-match');
    expect(tryEvaluateRuleExpression('user.notes == null', user)).toBe('match');
  });

  describe('three-valued logic', () => {
    it('resolves an OR whose other side is true', () => {
      expect(
        walkUngated('isMemberOfGroup("00gFAKE") || user.department == "Engineering"', user),
      ).toEqual({ resolved: true, value: true });
    });

    it('resolves an AND whose other side is false', () => {
      expect(walkUngated('isMemberOfGroup("00gFAKE") && user.department == "Sales"', user)).toEqual(
        { resolved: true, value: false },
      );
    });

    it('stays unresolved when the known side cannot decide it', () => {
      expect(
        walkUngated('isMemberOfGroup("00gFAKE") && user.department == "Engineering"', user)
          .resolved,
      ).toBe(false);
    });

    it('propagates an unresolved argument out of a supported call', () => {
      expect(walkUngated('String.startsWith(isMemberOfGroup("00gFAKE"), "a")', user).resolved).toBe(
        false,
      );
    });
  });

  describe('rejections reachable only through the ungated walk', () => {
    it('rejects computed and non-user member access', () => {
      expect(walkUngated('user["department"] == "Engineering"', user).resolved).toBe(false);
      expect(walkUngated('app.id == "0oaFAKE"', user).resolved).toBe(false);
      expect(walkUngated('user.a.b == 1', user).resolved).toBe(false);
    });

    it('rejects a nested callee, an unsupported operator and a bare identifier', () => {
      expect(walkUngated('user.a.b("x") == 1', user).resolved).toBe(false);
      expect(walkUngated('user.employeeNumber % 2 == 0', user).resolved).toBe(false);
      expect(walkUngated('department == "Engineering"', user).resolved).toBe(false);
    });

    it('rejects a wrong-arity call and a non-"!" unary operator', () => {
      expect(walkUngated('String.startsWith(user.firstName)', user).resolved).toBe(false);
      expect(walkUngated('-user.employeeNumber == -42', user).resolved).toBe(false);
    });
  });
});

describe('parse memoisation', () => {
  const user: OktaUser = {
    id: '00uFAKE',
    status: 'ACTIVE',
    profile: {
      login: 'ada@example.com',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      department: 'Engineering',
      city: 'San Francisco',
    },
  } as unknown as OktaUser;

  const PARSE_CACHE_LIMIT = 128;

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

  const ungrammatical = (tag: string): string => `user.${tag} ==`;
  const filler = (tag: string, index: number): string => `user.${tag}${index} == "x"`;

  it('caches a parse failure so an ungrammatical expression is not re-parsed', () => {
    const bad = ungrammatical('memoFailureCached');

    expect(gateAccepts(bad)).toBe(false);
    expect(parseAttempts()).toBe(1);

    expect(gateAccepts(bad)).toBe(false);
    expect(tryEvaluateRuleExpression(bad, user)).toBe('unevaluable');
    expect(tryEvaluateRuleExpressionDetailed(bad, user).outcome).toBe('unevaluable');
    expect(parseAttempts()).toBe(1);
  });

  it(`evicts the oldest entry only once a ${PARSE_CACHE_LIMIT + 1}th expression arrives`, () => {
    const victim = ungrammatical('memoEviction');

    for (let i = 0; i < PARSE_CACHE_LIMIT; i++) gateAccepts(filler('pre', i));

    gateAccepts(victim); // newest of PARSE_CACHE_LIMIT entries
    expect(parseAttempts()).toBe(1);

    for (let i = 0; i < PARSE_CACHE_LIMIT - 1; i++) gateAccepts(filler('post', i));
    expect(gateAccepts(victim)).toBe(false);
    expect(parseAttempts()).toBe(1);

    gateAccepts(filler('post', PARSE_CACHE_LIMIT - 1));
    expect(gateAccepts(victim)).toBe(false);
    expect(parseAttempts()).toBe(2);
  });

  it('never lets a shared cached AST drift between calls, users, or entry points', () => {
    const expression =
      'String.toUpperCase(user.department) == "ENGINEERING" and user.city == "San Francisco"';
    const otherUser: OktaUser = {
      ...user,
      profile: { ...user.profile, department: 'Sales' },
    } as unknown as OktaUser;

    expect(gateAccepts(expression)).toBe(true);
    expect(tryEvaluateRuleExpression(expression, user)).toBe('match');
    expect(tryEvaluateRuleExpression(expression, otherUser)).toBe('no-match');
    expect(tryEvaluateRuleExpressionDetailed(expression, user)).toEqual({ outcome: 'match' });

    expect(tryEvaluateRuleExpression(expression, user)).toBe('match');
    expect(tryEvaluateRuleExpression(expression, otherUser)).toBe('no-match');
    expect(gateAccepts(expression)).toBe(true);
  });
});

describe('tryEvaluateRuleExpressionDetailed', () => {
  const user: OktaUser = {
    id: '00uFAKE',
    status: 'ACTIVE',
    profile: {
      login: 'ada@example.com',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      department: 'Engineering',
      city: 'San Francisco',
      employeeNumber: 42,
      roles: ['admin', 'dev'],
    },
  } as unknown as OktaUser;

  const expressions = [
    'user.department == "Engineering"',
    'user.department == "Sales"',
    'user.department eq "Engineering" and user.city eq "San Francisco"',
    'String.startsWith(user.firstName, "Ad")',
    '!(user.department == "Sales")',
    'user.employeeNumber > 10',
    '',
    '   ',
    'user.department ==',
    '(user.department == "Engineering"',
    'isMemberOfGroup("00gFAKE")',
    'isMemberOfGroup("00gFAKE") || user.department == "Engineering"',
    'app.clientId == "x"',
    'session.amr == "pwd"',
    'user["department"] == "Engineering"',
    'String.substring(user.email, 0, 3) == "ada"',
    'String.startsWith(user.firstName)',
    'user.department + "x" == "Engineeringx"',
    'user.department > "A"',
    'user.department',
    '"Engineering"',
    'this.foo == 1',
    `user.department == "${'x'.repeat(5000)}"`,
  ];

  it.each(expressions)(
    'returns the same outcome as tryEvaluateRuleExpression for %s',
    (expression) => {
      expect(tryEvaluateRuleExpressionDetailed(expression, user).outcome).toBe(
        tryEvaluateRuleExpression(expression, user),
      );
    },
  );

  it('carries no reason code on a decided answer', () => {
    expect(tryEvaluateRuleExpressionDetailed('user.department == "Engineering"', user)).toEqual({
      outcome: 'match',
    });
    expect(tryEvaluateRuleExpressionDetailed('user.department == "Sales"', user)).toEqual({
      outcome: 'no-match',
    });
  });

  it.each([
    { expression: '', reasonCode: 'empty' },
    { expression: '   ', reasonCode: 'empty' },
    { expression: `user.department == "${'x'.repeat(5000)}"`, reasonCode: 'too-long' },
    { expression: 'user.department ==', reasonCode: 'parse-error' },
    { expression: 'user.department + "x" == "Engineeringx"', reasonCode: 'unsupported-operator' },
    { expression: 'isMemberOfGroupName("Eng")', reasonCode: 'group-membership-fn' },
    { expression: 'Arrays.flatten(user.roles)', reasonCode: 'unknown-fn' },
    { expression: 'Arrays.contains(user.department, "Eng")', reasonCode: 'operand-type' },
    { expression: 'user.costCenter == "1234"', reasonCode: 'attribute-absent' },
    { expression: 'user.roles == "admin,dev"', reasonCode: 'operand-type' },
    { expression: 'String.startsWith(user.firstName)', reasonCode: 'fn-arity' },
    { expression: 'app.clientId == "x"', reasonCode: 'unsupported-node' },
    { expression: 'user["department"] == "Engineering"', reasonCode: 'unsupported-node' },
    { expression: 'user.department > "A"', reasonCode: 'operand-type' },
    { expression: 'String.startsWith(user.employeeNumber, "4")', reasonCode: 'operand-type' },
    { expression: 'user.department', reasonCode: 'not-a-boolean' },
    { expression: '"Engineering"', reasonCode: 'not-a-boolean' },
  ])('attributes $reasonCode to $expression', ({ expression, reasonCode }) => {
    expect(tryEvaluateRuleExpressionDetailed(expression, user)).toEqual({
      outcome: 'unevaluable',
      reasonCode,
    });
  });
});

describe('AST seam', () => {
  const user: OktaUser = {
    id: '00uFAKE',
    status: 'ACTIVE',
    profile: {
      login: 'ada@example.com',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      department: 'Engineering',
    },
  } as unknown as OktaUser;

  it('hands back the memoised AST rather than a fresh parse', () => {
    const expression = 'user.department == "Engineering" && user.firstName == "Ada"';
    const first = parseRuleExpression(expression);
    const second = parseRuleExpression(expression);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) expect(second.ast).toBe(first.ast);
  });

  it('classifies why an expression never became an AST', () => {
    expect(parseRuleExpression('')).toEqual({ ok: false, reasonCode: 'empty' });
    expect(parseRuleExpression('user.department ==')).toEqual({
      ok: false,
      reasonCode: 'parse-error',
    });
    expect(parseRuleExpression(`user.department == "${'x'.repeat(5000)}"`)).toEqual({
      ok: false,
      reasonCode: 'too-long',
    });
  });

  it('gates a sub-tree with the same allow-list as a whole expression', () => {
    const parsed = parseRuleExpression('isMemberOfGroup("00gFAKE") && user.department == "Eng"');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const binary = parsed.ast as unknown as { left: never; right: never };
    expect(checkRuleNodeSupport(parsed.ast)).toEqual({
      supported: false,
      reasonCode: 'group-membership-fn',
    });
    expect(checkRuleNodeSupport(binary.left)).toEqual({
      supported: false,
      reasonCode: 'group-membership-fn',
    });
    expect(checkRuleNodeSupport(binary.right)).toEqual({ supported: true });
  });

  it('surfaces the UNRESOLVED sentinel as a reason code instead of a value', () => {
    const resolved = parseRuleExpression('user.department');
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(evaluateRuleNode(resolved.ast, { user })).toEqual({
        resolved: true,
        value: 'Engineering',
      });
    }

    const unresolvable = parseRuleExpression('isMemberOfGroup("00gFAKE")');
    expect(unresolvable.ok).toBe(true);
    if (unresolvable.ok) {
      expect(evaluateRuleNode(unresolvable.ast, { user })).toEqual({
        resolved: false,
        reasonCode: 'group-membership-fn',
      });
    }
  });

  it('evaluates an already-parsed condition without re-parsing it', () => {
    const parsed = parseRuleExpression('user.department == "Engineering"');
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(evaluateParsedRule(parsed.ast, { user })).toEqual({ outcome: 'match' });
  });

  it('exposes the connective set the clause splitter descends through', () => {
    expect([...RULE_CONNECTIVE_OPERATORS].sort()).toEqual(
      ['&&', 'AND', 'OR', '||', 'and', 'or'].sort(),
    );
  });
});
