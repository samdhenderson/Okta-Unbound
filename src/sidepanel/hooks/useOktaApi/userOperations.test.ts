import { describe, it, expect, vi } from 'vitest';
import { createUserOperations } from './userOperations';
import type { CoreApi } from './core';
import type { RequestResult } from '@/shared/scheduler/types';
import { makeFakeCore } from '@/test/factories/coreApi';

const makeCore = (overrides: Partial<CoreApi> = {}): CoreApi =>
  makeFakeCore({
    makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: {} }),
    runOperation: vi.fn(
      async (_name, items: unknown[], task: (i: unknown, n: number) => unknown) => {
        for (let i = 0; i < items.length; i++) await task(items[i], i);
        return { results: [], completed: items.length, failed: 0, cancelled: false };
      },
    ),
    ...overrides,
  });

describe('getUserLastLogin', () => {
  it('returns a Date when lastLogin is present', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({
        success: true,
        data: { lastLogin: '2026-01-02T03:04:05.000Z' },
      }),
    });
    const { getUserLastLogin } = createUserOperations(core);

    const result = await getUserLastLogin('00uFAKE1');

    expect(core.makeApiRequest).toHaveBeenCalledWith('/api/v1/users/00uFAKE1', {
      reason: 'Load user last login',
    });
    expect(result).toEqual(new Date('2026-01-02T03:04:05.000Z'));
  });

  it('returns null when the user never logged in (no lastLogin)', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: {} }),
    });
    const { getUserLastLogin } = createUserOperations(core);
    expect(await getUserLastLogin('00uFAKE1')).toBeNull();
  });

  it('returns null when the request is unsuccessful', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: false }),
    });
    const { getUserLastLogin } = createUserOperations(core);
    expect(await getUserLastLogin('00uFAKE1')).toBeNull();
  });

  it('returns null and swallows a thrown error', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockRejectedValue(new Error('boom')),
    });
    const { getUserLastLogin } = createUserOperations(core);
    expect(await getUserLastLogin('00uFAKE1')).toBeNull();
  });
});

describe('getUserApps', () => {
  it('walks Link pagination and flattens id + label/name/id fallback', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValueOnce({
        success: true,
        data: [{ id: 'a1', label: 'App One', name: 'app_one' }],
        headers: { link: '<https://example.okta.com/api/v1/apps?after=cur>; rel="next"' },
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{ id: 'a2', name: 'App Two' }, { id: 'a3' }],
        headers: {},
      });
    const core = makeCore({ makeApiRequest });
    const { getUserApps } = createUserOperations(core);

    const { apps, complete } = await getUserApps('00uFAKE1');

    expect(makeApiRequest).toHaveBeenCalledTimes(2);
    expect(apps).toEqual([
      { id: 'a1', label: 'App One', name: 'app_one', isProfileSource: false },
      { id: 'a2', label: 'App Two', name: 'App Two', isProfileSource: false },
      { id: 'a3', label: 'a3', name: undefined, isProfileSource: false },
    ]);
    expect(complete).toBe(true);
  });

  it('reports the walk as incomplete when a page is unsuccessful', async () => {
    const core = makeCore({ makeApiRequest: vi.fn().mockResolvedValue({ success: false }) });
    const { getUserApps } = createUserOperations(core);

    expect(await getUserApps('00uFAKE1')).toEqual({ apps: [], complete: false });
  });

  it('keeps the pages it collected before a mid-walk failure, and flags them as partial', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValueOnce({
        success: true,
        data: [{ id: 'a1', label: 'App One' }],
        headers: { link: '<https://example.okta.com/api/v1/apps?after=cur>; rel="next"' },
      })
      .mockResolvedValueOnce({ success: false, error: '500 from Okta' });
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    expect(await getUserApps('00uFAKE1')).toEqual({
      apps: [{ id: 'a1', label: 'App One', scope: undefined, isProfileSource: false }],
      complete: false,
    });
  });

  it('reports the walk as incomplete on a thrown error', async () => {
    const core = makeCore({ makeApiRequest: vi.fn().mockRejectedValue(new Error('offline')) });
    const { getUserApps } = createUserOperations(core);
    expect(await getUserApps('00uFAKE1')).toEqual({ apps: [], complete: false });
  });
});

