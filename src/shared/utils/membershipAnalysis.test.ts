import { describe, it, expect } from 'vitest';
import {
  analyzeMemberships,
  attributionNamesRules,
  attributionSemantics,
  isDeducedAttribution,
  unclassifiedMemberships,
} from './membershipAnalysis';
import { groupContextOfGroups } from '../membership/groupContext';
import type { OktaGroup, OktaUser, MembershipRule, MembershipAttribution } from '../types';

function group(over: Partial<OktaGroup> = {}): OktaGroup {
  return {
    id: 'g1',
    type: 'OKTA_GROUP',
    created: '2020-01-01T00:00:00.000Z',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    profile: { name: 'Engineering', description: '' },
    ...over,
  } as OktaGroup;
}

function rule(over: Partial<MembershipRule> = {}): MembershipRule {
  return { id: 'r1', name: 'Rule 1', status: 'ACTIVE', groupIds: ['g1'], ...over };
}

const user: OktaUser = {
  id: 'u1',
  status: 'ACTIVE',
  profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@x.com', login: 'ada@x.com' },
} as OktaUser;

describe('analyzeMemberships', () => {
  it('returns [] for no groups', () => {
    expect(analyzeMemberships([], [rule()], user)).toEqual([]);
  });

  it('classifies APP_GROUP as RULE_BASED with no rule, even absent any rules', () => {
    const [m] = analyzeMemberships([group({ id: 'a', type: 'APP_GROUP' })], [], user);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.rules).toEqual([]);
  });

  it('classifies a group with no matching active rules as DIRECT', () => {
    const [m] = analyzeMemberships([group({ id: 'g2' })], [rule({ groupIds: ['other'] })], user);
    expect(m.membershipType).toBe('DIRECT');
    expect(m.rules).toEqual([]);
  });

  it('ignores INACTIVE rules (→ DIRECT)', () => {
    const [m] = analyzeMemberships([group()], [rule({ status: 'INACTIVE' })], user);
    expect(m.membershipType).toBe('DIRECT');
  });

  it('classifies a group with a matching active rule as RULE_BASED and attributes it', () => {
    const r = rule({ id: 'rX', groupIds: ['g1'] });
    const [m] = analyzeMemberships([group()], [r], user);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.rules.map((r) => r.id)).toEqual(['rX']);
  });

  it('matches on actions.assignUserToGroups.groupIds when groupIds is absent', () => {
    const r = rule({
      id: 'rA',
      groupIds: undefined,
      actions: { assignUserToGroups: { groupIds: ['g1'] } },
    });
    const [m] = analyzeMemberships([group()], [r], user);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.rules.map((r) => r.id)).toEqual(['rA']);
  });

  it('defaults attribution to the first matching rule (low confidence)', () => {
    const first = rule({ id: 'first' });
    const second = rule({ id: 'second' });
    const [m] = analyzeMemberships([group()], [first, second], user);
    expect(m.rules[0]?.id).toBe('first');
    expect(m.rules.map((r) => r.id)).toEqual(['first', 'second']);
    expect(m.attribution).toBe('ambiguous');
  });

  it('classifies as DIRECT when the user is excluded from every matching rule', () => {
    const excluding = rule({
      id: 'exc',
      conditions: { people: { users: { exclude: ['u1'] } } },
    });
    const [m] = analyzeMemberships([group()], [excluding], user);
    expect(m.membershipType).toBe('DIRECT');
    expect(m.rules).toEqual([]);
  });

  it('stays RULE_BASED and attributes to a non-excluding rule when excluded from only some', () => {
    const excluding = rule({ id: 'exc', conditions: { people: { users: { exclude: ['u1'] } } } });
    const keeps = rule({ id: 'keeps' });
    const [m] = analyzeMemberships([group()], [excluding, keeps], user);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.rules.map((r) => r.id)).toEqual(['keeps']);
  });

  it('marks a rule with no condition expression as inferred (nothing to evaluate)', () => {
    const [m] = analyzeMemberships([group()], [rule({ id: 'rX' })], user);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.attribution).toBe('inferred');
  });

  it('never credits a rule the evaluator PROVED does not match, however well it scores', () => {
    const engUser = {
      ...user,
      profile: { ...user.profile, department: 'Engineering' },
    } as OktaUser;
    const plain = rule({ id: 'plain' });
    const scoresButProvenNoMatch = rule({
      id: 'matching',
      userAttributes: ['department'],
      conditions: {
        expression: { value: 'user.department == "engineering"', type: 'urn:okta:expression:1.0' },
      },
    });
    const [m] = analyzeMemberships([group()], [plain, scoresButProvenNoMatch], engUser);
    expect(m.rules.map((r) => r.id)).toEqual(['plain']);
    expect(m.attribution).toBe('inferred');
  });

  it('scores an unevaluable rule whose condition names the user’s own attribute value', () => {
    const engUser = {
      ...user,
      profile: { ...user.profile, department: 'Engineering' },
    } as OktaUser;
    const plain = rule({ id: 'plain' });
    const scores = rule({
      id: 'scores',
      userAttributes: ['department'],
      conditionExpression: 'isMemberOfGroup("00gFAKE") OR user.dept == "Engineering"',
    });
    const [m] = analyzeMemberships([group()], [plain, scores], engUser);
    expect(m.rules.map((r) => r.id)).toEqual(['scores']);
    expect(m.attribution).toBe('inferred');
  });
});

