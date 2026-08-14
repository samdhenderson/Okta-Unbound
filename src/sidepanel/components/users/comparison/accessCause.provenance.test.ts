import { describe, it, expect } from 'vitest';
import { classifyAccessCauses, type AccessCause } from './accessCause';
import type {
  GroupMembership,
  MembershipRule,
  OktaGroup,
  OktaUser,
} from '../../../../shared/types';

const GROUP_ID = '00gFAKEGROUP01';
const PREREQ_ID = '00gFAKEPREREQ1';

const contextUser: OktaUser = {
  id: '00uFAKECONTEXT',
  status: 'ACTIVE',
  profile: {
    login: 'context@example.com',
    email: 'context@example.com',
    firstName: 'Con',
    lastName: 'Text',
    department: 'Engineering',
  },
};

const group = (id = GROUP_ID, name = 'VPN Access', type: OktaGroup['type'] = 'OKTA_GROUP') => ({
  id,
  type,
  profile: { name },
});

const membership = (over: Partial<GroupMembership> = {}): GroupMembership => ({
  group: group(),
  membershipType: 'RULE_BASED',
  rules: [],
  attribution: 'exact',
  ...over,
});

const salesRule: MembershipRule = {
  id: '0prFAKE0001',
  name: 'Sales rule',
  status: 'ACTIVE',
  groupIds: [GROUP_ID],
  conditionExpression: 'user.department == "Sales"',
};

const classify = (
  memberships: GroupMembership[],
  rules: MembershipRule[],
  contextGroups?: GroupMembership[],
): AccessCause =>
  classifyAccessCauses({ onlyCompared: memberships, contextUser, rules, contextGroups })[0];

describe('the remedy follows the provenance', () => {
  it('THE BUG: a hand-added group is manual-add even though a rule targets it and the user fails it', () => {
    const cause = classify(
      [membership({ membershipType: 'DIRECT', attribution: 'exact' })],
      [salesRule],
    );

    expect(cause.remedy).toBe('manual-add');
    expect(cause.failingClauses).toEqual([]);
  });

  it('still reports blocked-by-attribute when a rule IS what grants it', () => {
    const cause = classify([membership()], [salesRule]);

    expect(cause.remedy).toBe('blocked-by-attribute');
    expect(cause.failingClauses).toHaveLength(1);
  });

  it('reports an app-mastered group as app-managed, never as an attribute to fix', () => {
    const cause = classify(
      [membership({ group: group(GROUP_ID, 'Okta Admins', 'APP_GROUP') })],
      [salesRule],
    );

    expect(cause.remedy).toBe('app-managed');
    expect(cause.failingClauses).toEqual([]);
  });

  it('says app-managed even with no rule inventory — the group type alone settles it', () => {
    const cause = classifyAccessCauses({
      onlyCompared: [membership({ group: group(GROUP_ID, 'Okta Admins', 'APP_GROUP') })],
      contextUser,
      rules: null,
    })[0];

    expect(cause.remedy).toBe('app-managed');
  });
});