describe('batchGetUserDetails', () => {
  it('loads users in batches of 3 at low priority, omitting failures, and reports progress', async () => {
    const makeApiRequest = vi.fn(async (endpoint: string): Promise<RequestResult> => {
      if (endpoint.endsWith('/00uFAKE2')) return { success: true, data: null }; // omitted
      if (endpoint.endsWith('/00uFAKE4')) throw new Error('boom'); // omitted via catch
      const id = endpoint.split('/').pop();
      return { success: true, data: { id, profile: {} } };
    });
    const core = makeCore({ makeApiRequest });
    const { batchGetUserDetails } = createUserOperations(core);
    const onProgress = vi.fn();

    const map = await batchGetUserDetails(
      ['00uFAKE1', '00uFAKE2', '00uFAKE3', '00uFAKE4'],
      onProgress,
    );

    expect([...map.keys()].sort()).toEqual(['00uFAKE1', '00uFAKE3']);
    expect(makeApiRequest).toHaveBeenCalledWith('/api/v1/users/00uFAKE1', {
      method: 'GET',
      priority: 'low',
      reason: 'Load user details',
    });
    expect(onProgress).toHaveBeenNthCalledWith(1, 3, 4);
    expect(onProgress).toHaveBeenNthCalledWith(2, 4, 4);
  });

  it('works without an onProgress callback', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: { id: 'x', profile: {} } }),
    });
    const { batchGetUserDetails } = createUserOperations(core);
    const map = await batchGetUserDetails(['00uFAKE1']);
    expect(map.size).toBe(1);
  });

  it('returns the partially-loaded map when the run is cancelled midway', async () => {
    const runOperation = vi.fn(
      async (_name: string, items: unknown[], task: (item: unknown, index: number) => unknown) => {
        await task(items[0], 0);
        return {
          results: [],
          total: items.length,
          completed: 1,
          failed: 0,
          skipped: items.length - 1,
          stoppedByError: false,
          cancelled: true,
        };
      },
    ) as unknown as CoreApi['runOperation'];
    const core = makeCore({
      makeApiRequest: vi.fn(async (endpoint: string): Promise<RequestResult> => ({
        success: true,
        data: { id: endpoint.split('/').pop(), profile: {} },
      })),
      runOperation,
    });
    const { batchGetUserDetails } = createUserOperations(core);

    const map = await batchGetUserDetails(['00uFAKE1', '00uFAKE2', '00uFAKE3']);

    expect([...map.keys()]).toEqual(['00uFAKE1']);
  });
});

describe('scanGroupMfa', () => {
  it('summarizes factors per user, treating non-array/failed data as no factors', async () => {
    const makeApiRequest = vi.fn(async (endpoint: string): Promise<RequestResult> => {
      if (endpoint.includes('00uFAKE1')) {
        return { success: true, data: [{ factorType: 'sms', status: 'ACTIVE' }] };
      }
      if (endpoint.includes('00uFAKE2')) return { success: true, data: null }; // non-array
      throw new Error('factors down'); // 00uFAKE3 → catch
    });
    const core = makeCore({ makeApiRequest });
    const { scanGroupMfa } = createUserOperations(core);

    const map = await scanGroupMfa(['00uFAKE1', '00uFAKE2', '00uFAKE3']);

    expect(core.runOperation).toHaveBeenCalled();
    expect([...map.keys()].sort()).toEqual(['00uFAKE1', '00uFAKE2', '00uFAKE3']);
    expect(makeApiRequest).toHaveBeenCalledWith('/api/v1/users/00uFAKE1/factors', {
      method: 'GET',
      priority: 'low',
      reason: 'MFA scan',
    });
    expect(map.get('00uFAKE1')?.enrolled).toBe(true);
    expect(map.get('00uFAKE1')?.factorCount).toBe(1);
    expect(map.get('00uFAKE2')?.enrolled).toBe(false);
    expect(map.get('00uFAKE3')?.enrolled).toBe(false);
  });
});

