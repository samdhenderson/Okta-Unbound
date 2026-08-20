import { describe, it, expect } from 'vitest';
import { allProfileAttributes } from './profileAttributes';
import { oktaUserProfileSchemaSchema } from '../../../shared/schemas/okta';
import { BASE_PROFILE_ATTRIBUTES } from '../../../shared/utils/profileFields';
import type { OktaUser } from '../../../shared/types';

const makeUser = (profile: Record<string, unknown> = {}): OktaUser =>
  ({
    id: '00uFAKE0001',
    status: 'ACTIVE',
    created: '2026-01-02T03:04:05.000Z',
    profile: {
      login: 'user@example.com',
      email: 'user@example.com',
      firstName: 'Ada',
      lastName: 'Example',
      ...profile,
    },
  }) as OktaUser;

const parseSchema = (raw: unknown) => oktaUserProfileSchemaSchema.parse(raw);

const schemaWith = (
  base: Record<string, unknown>,
  custom: Record<string, unknown> = {},
): ReturnType<typeof parseSchema> =>
  parseSchema({
    definitions: {
      base: { properties: base },
      custom: { properties: custom },
    },
  });

const byName = (rows: ReturnType<typeof allProfileAttributes>, name: string) =>
  rows.find((row) => row.name === name);

describe('allProfileAttributes', () => {
  it('labels base attributes from the schema title, not a hard-coded map', () => {
    const rows = allProfileAttributes(
      makeUser(),
      schemaWith({
        login: { title: 'Username', type: 'string' },
        email: { title: 'Primary email', type: 'string' },
      }),
    );

    expect(byName(rows, 'login')).toMatchObject({
      key: 'profile.login',
      label: 'Username',
      kind: 'base',
      value: 'user@example.com',
      isEmpty: false,
    });
    expect(byName(rows, 'email')?.label).toBe('Primary email');
  });

  it('humanizes the name when the schema supplies no title', () => {
    const rows = allProfileAttributes(makeUser(), schemaWith({ secondEmail: { type: 'string' } }));
    expect(byName(rows, 'secondEmail')?.label).toBe('Second Email');
  });

  it('includes the top-level system fields, with the id monospaced', () => {
    const rows = allProfileAttributes(makeUser(), null);

    expect(byName(rows, 'id')).toMatchObject({
      key: 'id',
      label: 'User ID',
      kind: 'system',
      value: '00uFAKE0001',
      mono: true,
    });
    expect(byName(rows, 'status')?.value).toBe('ACTIVE');
    expect(byName(rows, 'lastLogin')).toMatchObject({ value: '', isEmpty: true });
    expect(byName(rows, 'created')?.isEmpty).toBe(false);
  });

  it('falls back to BASE_PROFILE_ATTRIBUTES when there is no schema', () => {
    const rows = allProfileAttributes(makeUser(), null);
    const baseNames = rows.filter((row) => row.kind === 'base').map((row) => row.name);

    expect(baseNames).toEqual([...BASE_PROFILE_ATTRIBUTES]);
    expect(byName(rows, 'honorificPrefix')).toMatchObject({ value: '', isEmpty: true });
  });

  it('keeps a custom attribute the schema defines but this user has not set', () => {
    const rows = allProfileAttributes(
      makeUser(),
      schemaWith({ login: { title: 'Username' } }, { badgeId: { title: 'Badge ID' } }),
    );

    expect(byName(rows, 'badgeId')).toMatchObject({
      key: 'profile.badgeId',
      label: 'Badge ID',
      kind: 'custom',
      value: '',
      raw: undefined,
      isEmpty: true,
    });
  });

  it('surfaces a profile key the schema never mentioned, classified custom', () => {
    const rows = allProfileAttributes(
      makeUser({ legacyCode: 'X-9' }),
      schemaWith({ login: {} }, { badgeId: {} }),
    );

    expect(byName(rows, 'legacyCode')).toMatchObject({
      key: 'profile.legacyCode',
      label: 'Legacy Code',
      kind: 'custom',
      value: 'X-9',
      isEmpty: false,
    });
  });

  it('never emits an excluded key, whichever source it came from', () => {
    const rows = allProfileAttributes(
      makeUser({ securityQuestion: 'first pet?', recoveryAnswer: 'fluffy', password: 'hunter2' }),
      schemaWith(
        { login: {}, securityQuestion: { title: 'Security Question' } },
        { securityQuestionAnswer: { title: 'Security Answer' } },
      ),
    );

    for (const excluded of [
      'securityQuestion',
      'securityQuestionAnswer',
      'recoveryAnswer',
      'password',
    ]) {
      expect(byName(rows, excluded)).toBeUndefined();
    }
    expect(rows.some((row) => row.value.includes('fluffy'))).toBe(false);
  });

  it('preserves a non-string value in `raw` while stringifying `value`', () => {
    const rows = allProfileAttributes(
      makeUser({ isContractor: false, seats: 3, aliases: ['a', 'b'] }),
      null,
    );

    expect(byName(rows, 'isContractor')).toMatchObject({ raw: false, value: 'false' });
    expect(byName(rows, 'seats')).toMatchObject({ raw: 3, value: '3' });
    expect(byName(rows, 'aliases')?.raw).toEqual(['a', 'b']);
    expect(byName(rows, 'aliases')?.value).toBe('["a","b"]');
  });

  it('emits each key exactly once even when the schema and the profile overlap', () => {
    const rows = allProfileAttributes(
      makeUser({ badgeId: 'B-1' }),
      schemaWith({ login: {}, email: {} }, { badgeId: { title: 'Badge ID' } }),
    );

    const keys = rows.map((row) => row.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(byName(rows, 'badgeId')).toMatchObject({ label: 'Badge ID', value: 'B-1' });
  });
});
