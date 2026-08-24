import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PaginatedPageResult } from '../utils/oktaPagination';
import type { SnapshotRecord } from './types';

const { fakeDB, tables, control } = vi.hoisted(() => {
  const tables = new Map<string, Map<string, unknown>>();
  const control = { failAll: false };

  const keyOf = (key: unknown): string => (Array.isArray(key) ? key.join('::') : String(key));
  const table = (name: string): Map<string, unknown> => {
    if (!tables.has(name)) tables.set(name, new Map());
    return tables.get(name) as Map<string, unknown>;
  };
  const guard = (): void => {
    if (control.failAll) throw new Error('IndexedDB unavailable');
  };
  const primaryKey = (name: string, value: unknown): unknown[] => {
    const row = value as Record<string, string>;
    return name === 'syncMeta' ? [row.origin, row.collection] : [row.origin, row.id];
  };

  const fakeDB = {
    get: vi.fn(async (name: string, key: unknown) => {
      guard();
      return table(name).get(keyOf(key));
    }),
    put: vi.fn(async (name: string, value: unknown) => {
      guard();
      table(name).set(keyOf(primaryKey(name, value)), value);
    }),
    delete: vi.fn(async (name: string, key: unknown) => {
      guard();
      table(name).delete(keyOf(key));
    }),
    getAllFromIndex: vi.fn(async (name: string, _index: string, origin: string) => {
      guard();
      return [...table(name).values()].filter((v) => (v as SnapshotRecord).origin === origin);
    }),
    getAllKeysFromIndex: vi.fn(async (name: string, _index: string, origin: string) => {
      guard();
      return [...table(name).values()]
        .filter((v) => (v as SnapshotRecord).origin === origin)
        .map((v) => primaryKey(name, v));
    }),
    transaction: vi.fn((name: string) => {
      guard();
      return {
        store: {
          put: async (value: unknown) => {
            guard();
            table(name).set(keyOf(primaryKey(name, value)), value);
          },
          delete: async (key: unknown) => {
            guard();
            table(name).delete(keyOf(key));
          },
        },
        done: Promise.resolve(),
      };
    }),
  };

  return { fakeDB, tables, control };
});

vi.mock('idb', () => ({ openDB: vi.fn(async () => fakeDB) }));

import { orgSnapshotStore } from './orgSnapshotStore';
import { z } from 'zod';
import {
  APPS_SPEC,
  GROUPS_SPEC,
  RULES_SPEC,
  runFullWalk,
  runShardedWalk,
  syncCollection,
  syncOrg,
  type CollectionSpec,
  type PageRequest,
} from './snapshotSync';

const ORIGIN = 'https://example.okta.com';
const NOW = 1_800_000_000_000;

function group(id: string, name: string, lastUpdated = '2026-08-20T09:00:00.000Z') {
  return {
    id,
    type: 'OKTA_GROUP',
    profile: { name, description: null },
    lastUpdated,
    _embedded: { stats: { usersCount: 3 } },
  };
}

function linkTo(nextPath: string): Record<string, string> {
  return { link: `<${ORIGIN}${nextPath}>; rel="next"` };
}

function scriptedRequest(pages: Record<string, PaginatedPageResult>): {
  request: PageRequest;
  urls: string[];
} {
  const urls: string[] = [];
  const request: PageRequest = async (url) => {
    urls.push(url);
    const page = pages[url];
    if (!page) throw new Error(`unscripted URL: ${url}`);
    return page;
  };
  return { request, urls };
}

async function storedGroupNames(): Promise<string[]> {
  const rows = await orgSnapshotStore.getCollection<{ profile?: { name?: string } }>(
    'groups',
    ORIGIN,
  );
  return rows.map((row) => row.profile?.name ?? '?').sort();
}

beforeEach(() => {
  tables.clear();
  control.failAll = false;
  vi.clearAllMocks();
});