describe('getUserGroupMemberships', () => {
  it('reads the exact count from the x-total-count header', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({
        success: true,
        headers: { 'x-total-count': '42' },
      }),
    });
    const { getUserGroupMemberships } = createUserOperations(core);

    const count = await getUserGroupMemberships('00uFAKE1');

    expect(core.makeApiRequest).toHaveBeenCalledWith('/api/v1/users/00uFAKE1/groups?limit=1', {
      reason: 'Count user group memberships',
    });
    expect(count).toBe(42);
  });

  it('returns 0 when the header is absent', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true, headers: {} }),
    });
    const { getUserGroupMemberships } = createUserOperations(core);
    expect(await getUserGroupMemberships('00uFAKE1')).toBe(0);
  });

  it('returns 0 on a thrown error', async () => {
    const core = makeCore({ makeApiRequest: vi.fn().mockRejectedValue(new Error('nope')) });
    const { getUserGroupMemberships } = createUserOperations(core);
    expect(await getUserGroupMemberships('00uFAKE1')).toBe(0);
  });
});

describe('searchUsers', () => {
  it('short-circuits to [] for queries shorter than 2 chars', async () => {
    const core = makeCore();
    const { searchUsers } = createUserOperations(core);

    expect(await searchUsers('a')).toEqual([]);
    expect(await searchUsers('')).toEqual([]);
    expect(core.makeApiRequest).not.toHaveBeenCalled();
  });

  it('URL-encodes the query and flattens results, defaulting missing fields', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            id: '00uFAKE1',
            status: 'ACTIVE',
            profile: {
              email: 'jane@example.com',
              firstName: 'Jane',
              lastName: 'Doe',
              login: 'jane@example.com',
            },
          },
          { id: '00uFAKE2', profile: {} }, // missing status + profile fields → defaults
        ],
      }),
    });
    const { searchUsers } = createUserOperations(core);

    const results = await searchUsers('jane doe');

    expect(core.makeApiRequest).toHaveBeenCalledWith('/api/v1/users?q=jane%20doe&limit=20', {
      reason: 'Search users',
    });
    expect(results[0]).toEqual({
      id: '00uFAKE1',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      login: 'jane@example.com',
      status: 'ACTIVE',
    });
    expect(results[1]).toEqual({
      id: '00uFAKE2',
      email: '',
      firstName: '',
      lastName: '',
      login: '',
      status: 'UNKNOWN',
    });
  });

  it('returns [] when the response has no data', async () => {
    const core = makeCore({ makeApiRequest: vi.fn().mockResolvedValue({ success: false }) });
    const { searchUsers } = createUserOperations(core);
    expect(await searchUsers('jane')).toEqual([]);
  });

  it('returns [] on a thrown error', async () => {
    const core = makeCore({ makeApiRequest: vi.fn().mockRejectedValue(new Error('down')) });
    const { searchUsers } = createUserOperations(core);
    expect(await searchUsers('jane')).toEqual([]);
  });
});

describe('getUserById', () => {
  it('flattens a found user, defaulting missing fields', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({
        success: true,
        data: { id: '00uFAKE1', profile: {} },
      }),
    });
    const { getUserById } = createUserOperations(core);

    const result = await getUserById('00uFAKE1');

    expect(result).toEqual({
      id: '00uFAKE1',
      email: '',
      firstName: '',
      lastName: '',
      login: '',
      status: 'UNKNOWN',
    });
  });

  it('returns null when the user is not found', async () => {
    const core = makeCore({ makeApiRequest: vi.fn().mockResolvedValue({ success: false }) });
    const { getUserById } = createUserOperations(core);
    expect(await getUserById('00uFAKE1')).toBeNull();
  });

  it('returns null on a thrown error', async () => {
    const core = makeCore({ makeApiRequest: vi.fn().mockRejectedValue(new Error('boom')) });
    const { getUserById } = createUserOperations(core);
    expect(await getUserById('00uFAKE1')).toBeNull();
  });
});