describe('analyzeMemberships — plural attribution and guess labelling', () => {
  const engUser = {
    ...user,
    profile: { ...user.profile, department: 'Engineering' },
  } as OktaUser;

  function ruleWith(expression: string, over: Partial<MembershipRule> = {}): MembershipRule {
    return rule({ conditionExpression: expression, ...over });
  }

  it('carries EVERY rule the user provably matches, not just the first', () => {
    const byDept = ruleWith('user.department == "Engineering"', { id: 'byDept' });
    const byLogin = ruleWith('user.login == "ada@x.com"', { id: 'byLogin' });
    const [m] = analyzeMemberships([group()], [byDept, byLogin], engUser);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.rules.map((r) => r.id)).toEqual(['byDept', 'byLogin']);
    expect(m.attribution).toBe('exact');
  });

  it('keeps a proven match exact even when a sibling rule is unevaluable', () => {
    const opaque = ruleWith('isMemberOfGroup("00gFAKE")', { id: 'opaque' });
    const byDept = ruleWith('user.department == "Engineering"', { id: 'byDept' });
    const [m] = analyzeMemberships([group()], [opaque, byDept], engUser);
    expect(m.rules.map((r) => r.id)).toEqual(['byDept']);
    expect(m.attribution).toBe('exact');
  });

  it('calls a sole surviving candidate inferred — nothing else could explain it', () => {
    const opaque = ruleWith('isMemberOfGroup("00gFAKE")', { id: 'opaque' });
    const provenNoMatch = ruleWith('user.department == "Sales"', { id: 'sales' });
    const [m] = analyzeMemberships([group()], [opaque, provenNoMatch], engUser);
    expect(m.rules.map((r) => r.id)).toEqual(['opaque']);
    expect(m.attribution).toBe('inferred');
  });

  it('calls two indistinguishable candidates ambiguous and carries BOTH', () => {
    const opaqueA = ruleWith('isMemberOfGroup("00gFAKE1")', { id: 'opaqueA' });
    const opaqueB = ruleWith('isMemberOfGroup("00gFAKE2")', { id: 'opaqueB' });
    const [m] = analyzeMemberships([group()], [opaqueA, opaqueB], engUser);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.rules.map((r) => r.id)).toEqual(['opaqueA', 'opaqueB']);
    expect(m.attribution).toBe('ambiguous');
  });

  it('excludes a proven no-match from the ambiguous candidate set', () => {
    const opaqueA = ruleWith('isMemberOfGroup("00gFAKE1")', { id: 'opaqueA' });
    const opaqueB = ruleWith('isMemberOfGroup("00gFAKE2")', { id: 'opaqueB' });
    const provenNoMatch = ruleWith('user.department == "Sales"', { id: 'sales' });
    const [m] = analyzeMemberships([group()], [opaqueA, provenNoMatch, opaqueB], engUser);
    expect(m.rules.map((r) => r.id)).toEqual(['opaqueA', 'opaqueB']);
    expect(m.attribution).toBe('ambiguous');
  });

  it('excludes a rule the user is excluded from the candidate set', () => {
    const opaqueA = ruleWith('isMemberOfGroup("00gFAKE1")', { id: 'opaqueA' });
    const opaqueExcluding = ruleWith('isMemberOfGroup("00gFAKE2")', {
      id: 'opaqueExcluding',
      conditions: { people: { users: { exclude: ['u1'] } } },
    });
    const [m] = analyzeMemberships([group()], [opaqueA, opaqueExcluding], engUser);
    expect(m.rules.map((r) => r.id)).toEqual(['opaqueA']);
    expect(m.attribution).toBe('inferred');
  });

  it('never leaves attribution unset — every branch labels its evidence', () => {
    const memberships = analyzeMemberships(
      [group({ id: 'a', type: 'APP_GROUP' }), group({ id: 'g1' }), group({ id: 'g9' })],
      [rule({ id: 'opaque', conditionExpression: 'isMemberOfGroup("00gFAKE")' })],
      engUser,
    );
    for (const m of memberships) {
      expect(['exact', 'inferred', 'ambiguous']).toContain(m.attribution);
      expect(Array.isArray(m.rules)).toBe(true);
    }
  });
});