describe('a completed full walk', () => {
  it('accumulates every page into the snapshot and marks the collection complete', async () => {
    const page2 = '/api/v1/groups?limit=200&after=cur1';
    const { request } = scriptedRequest({
      [GROUPS_SPEC.firstUrl]: {
        success: true,
        data: [group('00g1', 'Eng'), group('00g2', 'Sales')],
        headers: linkTo(page2),
      },
      [`${page2}&expand=stats&expand=app`]: {
        success: true,
        data: [group('00g3', 'Support')],
        headers: {},
      },
    });

    const outcome = await runFullWalk(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW });

    expect(outcome).toMatchObject({ collection: 'groups', complete: true, written: 3, swept: 0 });
    await expect(storedGroupNames()).resolves.toEqual(['Eng', 'Sales', 'Support']);

    const meta = await orgSnapshotStore.getMeta('groups', ORIGIN);
    expect(meta).toMatchObject({
      complete: true,
      lastFullWalkAt: NOW,
      cursor: null,
      walkStartedAt: null,
      itemCount: 3,
    });
  });

  it('announces each page as it lands rather than once at the end', async () => {
    const page2 = '/api/v1/groups?limit=200&after=cur1';
    const { request } = scriptedRequest({
      [GROUPS_SPEC.firstUrl]: {
        success: true,
        data: [group('00g1', 'Eng')],
        headers: linkTo(page2),
      },
      [`${page2}&expand=stats&expand=app`]: {
        success: true,
        data: [group('00g2', 'Sales')],
        headers: {},
      },
    });
    const onPage = vi.fn();

    await runFullWalk(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW, onPage });

    expect(onPage.mock.calls).toEqual([
      ['groups', 1],
      ['groups', 2],
    ]);
  });

  it('advances the watermark to the newest lastUpdated it saw, whatever the page order', async () => {
    const page2 = '/api/v1/groups?limit=200&after=cur1';
    const { request } = scriptedRequest({
      [GROUPS_SPEC.firstUrl]: {
        success: true,
        data: [group('00g1', 'Eng', '2026-08-24T11:00:00.000Z')],
        headers: linkTo(page2),
      },
      [`${page2}&expand=stats&expand=app`]: {
        success: true,
        data: [group('00g2', 'Sales', '2026-08-20T09:00:00.000Z')],
        headers: {},
      },
    });

    await runFullWalk(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW });

    expect((await orgSnapshotStore.getMeta('groups', ORIGIN)).watermark).toBe(
      '2026-08-24T11:00:00.000Z',
    );
  });

  it('re-appends the expand values Okta dropped from its next link', async () => {
    const echoed = '/api/v1/groups?limit=200&after=cur1&expand=stats';
    const { request, urls } = scriptedRequest({
      [GROUPS_SPEC.firstUrl]: {
        success: true,
        data: [group('00g1', 'Eng')],
        headers: linkTo(echoed),
      },
      [`${echoed}&expand=app`]: { success: true, data: [group('00g2', 'Sales')], headers: {} },
    });

    await runFullWalk(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW });

    expect(urls[1]).toBe(`${echoed}&expand=app`);
    expect(urls[1].match(/expand=stats/g)).toHaveLength(1);
  });

  it('drops a row with no usable id instead of failing the walk', async () => {
    const { request } = scriptedRequest({
      [GROUPS_SPEC.firstUrl]: {
        success: true,
        data: [group('00g1', 'Eng'), { profile: { name: 'No id' } }],
        headers: {},
      },
    });

    const outcome = await runFullWalk(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW });

    expect(outcome.complete).toBe(true);
    await expect(storedGroupNames()).resolves.toEqual(['Eng']);
  });
});

describe('reconciliation', () => {
  it('sweeps a group that Okta no longer returns', async () => {
    const first = scriptedRequest({
      [GROUPS_SPEC.firstUrl]: {
        success: true,
        data: [group('00g1', 'Eng'), group('00g2', 'Sales')],
        headers: {},
      },
    });
    await runFullWalk(GROUPS_SPEC, { origin: ORIGIN, request: first.request, now: NOW });
    await expect(storedGroupNames()).resolves.toEqual(['Eng', 'Sales']);

    const second = scriptedRequest({
      [GROUPS_SPEC.firstUrl]: { success: true, data: [group('00g1', 'Eng')], headers: {} },
    });
    const outcome = await runFullWalk(GROUPS_SPEC, {
      origin: ORIGIN,
      request: second.request,
      now: NOW + 60_000,
    });

    expect(outcome.swept).toBe(1);
    await expect(storedGroupNames()).resolves.toEqual(['Eng']);
    expect((await orgSnapshotStore.getMeta('groups', ORIGIN)).itemCount).toBe(1);
  });

  it('keeps a row the walk re-returned unchanged', async () => {
    const pages = {
      [GROUPS_SPEC.firstUrl]: { success: true, data: [group('00g1', 'Eng')], headers: {} },
    };
    await runFullWalk(GROUPS_SPEC, {
      origin: ORIGIN,
      request: scriptedRequest(pages).request,
      now: NOW,
    });
    const outcome = await runFullWalk(GROUPS_SPEC, {
      origin: ORIGIN,
      request: scriptedRequest(pages).request,
      now: NOW + 60_000,
    });

    expect(outcome.swept).toBe(0);
    await expect(storedGroupNames()).resolves.toEqual(['Eng']);
  });
});

