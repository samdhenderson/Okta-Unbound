import { describe, it, expect } from 'vitest';
import {
  classifyAccessCauses,
  groupCausesByRemedy,
  type AccessCause,
  type AccessCauseInput,
} from './accessCause';
import type {
  GroupMembership,
  MembershipRule,
  OktaGroup,
  OktaUser,
} from '../../../../shared/types';

const GROUP_ID = '00gFAKEGROUP01';
const CONTEXT_USER_ID = '00uFAKECONTEXT';

const contextUser = (profile: Partial<OktaUser['profile']> = {}): OktaUser => ({
  id: CONTEXT_USER_ID,
  status: 'ACTIVE',
  profile: {
    login: 'context@example.com',
    email: 'context@example.com',
    firstName: 'Con',
    lastName: 'Text',
    department: 'Engineering',
    title: 'Engineer',
    employeeNumber: '42', // a STRING, so `user.employeeNumber > 5` is unevaluable
    ...profile,
  },
});

const group = (id = GROUP_ID, name = 'VPN Access'): OktaGroup => ({
  id,
  type: 'OKTA_GROUP',
  profile: { name },
});

const membership = (over: Partial<GroupMembership> = {}): GroupMembership => ({
  group: group(),
  membershipType: 'RULE_BASED',
  rules: [],
  attribution: 'exact',
  ...over,
});

const directMembership = (over: Partial<GroupMembership> = {}): GroupMembership =>
  membership({ membershipType: 'DIRECT', ...over });

const rule = (over: Partial<MembershipRule> = {}): MembershipRule => ({
  id: '0prFAKE0001',
  name: 'Sales rule',
  status: 'ACTIVE',
  groupIds: [GROUP_ID],
  conditionExpression: 'user.department == "Sales"',
  ...over,
});

const classify = (
  rules: AccessCauseInput['rules'],
  memberships: GroupMembership[] = [membership()],
  user: OktaUser = contextUser(),
): AccessCause[] => classifyAccessCauses({ onlyCompared: memberships, contextUser: user, rules });

const one = (
  rules: AccessCauseInput['rules'],
  memberships: GroupMembership[] = [membership()],
  user: OktaUser = contextUser(),
): AccessCause => classify(rules, memberships, user)[0];