describe('lifecycle actions', () => {
  it('suspendUser POSTs the suspend endpoint and passes success/error through', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: false, error: 'not active' }),
    });
    const { suspendUser } = createUserOperations(core);

    const result = await suspendUser('00uFAKE1');

    expect(core.makeApiRequest).toHaveBeenCalledWith('/api/v1/users/00uFAKE1/lifecycle/suspend', {
      method: 'POST',
      reason: 'Suspend user',
    });
    expect(result).toEqual({ success: false, error: 'not active' });
  });

  it('unsuspendUser POSTs the unsuspend endpoint', async () => {
    const core = makeCore({ makeApiRequest: vi.fn().mockResolvedValue({ success: true }) });
    const { unsuspendUser } = createUserOperations(core);

    const result = await unsuspendUser('00uFAKE1');

    expect(core.makeApiRequest).toHaveBeenCalledWith('/api/v1/users/00uFAKE1/lifecycle/unsuspend', {
      method: 'POST',
      reason: 'Unsuspend user',
    });
    expect(result).toEqual({ success: true, error: undefined });
  });

  it('resetPassword POSTs the reset endpoint with sendEmail=true', async () => {
    const core = makeCore({ makeApiRequest: vi.fn().mockResolvedValue({ success: true }) });
    const { resetPassword } = createUserOperations(core);

    const result = await resetPassword('00uFAKE1');

    expect(core.makeApiRequest).toHaveBeenCalledWith(
      '/api/v1/users/00uFAKE1/lifecycle/reset_password?sendEmail=true',
      { method: 'POST', reason: 'Reset user password' },
    );
    expect(result).toEqual({ success: true, error: undefined });
  });
});

describe('getUserApps boundary validation', () => {
  it('drops malformed app rows (missing id) leniently instead of failing', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: '0oaFAKE1', label: 'App One' }, { label: 'No Id App' }],
        headers: {},
      }),
    });
    const { getUserApps } = createUserOperations(core);

    expect(await getUserApps('00uFAKE1')).toEqual({
      apps: [{ id: '0oaFAKE1', label: 'App One', isProfileSource: false }],
      complete: true,
    });
  });
});

