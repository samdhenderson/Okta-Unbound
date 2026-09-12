import { describe, it, expect } from 'vitest';
import {
  explainRuleExpression,
  type ClauseTreeNode,
  type LeafClauseNode,
} from './explainExpression';
import type { RuleGroupContext } from '../ruleEvaluator';
import type { OktaUser } from '../types';

const CONTRACTORS = '00gFAKECONTRACTOR01';
const VENDORS = '00gFAKEVENDORS00001';

const user: OktaUser = {
  id: '00uFAKE0000000000000',
  status: 'ACTIVE',
  profile: {
    login: 'user@example.com',
    email: 'user@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
  },
};

const groups: RuleGroupContext = [
  { id: CONTRACTORS, name: 'emea.contractors' },
  { id: '00gFAKEEVERYONE0001', name: 'Everyone' },
];

function leafOf(node: ClauseTreeNode): LeafClauseNode {
  if (node.node !== 'leaf') throw new Error(`expected a leaf, got a ${node.kind} group`);
  return node;
}

describe('a negated membership clause is understood as an exclusion', () => {
  it('THE BUG: reports the groups of a negated call instead of nothing at all', () => {
    const { tree } = explainRuleExpression(`!isMemberOfAnyGroup("${CONTRACTORS}")`, user, {
      groups,
    });

    expect(leafOf(tree).groupRequirement).toBe('non-member');
    expect(leafOf(tree).groupReferences).toEqual([
      {
        match: 'id',
        value: CONTRACTORS,
        satisfied: true,
        matchedGroupName: 'emea.contractors',
      },
    ]);
  });

  it('fails the clause when the user IS in an excluded group', () => {
    const { tree } = explainRuleExpression(
      `!isMemberOfAnyGroup("${CONTRACTORS}", "${VENDORS}")`,
      user,
      { groups },
    );

    expect(leafOf(tree).status).toBe('fail');
    expect(leafOf(tree).groupReferences?.map((r) => r.satisfied)).toEqual([true, false]);
  });

  it('passes the clause when the user is in none of the excluded groups', () => {
    const { tree } = explainRuleExpression(`!isMemberOfAnyGroup("${VENDORS}")`, user, {
      groups,
    });

    expect(leafOf(tree).status).toBe('pass');
    expect(leafOf(tree).groupRequirement).toBe('non-member');
  });

  it('marks an un-negated call as `member`, the opposite requirement', () => {
    const { tree } = explainRuleExpression(`isMemberOfAnyGroup("${VENDORS}")`, user, { groups });

    expect(leafOf(tree).groupRequirement).toBe('member');
    expect(leafOf(tree).status).toBe('fail');
  });

  it('still reports nothing without a group list, negated or not', () => {
    const { tree } = explainRuleExpression(`!isMemberOfAnyGroup("${CONTRACTORS}")`, user);

    expect(leafOf(tree).status).toBe('not-evaluated');
    expect(leafOf(tree).groupReferences).toBeUndefined();
    expect(leafOf(tree).groupRequirement).toBeUndefined();
  });

  it('declines a double negation rather than guessing its polarity', () => {
    const { tree } = explainRuleExpression(`!!isMemberOfGroup("${CONTRACTORS}")`, user, {
      groups,
    });

    expect(leafOf(tree).groupReferences).toBeUndefined();
  });

  it('keeps a negated COMBINATION as one clause with no group references', () => {
    const { tree } = explainRuleExpression(
      `!(isMemberOfGroup("${CONTRACTORS}") && user.department == "Sales")`,
      user,
      { groups },
    );

    expect(tree.node).toBe('leaf');
    expect(leafOf(tree).groupReferences).toBeUndefined();
  });

  it('carries polarity per clause when both directions appear in one rule', () => {
    const { tree } = explainRuleExpression(
      `isMemberOfGroup("${VENDORS}") && !isMemberOfGroup("${CONTRACTORS}")`,
      user,
      { groups },
    );

    const conjuncts = tree.node === 'connective' ? tree.children : [tree];
    expect(conjuncts.map((c) => leafOf(c).groupRequirement)).toEqual(['member', 'non-member']);
  });
});