describe('classifyAccessCauses', () => {
  it('returns one cause per membership, in input order', () => {
    const causes = classify(
      [],
      [
        membership({ group: group('00gFAKEz', 'Zebra') }),
        membership({ group: group('00gFAKEa', 'Alpha') }),
        membership({ group: group('00gFAKEm', 'Mike') }),
      ],
    );

    expect(causes.map((c) => c.groupId)).toEqual(['00gFAKEz', '00gFAKEa', '00gFAKEm']);
    expect(causes.map((c) => c.groupName)).toEqual(['Zebra', 'Alpha', 'Mike']);
  });

  it('returns an empty array for an empty diff', () => {
    expect(classify([], [])).toEqual([]);
  });

  describe('rules === null', () => {
    it('yields cannot-determine / no-rule-inventory, NEVER manual-add', () => {
      const cause = one(null);

      expect(cause.remedy).toBe('cannot-determine');
      expect(cause.undeterminedReason).toBe('no-rule-inventory');
      expect(cause.failingClauses).toEqual([]);
    });

    it('applies to every row, whatever its attribution', () => {
      const causes = classify(null, [
        membership(),
        membership({ membershipType: 'RULE_BASED', rules: [rule()], attribution: 'exact' }),
        membership({ membershipType: 'UNKNOWN', attribution: 'ambiguous' }),
      ]);

      expect(causes.every((c) => c.remedy === 'cannot-determine')).toBe(true);
      expect(causes.every((c) => c.undeterminedReason === 'no-rule-inventory')).toBe(true);
    });

    it('is distinct from an EMPTY inventory, which can still say manual-add', () => {
      expect(one(null).remedy).toBe('cannot-determine');
      expect(one([], [directMembership()]).remedy).toBe('manual-add');
    });
  });

  describe('excluded-by-rule', () => {
    const excludingRule = (over: Partial<MembershipRule> = {}): MembershipRule =>
      rule({
        id: '0prFAKEEXCL',
        name: 'Excluding rule',
        conditions: {
          people: { users: { exclude: [CONTEXT_USER_ID] } },
          expression: {
            value: 'user.department == "Engineering"',
            type: 'urn:okta:expression:1.0',
          },
        },
        conditionExpression: undefined,
        ...over,
      });

    it('names the excluding rule and carries no failing clauses', () => {
      const cause = one([excludingRule()]);

      expect(cause.remedy).toBe('excluded-by-rule');
      expect(cause.ruleId).toBe('0prFAKEEXCL');
      expect(cause.ruleName).toBe('Excluding rule');
      expect(cause.failingClauses).toEqual([]);
      expect(cause.undeterminedReason).toBeUndefined();
    });

    it('outranks a failing attribute on another rule', () => {
      const cause = one([rule(), excludingRule()]);
      expect(cause.remedy).toBe('excluded-by-rule');
    });

    it('ignores an exclusion list that names somebody else', () => {
      const cause = one([
        excludingRule({ conditions: { people: { users: { exclude: ['00uFAKEOTHER'] } } } }),
      ]);
      expect(cause.remedy).not.toBe('excluded-by-rule');
    });
  });

  describe('blocked-by-attribute', () => {
    it('reports the failing clause and names the single implicated rule', () => {
      const cause = one([rule()]);

      expect(cause.remedy).toBe('blocked-by-attribute');
      expect(cause.ruleId).toBe('0prFAKE0001');
      expect(cause.ruleName).toBe('Sales rule');
      expect(cause.undeterminedReason).toBeUndefined();
      expect(cause.failingClauses).toHaveLength(1);
      expect(cause.failingClauses[0].status).toBe('fail');
      expect(cause.failingClauses[0].resolvedValue).toBe('Engineering');
    });

    it('carries every failing clause of the rule', () => {
      const cause = one([
        rule({ conditionExpression: 'user.department == "Sales" && user.title == "Manager"' }),
      ]);

      expect(cause.remedy).toBe('blocked-by-attribute');
      expect(cause.failingClauses).toHaveLength(2);
      expect(cause.failingClauses.every((c) => c.status === 'fail')).toBe(true);
    });

    it('excludes clauses that PASSED', () => {
      const cause = one([
        rule({
          conditionExpression: 'user.department == "Engineering" && user.title == "Manager"',
        }),
      ]);

      expect(cause.remedy).toBe('blocked-by-attribute');
      expect(cause.failingClauses).toHaveLength(1);
      expect(cause.failingClauses[0].expressionText).toContain('title');
    });

    it('drops the rule name when several rules are blocked, and concatenates their clauses', () => {
      const cause = one([
        rule({ id: '0prFAKEA', conditionExpression: 'user.department == "Sales"' }),
        rule({ id: '0prFAKEB', conditionExpression: 'user.title == "Manager"' }),
      ]);

      expect(cause.remedy).toBe('blocked-by-attribute');
      expect(cause.ruleId).toBeUndefined();
      expect(cause.ruleName).toBeUndefined();
      expect(cause.failingClauses).toHaveLength(2);
    });

    it('is unaffected by an INACTIVE rule, which grants nothing', () => {
      const cause = one([rule({ status: 'INACTIVE' })], [directMembership()]);
      expect(cause.remedy).toBe('manual-add');
    });

    it('reads targeting from actions.assignUserToGroups as well as groupIds', () => {
      const cause = one([
        rule({
          groupIds: undefined,
          actions: { assignUserToGroups: { groupIds: [GROUP_ID] } },
        }),
      ]);

      expect(cause.remedy).toBe('blocked-by-attribute');
    });

    it('ignores rules targeting a different group', () => {
      const cause = one([rule({ groupIds: ['00gFAKEOTHER'] })], [directMembership()]);
      expect(cause.remedy).toBe('manual-add');
    });
  });

  describe('not-evaluated clauses', () => {
    it('never yields blocked-by-attribute on its own', () => {
      const cause = one([rule({ conditionExpression: 'isMemberOfGroup("00gFAKEOTHER")' })]);

      expect(cause.remedy).toBe('cannot-determine');
      expect(cause.undeterminedReason).toBe('needs-group-context');
      expect(cause.failingClauses).toEqual([]);
    });

    it('prefers needs-group-context over the generic unevaluable-clause', () => {
      const cause = one([rule({ conditionExpression: 'isMemberOfGroupName("Contractors")' })]);
      expect(cause.undeterminedReason).toBe('needs-group-context');
    });

    it('falls back to unevaluable-clause when nothing needs group context', () => {
      const cause = one([rule({ conditionExpression: 'user.employeeNumber > 5' })]);

      expect(cause.remedy).toBe('cannot-determine');
      expect(cause.undeterminedReason).toBe('unevaluable-clause');
      expect(cause.failingClauses).toEqual([]);
    });

    it('reports an unparseable condition as unevaluable-clause, never as a failure', () => {
      const cause = one([rule({ conditionExpression: 'user.department ==' })]);

      expect(cause.remedy).toBe('cannot-determine');
      expect(cause.undeterminedReason).toBe('unevaluable-clause');
      expect(cause.failingClauses).toEqual([]);
    });

    it('MIXED, &&: a proven no-match verdict yields blocked-by-attribute with ONLY the fail row', () => {
      const cause = one([
        rule({ conditionExpression: 'user.department == "Sales" && user.employeeNumber > 5' }),
      ]);

      expect(cause.remedy).toBe('blocked-by-attribute');
      expect(cause.failingClauses).toHaveLength(1);
      expect(cause.failingClauses[0].expressionText).toContain('department');
      expect(cause.failingClauses.every((c) => c.status === 'fail')).toBe(true);
      expect(cause.failingClauses.some((c) => c.reasonCode !== undefined)).toBe(false);
    });

    it('MIXED, ||: an unevaluable verdict yields cannot-determine and NO failing clauses', () => {
      const cause = one([
        rule({ conditionExpression: 'user.department == "Sales" || user.employeeNumber > 5' }),
      ]);

      expect(cause.remedy).toBe('cannot-determine');
      expect(cause.undeterminedReason).toBe('unevaluable-clause');
      expect(cause.failingClauses).toEqual([]);
    });

    it('MIXED, && with a group-context call: still cannot-determine, and the fail row does not leak', () => {
      const cause = one([
        rule({
          conditionExpression: 'user.department == "Sales" && isMemberOfGroup("00gFAKEOTHER")',
        }),
      ]);

      expect(cause.remedy).toBe('cannot-determine');
      expect(cause.undeterminedReason).toBe('needs-group-context');
      expect(cause.failingClauses).toEqual([]);
    });

    it('prefers needs-group-context when several rules are unresolved for different reasons', () => {
      const cause = one([
        rule({ id: '0prFAKEA', conditionExpression: 'user.employeeNumber > 5' }),
        rule({ id: '0prFAKEB', conditionExpression: 'isMemberOfGroup("00gFAKEOTHER")' }),
      ]);

      expect(cause.undeterminedReason).toBe('needs-group-context');
      expect(cause.ruleId).toBeUndefined();
    });

    it('names the rule when exactly one is unresolved', () => {
      const cause = one([rule({ conditionExpression: 'isMemberOfGroup("00gFAKEOTHER")' })]);
      expect(cause.ruleId).toBe('0prFAKE0001');
      expect(cause.ruleName).toBe('Sales rule');
    });

    it('CHARACTERIZED: a proven blocker outranks an unresolved sibling RULE', () => {
      const cause = one([
        rule({ id: '0prFAKEA', conditionExpression: 'user.department == "Sales"' }),
        rule({ id: '0prFAKEB', conditionExpression: 'isMemberOfGroup("00gFAKEOTHER")' }),
      ]);

      expect(cause.remedy).toBe('blocked-by-attribute');
      expect(cause.ruleId).toBe('0prFAKEA');
    });
  });

  describe('no-condition', () => {
    it('treats an absent expression as no-condition, not as "matches nothing"', () => {
      const cause = one([rule({ conditionExpression: undefined })]);

      expect(cause.remedy).toBe('cannot-determine');
      expect(cause.undeterminedReason).toBe('no-condition');
      expect(cause.failingClauses).toEqual([]);
    });

    it('treats an empty expression as no-condition', () => {
      const cause = one([rule({ conditionExpression: '' })]);
      expect(cause.undeterminedReason).toBe('no-condition');
    });

    it('treats a whitespace-only expression as no-condition', () => {
      const cause = one([rule({ conditionExpression: '   ' })]);
      expect(cause.undeterminedReason).toBe('no-condition');
    });

    it('falls back to the raw conditions.expression shape when present', () => {
      const cause = one([
        rule({
          conditionExpression: undefined,
          conditions: {
            expression: { value: 'user.department == "Sales"', type: 'urn:okta:expression:1.0' },
          },
        }),
      ]);

      expect(cause.remedy).toBe('blocked-by-attribute');
    });
  });

  describe('manual-add', () => {
    it('is claimed when no rule targets the group and the membership is DIRECT/exact', () => {
      const cause = one([rule({ groupIds: ['00gFAKEOTHER'] })], [directMembership()]);

      expect(cause.remedy).toBe('manual-add');
      expect(cause.undeterminedReason).toBeUndefined();
      expect(cause.failingClauses).toEqual([]);
      expect(cause.ruleId).toBeUndefined();
    });

    it('is NOT claimed for a rule-attributed membership no supplied rule accounts for', () => {
      const cause = one(
        [],
        [membership({ membershipType: 'RULE_BASED', rules: [], attribution: 'exact' })],
      );

      expect(cause.remedy).toBe('cannot-determine');
      expect(cause.undeterminedReason).toBe('no-rule-inventory');
    });

    it('is NOT claimed for an unclassified (UNKNOWN/ambiguous) membership', () => {
      const cause = one([], [membership({ membershipType: 'UNKNOWN', attribution: 'ambiguous' })]);

      expect(cause.remedy).toBe('cannot-determine');
      expect(cause.undeterminedReason).toBe('ambiguous-attribution');
    });

    it('is NOT claimed on a deduced attribution — manual-add is a confident claim', () => {
      const cause = one([], [membership({ membershipType: 'DIRECT', attribution: 'inferred' })]);

      expect(cause.remedy).toBe('cannot-determine');
      expect(cause.undeterminedReason).toBe('ambiguous-attribution');
    });
  });

  describe('ambiguous-attribution', () => {
    it('reports an ambiguous compared-side membership as cannot-determine', () => {
      const cause = one(
        [],
        [
          membership({
            membershipType: 'RULE_BASED',
            rules: [rule({ id: '0prFAKEA' }), rule({ id: '0prFAKEB' })],
            attribution: 'ambiguous',
          }),
        ],
      );

      expect(cause.remedy).toBe('cannot-determine');
      expect(cause.undeterminedReason).toBe('ambiguous-attribution');
      expect(cause.failingClauses).toEqual([]);
    });

    it('does not suppress a hard finding about the CONTEXT user', () => {
      const cause = one(
        [rule()],
        [membership({ membershipType: 'RULE_BASED', rules: [rule()], attribution: 'ambiguous' })],
      );

      expect(cause.remedy).toBe('blocked-by-attribute');
    });
  });

  it('reports a rule that ALREADY matches the context user as cannot-determine', () => {
    const cause = one([rule({ conditionExpression: 'user.department == "Engineering"' })]);

    expect(cause.remedy).toBe('cannot-determine');
    expect(cause.undeterminedReason).toBe('unevaluable-clause');
    expect(cause.failingClauses).toEqual([]);
  });

  describe('invariants', () => {
    const mixedInput = (): AccessCause[] =>
      classify(
        [
          rule({ id: '0prFAKEBLOCK', groupIds: ['00gFAKEBLOCKED'] }),
          rule({
            id: '0prFAKEEXCL',
            groupIds: ['00gFAKEEXCLUDED'],
            conditions: { people: { users: { exclude: [CONTEXT_USER_ID] } } },
          }),
          rule({
            id: '0prFAKEUNK',
            groupIds: ['00gFAKEUNKNOWN'],
            conditionExpression: 'isMemberOfGroup("00gFAKEOTHER")',
          }),
        ],
        [
          membership({ group: group('00gFAKEBLOCKED', 'Blocked') }),
          membership({ group: group('00gFAKEEXCLUDED', 'Excluded') }),
          directMembership({ group: group('00gFAKEMANUAL', 'Manual') }),
          membership({ group: group('00gFAKEUNKNOWN', 'Unknown') }),
        ],
      );

    it('covers all four remedies from one realistic input', () => {
      expect(mixedInput().map((c) => c.remedy)).toEqual([
        'blocked-by-attribute',
        'excluded-by-rule',
        'manual-add',
        'cannot-determine',
      ]);
    });

    it('carries undeterminedReason exactly when the remedy is cannot-determine', () => {
      for (const cause of mixedInput()) {
        expect(cause.undeterminedReason !== undefined).toBe(cause.remedy === 'cannot-determine');
      }
    });

    it('leaves failingClauses empty for every remedy except blocked-by-attribute', () => {
      for (const cause of mixedInput()) {
        if (cause.remedy !== 'blocked-by-attribute') expect(cause.failingClauses).toEqual([]);
        else expect(cause.failingClauses.length).toBeGreaterThan(0);
      }
    });

    it('never puts a not-evaluated clause in failingClauses, whatever the input', () => {
      const causes = classify(
        [
          rule({ id: '0prFAKE1', groupIds: ['00gFAKE1'], conditionExpression: 'user.x > 5' }),
          rule({
            id: '0prFAKE2',
            groupIds: ['00gFAKE2'],
            conditionExpression: 'user.department == "Sales" && user.employeeNumber > 5',
          }),
          rule({
            id: '0prFAKE3',
            groupIds: ['00gFAKE3'],
            conditionExpression: 'user.department == "Sales" || isMemberOfGroup("00gFAKEX")',
          }),
        ],
        ['00gFAKE1', '00gFAKE2', '00gFAKE3'].map((id) => membership({ group: group(id, id) })),
      );

      for (const cause of causes) {
        expect(cause.failingClauses.every((c) => c.status === 'fail')).toBe(true);
      }
    });
  });
});

