import { describe, it, expect } from 'vitest';
import { summarizeMemberSources, type GroupIdentity } from './groupSource';
import { interpretGroupRules, readEmbeddedGroupRules } from './memberRuleAttribution';
import { withMembershipProvenance } from './provenance';
import {
  analyzeMemberships,
  attributionNamesRules,
  isDeducedAttribution,
} from '../utils/membershipAnalysis';
import type { MembershipRule, OktaGroup, OktaUser } from '../types';

const GROUP: GroupIdentity = { id: '00gFAKEeng', name: 'Engineering', type: 'OKTA_GROUP' };

const asOktaGroup = (identity: GroupIdentity): OktaGroup => ({
  id: identity.id,
  type: identity.type,
  profile: { name: identity.name },
});

function member(profile: Record<string, string> = {}, embedded?: unknown): OktaUser {
  const base = {
    id: '00uFAKEuser',
    status: 'ACTIVE',
    profile: {
      login: 'user@example.com',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      ...profile,
    },
  };
  return (embedded === undefined ? base : { ...base, _embedded: embedded }) as OktaUser;
}

const evaluableRule: MembershipRule = {
  id: '0prFAKEeval',
  name: 'Eng feeder',
  status: 'ACTIVE',
  groupIds: [GROUP.id],
  conditionExpression: 'user.department=="Eng"',
  userAttributes: ['department'],
};

const unevaluableRule = (id: string, name: string): MembershipRule => ({
  id,
  name,
  status: 'ACTIVE',
  groupIds: [GROUP.id],
  conditionExpression: `isMemberOfGroupName("${name}")`,
  userAttributes: [],
});

interface Verdict {
  managed: 'rule' | 'manual';
  namedRuleIds: string[];
  deduced: boolean;
}

function userViewVerdict(
  identity: GroupIdentity,
  rules: MembershipRule[],
  user: OktaUser,
): Verdict {
  const [membership] = analyzeMemberships([asOktaGroup(identity)], rules, user);
  return {
    managed: membership.membershipType === 'RULE_BASED' ? 'rule' : 'manual',
    namedRuleIds: attributionNamesRules(membership.attribution)
      ? membership.rules.map((rule) => rule.id).sort()
      : [],
    deduced: isDeducedAttribution(membership.attribution),
  };
}

function groupViewVerdict(
  identity: GroupIdentity,
  rules: MembershipRule[],
  user: OktaUser,
): Verdict {
  const breakdown = summarizeMemberSources(identity, [user], rules);
  expect(breakdown.total).toBe(1);
  return {
    managed: breakdown.ruleBased === 1 ? 'rule' : 'manual',
    namedRuleIds: breakdown.byRule.map((contribution) => contribution.ruleId).sort(),
    deduced: breakdown.unattributed === 1,
  };
}

interface Scenario {
  name: string;
  identity?: GroupIdentity;
  rules: MembershipRule[];
  user: OktaUser;
  oktaAsserts: boolean;
  groupView: Verdict;
  userView: Verdict;
}

const rule = (managed: 'rule' | 'manual', namedRuleIds: string[], deduced: boolean): Verdict => ({
  managed,
  namedRuleIds,
  deduced,
});

const scenarios: Scenario[] = [
  {
    name: 'no rule targets the group → both call it a manual add',
    rules: [],
    user: member(),
    oktaAsserts: false,
    groupView: rule('manual', [], false),
    userView: rule('manual', [], false),
  },
  {
    name: 'the user provably satisfies the feeding rule → both name that rule',
    rules: [evaluableRule],
    user: member({ department: 'Eng' }),
    oktaAsserts: false,
    groupView: rule('rule', [evaluableRule.id], false),
    userView: rule('rule', [evaluableRule.id], false),
  },
  {
    name: 'the user provably fails the only feeding rule → both call it a manual add',
    rules: [evaluableRule],
    user: member({ department: 'Sales' }),
    oktaAsserts: false,
    groupView: rule('manual', [], false),
    userView: rule('manual', [], false),
  },
  {
    name: 'one unevaluable candidate → both name it, both flag the guess',
    rules: [unevaluableRule('0prFAKEone', 'Contractors')],
    user: member(),
    oktaAsserts: false,
    groupView: rule('rule', ['0prFAKEone'], true),
    userView: rule('rule', ['0prFAKEone'], true),
  },
  {
    name: 'two indistinguishable candidates → neither path names a rule',
    rules: [unevaluableRule('0prFAKEone', 'Contractors'), unevaluableRule('0prFAKEtwo', 'Vendors')],
    user: member(),
    oktaAsserts: false,
    groupView: rule('rule', [], true),
    userView: rule('rule', [], true),
  },
  {
    name: 'APP_GROUP membership is application-managed on both paths',
    identity: { id: '00gFAKEapp', name: 'Salesforce Users', type: 'APP_GROUP' },
    rules: [],
    user: member(),
    oktaAsserts: false,
    groupView: rule('rule', [], false),
    userView: rule('rule', [], false),
  },
  {
    name: 'the user is excluded from the only feeding rule → both call it a manual add',
    rules: [{ ...evaluableRule, conditions: { people: { users: { exclude: ['00uFAKEuser'] } } } }],
    user: member({ department: 'Eng' }),
    oktaAsserts: false,
    groupView: rule('manual', [], false),
    userView: rule('manual', [], false),
  },

  {
    name: 'DIVERGES: Okta credits a rule the heuristic proved does not match',
    rules: [evaluableRule],
    user: member(
      { department: 'Sales' },
      { 'group-rules': [{ id: '0prFAKEhr', name: 'HR sync' }] },
    ),
    oktaAsserts: true,
    groupView: rule('rule', ['0prFAKEhr'], false),
    userView: rule('manual', [], false),
  },
  {
    name: 'DIVERGES: Okta asserts no rule feeds the member; the heuristic was guessing one',
    rules: [unevaluableRule('0prFAKEone', 'Contractors')],
    user: member({}, { 'group-rules': [] }),
    oktaAsserts: true,
    groupView: rule('manual', [], false),
    userView: rule('rule', ['0prFAKEone'], true),
  },
];

