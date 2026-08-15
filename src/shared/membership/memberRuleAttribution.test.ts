import { describe, it, expect } from 'vitest';
import {
  GROUP_RULES_EXPAND,
  interpretGroupRules,
  readEmbeddedGroupRules,
  memberWithGroupRulesSchema,
} from './memberRuleAttribution';

function row(embedded: unknown): unknown {
  return { id: '00uFAKE1', _embedded: embedded };
}

describe('GROUP_RULES_EXPAND', () => {
  it('is the hyphenated key Okta actually uses', () => {
    expect(GROUP_RULES_EXPAND).toBe('group-rules');
  });
});

describe('readEmbeddedGroupRules', () => {
  it('reports the rules Okta names', () => {
    const result = readEmbeddedGroupRules(
      row({ 'group-rules': [{ id: '0prFAKE1', name: 'Eng feeder' }] }),
    );

    expect(result).toEqual({
      state: 'rules',
      rules: [{ id: '0prFAKE1', name: 'Eng feeder' }],
    });
  });

  it('keeps every rule of a multi-rule member', () => {
    const result = readEmbeddedGroupRules(
      row({
        'group-rules': [
          { id: '0prFAKE1', name: 'Eng feeder' },
          { id: '0prFAKE2', name: 'Contractor feeder' },
        ],
      }),
    );

    expect(result).toMatchObject({ state: 'rules' });
    expect(result).toHaveProperty('rules.length', 2);
  });

  it('collapses a repeated rule id so a member is credited once per rule', () => {
    const result = readEmbeddedGroupRules(
      row({
        'group-rules': [
          { id: '0prFAKE1', name: 'Eng feeder' },
          { id: '0prFAKE1', name: 'Eng feeder' },
        ],
      }),
    );

    expect(result).toEqual({ state: 'rules', rules: [{ id: '0prFAKE1', name: 'Eng feeder' }] });
  });

  it('keeps the usable entries of a partially malformed array', () => {
    const result = readEmbeddedGroupRules(
      row({ 'group-rules': [{ nope: true }, { id: '0prFAKE1', name: 'Eng feeder' }] }),
    );

    expect(result).toEqual({ state: 'rules', rules: [{ id: '0prFAKE1', name: 'Eng feeder' }] });
  });

  it('reports an EMPTY array as a positive "no rule feeds this member"', () => {
    expect(readEmbeddedGroupRules(row({ 'group-rules': [] }))).toEqual({ state: 'no-rules' });
  });

  it('reports an ABSENT group-rules key as unknown, never as "no rule"', () => {
    expect(readEmbeddedGroupRules(row({}))).toEqual({ state: 'unknown' });
    expect(readEmbeddedGroupRules({ id: '00uFAKE1' })).toEqual({ state: 'unknown' });
  });

  it.each([
    ['a null embed', null],
    ['a string embed', 'nope'],
    ['a number embed', 7],
    ['a non-array group-rules value', { 'group-rules': 'nope' }],
    ['a null group-rules value', { 'group-rules': null }],
    ['an array of unusable entries', { 'group-rules': [null, {}, { id: 42 }] }],
    ['a camelCase key Okta does not use', { groupRules: [{ id: '0prFAKE1', name: 'x' }] }],
  ])('degrades %s to unknown rather than throwing', (_label, embedded) => {
    expect(readEmbeddedGroupRules(row(embedded))).toEqual({ state: 'unknown' });
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'nope'],
  ])('returns unknown for %s instead of a member row', (_label, member) => {
    expect(readEmbeddedGroupRules(member)).toEqual({ state: 'unknown' });
  });
});

describe('memberWithGroupRulesSchema', () => {
  const validMember = {
    id: '00uFAKE1',
    status: 'ACTIVE',
    profile: {
      login: 'ada@example.com',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Fake',
    },
  };

  it('keeps the embed on a valid row', () => {
    const parsed = memberWithGroupRulesSchema.parse({
      ...validMember,
      _embedded: { 'group-rules': [{ id: '0prFAKE1', name: 'Eng feeder' }] },
    });

    expect(readEmbeddedGroupRules(parsed)).toMatchObject({ state: 'rules' });
  });

  it.each([
    ['a malformed embed', 'nope'],
    ['a non-array group-rules value', { 'group-rules': 42 }],
    ['no embed at all', undefined],
  ])('still validates a member with %s', (_label, embedded) => {
    const input =
      embedded === undefined ? { ...validMember } : { ...validMember, _embedded: embedded };

    expect(memberWithGroupRulesSchema.safeParse(input).success).toBe(true);
  });
});

describe('interpretGroupRules', () => {
  it('reports the rules Okta names, collapsing a repeated id', () => {
    expect(
      interpretGroupRules([
        { id: '0prFAKE1', name: 'Eng feeder' },
        { id: '0prFAKE1', name: 'Eng feeder' },
        { id: '0prFAKE2', name: 'Contractor feeder' },
      ]),
    ).toEqual({
      state: 'rules',
      rules: [
        { id: '0prFAKE1', name: 'Eng feeder' },
        { id: '0prFAKE2', name: 'Contractor feeder' },
      ],
    });
  });

  it('reports an EMPTY array as a positive "no rule manages this membership"', () => {
    expect(interpretGroupRules([])).toEqual({ state: 'no-rules' });
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['a string', 'nope'],
    ['an object', { 'group-rules': [] }],
    ['an array of unusable entries', [null, {}, { id: 42 }]],
  ])('degrades %s to unknown rather than to "no rule"', (_label, raw) => {
    expect(interpretGroupRules(raw)).toEqual({ state: 'unknown' });
  });

  it('is the reading the embed reader delegates to', () => {
    const rules = [{ id: '0prFAKE1', name: 'Eng feeder' }];

    expect(readEmbeddedGroupRules(row({ 'group-rules': rules }))).toEqual(
      interpretGroupRules(rules),
    );
  });
});