describe('attribution semantics', () => {
  it('treats only `exact` as a fact', () => {
    expect(isDeducedAttribution('exact')).toBe(false);
    expect(isDeducedAttribution('inferred')).toBe(true);
    expect(isDeducedAttribution('ambiguous')).toBe(true);
  });

  it('refuses to name rules for an unevidenced guess', () => {
    expect(attributionNamesRules('exact')).toBe(true);
    expect(attributionNamesRules('inferred')).toBe(true);
    expect(attributionNamesRules('ambiguous')).toBe(false);
  });

  it('describes every attribution class', () => {
    const classes: MembershipAttribution[] = ['exact', 'inferred', 'ambiguous'];
    for (const attribution of classes) {
      const semantics = attributionSemantics(attribution);
      expect(['fact', 'deduction']).toContain(semantics.evidence);
      expect(typeof semantics.namesRules).toBe('boolean');
    }
  });
});

describe('unclassifiedMemberships', () => {
  it('says "unknown", never "added by hand", for every group', () => {
    const groups = [group({ id: 'g1' }), group({ id: 'g2', type: 'APP_GROUP' })];

    const result = unclassifiedMemberships(groups);

    expect(result.map((m) => m.group.id)).toEqual(['g1', 'g2']);
    for (const membership of result) {
      expect(membership.membershipType).toBe('UNKNOWN');
      expect(membership.attribution).toBe('ambiguous');
      expect(membership.rules).toEqual([]);
      expect(isDeducedAttribution(membership.attribution)).toBe(true);
      expect(attributionNamesRules(membership.attribution)).toBe(false);
    }
  });

  it('gives every membership its own rules array', () => {
    const [first, second] = unclassifiedMemberships([group({ id: 'g1' }), group({ id: 'g2' })]);
    expect(first.rules).not.toBe(second.rules);
  });
});