describe('getUserApps assignment scope', () => {
  const onePage = (data: unknown[]) => ({ success: true, data, headers: {} });

  it('expands the app-user on the same endpoint, for the same id it filters on', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(onePage([{ id: '0oaFAKE1', label: 'One' }]));
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    await getUserApps('00uFAKE1');

    const url = String(makeApiRequest.mock.calls[0][0]);
    expect(url).toBe('/api/v1/apps?filter=user.id+eq+"00uFAKE1"&limit=200&expand=user/00uFAKE1');
    expect(url.match(/user\.id\+eq\+"([^"]+)"/)?.[1]).toBe(url.match(/expand=user\/([^&]+)/)?.[1]);
  });

  it('costs no extra requests: the paginated walk issues one call per page, as before', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValueOnce({
        success: true,
        data: [
          { id: '0oaFAKE1', label: 'One', _embedded: { user: { id: '00uFAKE1', scope: 'USER' } } },
        ],
        headers: {
          link: '<https://example.okta.com/api/v1/apps?after=cur&limit=200&expand=user%2F00uFAKE1>; rel="next"',
        },
      })
      .mockResolvedValueOnce(
        onePage([
          { id: '0oaFAKE2', label: 'Two', _embedded: { user: { id: '00uFAKE1', scope: 'GROUP' } } },
        ]),
      );
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    const { apps } = await getUserApps('00uFAKE1');

    expect(makeApiRequest).toHaveBeenCalledTimes(2);
    expect(apps).toEqual([
      { id: '0oaFAKE1', label: 'One', scope: 'USER', isProfileSource: false },
      { id: '0oaFAKE2', label: 'Two', scope: 'GROUP', isProfileSource: false },
    ]);
  });

  it('maps _embedded.user.scope USER → direct-assignment scope', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValue(
        onePage([
          { id: '0oaFAKE1', label: 'One', _embedded: { user: { id: '00uFAKE1', scope: 'USER' } } },
        ]),
      );
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    expect((await getUserApps('00uFAKE1')).apps[0].scope).toBe('USER');
  });

  it('maps _embedded.user.scope GROUP → group-granted scope', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValue(
        onePage([
          { id: '0oaFAKE1', label: 'One', _embedded: { user: { id: '00uFAKE1', scope: 'GROUP' } } },
        ]),
      );
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    expect((await getUserApps('00uFAKE1')).apps[0].scope).toBe('GROUP');
  });

  it('keeps the app (scope undefined) when _embedded is absent entirely', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(onePage([{ id: '0oaFAKE1', label: 'One' }]));
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    const { apps } = await getUserApps('00uFAKE1');

    expect(apps).toHaveLength(1);
    expect(apps[0]).toEqual({
      id: '0oaFAKE1',
      label: 'One',
      scope: undefined,
      isProfileSource: false,
    });
  });

  it.each([
    ['a string', 'nonsense'],
    ['null', null],
    ['an array', [{ scope: 'USER' }]],
    ['a user that is a string', { user: 'nonsense' }],
    ['a user with no id', { user: { scope: 'USER' } }],
    ['an unrecognized scope value', { user: { id: '00uFAKE1', scope: 'SOMETHING_NEW' } }],
    ['a non-string scope', { user: { id: '00uFAKE1', scope: 7 } }],
  ])('keeps the app (scope undefined) when _embedded is %s', async (_label, embedded) => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValue(onePage([{ id: '0oaFAKE1', label: 'One', _embedded: embedded }]));
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    const { apps } = await getUserApps('00uFAKE1');

    expect(apps).toHaveLength(1);
    expect(apps[0].scope).toBeUndefined();
  });

  it('returns every app on a page where only some rows carry the embed', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(
      onePage([
        { id: '0oaFAKE1', label: 'One', _embedded: { user: { id: '00uFAKE1', scope: 'USER' } } },
        { id: '0oaFAKE2', label: 'Two' },
        { id: '0oaFAKE3', label: 'Three', _embedded: 'nonsense' },
        { id: '0oaFAKE4', label: 'Four', _embedded: { user: { id: '00uFAKE1', scope: 'GROUP' } } },
      ]),
    );
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    expect((await getUserApps('00uFAKE1')).apps).toEqual([
      { id: '0oaFAKE1', label: 'One', scope: 'USER', isProfileSource: false },
      { id: '0oaFAKE2', label: 'Two', scope: undefined, isProfileSource: false },
      { id: '0oaFAKE3', label: 'Three', scope: undefined, isProfileSource: false },
      { id: '0oaFAKE4', label: 'Four', scope: 'GROUP', isProfileSource: false },
    ]);
  });
});

