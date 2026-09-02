import { describe, it, expect } from 'vitest';
import { ruleIdentity } from './ruleIdentity';
import type { FormattedRule } from '../../../shared/types';

const rule = (over: Partial<FormattedRule> = {}): FormattedRule => ({
  id: '0prFAKErule000000001',
  name: 'Engineering intake',
  status: 'ACTIVE',
  condition: "user.department == 'Engineering'",
  conditionExpression: "user.department == 'Engineering'",
  groupIds: [],
  groupNames: [],
  userAttributes: [],
  created: '2024-01-01T00:00:00.000Z',
  lastUpdated: '2024-06-01T00:00:00.000Z',
  ...over,
});

const facts = (r: FormattedRule) => ruleIdentity(r).rows.flat();

describe('ruleIdentity', () => {
  it('names the rule and keys on its id', () => {
    const identity = ruleIdentity(rule());

    expect(identity.name).toBe('Engineering intake');
    expect(identity.key).toBe('0prFAKErule000000001');
  });

  it('offers no Okta deep link, because Okta has no per-rule route', () => {
    expect(ruleIdentity(rule()).link).toBeUndefined();
  });

  it('always carries the copyable rule id', () => {
    expect(facts(rule())).toContainEqual({
      kind: 'id',
      value: '0prFAKErule000000001',
      copyLabel: 'Copy rule id 0prFAKErule000000001',
    });
  });
});

describe('ruleIdentity status', () => {
  it('states an active rule quietly, in the identity row, with no header badge', () => {
    const identity = ruleIdentity(rule({ status: 'ACTIVE' }));

    expect(identity.badge).toBeUndefined();
    expect(identity.rows.flat()).toContainEqual({
      kind: 'status',
      variant: 'success',
      text: 'Active',
    });
  });

  it('promotes a paused rule to the header badge, and does not also say it in the row', () => {
    const identity = ruleIdentity(rule({ status: 'INACTIVE' }));

    expect(identity.badge).toEqual({ text: 'Paused', variant: 'warning' });
    expect(identity.rows.flat().filter((f) => f.kind === 'status')).toHaveLength(0);
  });

  it('marks an INVALID rule Broken, never Paused (D-085)', () => {
    const identity = ruleIdentity(rule({ status: 'INVALID' }));

    expect(identity.badge).toEqual({ text: 'Broken', variant: 'danger' });
    expect(identity.rows.flat().filter((f) => f.kind === 'status')).toHaveLength(0);
  });
});

describe('ruleIdentity counts', () => {
  it('counts target groups, attributes and conflicts, pluralising each', () => {
    const identity = ruleIdentity(
      rule({
        groupIds: ['00gFAKE0000000000001'],
        userAttributes: ['user.department', 'user.title'],
        conflicts: [
          { severity: 'high', reason: 'overlaps', rule2: { name: 'Other' } },
          { severity: 'low', reason: 'overlaps', rule2: { name: 'Another' } },
        ] as FormattedRule['conflicts'],
      }),
    );
    const counted = identity.rows.flat().filter((f) => f.kind === 'metric');

    expect(counted).toEqual([
      expect.objectContaining({ value: '1', label: 'target group' }),
      expect.objectContaining({ value: '2', label: 'attributes' }),
      expect.objectContaining({ value: '2', label: 'conflicts' }),
    ]);
  });

  it('omits every count at zero rather than stating it', () => {
    const counted = facts(rule({ groupIds: [], userAttributes: [], conflicts: [] })).filter(
      (f) => f.kind === 'metric',
    );

    expect(counted).toEqual([]);
  });

  it('omits the conflict count when conflicts were never populated', () => {
    const counted = facts(rule({ conflicts: undefined })).filter((f) => f.kind === 'metric');

    expect(counted).toEqual([]);
  });
});

describe('ruleIdentity timestamps', () => {
  it('states both timestamps relatively', () => {
    const texts = facts(rule())
      .filter((f) => f.kind === 'text')
      .map((f) => (f.kind === 'text' ? f.text : ''));

    expect(texts.some((t) => t.startsWith('Updated '))).toBe(true);
    expect(texts.some((t) => t.startsWith('Created '))).toBe(true);
  });

  it('omits a timestamp it cannot render rather than printing null', () => {
    const texts = facts(rule({ created: '', lastUpdated: 'not-a-date' })).filter(
      (f) => f.kind === 'text',
    );

    expect(texts).toEqual([]);
  });
});
