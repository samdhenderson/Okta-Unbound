import { describe, it, expect } from 'vitest';
import { assessRule } from './ruleAssessment';
import type { RuleGroupContext } from '../ruleEvaluator';
import type { MembershipRule, OktaUser } from '../types';

const USER_ID = '00uFAKESUBJECT';
const HELD_GROUP = { id: '00gFAKEHELD001', name: 'Held Group' };
const OTHER_GROUP = { id: '00gFAKEOTHER01', name: 'Other Group' };

const user = (profile: Partial<OktaUser['profile']> = {}): OktaUser => ({
  id: USER_ID,
  status: 'ACTIVE',
  profile: {
    login: 'subject@example.com',
    email: 'subject@example.com',
    firstName: 'Sub',
    lastName: 'Ject',
    department: 'Engineering',
    employeeNumber: '42', // a STRING, so `user.employeeNumber > 5` is unevaluable
    ...profile,
  },
});

const rule = (over: Partial<MembershipRule> = {}): MembershipRule => ({
  id: '0prFAKE0001',
  name: 'Engineering rule',
  status: 'ACTIVE',
  groupIds: ['00gFAKETARGET1'],
  conditionExpression: 'user.department == "Engineering"',
  ...over,
});

const context: RuleGroupContext = [HELD_GROUP];

describe('assessRule', () => {
  it('grants when the condition matches', () => {
    expect(assessRule(rule(), user(), context).kind).toBe('grants');
  });

  it('is blocked on the clause that failed, with the clause named', () => {
    const result = assessRule(rule(), user({ department: 'Sales' }), context);
    expect(result.kind).toBe('blocked');
    if (result.kind !== 'blocked') return;
    expect(result.failingClauses).toHaveLength(1);
    expect(result.onlyGroupClausesFailed).toBe(false);
  });

  it('names the user route when the rule lists the user', () => {
    const result = assessRule(rule({ excludedUserIds: [USER_ID] }), user(), context);
    expect(result).toMatchObject({ kind: 'excluded', route: 'user' });
  });

  it('names the group route when the user holds an excluded group', () => {
    const result = assessRule(rule({ excludedGroupIds: [HELD_GROUP.id] }), user(), context);
    expect(result).toMatchObject({ kind: 'excluded', route: 'group' });
  });

  it('does not claim the group route without a group context', () => {
    const result = assessRule(rule({ excludedGroupIds: [HELD_GROUP.id] }), user(), undefined);
    expect(result.kind).toBe('grants');
  });

  it('is unknown with no-condition when the rule carries no expression', () => {
    const result = assessRule(rule({ conditionExpression: '' }), user(), context);
    expect(result).toMatchObject({ kind: 'unknown', reason: 'no-condition' });
    if (result.kind === 'unknown') expect(result.condition).toBeUndefined();
  });

  it('carries the evaluator verdict on an unevaluable clause', () => {
    const result = assessRule(
      rule({ conditionExpression: 'user.employeeNumber > 5' }),
      user(),
      context,
    );
    expect(result).toMatchObject({ kind: 'unknown', reason: 'unevaluable-clause' });
    if (result.kind === 'unknown') expect(result.condition?.outcome).toBe('unevaluable');
  });

  it('reports needs-group-context only when no context was supplied', () => {
    const grouped = rule({ conditionExpression: `isMemberOfGroup("${OTHER_GROUP.id}")` });
    expect(assessRule(grouped, user(), undefined)).toMatchObject({
      kind: 'unknown',
      reason: 'needs-group-context',
    });
    const withContext = assessRule(grouped, user(), context);
    expect(withContext.kind).toBe('blocked');
    if (withContext.kind === 'blocked') expect(withContext.onlyGroupClausesFailed).toBe(true);
  });

  it('is blocked on `a && b` when a failed and b is unevaluable', () => {
    const result = assessRule(
      rule({ conditionExpression: 'user.department == "Sales" && user.employeeNumber > 5' }),
      user(),
      context,
    );
    expect(result.kind).toBe('blocked');
  });

  it('is unknown on `a || b` when a failed and b is unevaluable', () => {
    const result = assessRule(
      rule({ conditionExpression: 'user.department == "Sales" || user.employeeNumber > 5' }),
      user(),
      context,
    );
    expect(result.kind).toBe('unknown');
  });

  it('ignores rule status — the callers gate on it', () => {
    expect(assessRule(rule({ status: 'INACTIVE' }), user(), context).kind).toBe('grants');
  });
});