describe('groupCausesByRemedy', () => {
  const cause = (remedy: AccessCause['remedy'], groupId: string): AccessCause => ({
    groupId,
    groupName: groupId,
    remedy,
    ...(remedy === 'cannot-determine' ? { undeterminedReason: 'unevaluable-clause' as const } : {}),
    failingClauses: [],
  });

  it('returns groups in remedy order', () => {
    const grouped = groupCausesByRemedy([
      cause('cannot-determine', '00gFAKE1'),
      cause('manual-add', '00gFAKE2'),
      cause('excluded-by-rule', '00gFAKE3'),
      cause('blocked-by-attribute', '00gFAKE4'),
    ]);

    expect(grouped.map((g) => g.remedy)).toEqual([
      'blocked-by-attribute',
      'excluded-by-rule',
      'manual-add',
      'cannot-determine',
    ]);
  });

  it('preserves input order within a group', () => {
    const grouped = groupCausesByRemedy([
      cause('manual-add', '00gFAKEz'),
      cause('manual-add', '00gFAKEa'),
      cause('manual-add', '00gFAKEm'),
    ]);

    expect(grouped[0].causes.map((c) => c.groupId)).toEqual(['00gFAKEz', '00gFAKEa', '00gFAKEm']);
  });

  it('omits remedies with no causes', () => {
    const grouped = groupCausesByRemedy([cause('manual-add', '00gFAKE1')]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].remedy).toBe('manual-add');
  });

  it('NEVER merges a lone cannot-determine into another bucket', () => {
    const grouped = groupCausesByRemedy([
      cause('blocked-by-attribute', '00gFAKE1'),
      cause('blocked-by-attribute', '00gFAKE2'),
      cause('cannot-determine', '00gFAKE3'),
    ]);

    expect(grouped).toHaveLength(2);
    expect(grouped[1].remedy).toBe('cannot-determine');
    expect(grouped[1].causes.map((c) => c.groupId)).toEqual(['00gFAKE3']);
    expect(grouped[0].causes.map((c) => c.groupId)).toEqual(['00gFAKE1', '00gFAKE2']);
  });

  it('keeps cannot-determine separate even when it is the only bucket', () => {
    const grouped = groupCausesByRemedy([cause('cannot-determine', '00gFAKE1')]);
    expect(grouped).toEqual([
      { remedy: 'cannot-determine', causes: [cause('cannot-determine', '00gFAKE1')] },
    ]);
  });

  it('returns nothing for an empty input', () => {
    expect(groupCausesByRemedy([])).toEqual([]);
  });
});