describe('analyzeMemberships — condition evaluation', () => {
  const engUser = {
    ...user,
    profile: { ...user.profile, department: 'Engineering' },
  } as OktaUser;

  function ruleWith(expression: string, over: Partial<MembershipRule> = {}): MembershipRule {
    return rule({ conditionExpression: expression, ...over });
  }

  it('attributes the rule the user actually matches, not the first one', () => {
    const sales = ruleWith('user.department == "Sales"', { id: 'sales' });
    const eng = ruleWith('user.department == "Engineering"', { id: 'eng' });
    const [m] = analyzeMemberships([group()], [sales, eng], engUser);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.rules.map((r) => r.id)).toEqual(['eng']);
    expect(m.attribution).toBe('exact');
  });

  it('reads the condition from conditions.expression.value too', () => {
    const eng = rule({
      id: 'eng',
      conditions: {
        expression: { value: 'user.department == "Engineering"', type: 'urn:okta:expression:1.0' },
      },
    });
    const [m] = analyzeMemberships([group()], [eng], engUser);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.attribution).toBe('exact');
  });

  it('THE FIX: a hand-added member of a rule-fed group is DIRECT, not rule-managed', () => {
    const sales = ruleWith('user.department == "Sales"', { id: 'sales' });
    const finance = ruleWith('user.department == "Finance"', { id: 'finance' });
    const [m] = analyzeMemberships([group()], [sales, finance], engUser);
    expect(m.membershipType).toBe('DIRECT');
    expect(m.rules).toEqual([]);
    expect(m.attribution).toBe('exact');
  });

  it('falls back to the heuristic — flagged inferred — when ANY feeding rule is unevaluable', () => {
    const unevaluable = ruleWith('isMemberOfGroup("00gFAKE")', { id: 'unevaluable' });
    const sales = ruleWith('user.department == "Sales"', { id: 'sales' });
    const [m] = analyzeMemberships([group()], [unevaluable, sales], engUser);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.attribution).toBe('inferred');
  });

  it('prefers an exact match even when another feeding rule is unevaluable', () => {
    const unevaluable = ruleWith('isMemberOfGroup("00gFAKE")', { id: 'unevaluable' });
    const eng = ruleWith('user.department == "Engineering"', { id: 'eng' });
    const [m] = analyzeMemberships([group()], [unevaluable, eng], engUser);
    expect(m.rules.map((r) => r.id)).toEqual(['eng']);
    expect(m.attribution).toBe('exact');
  });

  it('treats an ungrammatical condition as unevaluable, never as "does not match"', () => {
    const broken = ruleWith('user.department ==', { id: 'broken' });
    const [m] = analyzeMemberships([group()], [broken], engUser);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.membershipType).not.toBe('DIRECT');
    expect(m.attribution).toBe('inferred');
  });

  it('treats an unsupported operator as unevaluable, never as "does not match"', () => {
    const unsupported = ruleWith('String.replaceFirst(user.department, "E", "X") == "Xng"', {
      id: 'unsupported',
    });
    const [m] = analyzeMemberships([group()], [unsupported], engUser);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.attribution).toBe('inferred');
  });

  it('attributes a matching String.stringSwitch rule exactly, not by the unevaluable fallback', () => {
    const stringSwitchRule = ruleWith(
      'String.stringSwitch(user.department, "Other", "Engineering", "yes") == "yes"',
      { id: 'string-switch' },
    );
    const [m] = analyzeMemberships([group()], [stringSwitchRule], engUser);
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.rules.map((r) => r.id)).toEqual(['string-switch']);
    expect(m.attribution).toBe('exact');
  });

  it('ignores a non-matching rule the user is excluded from', () => {
    const excluded = ruleWith('user.department == "Engineering"', {
      id: 'excluded',
      conditions: { people: { users: { exclude: ['u1'] } } },
    });
    const other = ruleWith('user.department == "Sales"', { id: 'other' });
    const [m] = analyzeMemberships([group()], [excluded, other], engUser);
    expect(m.membershipType).toBe('DIRECT');
    expect(m.attribution).toBe('exact');
  });

  it('labels the fact-based branches exact', () => {
    const [appGroup] = analyzeMemberships([group({ id: 'a', type: 'APP_GROUP' })], [], user);
    expect(appGroup.attribution).toBe('exact');

    const [noRules] = analyzeMemberships([group()], [], user);
    expect(noRules.attribution).toBe('exact');

    const [allExcluded] = analyzeMemberships(
      [group()],
      [rule({ conditions: { people: { users: { exclude: ['u1'] } } } })],
      user,
    );
    expect(allExcluded.attribution).toBe('exact');
  });
});

