import { describe, it, expect } from 'vitest';
import { isSafePathSegment, substitutePathHoles, isNormalizedPath } from './apiPath';
import { CATALOG_ENDPOINTS } from '@/sidepanel/apiCatalog/registry';

const ORIGIN = 'https://example.okta.com';

describe('isSafePathSegment', () => {
  it('accepts an Okta id', () => {
    expect(isSafePathSegment('00uFAKE000000000000')).toBe(true);
  });

  it('accepts values that are not ids but are real path segments', () => {
    expect(isSafePathSegment('me')).toBe(true);
    expect(isSafePathSegment('ada@example.com')).toBe(true);
    expect(isSafePathSegment('rst1abcdefghijklmn0p7')).toBe(true);
  });

  it('refuses anything that could end the segment', () => {
    for (const value of ['a/b', 'a?b', 'a#b', 'a%2f', 'a\\b']) {
      expect(isSafePathSegment(value), value).toBe(false);
    }
  });

  it('refuses traversal, including the single dot', () => {
    expect(isSafePathSegment('..')).toBe(false);
    expect(isSafePathSegment('.')).toBe(false);
  });

  it('refuses whitespace and control characters', () => {
    expect(isSafePathSegment('a b')).toBe(false);
    expect(isSafePathSegment('a\nb')).toBe(false);
    expect(isSafePathSegment('a\u0000b')).toBe(false);
  });

  it('refuses the empty value and one longer than any real identifier', () => {
    expect(isSafePathSegment('')).toBe(false);
    expect(isSafePathSegment('x'.repeat(257))).toBe(false);
  });
});

describe('substitutePathHoles', () => {
  it('fills every hole', () => {
    expect(
      substitutePathHoles('/api/v1/groups/{groupId}/users/{userId}', {
        groupId: '00gFAKE000000000000',
        userId: '00uFAKE000000000000',
      }),
    ).toEqual({ ok: true, path: '/api/v1/groups/00gFAKE000000000000/users/00uFAKE000000000000' });
  });

  it('encodes a value that is legal but not URL-safe', () => {
    expect(substitutePathHoles('/api/v1/users/{userId}', { userId: 'ada@example.com' })).toEqual({
      ok: true,
      path: '/api/v1/users/ada%40example.com',
    });
  });

  it('names the token that was left empty rather than dropping the segment', () => {
    expect(substitutePathHoles('/api/v1/users/{userId}/groups', {})).toEqual({
      ok: false,
      error: { reason: 'unfilled', token: 'userId' },
    });
  });

  it('refuses a value that would rewrite the path, and says which one', () => {
    expect(substitutePathHoles('/api/v1/users/{userId}', { userId: '../../admin/users' })).toEqual({
      ok: false,
      error: { reason: 'unsafe', token: 'userId' },
    });
  });

  it('reports a reason code, not a sentence', () => {
    const result = substitutePathHoles('/api/v1/users/{userId}', { userId: 'a/b' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(['unfilled', 'unsafe']).toContain(result.error.reason);
  });

  it('leaves a template with no holes exactly as it was', () => {
    expect(substitutePathHoles('/api/v1/users', {})).toEqual({ ok: true, path: '/api/v1/users' });
  });
});

describe('isNormalizedPath', () => {
  it('accepts every path in the endpoint catalog once its holes are filled', () => {
    const rejected = CATALOG_ENDPOINTS.map((endpoint) =>
      endpoint.path.replace(/\{[^{}]+\}/g, '00uFAKE000000000000'),
    ).filter((path) => !isNormalizedPath(path, ORIGIN));

    expect(rejected).toEqual([]);
  });

  it('accepts the shapes the export engine and the API modules build', () => {
    const shipped = [
      '/api/v1/users?limit=200',
      '/api/v1/groups?limit=200&expand=stats',
      '/api/v1/groups/00gFAKE000000000000/users?limit=200&expand=group-rules',
      '/api/v1/apps?filter=user.id+eq+%2200uFAKE000000000000%22&expand=user/00uFAKE000000000000',
      '/api/v1/users?search=profile.department eq "Engineering"&limit=200',
      '/api/v1/logs?since=2026-01-01T00:00:00.000Z&sortOrder=DESCENDING&limit=1000',
      '/api/v1/users/ada%40example.com',
      '/api/v1/groups/rules/0prFAKE000000000000/lifecycle/activate',
    ];

    expect(shipped.filter((path) => !isNormalizedPath(path, ORIGIN))).toEqual([]);
  });

  it('leaves a query expression alone, spaces and quotes included', () => {
    expect(isNormalizedPath('/api/v1/users?search=status eq "ACTIVE"', ORIGIN)).toBe(true);
  });

  it('refuses a path that resolves somewhere else entirely', () => {
    expect(isNormalizedPath('/api/v1/../admin/users', ORIGIN)).toBe(false);
  });

  it('keeps a doubled slash, and refuses a dot segment', () => {
    expect(isNormalizedPath('/api//v1/users', ORIGIN)).toBe(true);
    expect(isNormalizedPath('/api/v1/users/./groups', ORIGIN)).toBe(false);
  });

  it('refuses a path that is not a path', () => {
    expect(isNormalizedPath('api/v1/users', ORIGIN)).toBe(false);
    expect(isNormalizedPath('https://elsewhere.example/api/v1/users', ORIGIN)).toBe(false);
  });
});
