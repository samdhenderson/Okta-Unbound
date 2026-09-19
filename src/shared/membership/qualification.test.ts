import { describe, it, expect } from 'vitest';
import { assessGroupForUser, assessRuleForUser, type QualificationSubject } from './qualification';
import type { MembershipRule, OktaUser } from '../types';

const USER_ID = '00uFAKESUBJECT';
const TARGET = '00gFAKETARGET1';
const TARGET_2 = '00gFAKETARGET2';
const HELD = '00gFAKEHELD001';

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

const subject = (
  held: string[] = [HELD],
  profile: Partial<OktaUser['profile']> = {},
): QualificationSubject => ({
  user: user(profile),
  groupContext: held.map((id) => ({ id, name: `Group ${id}` })),
});

const rule = (over: Partial<MembershipRule> = {}): MembershipRule => ({
  id: '0prFAKE0001',
  name: 'Engineering rule',
  status: 'ACTIVE',
  groupIds: [TARGET],
  conditionExpression: 'user.department == "Engineering"',
  ...over,
});

describe('assessRuleForUser — headline precedence', () => {
  it('grants an active matching rule', () => {
    const verdict = assessRuleForUser(rule(), subject());
    expect(verdict.headline).toBe('grants');
    expect(verdict.active).toBe(true);
    expect(verdict.condition.outcome).toBe('match');
  });

  it('reports an inactive matching rule as inactive-would-match, never grants', () => {
    const verdict = assessRuleForUser(rule({ status: 'INACTIVE' }), subject());
    expect(verdict.headline).toBe('inactive-would-match');
    expect(verdict.active).toBe(false);
  });

  it('treats INVALID as inactive', () => {
    expect(assessRuleForUser(rule({ status: 'INVALID' }), subject()).headline).toBe(
      'inactive-would-match',
    );
  });

  it('reports does-not-match with the failure evidence, whatever the status', () => {
    const active = assessRuleForUser(rule(), subject([HELD], { department: 'Sales' }));
    expect(active.headline).toBe('does-not-match');
    expect(active.failure?.failingClauses).toHaveLength(1);
    const inactive = assessRuleForUser(
      rule({ status: 'INACTIVE' }),
      subject([HELD], { department: 'Sales' }),
    );
    expect(inactive.headline).toBe('does-not-match');
    expect(inactive.active).toBe(false);
  });

  it('excluded-by-user outranks a matching condition, and the condition is still carried', () => {
    const verdict = assessRuleForUser(rule({ excludedUserIds: [USER_ID] }), subject());
    expect(verdict.headline).toBe('excluded');
    expect(verdict.exclusion).toBe('user');
    expect(verdict.condition.outcome).toBe('match');
  });

  it('excluded-by-group needs the group in the context', () => {
    const excluding = rule({ excludedGroupIds: [HELD] });
    expect(assessRuleForUser(excluding, subject([HELD]))).toMatchObject({
      headline: 'excluded',
      exclusion: 'group',
    });
    expect(assessRuleForUser(excluding, subject([])).headline).toBe('grants');
  });

  it('is undetermined on an unevaluable clause, with the evaluator reason code', () => {
    const verdict = assessRuleForUser(
      rule({ conditionExpression: 'user.employeeNumber > 5' }),
      subject(),
    );
    expect(verdict.headline).toBe('undetermined');
    expect(verdict.undeterminedReason).toBe('unevaluable-clause');
    expect(verdict.condition.outcome).toBe('unevaluable');
  });

  it('is undetermined with no-condition when the rule carries no expression', () => {
    const verdict = assessRuleForUser(rule({ conditionExpression: '' }), subject());
    expect(verdict.headline).toBe('undetermined');
    expect(verdict.undeterminedReason).toBe('no-condition');
    expect(verdict.condition).toEqual({ outcome: 'unevaluable', reasonCode: 'empty' });
  });

  it('never rounds unevaluable to does-not-match', () => {
    const verdict = assessRuleForUser(
      rule({ conditionExpression: 'user.department == "Sales" || user.employeeNumber > 5' }),
      subject(),
    );
    expect(verdict.headline).toBe('undetermined');
    expect(verdict.failure).toBeUndefined();
  });

  it('carries failure iff does-not-match and undeterminedReason iff undetermined', () => {
    const grants = assessRuleForUser(rule(), subject());
    expect(grants.failure).toBeUndefined();
    expect(grants.undeterminedReason).toBeUndefined();
    const blocked = assessRuleForUser(rule(), subject([HELD], { department: 'Sales' }));
    expect(blocked.failure).toBeDefined();
    expect(blocked.undeterminedReason).toBeUndefined();
  });
});