describe('getUserApps grant group', () => {
  const onePage = (data: unknown[]) => ({ success: true, data, headers: {} });

  const rowWithGroupHref = (href: unknown, scope = 'GROUP') => ({
    id: '0oaFAKEapp000001',
    label: 'One',
    _embedded: { user: { id: '00uFAKE0001', scope, _links: { group: { href } } } },
  });

  it('reads grantGroupId off the embed without issuing a request per app', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValue(
        onePage([rowWithGroupHref('https://example.okta.com/api/v1/groups/00gFAKEgroup00000001')]),
      );
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    const { apps } = await getUserApps('00uFAKE0001');

    expect(apps).toEqual([
      {
        id: '0oaFAKEapp000001',
        label: 'One',
        scope: 'GROUP',
        grantGroupId: '00gFAKEgroup00000001',
        isProfileSource: false,
      },
    ]);
    expect(makeApiRequest).toHaveBeenCalledTimes(1);
  });

  it('reads PROFILE_MASTERING off features without issuing a request per app', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(
      onePage([
        {
          id: '0oaFAKEapp000001',
          label: 'Workday',
          features: ['IMPORT_PROFILE_UPDATES', 'PROFILE_MASTERING', 'IMPORT_NEW_USERS'],
        },
        { id: '0oaFAKEapp000002', label: 'Salesforce', features: ['SSO', 'GROUP_PUSH'] },
        { id: '0oaFAKEapp000003', label: 'Slack' },
      ]),
    );
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    const { apps } = await getUserApps('00uFAKE0001');

    expect(apps.map((app) => app.isProfileSource)).toEqual([true, false, false]);
    expect(makeApiRequest).toHaveBeenCalledTimes(1);
  });

  it('leaves grantGroupId undefined when the embed carries no _links', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue(
      onePage([
        {
          id: '0oaFAKEapp000001',
          label: 'One',
          _embedded: { user: { id: '00uFAKE0001', scope: 'GROUP' } },
        },
      ]),
    );
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    const { apps } = await getUserApps('00uFAKE0001');

    expect(apps[0].grantGroupId).toBeUndefined();
    expect(apps[0].scope).toBe('GROUP');
  });

  it.each([
    ['a user id', '/api/v1/users/00uFAKE00000000000001'],
    ['a path-traversal href', 'https://example.okta.com/api/v1/groups/00gFAKE/../../../users/me'],
    ['a bare traversal', '../../etc/passwd'],
    ['an empty href', ''],
    ['a query string with no path segment', '?groupId=00gFAKEgroup00000001'],
    ['a too-short id', '/api/v1/groups/00gFAKE'],
  ])('keeps the app but reports no grant group for %s', async (_label, href) => {
    const makeApiRequest = vi.fn().mockResolvedValue(onePage([rowWithGroupHref(href)]));
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    const { apps, complete } = await getUserApps('00uFAKE0001');

    expect(apps).toHaveLength(1);
    expect(apps[0].id).toBe('0oaFAKEapp000001');
    expect(apps[0].grantGroupId).toBeUndefined();
    expect(complete).toBe(true);
  });

  it('keeps BOTH scope USER and grantGroupId — a direct assignment does not exclude a group path', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValue(
        onePage([rowWithGroupHref('/api/v1/groups/00gFAKEgroup00000001', 'USER')]),
      );
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    const { apps } = await getUserApps('00uFAKE0001');

    expect(apps[0].scope).toBe('USER');
    expect(apps[0].grantGroupId).toBe('00gFAKEgroup00000001');
  });

  it('a malformed _links never drops the app (and never costs its scope)', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const makeApiRequest = vi.fn().mockResolvedValue(
      onePage([
        {
          id: '0oaFAKEapp000001',
          label: 'One',
          _embedded: { user: { id: '00uFAKE0001', scope: 'USER', _links: 'nonsense' } },
        },
        {
          id: '0oaFAKEapp000002',
          label: 'Two',
          _embedded: { user: { id: '00uFAKE0001', scope: 'GROUP', _links: { group: 42 } } },
        },
      ]),
    );
    const { getUserApps } = createUserOperations(makeCore({ makeApiRequest }));

    const { apps, complete } = await getUserApps('00uFAKE0001');

    expect(apps).toEqual([
      {
        id: '0oaFAKEapp000001',
        label: 'One',
        scope: 'USER',
        grantGroupId: undefined,
        isProfileSource: false,
      },
      {
        id: '0oaFAKEapp000002',
        label: 'Two',
        scope: 'GROUP',
        grantGroupId: undefined,
        isProfileSource: false,
      },
    ]);
    expect(complete).toBe(true);
    vi.restoreAllMocks();
  });
});
