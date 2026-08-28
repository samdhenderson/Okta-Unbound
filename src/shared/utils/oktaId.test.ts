import { describe, it, expect } from 'vitest';
import { oktaIdKind } from './oktaId';
import { redactJson } from './redact';

const fakeId = (prefix: string, filler = 'FAKE00000000000') => `${prefix}${filler}01`;

describe('oktaIdKind', () => {
  it('classifies each reachable entity kind by its prefix', () => {
    expect(oktaIdKind(fakeId('00g'))).toBe('group');
    expect(oktaIdKind(fakeId('00u'))).toBe('user');
    expect(oktaIdKind(fakeId('0oa'))).toBe('app');
    expect(oktaIdKind(fakeId('0pr'))).toBe('rule');
  });

  it('trims surrounding whitespace, because ids arrive by paste', () => {
    expect(oktaIdKind(`  ${fakeId('00g')}\n`)).toBe('group');
  });

  it('does not lowercase — Okta ids are case-sensitive', () => {
    const upper = fakeId('00g');
    const lower = upper.slice(0, 3) + upper.slice(3).toLowerCase();
    expect(oktaIdKind(upper)).toBe('group');
    expect(oktaIdKind(lower)).toBe('group');
    expect(lower).not.toBe(upper);
  });

  describe('returns null rather than guessing', () => {
    it('for a policy id — the prefix is real but has no destination tab', () => {
      expect(oktaIdKind(fakeId('00p'))).toBeNull();
      expect(oktaIdKind(fakeId('rst'))).toBeNull();
    });

    it('for an authorization-server id — nothing in this app browses them', () => {
      expect(oktaIdKind(fakeId('aus'))).toBeNull();
    });

    it('for a known prefix with the wrong body length', () => {
      expect(oktaIdKind('00gFAKE')).toBeNull(); // too short
      expect(oktaIdKind(`${fakeId('00g')}X`)).toBeNull(); // too long
    });

    it('for a known prefix with a non-alphanumeric body', () => {
      expect(oktaIdKind('00gFAKE-0000-0000-01')).toBeNull();
    });

    it('for names and emails, which are what the caller searches instead', () => {
      expect(oktaIdKind('Engineering')).toBeNull();
      expect(oktaIdKind('ada@example.com')).toBeNull();
      expect(oktaIdKind('')).toBeNull();
      expect(oktaIdKind('   ')).toBeNull();
    });

    it('for an id embedded in a longer string — the match is anchored', () => {
      expect(oktaIdKind(`group ${fakeId('00g')} please`)).toBeNull();
    });
  });
});

describe('agreement with the redaction prefix table', () => {
  it.each(['00g', '00u', '0oa'])(
    'treats %s as an id in the same shape redaction recognises',
    (prefix) => {
      const id = fakeId(prefix);
      expect(oktaIdKind(id)).not.toBeNull();
      expect(redactJson({ id }).redactedCount).toBe(1);
    },
  );

  it('documents the one prefix redaction does not cover', () => {
    const ruleId = fakeId('0pr');
    expect(oktaIdKind(ruleId)).toBe('rule');
    expect(redactJson({ id: ruleId }).redactedCount).toBe(0);
  });
});
