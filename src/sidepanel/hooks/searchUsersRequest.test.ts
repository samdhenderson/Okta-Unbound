import { describe, it, expect, vi } from 'vitest';
import { searchUsersRequest } from './searchUsersRequest';
import type { RequestResult } from '../../shared/scheduler/types';

const ok = (data: unknown): RequestResult => ({ success: true, data });

const okWithNext = (data: unknown): RequestResult => ({
  success: true,
  data,
  headers: { link: '<https://example.okta.com/api/v1/users?after=00uFAKE0002>; rel="next"' },
});

const okSelfOnly = (data: unknown): RequestResult => ({
  success: true,
  data,
  headers: { link: '<https://example.okta.com/api/v1/users?q=ada>; rel="self"' },
});

function user(id: string) {
  return { id, status: 'ACTIVE', profile: { email: `${id}@x.com`, login: `${id}@x.com` } };
}

describe('searchUsersRequest', () => {
  it('uses the q= result and stops when strategy 1 returns matches', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(ok([user('u1')]));

    const result = await searchUsersRequest(makeApiRequest, 'ada');

    expect(result).toEqual({ success: true, data: [user('u1')], truncated: false });
    expect(makeApiRequest).toHaveBeenCalledTimes(1);
    expect(makeApiRequest).toHaveBeenCalledWith('/api/v1/users?q=ada&limit=20', {
      method: 'GET',
      priority: 'interactive',
      reason: 'Search users',
    });
  });

  function searchExpression(makeApiRequest: ReturnType<typeof vi.fn>, nth: number): string {
    const url = makeApiRequest.mock.calls[nth - 1][0] as string;
    const value = /[?&]search=([^&]*)/.exec(url)?.[1] ?? '';
    return decodeURIComponent(value);
  }

  it('falls back to a SCIM search= expression when q= returns no rows', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValueOnce(ok([])) // q=
      .mockResolvedValueOnce(ok([user('u2')])); // search=

    const result = await searchUsersRequest(makeApiRequest, 'ada');

    expect(result.data).toEqual([user('u2')]);
    expect(makeApiRequest).toHaveBeenCalledTimes(2);
    expect(searchExpression(makeApiRequest, 2)).toBe(
      'profile.firstName sw "ada" or profile.lastName sw "ada" or ' +
        'profile.login sw "ada" or profile.email sw "ada"',
    );
    expect(makeApiRequest.mock.calls[1][1]).toEqual({
      method: 'GET',
      priority: 'interactive',
      reason: 'Search users',
    });
  });

  it('adds a first/last name pair for a multi-word query', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(ok([]));

    await searchUsersRequest(makeApiRequest, 'Ada Lovelace');

    expect(searchExpression(makeApiRequest, 2)).toContain(
      '(profile.firstName sw "Ada" and profile.lastName sw "Lovelace")',
    );
  });

  it('pairs the first and last token of a three-part name, not the middle one', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(ok([]));

    await searchUsersRequest(makeApiRequest, 'Ada Byron Lovelace');

    expect(searchExpression(makeApiRequest, 2)).toContain(
      '(profile.firstName sw "Ada" and profile.lastName sw "Lovelace")',
    );
  });

  it('escapes quotes and backslashes so a typed " cannot break the expression', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(ok([]));

    await searchUsersRequest(makeApiRequest, 'a" or profile.login pr or "');

    const expression = searchExpression(makeApiRequest, 2);
    expect(expression).toContain('profile.firstName sw "a\\" or profile.login pr or \\""');
    expect(expression).not.toContain('sw "a" or profile.login pr or ""');
  });

  it('URL-encodes the search expression', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(ok([]));

    await searchUsersRequest(makeApiRequest, 'ada');

    const url = makeApiRequest.mock.calls[1][0] as string;
    expect(url).not.toMatch(/[ "]/);
    expect(url).toContain('search=profile.firstName%20sw%20%22ada%22');
  });

  it('tries the email filter only when the query has @ and nothing matched yet', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValueOnce(ok([])) // q=
      .mockResolvedValueOnce(ok([])) // search=
      .mockResolvedValueOnce(ok([user('ada')])); // filter=

    const result = await searchUsersRequest(makeApiRequest, 'ada@x.com');

    expect(result.data).toEqual([user('ada')]);
    expect(makeApiRequest).toHaveBeenCalledTimes(3);
    expect(makeApiRequest).toHaveBeenNthCalledWith(
      3,
      '/api/v1/users?filter=profile.email eq "ada@x.com"&limit=20',
      {
        method: 'GET',
        priority: 'interactive',
        reason: 'Search users',
      },
    );
  });

  it('does NOT try the email filter for a non-email query that finds nothing', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(ok([]));

    const result = await searchUsersRequest(makeApiRequest, 'ada');

    expect(result).toEqual({ success: true, data: [], truncated: false });
    expect(makeApiRequest).toHaveBeenCalledTimes(2); // q= then search=, no filter
  });

  it('trims the query and URL-encodes it', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(ok([user('u1')]));

    await searchUsersRequest(makeApiRequest, '  a b  ');

    expect(makeApiRequest).toHaveBeenCalledWith('/api/v1/users?q=a%20b&limit=20', {
      method: 'GET',
      priority: 'interactive',
      reason: 'Search users',
    });
  });

  it('reports a failure (does not throw) when a request rejects', async () => {
    const makeApiRequest = vi.fn().mockRejectedValue(new Error('scheduler down'));

    const result = await searchUsersRequest(makeApiRequest, 'ada');

    expect(result).toEqual({ success: false, truncated: false, error: 'scheduler down' });
  });

  describe('truncated (D-C)', () => {
    it('is true when the winning page carries a rel="next" link', async () => {
      const makeApiRequest = vi.fn().mockResolvedValue(okWithNext([user('u1')]));

      const result = await searchUsersRequest(makeApiRequest, 'ada');

      expect(result.truncated).toBe(true);
    });

    it('is false when the only link is rel="self"', async () => {
      const makeApiRequest = vi.fn().mockResolvedValue(okSelfOnly([user('u1')]));

      expect((await searchUsersRequest(makeApiRequest, 'ada')).truncated).toBe(false);
    });

    it('is false when the response carries no headers at all', async () => {
      const makeApiRequest = vi.fn().mockResolvedValue(ok([user('u1')]));

      expect((await searchUsersRequest(makeApiRequest, 'ada')).truncated).toBe(false);
    });

    it('reads the headers of the strategy that returned the rows, not an earlier one', async () => {
      const makeApiRequest = vi
        .fn()
        .mockResolvedValueOnce(okWithNext([])) // q= — no rows, so not the winner
        .mockResolvedValueOnce(ok([user('u2')])); // search= — the winner, complete

      const result = await searchUsersRequest(makeApiRequest, 'ada');

      expect(result.data).toEqual([user('u2')]);
      expect(result.truncated).toBe(false);
    });

    it('does not inherit a losing strategy\u2019s next link when no later one supplies headers', async () => {
      const makeApiRequest = vi
        .fn()
        .mockResolvedValueOnce(okWithNext([])) // q= — a truncated *empty* page
        .mockResolvedValueOnce({ success: false, error: 'boom' } as RequestResult); // search= fails

      const result = await searchUsersRequest(makeApiRequest, 'ada');

      expect(result.data).toEqual([]);
      expect(result.truncated).toBe(false);
    });

    it('carries a later strategy\u2019s truncation forward', async () => {
      const makeApiRequest = vi
        .fn()
        .mockResolvedValueOnce(ok([])) // q=
        .mockResolvedValueOnce(okWithNext([user('u2')])); // search= wins, truncated

      expect((await searchUsersRequest(makeApiRequest, 'ada')).truncated).toBe(true);
    });

    it('reads the email filter\u2019s headers when strategy 3 wins', async () => {
      const makeApiRequest = vi
        .fn()
        .mockResolvedValueOnce(ok([])) // q=
        .mockResolvedValueOnce(ok([])) // search=
        .mockResolvedValueOnce(okWithNext([user('ada')])); // filter=

      expect((await searchUsersRequest(makeApiRequest, 'ada@x.com')).truncated).toBe(true);
    });
  });
});
