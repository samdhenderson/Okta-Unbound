import { describe, expect, it } from 'vitest';
import { tryEvaluateRuleExpression, type RuleGroupContext } from '../../shared/ruleEvaluator';
import { GROUP, RULE_FED_GROUPS, demoGroupMembers } from './memberships';
import { fakeId } from './org';
import { currentGroupsById, demoRules } from './snapshot';
import { demoUsers } from './users';

const EXPECTED_EXEMPT_ORDINALS: readonly number[] = [GROUP.everyone, GROUP.workdayAllWorkers];

const groupId = (ordinal: number): string => fakeId('00g', ordinal);

const groupName = (ordinal: number): string =>
  currentGroupsById().get(groupId(ordinal))?.profile?.name ?? `<no group ${ordinal}>`;

const targets = (rule: (typeof demoRules)[number]): readonly string[] =>
  rule.actions?.assignUserToGroups?.groupIds ?? [];

const rulesTargeting = (ordinal: number) =>
  demoRules.filter((rule) => targets(rule).includes(groupId(ordinal)));

const declared = RULE_FED_GROUPS.filter((entry) => entry.expression !== null);
const exempt = RULE_FED_GROUPS.filter((entry) => entry.expression === null);

describe('every rule-fed demo group states its reason', () => {
  for (const entry of declared) {
    const name = groupName(entry.ordinal);

    it(`${name} is fed by a rule that declares its predicate`, () => {
      const matches = rulesTargeting(entry.ordinal);
      expect(
        matches.map((rule) => rule.name),
        `${name} is filled by a predicate; exactly one rule in demoRules must declare it`,
      ).toHaveLength(1);
      expect(matches[0]?.conditions?.expression?.value).toBe(entry.expression);
    });
  }

  for (const entry of exempt) {
    const name = groupName(entry.ordinal);

    it(`${name} is exempt, and says who fills it instead`, () => {
      expect(entry.exemption ?? '', `${name} has no rule and no written exemption`).not.toBe('');
      expect(
        rulesTargeting(entry.ordinal).map((rule) => rule.name),
        `${name} claims an exemption but a rule feeds it; drop the exemption`,
      ).toEqual([]);
    });
  }

  it('the exemption list is exactly the groups with an invisible maintainer', () => {
    expect(exempt.map((entry) => groupName(entry.ordinal)).sort()).toEqual(
      EXPECTED_EXEMPT_ORDINALS.map(groupName).sort(),
    );
  });

  it('no rule feeds a group that has no predicate', () => {
    const fed = new Set(RULE_FED_GROUPS.map((entry) => groupId(entry.ordinal)));
    const orphans = demoRules.flatMap((rule) =>
      targets(rule)
        .filter((id) => !fed.has(id))
        .map((id) => `${rule.name} → ${currentGroupsById().get(id)?.profile?.name ?? id}`),
    );
    expect(orphans).toEqual([]);
  });
});

const groupContextByUser = ((): ReadonlyMap<string, RuleGroupContext> => {
  const byUser = new Map<string, { id: string; name: string }[]>();
  for (const [id, members] of demoGroupMembers()) {
    const name = currentGroupsById().get(id)?.profile?.name ?? id;
    for (const userId of members) {
      const held = byUser.get(userId) ?? [];
      held.push({ id, name });
      byUser.set(userId, held);
    }
  }
  return byUser;
})();

describe('the declared expression selects the derived membership', () => {
  for (const entry of declared) {
    const name = groupName(entry.ordinal);
    const expression = entry.expression ?? '';

    it(`${name}'s rule evaluates to exactly its ${demoGroupMembers().get(groupId(entry.ordinal))?.length ?? 0} members`, () => {
      const derived = new Set(demoGroupMembers().get(groupId(entry.ordinal)) ?? []);
      const evaluated = new Set(
        demoUsers
          .filter(
            (user) =>
              tryEvaluateRuleExpression(expression, user, groupContextByUser.get(user.id) ?? []) ===
              'match',
          )
          .map((user) => user.id),
      );

      expect({
        group: name,
        inRuleNotInGroup: [...evaluated].filter((id) => !derived.has(id)).length,
        inGroupNotInRule: [...derived].filter((id) => !evaluated.has(id)).length,
      }).toEqual({ group: name, inRuleNotInGroup: 0, inGroupNotInRule: 0 });
    });
  }
});