describe('a walk that did not finish', () => {
  it('keeps the rows it got, sweeps nothing, and does not present as complete', async () => {
    const page2 = '/api/v1/groups?limit=200&after=cur1';
    const { request } = scriptedRequest({
      [GROUPS_SPEC.firstUrl]: {
        success: true,
        data: [group('00g1', 'Eng')],
        headers: linkTo(page2),
      },
      [`${page2}&expand=stats&expand=app`]: { success: false, error: 'rate limited' },
    });

    const outcome = await runFullWalk(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW });

    expect(outcome).toMatchObject({ complete: false, swept: 0 });
    expect(outcome.error).toBe('rate limited');
    await expect(storedGroupNames()).resolves.toEqual(['Eng']);

    const meta = await orgSnapshotStore.getMeta('groups', ORIGIN);
    expect(meta.complete).toBe(false);
    expect(meta.cursor).toBe(`${page2}&expand=stats&expand=app`);
    expect(meta.walkStartedAt).toBe(NOW);
  });

  it('resumes from the cursor and still sweeps what the interrupted pages had returned', async () => {
    await orgSnapshotStore.upsertMany(
      'groups',
      ORIGIN,
      [{ id: '00gOLD', entity: group('00gOLD', 'Deleted') }],
      NOW - 100_000,
    );

    const page2 = '/api/v1/groups?limit=200&after=cur1';
    const failing = scriptedRequest({
      [GROUPS_SPEC.firstUrl]: {
        success: true,
        data: [group('00g1', 'Eng')],
        headers: linkTo(page2),
      },
      [`${page2}&expand=stats&expand=app`]: { success: false, error: 'worker suspended' },
    });
    await runFullWalk(GROUPS_SPEC, { origin: ORIGIN, request: failing.request, now: NOW });

    const resumed = scriptedRequest({
      [`${page2}&expand=stats&expand=app`]: {
        success: true,
        data: [group('00g2', 'Sales')],
        headers: {},
      },
    });
    const outcome = await runFullWalk(GROUPS_SPEC, {
      origin: ORIGIN,
      request: resumed.request,
      now: NOW + 60_000,
    });

    expect(resumed.urls).toEqual([`${page2}&expand=stats&expand=app`]);
    expect(outcome.complete).toBe(true);
    expect(outcome.swept).toBe(1);
    await expect(storedGroupNames()).resolves.toEqual(['Eng', 'Sales']);
  });
});