describe('assessRuleForUser — targets and coverage', () => {
  it('reports no-targets for a rule that assigns nowhere', () => {
    const verdict = assessRuleForUser(rule({ groupIds: [] }), subject());
    expect(verdict.targets).toEqual([]);
    expect(verdict.coverage).toBe('no-targets');
  });

  it('marks each target held or not, read from the complete list', () => {
    const verdict = assessRuleForUser(rule({ groupIds: [TARGET, TARGET_2] }), subject([TARGET]));
    expect(verdict.targets).toEqual([
      { groupId: TARGET, member: true },
      { groupId: TARGET_2, member: false },
    ]);
    expect(verdict.coverage).toBe('some');
  });

  it('is all when every target is held and none when no target is', () => {
    expect(assessRuleForUser(rule(), subject([TARGET])).coverage).toBe('all');
    expect(assessRuleForUser(rule(), subject([])).coverage).toBe('none');
  });

  it('names a target only when a name was supplied — an absent name stays absent', () => {
    const names = new Map([[TARGET, 'Engineers']]);
    const verdict = assessRuleForUser(rule({ groupIds: [TARGET, TARGET_2] }), subject(), names);
    expect(verdict.targets[0].groupName).toBe('Engineers');
    expect(verdict.targets[1]).not.toHaveProperty('groupName');
  });

  it('copies the missing verdict only when the producer supplied one', () => {
    const asked = assessRuleForUser(rule({ groupIds: [TARGET, TARGET_2] }), subject(), undefined, [
      TARGET_2,
    ]);
    expect(asked.targets.map((target) => target.missing)).toEqual([false, true]);
    const notAsked = assessRuleForUser(rule(), subject());
    expect(notAsked.targets[0]).not.toHaveProperty('missing');
  });
});

describe('assessGroupForUser', () => {
  const feeding = (over: Partial<MembershipRule> = {}) => rule({ groupIds: [TARGET], ...over });
  const target = { id: TARGET, type: 'OKTA_GROUP' };

  it('is app-managed for an APP_GROUP whatever the rules say', () => {
    expect(
      assessGroupForUser({
        group: { id: TARGET, type: 'APP_GROUP' },
        feedingRules: [feeding()],
        subject: subject(),
      }),
    ).toEqual({ kind: 'app-managed' });
  });

  it('is already-member when the subject holds the group, with the rules as evidence', () => {
    const verdict = assessGroupForUser({
      group: target,
      feedingRules: [feeding()],
      subject: subject([TARGET]),
    });
    expect(verdict.kind).toBe('already-member');
    if (verdict.kind === 'already-member') expect(verdict.rules).toHaveLength(1);
  });

  it('already-member beats an unavailable inventory', () => {
    expect(
      assessGroupForUser({ group: target, feedingRules: null, subject: subject([TARGET]) }),
    ).toEqual({ kind: 'already-member', rules: [] });
  });

  it('is inventory-unavailable when the feeding list could not be obtained', () => {
    expect(assessGroupForUser({ group: target, feedingRules: null, subject: subject() })).toEqual({
      kind: 'inventory-unavailable',
    });
  });

  it('is no-feeding-rule when the obtained list assigns nothing into the group', () => {
    const elsewhere = feeding({ groupIds: [TARGET_2] });
    expect(
      assessGroupForUser({ group: target, feedingRules: [elsewhere], subject: subject() }),
    ).toEqual({ kind: 'no-feeding-rule' });
  });

  it('is would-be-added listing only the granting rule ids', () => {
    const grants = feeding({ id: '0prFAKEGRANT' });
    const blocks = feeding({
      id: '0prFAKEBLOCK',
      conditionExpression: 'user.department == "Sales"',
    });
    const verdict = assessGroupForUser({
      group: target,
      feedingRules: [grants, blocks],
      subject: subject(),
    });
    expect(verdict).toMatchObject({ kind: 'would-be-added', grantingRuleIds: ['0prFAKEGRANT'] });
    if (verdict.kind === 'would-be-added') expect(verdict.rules).toHaveLength(2);
  });

  it('an inactive matching rule alone is not-qualified, never would-be-added', () => {
    const verdict = assessGroupForUser({
      group: target,
      feedingRules: [feeding({ status: 'INACTIVE' })],
      subject: subject(),
    });
    expect(verdict.kind).toBe('not-qualified');
  });

  it('is undetermined when nothing grants and one rule could not be decided', () => {
    const undecided = feeding({ conditionExpression: 'user.employeeNumber > 5' });
    const blocks = feeding({
      id: '0prFAKEBLOCK',
      conditionExpression: 'user.department == "Sales"',
    });
    expect(
      assessGroupForUser({ group: target, feedingRules: [undecided, blocks], subject: subject() })
        .kind,
    ).toBe('undetermined');
  });

  it('is not-qualified only when every rule is excluded, does-not-match or inactive', () => {
    const excluded = feeding({ id: '0prFAKEEXCL', excludedUserIds: [USER_ID] });
    const blocks = feeding({
      id: '0prFAKEBLOCK',
      conditionExpression: 'user.department == "Sales"',
    });
    expect(
      assessGroupForUser({ group: target, feedingRules: [excluded, blocks], subject: subject() })
        .kind,
    ).toBe('not-qualified');
  });
});