describe('group-membership clauses are answered, not shrugged at', () => {
  const prereqRule: MembershipRule = {
    id: '0prFAKEPRQ',
    name: 'VPN prerequisite',
    status: 'ACTIVE',
    groupIds: [GROUP_ID],
    conditionExpression: `isMemberOfGroup("${PREREQ_ID}")`,
  };

  const inGroup = (id: string, name: string): GroupMembership =>
    membership({ group: group(id, name) });

  it('names the prerequisite group instead of reporting needs-investigation', () => {
    const cause = classify([membership()], [prereqRule], [inGroup('00gFAKEOTHER', 'Everyone')]);

    expect(cause.remedy).toBe('needs-group-membership');
    expect(cause.requiredGroups).toEqual([{ match: 'id', value: PREREQ_ID, satisfied: false }]);
  });

  it('lists every candidate of an isMemberOfAnyGroup, all unsatisfied', () => {
    const anyRule: MembershipRule = {
      ...prereqRule,
      conditionExpression: `isMemberOfAnyGroup("${PREREQ_ID}", "00gFAKEPREREQ2")`,
    };
    const cause = classify([membership()], [anyRule], [inGroup('00gFAKEOTHER', 'Everyone')]);

    expect(cause.remedy).toBe('needs-group-membership');
    expect(cause.requiredGroups?.map((r) => r.value)).toEqual([PREREQ_ID, '00gFAKEPREREQ2']);
    expect(cause.requiredGroups?.every((r) => !r.satisfied)).toBe(true);
  });

  it('keeps the attribute remedy when a profile clause fails alongside a group clause', () => {
    const bothRule: MembershipRule = {
      ...prereqRule,
      conditionExpression: `user.department == "Sales" && isMemberOfGroup("${PREREQ_ID}")`,
    };
    const cause = classify([membership()], [bothRule], [inGroup('00gFAKEOTHER', 'Everyone')]);

    expect(cause.remedy).toBe('blocked-by-attribute');
    expect(cause.requiredGroups?.map((r) => r.value)).toEqual([PREREQ_ID]);
  });

  it('falls back to cannot-determine when no group list was supplied', () => {
    const cause = classify([membership()], [prereqRule]);

    expect(cause.remedy).toBe('cannot-determine');
    expect(cause.undeterminedReason).toBe('needs-group-context');
  });

  it('reports a negated clause as a membership to REMOVE, not an attribute to fix', () => {
    const exclusionRule: MembershipRule = {
      ...prereqRule,
      conditionExpression: `!isMemberOfAnyGroup("${PREREQ_ID}", "00gFAKEVENDORS1")`,
    };
    const cause = classify(
      [membership()],
      [exclusionRule],
      [inGroup(PREREQ_ID, 'emea.contractors')],
    );

    expect(cause.remedy).toBe('blocked-by-group-membership');
    expect(cause.blockingGroups).toEqual([
      { match: 'id', value: PREREQ_ID, satisfied: true, matchedGroupName: 'emea.contractors' },
    ]);
    expect(cause.requiredGroups ?? []).toEqual([]);
  });

  it('leaving outranks joining when a rule asks for both', () => {
    const bothWays: MembershipRule = {
      ...prereqRule,
      conditionExpression: `isMemberOfGroup("00gFAKENEEDED01") && !isMemberOfGroup("${PREREQ_ID}")`,
    };
    const cause = classify([membership()], [bothWays], [inGroup(PREREQ_ID, 'emea.contractors')]);

    expect(cause.remedy).toBe('blocked-by-group-membership');
    expect(cause.blockingGroups?.map((r) => r.value)).toEqual([PREREQ_ID]);
    expect(cause.requiredGroups?.map((r) => r.value)).toEqual(['00gFAKENEEDED01']);
  });

  it('keeps the attribute remedy when a profile clause fails alongside an exclusion', () => {
    const mixed: MembershipRule = {
      ...prereqRule,
      conditionExpression: `user.department == "Sales" && !isMemberOfGroup("${PREREQ_ID}")`,
    };
    const cause = classify([membership()], [mixed], [inGroup(PREREQ_ID, 'emea.contractors')]);

    expect(cause.remedy).toBe('blocked-by-attribute');
    expect(cause.blockingGroups?.map((r) => r.value)).toEqual([PREREQ_ID]);
  });

  it('does not blame an exclusion the user is outside of', () => {
    const exclusionRule: MembershipRule = {
      ...prereqRule,
      conditionExpression: `!isMemberOfAnyGroup("00gFAKEVENDORS1") && user.department == "Sales"`,
    };
    const cause = classify([membership()], [exclusionRule], [inGroup('00gFAKEOTHER', 'Everyone')]);

    expect(cause.remedy).toBe('blocked-by-attribute');
    expect(cause.blockingGroups ?? []).toEqual([]);
  });

  it('resolves a satisfied prerequisite rather than blaming it', () => {
    const cause = classify([membership()], [prereqRule], [inGroup(PREREQ_ID, 'VPN Prerequisite')]);

    expect(cause.remedy).toBe('cannot-determine');
    expect(cause.requiredGroups ?? []).toEqual([]);
  });
});