describe('syncOrg', () => {
  it('walks the collections concurrently rather than one after the other', async () => {
    const inFlight: string[] = [];
    let releaseGroups: () => void = () => {};
    const groupsHeld = new Promise<void>((resolve) => {
      releaseGroups = resolve;
    });

    const request: PageRequest = async (url) => {
      inFlight.push(url);
      if (url === GROUPS_SPEC.firstUrl) {
        await groupsHeld;
        return { success: true, data: [group('00g1', 'Eng')], headers: {} };
      }
      return {
        success: true,
        data: [{ id: '0pr1', name: 'By dept', status: 'ACTIVE' }],
        headers: {},
      };
    };

    const running = syncOrg({ origin: ORIGIN, request, now: NOW });
    await vi.waitFor(() => expect(inFlight).toContain(RULES_SPEC.firstUrl));
    releaseGroups();

    const outcomes = await running;
    expect(outcomes.map((o) => [o.collection, o.complete])).toEqual([
      ['groups', true],
      ['rules', true],
      ['apps', true],
      ['appGroups', true],
    ]);
    await expect(orgSnapshotStore.countCollection('rules', ORIGIN)).resolves.toBe(1);
  });

  it('waits for the app inventory before deriving which apps to walk', async () => {
    const order: string[] = [];
    const request: PageRequest = async (url) => {
      order.push(url);
      if (url === APPS_SPEC.firstUrl) {
        return {
          success: true,
          data: [{ id: '0oaA', label: 'Payroll', features: ['GROUP_PUSH'] }],
          headers: {},
        };
      }
      if (url.startsWith('/api/v1/apps/0oaA/groups')) {
        return { success: true, data: [{ id: '00g1' }], headers: {} };
      }
      return { success: true, data: [], headers: {} };
    };

    const outcomes = await syncOrg({ origin: ORIGIN, request, now: NOW });

    expect(order.indexOf('/api/v1/apps/0oaA/groups?limit=200')).toBeGreaterThan(
      order.indexOf(APPS_SPEC.firstUrl),
    );
    expect(outcomes.find((o) => o.collection === 'appGroups')).toMatchObject({
      complete: true,
      written: 1,
    });
    await expect(orgSnapshotStore.getIds('appGroups', ORIGIN)).resolves.toEqual(
      new Set(['0oaA::00g1']),
    );
  });

  it('retries rather than recording an empty fan-out when the inventory is cold', async () => {
    const request: PageRequest = async (url) => {
      if (url === APPS_SPEC.firstUrl) return { success: false, error: 'apps unavailable' };
      return { success: true, data: [], headers: {} };
    };

    const outcomes = await syncOrg({ origin: ORIGIN, request, now: NOW });

    expect(outcomes.find((o) => o.collection === 'appGroups')).toMatchObject({ complete: false });
    const meta = await orgSnapshotStore.getMeta('appGroups', ORIGIN);
    expect(meta.complete).toBe(false);
    expect(meta.lastFullWalkAt).toBeNull();
  });

  it('lands the collections that succeeded when one of them fails', async () => {
    const request: PageRequest = async (url) => {
      if (url === GROUPS_SPEC.firstUrl) return { success: false, error: 'groups unavailable' };
      return {
        success: true,
        data: [{ id: '0pr1', name: 'By dept', status: 'ACTIVE' }],
        headers: {},
      };
    };

    const outcomes = await syncOrg({ origin: ORIGIN, request, now: NOW });

    expect(outcomes[0]).toMatchObject({ collection: 'groups', complete: false });
    expect(outcomes[1]).toMatchObject({ collection: 'rules', complete: true });
    await expect(orgSnapshotStore.countCollection('rules', ORIGIN)).resolves.toBe(1);
  });
});

const COUNT_URL = '/api/v1/groups?limit=1';

const PROBE_URL = `/api/v1/groups?${new URLSearchParams({
  limit: '1',
  search: 'lastUpdated gt "9999-01-01T00:00:00.000Z"',
}).toString()}`;

function deltaUrlFor(watermark: string): string {
  return `${GROUPS_SPEC.firstUrl}&search=${encodeURIComponent(`lastUpdated gt "${watermark}"`)}`;
}

const WATERMARK = '2026-08-20T09:00:00.000Z';

async function seedSyncedCollection(
  rows: ReturnType<typeof group>[],
  meta: Record<string, unknown> = {},
): Promise<void> {
  await orgSnapshotStore.upsertMany(
    'groups',
    ORIGIN,
    rows.map((row) => ({ id: row.id, entity: row })),
    NOW,
  );
  await orgSnapshotStore.patchMeta('groups', ORIGIN, {
    complete: true,
    lastFullWalkAt: NOW,
    lastDeltaAt: NOW,
    watermark: WATERMARK,
    itemCount: rows.length,
    cursor: null,
    walkStartedAt: null,
    deltaSupported: true,
    ...meta,
  });
}

