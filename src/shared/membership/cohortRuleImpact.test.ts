import { describe, it, expect } from 'vitest';
import { analyzeCohortRuleImpact } from './cohortRuleImpact';
import type { MembershipRule, OktaUser } from '../types';

const person = (id: string, department?: string, title?: string): OktaUser =>
  ({
    id,
    status: 'ACTIVE',
    profile: {
      login: `${id}@example.com`,
      email: `${id}@example.com`,
      ...(department === undefined ? {} : { department }),
      ...(title === undefined ? {} : { title }),
    },
  }) as OktaUser;

const rule = (
  over: Partial<MembershipRule> & Pick<MembershipRule, 'id' | 'name'>,
): MembershipRule =>
  ({
    status: 'ACTIVE',
    userAttributes: ['department'],
    groupIds: ['00gFAKE1'],
    ...over,
  }) as MembershipRule;

const salesRule = rule({
  id: '0prFAKE1',
  name: 'Sales by department',
  conditionExpression: 'user.department == "Sales"',
});

const marketingRule = rule({
  id: '0prFAKE2',
  name: 'Marketing by department',
  conditionExpression: 'user.department == "Marketing"',
  groupIds: ['00gFAKE2'],
});

const available = (rules: MembershipRule[]) => ({ status: 'available' as const, rules });

describe('a rule is named only when its answer moves', () => {
  it('names a rule that starts matching, with how many users it takes', () => {
    const result = analyzeCohortRuleImpact({
      attributeName: 'department',
      newValue: 'Sales',
      targets: [person('u1', 'Support'), person('u2', 'Support'), person('u3', 'Ops')],
      rules: available([salesRule]),
    });

    expect(result).toEqual({
      status: 'computed',
      flips: [
        {
          ruleId: '0prFAKE1',
          ruleName: 'Sales by department',
          transition: 'starts-matching',
          userCount: 3,
          targetGroupIds: ['00gFAKE1'],
        },
      ],
      undetermined: [],
    });
  });

  it('says nothing about a rule nobody in the cohort moves across', () => {
    const result = analyzeCohortRuleImpact({
      attributeName: 'department',
      newValue: 'Sales',
      targets: [person('u1', 'Support'), person('u2', 'Ops')],
      rules: available([marketingRule]),
    });

    expect(result).toEqual({ status: 'computed', flips: [], undetermined: [] });
  });

  it('names that same rule once somebody in the cohort does move across it', () => {
    const result = analyzeCohortRuleImpact({
      attributeName: 'department',
      newValue: 'Sales',
      targets: [person('u1', 'Marketing'), person('u2', 'Ops')],
      rules: available([marketingRule]),
    });

    expect(result.status).toBe('computed');
    expect(result).toMatchObject({
      flips: [
        {
          ruleId: '0prFAKE2',
          transition: 'stops-matching',
          userCount: 1,
          targetGroupIds: ['00gFAKE2'],
        },
      ],
    });
  });

  it('reports both directions for one rule when the cohort splits', () => {
    const twoAttribute = rule({
      id: '0prFAKE3',
      name: 'Sales leads',
      userAttributes: ['department', 'title'],
      conditionExpression: 'user.department == "Sales" && user.title == "Lead"',
    });

    const result = analyzeCohortRuleImpact({
      attributeName: 'department',
      newValue: 'Sales',
      targets: [
        person('joins', 'Ops', 'Lead'), // becomes Sales + Lead → starts
        person('stays-out', 'Ops', 'Analyst'), // never a Lead → no movement
      ],
      rules: available([twoAttribute]),
    });

    expect(result).toMatchObject({
      flips: [{ transition: 'starts-matching', userCount: 1 }],
    });
  });
});

describe('rules that cannot be answered are named as such, never as no-change', () => {
  it('withholds a verdict for a condition that needs the group list', () => {
    const gated = rule({
      id: '0prFAKE4',
      name: 'Sales, excluding contractors',
      conditionExpression: 'user.department == "Sales" && isMemberOfGroupName("Staff")',
    });

    const result = analyzeCohortRuleImpact({
      attributeName: 'department',
      newValue: 'Sales',
      targets: [person('u1', 'Ops')],
      rules: available([gated]),
    });

    expect(result).toMatchObject({
      flips: [],
      undetermined: [{ ruleId: '0prFAKE4', reason: 'group-membership-fn', userCount: 1 }],
    });
  });

  it('withholds for a rule whose exclusions are group-based', () => {
    const excludesGroups = rule({
      id: '0prFAKE5',
      name: 'Sales minus a group',
      conditionExpression: 'user.department == "Sales"',
      excludedGroupIds: ['00gFAKEexcluded'],
    });

    const result = analyzeCohortRuleImpact({
      attributeName: 'department',
      newValue: 'Sales',
      targets: [person('u1', 'Ops')],
      rules: available([excludesGroups]),
    });

    expect(result).toMatchObject({
      flips: [],
      undetermined: [{ ruleId: '0prFAKE5', reason: 'group-membership-fn' }],
    });
  });
});

describe('what the analysis refuses to count', () => {
  it('ignores an inactive rule, which places nobody', () => {
    const result = analyzeCohortRuleImpact({
      attributeName: 'department',
      newValue: 'Sales',
      targets: [person('u1', 'Ops')],
      rules: available([{ ...salesRule, status: 'INACTIVE' }]),
    });

    expect(result).toEqual({ status: 'computed', flips: [], undetermined: [] });
  });

  it('ignores a rule that does not read the attribute being written', () => {
    const otherAttribute = rule({
      id: '0prFAKE6',
      name: 'By cost centre',
      userAttributes: ['costCenter'],
      conditionExpression: 'user.costCenter == "1234"',
    });

    const result = analyzeCohortRuleImpact({
      attributeName: 'department',
      newValue: 'Sales',
      targets: [person('u1', 'Ops')],
      rules: available([otherAttribute]),
    });

    expect(result).toEqual({ status: 'computed', flips: [], undetermined: [] });
  });

  it('does not count a user the rule explicitly excludes', () => {
    const excludesUser = rule({
      id: '0prFAKE7',
      name: 'Sales, minus one person',
      conditionExpression: 'user.department == "Sales"',
      excludedUserIds: ['excluded'],
    });

    const result = analyzeCohortRuleImpact({
      attributeName: 'department',
      newValue: 'Sales',
      targets: [person('excluded', 'Ops'), person('counted', 'Ops')],
      rules: available([excludesUser]),
    });

    expect(result).toMatchObject({ flips: [{ userCount: 1 }] });
  });
});

describe('an unknown rule inventory is not an empty one', () => {
  it('reports not-computed when nobody has read the rules', () => {
    expect(
      analyzeCohortRuleImpact({
        attributeName: 'department',
        newValue: 'Sales',
        targets: [person('u1', 'Ops')],
        rules: { status: 'unresolved' },
      }),
    ).toEqual({ status: 'not-computed', reason: 'rules-unresolved' });
  });

  it('reports not-computed, distinctly, when the read failed', () => {
    expect(
      analyzeCohortRuleImpact({
        attributeName: 'department',
        newValue: 'Sales',
        targets: [person('u1', 'Ops')],
        rules: { status: 'unavailable' },
      }),
    ).toEqual({ status: 'not-computed', reason: 'rules-unavailable' });
  });

  it('computes an empty result for an org that genuinely has no rules', () => {
    expect(
      analyzeCohortRuleImpact({
        attributeName: 'department',
        newValue: 'Sales',
        targets: [person('u1', 'Ops')],
        rules: available([]),
      }),
    ).toEqual({ status: 'computed', flips: [], undetermined: [] });
  });
});
