import { describe, it, expect } from 'vitest';
import { tryEvaluateRuleExpression, tryEvaluateRuleExpressionDetailed } from './ruleEvaluator';
import type { OktaUser } from './types';

const user: OktaUser = {
  id: '00uFAKEuser00001',
  status: 'ACTIVE',
  profile: {
    login: 'ada@example.com',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
  },
};

const groups = [
  { id: '00gFAKEgroup0001', name: 'Engineering' },
  { id: '00gFAKEgroup0002', name: 'VPN — Standard' },
];

describe('isMemberOf* with a group context', () => {
  it.each([
    ['isMemberOfGroup("00gFAKEgroup0001")', 'match'],
    ['isMemberOfGroup("00gFAKEgroup9999")', 'no-match'],
    ['isMemberOfGroupName("Engineering")', 'match'],
    ['isMemberOfGroupName("Finance")', 'no-match'],
    ['isMemberOfAnyGroup("00gFAKEgroup9999", "00gFAKEgroup0002")', 'match'],
    ['isMemberOfAnyGroup("00gFAKEgroup9998", "00gFAKEgroup9999")', 'no-match'],
    ['isMemberOfAnyGroupName("Finance", "Engineering")', 'match'],
    ['isMemberOfAnyGroupName("Finance", "Legal")', 'no-match'],
    ['isMemberOfGroupNameStartsWith("VPN")', 'match'],
    ['isMemberOfGroupNameStartsWith("SSH")', 'no-match'],
    ['isMemberOfGroupNameContains("Standard")', 'match'],
    ['isMemberOfGroupNameContains("Premium")', 'no-match'],
  ])('%s → %s', (expression, expected) => {
    expect(tryEvaluateRuleExpression(expression, user, groups)).toBe(expected);
  });

  it('matches group names case-sensitively, as Okta does', () => {
    expect(tryEvaluateRuleExpression('isMemberOfGroupName("engineering")', user, groups)).toBe(
      'no-match',
    );
  });

  it('combines with profile clauses in one expression', () => {
    expect(
      tryEvaluateRuleExpression(
        'user.department == "Engineering" && isMemberOfGroup("00gFAKEgroup0002")',
        user,
        groups,
      ),
    ).toBe('match');
  });

  it('answers no-match for a user with no groups at all', () => {
    expect(tryEvaluateRuleExpression('isMemberOfGroup("00gFAKEgroup0001")', user, [])).toBe(
      'no-match',
    );
  });
});

describe('isMemberOf* without a group context', () => {
  it.each([
    'isMemberOfGroup("00gFAKEgroup0001")',
    'isMemberOfGroupName("Engineering")',
    'isMemberOfAnyGroup("00gFAKEgroup0001")',
    'isMemberOfAnyGroupName("Engineering")',
    'isMemberOfGroupNameStartsWith("VPN")',
    'isMemberOfGroupNameContains("Standard")',
  ])('%s stays unevaluable, never no-match', (expression) => {
    expect(tryEvaluateRuleExpression(expression, user)).toBe('unevaluable');
    expect(tryEvaluateRuleExpressionDetailed(expression, user)).toEqual({
      outcome: 'unevaluable',
      reasonCode: 'group-membership-fn',
    });
  });
});

describe('isMemberOfGroupNameRegex is answered like its siblings', () => {
  it('resolves against the group list instead of refusing', () => {
    expect(
      tryEvaluateRuleExpressionDetailed('isMemberOfGroupNameRegex(".*")', user, groups),
    ).toEqual({ outcome: 'match' });
  });

  it('resolves the whole condition it sits in', () => {
    expect(
      tryEvaluateRuleExpression(
        'user.department == "Engineering" && isMemberOfGroupNameRegex("Eng.*")',
        user,
        groups,
      ),
    ).toBe('match');
  });

  it('still declines a pattern the safe engine will not run', () => {
    expect(
      tryEvaluateRuleExpressionDetailed('isMemberOfGroupNameRegex("(?<=x)Eng")', user, groups),
    ).toEqual({ outcome: 'unevaluable', reasonCode: 'regex-unsupported-syntax' });
  });
});