describe('delta sync', () => {
  it('refuses to trust a search filter the org silently ignored, and full-walks instead', async () => {
    await seedSyncedCollection([group('00g1', 'Eng')], { deltaSupported: null });
    const { request, urls } = scriptedRequest({
      [PROBE_URL]: { success: true, data: [], headers: { 'x-total-count': '1' } },
      [GROUPS_SPEC.firstUrl]: { success: true, data: [group('00g1', 'Eng')], headers: {} },
    });

    const outcome = await syncCollection(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW + 1000 });

    expect(outcome.mode).toBe('full');
    expect(urls).toContain(GROUPS_SPEC.firstUrl);
    const meta = await orgSnapshotStore.getMeta('groups', ORIGIN);
    expect(meta.deltaSupported).toBe(false);
  });

  it('treats an unanswerable probe as unsupported rather than as support', async () => {
    await seedSyncedCollection([group('00g1', 'Eng')], { deltaSupported: null });
    const { request } = scriptedRequest({
      [PROBE_URL]: { success: true, data: [], headers: {} },
      [GROUPS_SPEC.firstUrl]: { success: true, data: [group('00g1', 'Eng')], headers: {} },
    });

    const outcome = await syncCollection(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW + 1000 });

    expect(outcome.mode).toBe('full');
    await expect(
      orgSnapshotStore.getMeta('groups', ORIGIN).then((m) => m.deltaSupported),
    ).resolves.toBe(false);
  });

  it('fetches only what changed, and leaves untouched rows alone', async () => {
    await seedSyncedCollection([group('00g1', 'Eng'), group('00g2', 'Sales')]);
    const { request, urls } = scriptedRequest({
      [deltaUrlFor(WATERMARK)]: {
        success: true,
        data: [
          group('00g2', 'Sales EMEA', '2026-08-24T10:00:00.000Z'),
          group('00g3', 'Support', '2026-08-24T11:00:00.000Z'),
        ],
        headers: {},
      },
    });

    const outcome = await syncCollection(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW + 1000 });

    expect(outcome).toMatchObject({ mode: 'delta', complete: true, written: 2, swept: 0 });
    await expect(storedGroupNames()).resolves.toEqual(['Eng', 'Sales EMEA', 'Support']);
    expect(urls).toEqual([deltaUrlFor(WATERMARK)]);

    const meta = await orgSnapshotStore.getMeta('groups', ORIGIN);
    expect(meta.watermark).toBe('2026-08-24T11:00:00.000Z');
    expect(meta.lastDeltaAt).toBe(NOW + 1000);
    expect(meta.itemCount).toBe(3);
  });

  it('leaves the snapshot whole and retryable when the delta request fails', async () => {
    await seedSyncedCollection([group('00g1', 'Eng')]);
    const { request } = scriptedRequest({
      [deltaUrlFor(WATERMARK)]: { success: false, error: 'delta unavailable' },
    });

    const outcome = await syncCollection(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW + 1000 });

    expect(outcome).toMatchObject({ mode: 'delta', complete: true, error: 'delta unavailable' });
    const meta = await orgSnapshotStore.getMeta('groups', ORIGIN);
    expect(meta.complete).toBe(true);
    expect(meta.lastDeltaAt).toBe(NOW);
    await expect(storedGroupNames()).resolves.toEqual(['Eng']);
  });
});

describe('drift check', () => {
  const LATER = NOW + 16 * 60 * 1000;

  it('catches a deletion a delta could never see, and escalates to a full walk', async () => {
    await seedSyncedCollection([group('00g1', 'Eng'), group('00g2', 'Sales')]);
    const { request, urls } = scriptedRequest({
      [COUNT_URL]: { success: true, data: [], headers: { 'x-total-count': '1' } },
      [GROUPS_SPEC.firstUrl]: { success: true, data: [group('00g1', 'Eng')], headers: {} },
    });

    const outcome = await syncCollection(GROUPS_SPEC, { origin: ORIGIN, request, now: LATER });

    expect(outcome.mode).toBe('full');
    expect(outcome.swept).toBe(1);
    await expect(storedGroupNames()).resolves.toEqual(['Eng']);
    expect(urls[0]).toBe(COUNT_URL);
  });

  it('escalates when the org does not answer the count question at all', async () => {
    await seedSyncedCollection([group('00g1', 'Eng')]);
    const { request } = scriptedRequest({
      [COUNT_URL]: { success: true, data: [], headers: {} },
      [GROUPS_SPEC.firstUrl]: { success: true, data: [group('00g1', 'Eng')], headers: {} },
    });

    const outcome = await syncCollection(GROUPS_SPEC, { origin: ORIGIN, request, now: LATER });

    expect(outcome.mode).toBe('full');
  });

  it('still runs the delta when the counts agree, because an edit moves no count', async () => {
    await seedSyncedCollection([group('00g1', 'Eng')]);
    const { request, urls } = scriptedRequest({
      [COUNT_URL]: { success: true, data: [], headers: { 'x-total-count': '1' } },
      [deltaUrlFor(WATERMARK)]: {
        success: true,
        data: [group('00g1', 'Engineering', '2026-08-24T12:00:00.000Z')],
        headers: {},
      },
    });

    const outcome = await syncCollection(GROUPS_SPEC, { origin: ORIGIN, request, now: LATER });

    expect(outcome.mode).toBe('delta');
    await expect(storedGroupNames()).resolves.toEqual(['Engineering']);
    expect(urls).toEqual([COUNT_URL, deltaUrlFor(WATERMARK)]);
  });
});

