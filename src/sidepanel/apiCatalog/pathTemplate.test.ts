import { describe, it, expect } from 'vitest';
import { parseHoles, matchesTemplate, findEndpoint, HOLE_KINDS } from './pathTemplate';

describe('parseHoles', () => {
  it('finds nothing in a path with no holes', () => {
    expect(parseHoles('/api/v1/users')).toEqual([]);
  });

  it('locates each hole and names what it wants', () => {
    expect(parseHoles('/api/v1/groups/{groupId}/users/{userId}')).toEqual([
      { token: 'groupId', kind: 'group', start: 15, end: 24 },
      { token: 'userId', kind: 'user', start: 31, end: 39 },
    ]);
  });

  it('reports a token it has no source for as unknown, rather than omitting it', () => {
    const [hole] = parseHoles('/api/v1/users/{userId}/linkedObjects/{relationshipName}').slice(1);
    expect(hole.kind).toBe('unknown');
  });

  it('gives offsets that slice the token back out of the path', () => {
    const path = '/api/v1/apps/{appId}/groups';
    const [hole] = parseHoles(path);
    expect(path.slice(hole.start, hole.end)).toBe('{appId}');
  });
});

describe('matchesTemplate', () => {
  it('matches a filled hole', () => {
    expect(matchesTemplate('/api/v1/users/00uFAKE000000000000', '/api/v1/users/{userId}')).toBe(
      true,
    );
  });

  it('refuses a path that is one segment short', () => {
    expect(matchesTemplate('/api/v1/users', '/api/v1/users/{userId}')).toBe(false);
  });

  it('refuses a path that is one segment long', () => {
    expect(
      matchesTemplate('/api/v1/users/00uFAKE000000000000/groups', '/api/v1/users/{userId}'),
    ).toBe(false);
  });

  it('refuses an empty segment where a hole is', () => {
    expect(matchesTemplate('/api/v1/users/', '/api/v1/users/{userId}')).toBe(false);
  });

  it('compares literal segments exactly', () => {
    expect(matchesTemplate('/api/v1/Users', '/api/v1/users')).toBe(false);
  });
});

describe('findEndpoint', () => {
  it('finds the endpoint behind a filled path', () => {
    expect(findEndpoint('/api/v1/groups/00gFAKE000000000000/users')?.id).toBe(
      'groups.members.list',
    );
  });

  it('ignores a query string', () => {
    expect(findEndpoint('/api/v1/users?limit=200')?.id).toBe('users.list');
  });

  it('narrows by method when asked', () => {
    expect(findEndpoint('/api/v1/users', 'POST')?.id).toBe('users.create');
  });

  it('returns null for a path the catalog has never heard of', () => {
    expect(findEndpoint('/api/v1/internal/whatever')).toBeNull();
  });
});

describe('HOLE_KINDS', () => {
  it('maps every token the catalog actually uses, or deliberately does not', () => {
    expect(HOLE_KINDS.groupId).toBe('group');
    expect(HOLE_KINDS.relationshipName).toBeUndefined();
  });
});