describe("analyzeMemberships — with the user's complete group list", () => {
  const ENGINEERING = group({ id: 'g1', profile: { name: 'Engineering', description: '' } });
  const CONTRACTORS = group({ id: 'g2', profile: { name: 'Contractors', description: '' } });
  const memberOf = [ENGINEERING, CONTRACTORS];

  const membershipRule = (expression: string, over: Partial<MembershipRule> = {}) =>
    rule({
      id: 'rMember',
      groupIds: ['g1'],
      conditions: { expression: { value: expression, type: 'urn:okta:expression:1.0' } },
      ...over,
    });

  it('answers an isMemberOfGroup rule instead of deferring to the coarse scorer', () => {
    const r = membershipRule('isMemberOfGroup("g2")');

    const [without] = analyzeMemberships(memberOf, [r], user);
    expect(without.attribution).toBe('inferred');

    const [withList] = analyzeMemberships(memberOf, [r], user, {
      groups: groupContextOfGroups(memberOf),
    });
    expect(withList.membershipType).toBe('RULE_BASED');
    expect(withList.attribution).toBe('exact');
    expect(withList.rules.map((rr) => rr.id)).toEqual(['rMember']);
  });

  it('answers a NON-matching isMemberOfGroup rule as a manual add, not a guess', () => {
    const r = membershipRule('isMemberOfGroup("gOther")');
    const [m] = analyzeMemberships(memberOf, [r], user, {
      groups: groupContextOfGroups(memberOf),
    });
    expect(m.membershipType).toBe('DIRECT');
    expect(m.attribution).toBe('exact');
  });

  it('attributes a matching isMemberOfGroupNameRegex rule exactly, not by the unevaluable fallback', () => {
    const r = membershipRule('isMemberOfGroupNameRegex("Contr.*")');
    const [m] = analyzeMemberships(memberOf, [r], user, {
      groups: groupContextOfGroups(memberOf),
    });
    expect(m.membershipType).toBe('RULE_BASED');
    expect(m.rules.map((rr) => rr.id)).toEqual(['rMember']);
    expect(m.attribution).toBe('exact');
  });

  it('leaves a rule whose pattern the safe engine declines unproven', () => {
    const r = membershipRule('isMemberOfGroupNameRegex("(?=Contr).*")');
    const [m] = analyzeMemberships(memberOf, [r], user, {
      groups: groupContextOfGroups(memberOf),
    });
    expect(m.attribution).toBe('inferred');
  });

  it('matches isMemberOfGroupName by name, case-sensitively', () => {
    const context = groupContextOfGroups(memberOf);
    expect(
      analyzeMemberships(memberOf, [membershipRule('isMemberOfGroupName("Contractors")')], user, {
        groups: context,
      })[0].attribution,
    ).toBe('exact');
    expect(
      analyzeMemberships(memberOf, [membershipRule('isMemberOfGroupName("contractors")')], user, {
        groups: context,
      })[0].membershipType,
    ).toBe('DIRECT');
  });

  it('treats a group-based exclusion as an exclusion, not as a credited rule', () => {
    const r = membershipRule('user.status == "ACTIVE"', { excludedGroupIds: ['g2'] });

    const [m] = analyzeMemberships(memberOf, [r], user, {
      groups: groupContextOfGroups(memberOf),
    });
    expect(m.membershipType).toBe('DIRECT');
    expect(m.rules).toEqual([]);

    const [credited] = analyzeMemberships(
      memberOf,
      [membershipRule('user.status == "ACTIVE"')],
      user,
      {
        groups: groupContextOfGroups(memberOf),
      },
    );
    expect(credited.membershipType).toBe('RULE_BASED');
  });

  it('reads a group exclusion off a raw rule as well as a formatted one', () => {
    const raw = membershipRule('user.status == "ACTIVE"', {
      conditions: {
        expression: { value: 'user.status == "ACTIVE"', type: 'urn:okta:expression:1.0' },
        people: { groups: { exclude: ['g2'] } },
      },
    });
    const [m] = analyzeMemberships(memberOf, [raw], user, {
      groups: groupContextOfGroups(memberOf),
    });
    expect(m.membershipType).toBe('DIRECT');
  });

  it('never claims a group exclusion it cannot check', () => {
    const r = membershipRule('user.status == "ACTIVE"', { excludedGroupIds: ['g2'] });
    const [m] = analyzeMemberships(memberOf, [r], user);
    expect(m.membershipType).toBe('RULE_BASED');
  });
});