describe('the freshness ladder', () => {
  it('does nothing for a snapshot that is complete, fresh and has no watermark', async () => {
    await seedSyncedCollection([], { watermark: null, itemCount: 0 });
    const { request, urls } = scriptedRequest({});

    const outcome = await syncCollection(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW + 1000 });

    expect(outcome).toMatchObject({ mode: 'none', complete: true, written: 0 });
    expect(urls).toEqual([]);
  });

  it('walks in full when forced, however fresh the snapshot is', async () => {
    await seedSyncedCollection([group('00g1', 'Eng')]);
    const { request, urls } = scriptedRequest({
      [GROUPS_SPEC.firstUrl]: {
        success: true,
        data: [group('00g1', 'Eng'), group('00g2', 'Sales')],
        headers: {},
      },
    });

    const outcome = await syncCollection(GROUPS_SPEC, {
      origin: ORIGIN,
      request,
      now: NOW + 1000,
      force: true,
    });

    expect(outcome.mode).toBe('full');
    expect(urls).toEqual([GROUPS_SPEC.firstUrl]);
    await expect(storedGroupNames()).resolves.toEqual(['Eng', 'Sales']);
  });

  it('full-walks a collection whose last walk was interrupted, rather than topping it up', async () => {
    await seedSyncedCollection([group('00g1', 'Eng')], {
      complete: false,
      cursor: '/api/v1/groups?limit=200&after=cur1&expand=stats&expand=app',
      walkStartedAt: NOW,
    });
    const { request } = scriptedRequest({
      '/api/v1/groups?limit=200&after=cur1&expand=stats&expand=app': {
        success: true,
        data: [group('00g2', 'Sales')],
        headers: {},
      },
    });

    const outcome = await syncCollection(GROUPS_SPEC, { origin: ORIGIN, request, now: NOW + 1000 });

    expect(outcome.mode).toBe('full');
    expect(outcome.complete).toBe(true);
  });
});

const assignmentSchema = z.object({ id: z.string() }).passthrough();

const shardUrl = (appId: string): string => `/api/v1/apps/${appId}/groups?limit=200`;

function shardedSpec(appIds: string[]): CollectionSpec<{ id: string }> {
  return {
    collection: 'apps',
    firstUrl: '/api/v1/apps?limit=200',
    schema: assignmentSchema,
    context: 'GET /api/v1/apps/{id}/groups',
    shards: async () => appIds.map((key) => ({ key, firstUrl: shardUrl(key) })),
    identify: (row, shard) => {
      const id = (row as { id?: unknown }).id;
      if (typeof id !== 'string' || !shard) return null;
      return { id: `${shard.key}::${id}` };
    },
    refreshIntervalMs: 6 * 60 * 60 * 1000,
  };
}

async function storedShardKeys(): Promise<string[]> {
  return [...(await orgSnapshotStore.getIds('apps', ORIGIN))].sort();
}