describe('attribution parity between the group view and the user view', () => {
  it.each(scenarios)('$name', (scenario) => {
    const identity = scenario.identity ?? GROUP;

    const fromGroupView = groupViewVerdict(identity, scenario.rules, scenario.user);
    const fromUserView = userViewVerdict(identity, scenario.rules, scenario.user);

    expect(fromGroupView).toEqual(scenario.groupView);
    expect(fromUserView).toEqual(scenario.userView);

    const oktaAnswered = readEmbeddedGroupRules(scenario.user).state !== 'unknown';
    expect(oktaAnswered).toBe(scenario.oktaAsserts);

    if (!scenario.oktaAsserts) {
      expect(fromUserView).toEqual(fromGroupView);
    }
  });

  it('only diverges where Okta itself supplied the answer', () => {
    const diverging = scenarios
      .filter((scenario) => {
        const identity = scenario.identity ?? GROUP;
        const fromGroupView = groupViewVerdict(identity, scenario.rules, scenario.user);
        const fromUserView = userViewVerdict(identity, scenario.rules, scenario.user);
        return JSON.stringify(fromGroupView) !== JSON.stringify(fromUserView);
      })
      .map((scenario) => scenario.name);

    expect(diverging).toEqual(
      scenarios.filter((scenario) => scenario.oktaAsserts).map((scenario) => scenario.name),
    );
  });

  it('never lets the two paths disagree about whether they are guessing, absent an Okta answer', () => {
    for (const scenario of scenarios.filter((s) => !s.oktaAsserts)) {
      const identity = scenario.identity ?? GROUP;
      expect(groupViewVerdict(identity, scenario.rules, scenario.user).deduced).toBe(
        userViewVerdict(identity, scenario.rules, scenario.user).deduced,
      );
    }
  });
});

describe('attribution parity after an explicit per-row proof (ADR-0031)', () => {
  function provenUserViewVerdict(
    identity: GroupIdentity,
    rules: MembershipRule[],
    user: OktaUser,
    proof: unknown,
  ): Verdict {
    const [membership] = analyzeMemberships([asOktaGroup(identity)], rules, user);
    const { provenance } = withMembershipProvenance(membership, interpretGroupRules(proof));
    if (!provenance) throw new Error('Okta did not answer: there is no proof to read');

    return {
      managed: provenance.rules.length > 0 ? 'rule' : 'manual',
      namedRuleIds: provenance.rules.map((r) => r.id).sort(),
      deduced: false,
    };
  }

  const divergent = scenarios.filter((scenario) => scenario.oktaAsserts);

  it('has divergent scenarios to close, or this suite proves nothing', () => {
    expect(divergent.length).toBeGreaterThan(0);
  });

  it.each(divergent)('proving "$name" makes the user path match the group path', (scenario) => {
    const identity = scenario.identity ?? GROUP;

    const embedded = readEmbeddedGroupRules(scenario.user);
    const proof = embedded.state === 'rules' ? embedded.rules : [];

    const proven = provenUserViewVerdict(identity, scenario.rules, scenario.user, proof);

    expect(proven).toEqual(scenario.groupView);
    expect(proven).not.toEqual(scenario.userView);
  });

  it('reproduces the group path for a member Okta says no rule feeds', () => {
    const user = member();
    const rules = [unevaluableRule('0prFAKEone', 'Contractors')];

    expect(userViewVerdict(GROUP, rules, user)).toEqual(rule('rule', ['0prFAKEone'], true));
    expect(provenUserViewVerdict(GROUP, rules, user, [])).toEqual(rule('manual', [], false));
  });

  it('leaves the heuristic standing when the proof yields no answer', () => {
    const user = member();
    const rules = [unevaluableRule('0prFAKEone', 'Contractors')];

    for (const noAnswer of [undefined, null, 'nope', {}, [{ nope: true }]]) {
      const [membership] = analyzeMemberships([asOktaGroup(GROUP)], rules, user);
      const result = withMembershipProvenance(membership, interpretGroupRules(noAnswer));

      expect(result.provenance).toBeUndefined();
      expect(userViewVerdict(GROUP, rules, user)).toEqual(rule('rule', ['0prFAKEone'], true));
    }
  });

  it('still requires the two paths to agree where Okta asserted nothing', () => {
    for (const scenario of scenarios.filter((s) => !s.oktaAsserts)) {
      const identity = scenario.identity ?? GROUP;
      expect(userViewVerdict(identity, scenario.rules, scenario.user)).toEqual(
        groupViewVerdict(identity, scenario.rules, scenario.user),
      );
    }
  });
});