describe('a sharded walk', () => {
  it('keys rows by shard, so one group assigned to two apps is not one row', async () => {
    const { request } = scriptedRequest({
      [shardUrl('0oaA')]: { success: true, data: [{ id: '00g1' }], headers: {} },
      [shardUrl('0oaB')]: { success: true, data: [{ id: '00g1' }], headers: {} },
    });

    const outcome = await runShardedWalk(shardedSpec(['0oaA', '0oaB']), {
      origin: ORIGIN,
      request,
      now: NOW,
    });

    expect(outcome).toMatchObject({ complete: true, written: 2, swept: 0 });
    await expect(storedShardKeys()).resolves.toEqual(['0oaA::00g1', '0oaB::00g1']);
  });

  it('sweeps nothing and stays incomplete when a shard fails', async () => {
    const spec = shardedSpec(['0oaA', '0oaB']);
    const first = scriptedRequest({
      [shardUrl('0oaA')]: { success: true, data: [{ id: '00g1' }], headers: {} },
      [shardUrl('0oaB')]: { success: true, data: [{ id: '00g2' }], headers: {} },
    });
    await runShardedWalk(spec, { origin: ORIGIN, request: first.request, now: NOW });

    const second: PageRequest = async (url) => {
      if (url === shardUrl('0oaB')) throw new Error('rate limited');
      return { success: true, data: [{ id: '00g1' }], headers: {} };
    };
    const outcome = await runShardedWalk(spec, {
      origin: ORIGIN,
      request: second,
      now: NOW + 1000,
    });

    expect(outcome).toMatchObject({ complete: false, swept: 0 });
    await expect(storedShardKeys()).resolves.toEqual(['0oaA::00g1', '0oaB::00g2']);
    const meta = await orgSnapshotStore.getMeta('apps', ORIGIN);
    expect(meta.complete).toBe(false);
    expect(meta.completedShards).toEqual(['0oaA']);
  });

  it('resumes without re-requesting the shards it already finished', async () => {
    const spec = shardedSpec(['0oaA', '0oaB']);
    const failing: PageRequest = async (url) => {
      if (url === shardUrl('0oaB')) throw new Error('suspended');
      return { success: true, data: [{ id: '00g1' }], headers: {} };
    };
    await runShardedWalk(spec, { origin: ORIGIN, request: failing, now: NOW });

    const retry = scriptedRequest({
      [shardUrl('0oaB')]: { success: true, data: [{ id: '00g2' }], headers: {} },
    });
    const outcome = await runShardedWalk(spec, {
      origin: ORIGIN,
      request: retry.request,
      now: NOW + 1000,
    });

    expect(retry.urls).toEqual([shardUrl('0oaB')]);
    expect(outcome).toMatchObject({ complete: true, swept: 0 });
    await expect(storedShardKeys()).resolves.toEqual(['0oaA::00g1', '0oaB::00g2']);
    const meta = await orgSnapshotStore.getMeta('apps', ORIGIN);
    expect(meta.completedShards).toEqual([]);
    expect(meta.walkStartedAt).toBeNull();
  });

  it('sweeps an app that has dropped out of the org entirely', async () => {
    const first = scriptedRequest({
      [shardUrl('0oaA')]: { success: true, data: [{ id: '00g1' }], headers: {} },
      [shardUrl('0oaB')]: { success: true, data: [{ id: '00g2' }], headers: {} },
    });
    await runShardedWalk(shardedSpec(['0oaA', '0oaB']), {
      origin: ORIGIN,
      request: first.request,
      now: NOW,
    });

    const second = scriptedRequest({
      [shardUrl('0oaA')]: { success: true, data: [{ id: '00g1' }], headers: {} },
    });
    const outcome = await runShardedWalk(shardedSpec(['0oaA']), {
      origin: ORIGIN,
      request: second.request,
      now: NOW + 1000,
    });

    expect(outcome).toMatchObject({ complete: true, swept: 1 });
    await expect(storedShardKeys()).resolves.toEqual(['0oaA::00g1']);
  });

  it('records that it has no cheap mode, so the ladder gates it on its interval', async () => {
    const spec = shardedSpec(['0oaA']);
    const { request } = scriptedRequest({
      [shardUrl('0oaA')]: { success: true, data: [{ id: '00g1' }], headers: {} },
    });
    await runShardedWalk(spec, { origin: ORIGIN, request, now: NOW });

    const meta = await orgSnapshotStore.getMeta('apps', ORIGIN);
    expect(meta.deltaSupported).toBe(false);

    const idle = scriptedRequest({});
    const outcome = await syncCollection(spec, {
      origin: ORIGIN,
      request: idle.request,
      now: NOW + 60_000,
    });
    expect(outcome.mode).toBe('none');
    expect(idle.urls).toEqual([]);
  });

  it('reports a failure to discover its shards rather than sweeping the collection', async () => {
    const first = scriptedRequest({
      [shardUrl('0oaA')]: { success: true, data: [{ id: '00g1' }], headers: {} },
    });
    await runShardedWalk(shardedSpec(['0oaA']), {
      origin: ORIGIN,
      request: first.request,
      now: NOW,
    });

    const spec: CollectionSpec<{ id: string }> = {
      ...shardedSpec(['0oaA']),
      shards: async () => {
        throw new Error('inventory unreadable');
      },
    };
    const outcome = await runShardedWalk(spec, {
      origin: ORIGIN,
      request: first.request,
      now: NOW + 1000,
    });

    expect(outcome).toMatchObject({ complete: false, written: 0, swept: 0 });
    await expect(storedShardKeys()).resolves.toEqual(['0oaA::00g1']);
  });
});
